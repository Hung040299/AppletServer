#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

#$1 is collection name
#$2 is dataID
deleteOneData() {
  collection=${1}
  dataID=${2}
  #deleteNeedlessFields "$data"
  url="${gDodaiURL}${collection}/${dataID}"
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
$0 [dev|stg|prod] [collection_name] [dataID]
EOS
}

main() {
  if [ $# -ne 3 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "${1}"
  deleteOneData "${2}" "${3}"
}

main "$@"
