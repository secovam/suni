#!/bin/sh
# Idempotent: assigns the node layout, creates the bucket and key, enables web hosting.
set -eu

API="http://garage:3903/v2"
AUTH="Authorization: Bearer ${GARAGE_ADMIN_TOKEN}"

call() {
  curl -fsS -H "$AUTH" -H "Content-Type: application/json" "$@"
}

# The API answers with pretty-printed JSON, so flatten it before matching.
flat() {
  call "$@" | tr -d ' \n'
}

if flat "$API/GetClusterLayout" | grep -q '"roles":\[\]'; then
  node_id=$(flat "$API/GetClusterStatus" | sed -n 's/.*"nodes":\[{"id":"\([0-9a-f]*\)".*/\1/p')
  call -o /dev/null -X POST "$API/UpdateClusterLayout" \
    -d "{\"roles\":[{\"id\":\"$node_id\",\"zone\":\"dc1\",\"capacity\":1073741824,\"tags\":[]}]}"
  call -o /dev/null -X POST "$API/ApplyClusterLayout" -d '{"version":1}'
fi

# 409 on re-runs means it already exists.
call -o /dev/null -X POST "$API/CreateBucket" -d "{\"globalAlias\":\"${STORAGE_BUCKET_NAME}\"}" || true
call -o /dev/null -X POST "$API/ImportKey" \
  -d "{\"name\":\"suni-local\",\"accessKeyId\":\"${STORAGE_ACCESS_KEY_ID}\",\"secretAccessKey\":\"${STORAGE_SECRET_ACCESS_KEY}\"}" || true

bucket_id=$(flat "$API/GetBucketInfo?globalAlias=${STORAGE_BUCKET_NAME}" | sed -n 's/^{"id":"\([0-9a-f]*\)".*/\1/p')
call -o /dev/null -X POST "$API/AllowBucketKey" \
  -d "{\"bucketId\":\"$bucket_id\",\"accessKeyId\":\"${STORAGE_ACCESS_KEY_ID}\",\"permissions\":{\"read\":true,\"write\":true,\"owner\":true}}"
call -o /dev/null -X POST "$API/UpdateBucket?id=$bucket_id" \
  -d '{"websiteAccess":{"enabled":true,"indexDocument":"index.html"}}'

echo "garage ready: bucket ${STORAGE_BUCKET_NAME}"
