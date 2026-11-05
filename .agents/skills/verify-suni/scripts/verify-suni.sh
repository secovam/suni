#!/usr/bin/env bash
# Launch, check, drive and tear down one Suni instance for verification.
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
BASE="${VERIFY_SUNI_DIR:-/tmp/verify-suni}"
STATE="$BASE/state"
SESSION="verify-suni"
MAILPIT="http://localhost:8025"

die() { echo "verify-suni: $*" >&2; exit 1; }
ab() { agent-browser --session "$SESSION" "$@"; }
web_url() { pnpm --silent --dir "$ROOT" exec portless get suni; }
api_url() { pnpm --silent --dir "$ROOT" exec portless get api.suni; }
root_pid() { [[ -f "$STATE/pid" ]] && cat "$STATE/pid"; }
alive() { local p; p="$(root_pid)" && kill -0 "$p" 2>/dev/null; }
# Turbo and bun start their own process groups, so ownership is the process tree under our pnpm.
tree() {
  ps -axo pid=,ppid= | awk -v root="$1" '
    { kids[$2] = kids[$2] " " $1 }
    END { q[1] = root; n = 1; for (i = 1; i <= n; i++) { print q[i]; c = split(kids[q[i]], k, " "); for (j = 1; j <= c; j++) q[++n] = k[j] } }'
}
owns() { [[ -n "$1" ]] && alive && tree "$(root_pid)" | grep -qx "$1"; }
run_id() { cat "$STATE/run_id" 2>/dev/null || die "no run started; run: $0 up"; }
evidence_dir() { echo "$BASE/evidence/$(run_id)"; }

route_pid() {
  local host="${1#https://}"
  pnpm --silent --dir "$ROOT" exec portless list 2>/dev/null |
    awk -v h="$host" '$1 == "https://" h { gsub(/[()]/, "", $NF); print $NF }'
}

ready() {
  curl -sf -o /dev/null "$(web_url)/" &&
    curl -sf -o /dev/null "$(api_url)/api/auth/ok"
}

cmd_up() {
  if alive; then
    echo "already running (pid $(root_pid)), run id $(run_id)"
    return
  fi
  local foreign
  foreign="$(route_pid "$(web_url)")"
  [[ -z "$foreign" ]] || die "$(web_url) is served by pid $foreign, which this run did not start. Stop it or verify against it by hand; never double-drive it."

  command -v agent-browser >/dev/null || die "agent-browser missing: npm i -g agent-browser && agent-browser install"
  mkdir -p "$STATE"
  (cd "$ROOT" && pnpm run services:up)

  local missing
  missing="$(docker exec suni-dev-postgres-1 psql -U postgres -d suni -tAc \
    "select string_agg(t, ',') from unnest(array['user','session','verification','customer']) t where to_regclass('public.\"' || t || '\"') is null")"
  [[ -z "$missing" ]] || die "tables missing: $missing. Migrations are the user's call; ask them to run pnpm run db:migrate."

  local seed_log="$STATE/seed.log"
  (cd "$ROOT" && pnpm run db:seed) >"$seed_log" 2>&1 || { cat "$seed_log"; die "seed failed"; }
  # Varlock masks ADMIN_EMAIL in the seed output, so read the seeded admin back from the table.
  docker exec suni-dev-postgres-1 psql -U postgres -d suni -tAc \
    "select email from \"user\" where role = 'admin' and banned is not true order by created_at limit 1" >"$STATE/admin_email"
  [[ -s "$STATE/admin_email" ]] || die "no active admin after seeding; see $seed_log"

  date +%Y%m%d-%H%M%S >"$STATE/run_id"
  mkdir -p "$(evidence_dir)"

  # Own process group, so a group kill aimed at the caller's shell cannot orphan the tree that down walks.
  set -m
  (cd "$ROOT" && exec pnpm run dev) >"$STATE/dev.log" 2>&1 &
  echo $! >"$STATE/pid"
  set +m

  for _ in $(seq 1 90); do
    if ready; then
      echo "ready: $(web_url) and $(api_url)"
      echo "admin: $(cat "$STATE/admin_email")"
      echo "evidence: $(evidence_dir)"
      return
    fi
    alive || { tail -40 "$STATE/dev.log"; die "dev server exited"; }
    sleep 2
  done
  tail -40 "$STATE/dev.log"
  die "not ready after 180s; log at $STATE/dev.log"
}

cmd_doctor() {
  local fail=0
  check() { if eval "$2"; then echo "ok    $1"; else echo "FAIL  $1"; fail=1; fi; }
  check "dev server started by this run is alive (pid $(root_pid || echo none))" alive
  check "web route $(web_url) is served by our process tree" 'owns "$(route_pid "$(web_url)")"'
  check "api route $(api_url) is served by our process tree" 'owns "$(route_pid "$(api_url)")"'
  check "web answers and api /api/auth/ok answers" ready
  check "postgres and mailpit containers are healthy" \
    '[[ "$(docker inspect -f "{{.State.Health.Status}}" suni-dev-postgres-1 suni-dev-mailpit-1 2>/dev/null | sort -u)" == "healthy" ]]'
  check "agent-browser is installed" 'command -v agent-browser >/dev/null'
  check "admin email known ($(cat "$STATE/admin_email" 2>/dev/null || echo none))" '[[ -s "$STATE/admin_email" ]]'
  return "$fail"
}

magic_link() {
  local email="$1" id
  for _ in $(seq 1 30); do
    id="$(curl -sf "$MAILPIT/api/v1/search" --get --data-urlencode "query=to:$email" | jq -r '.messages[0].ID // empty')"
    if [[ -n "$id" ]]; then
      curl -sf "$MAILPIT/api/v1/message/$id" | jq -r '.Text' | grep -Eo 'https://[^[:space:]]+/api/auth/magic-link/verify[^[:space:]]*' | head -1
      return
    fi
    sleep 1
  done
  die "no email for $email in Mailpit after 30s. Sign-up is disabled: the address must belong to an existing, active user."
}

cmd_login() {
  local email="${1:-$(cat "$STATE/admin_email" 2>/dev/null)}" link
  [[ -n "$email" ]] || die "no email given and no seeded admin; run: $0 up"
  curl -sf -X DELETE "$MAILPIT/api/v1/search" --get --data-urlencode "query=to:$email" >/dev/null
  ab open "$(web_url)/" >/dev/null
  ab wait --text "Inicia sesión con tu correo" >/dev/null
  ab find label "Inicia sesión con tu correo" fill "$email" >/dev/null
  ab find role button click --name "Enviar enlace mágico" >/dev/null
  ab wait --text "Si existe una cuenta con este correo" >/dev/null
  link="$(magic_link "$email")"
  [[ -n "$link" ]] || die "email for $email had no magic link"
  ab open "$link" >/dev/null
  ab wait --url "**/dashboard" >/dev/null
  echo "signed in as $email at $(ab get url)"
}

cmd_shot() {
  [[ $# -eq 2 ]] || die "usage: $0 shot <feature> <step>"
  local dir
  dir="$(evidence_dir)/$1"
  mkdir -p "$dir"
  ab screenshot --full "$dir/$2.png" >/dev/null
  { ab get url; ab snapshot; } >"$dir/$2.aria.txt"
  echo "$dir/$2.png"
  echo "$dir/$2.aria.txt"
}

cmd_sql() {
  docker exec suni-dev-postgres-1 psql -U postgres -d suni -c "$1"
}

cmd_down() {
  ab close >/dev/null 2>&1 || true
  if alive; then
    local pids left
    pids="$(tree "$(root_pid)" | paste -sd, -)"
    # shellcheck disable=SC2086
    kill -TERM ${pids//,/ } 2>/dev/null || true
    for _ in $(seq 1 10); do
      left="$(ps -o pid= -p "$pids" 2>/dev/null | tr -d ' ' || true)"
      [[ -z "$left" ]] && break
      sleep 1
    done
    # shellcheck disable=SC2086
    [[ -z "$left" ]] || kill -KILL $left 2>/dev/null || true
    echo "stopped process tree: $pids"
  fi
  rm -f "$STATE/pid"
  [[ -f "$STATE/run_id" ]] && echo "evidence kept at $(evidence_dir)"
  return 0
}

case "${1:-}" in
  up) cmd_up ;;
  doctor) cmd_doctor ;;
  login) shift; cmd_login "$@" ;;
  ab) shift; ab "$@" ;;
  shot) shift; cmd_shot "$@" ;;
  sql) shift; cmd_sql "$1" ;;
  evidence) evidence_dir ;;
  down) cmd_down ;;
  *) die "usage: $0 up | doctor | login [email] | ab <agent-browser args> | shot <feature> <step> | sql <query> | evidence | down" ;;
esac
