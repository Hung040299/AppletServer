#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod] [collection_name]
EOS
}

#$1 is collection name to get data.
getCollectionDataNum() {
  collectionName=${1}
  url="${gDodaiFileURL}${collectionName}/_count"
  echo "getting count from ${collectionName}..."
  echo "${url}"
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
  getCollectionDataNum "$2"
}

main "$@"
