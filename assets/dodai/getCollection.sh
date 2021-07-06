#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod]
EOS
}

getCollectionInfos() {
  curl -H "Authorization:${gDodaiRootKey}" \
    "${gDodaiBaseURL}collection" --insecure
}

main() {
  if [ $# -ne 1 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  getCollectionInfos
}

main "$@"
