#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

gDataFolder="./data/"

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod][collection_name]
EOS
}

#$1 is collection name to get data.
getCollectionData() {
  collectionName=${1}
  url="${gDodaiURL}${collectionName}"
  echo "getting data from ${collectionName}..."
  curl \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gDodaiRootKey}" \
    "${url}" --insecure
}

main() {
  if [ $# -ne 2 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  getCollectionData "$2"
}

main "$@"
