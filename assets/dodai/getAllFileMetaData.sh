#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod] [filestore CollectionName]
EOS
}

getCollectionInfos() {
  collectionName="$1"
  curl -H "Authorization:${gDodaiRootKey}" \
    "${gDodaiFileURL}${collectionName}" --insecure
}

main() {
  if [ $# -ne 2 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  getCollectionInfos "$2"
}

main "$@"
