#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

#$1 is collection name
deleteAllData() {
  collection=${1}
  #deleteNeedlessFields "$data"
  url="${gDodaiURL}${collection}"
  echo "deleting all datas from ${url}"
  curl -X DELETE \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gDodaiRootKey}" \
    "$url" --insecure
  echo ""
}

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod] [collection_name]
EOS
}

main() {
  if [ $# -ne 2 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "${1}"
  deleteAllData "${2}"
}

main "$@"
