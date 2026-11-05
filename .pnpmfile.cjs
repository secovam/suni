const fs = require("node:fs");

const path = require("node:path");

const BANNED_DEPENDENCIES = new Map([
  [
    "react-hook-form",
    "Use TanStack Form with the Zod schemas from @suni/db/validation/*.",
  ],
]);

const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

function readWorkspaceNames() {
  const names = new Set(["suni"]);

  for (const dir of ["apps", "packages"]) {
    for (const entry of fs.readdirSync(path.join(__dirname, dir))) {
      const manifest = path.join(__dirname, dir, entry, "package.json");

      if (fs.existsSync(manifest)) {
        names.add(JSON.parse(fs.readFileSync(manifest, "utf-8")).name);
      }
    }
  }

  return names;
}

const workspaceNames = readWorkspaceNames();

// Lint ignores packages/ui, so the ban is enforced here for every workspace package.
function readPackage(pkg) {
  if (!workspaceNames.has(pkg.name)) {
    return pkg;
  }

  for (const field of DEPENDENCY_FIELDS) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      const reason = BANNED_DEPENDENCIES.get(name);

      if (reason) {
        throw new Error(`${pkg.name} declares ${name}. ${reason}`);
      }
    }
  }

  return pkg;
}

module.exports = { hooks: { readPackage } };
