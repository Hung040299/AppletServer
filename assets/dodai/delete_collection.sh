#! /bin/bash -eu
# shellcheck shell=bash

source ./dodaiInfo.sh

usage() {
  if [ $# -ne 1 ]; then
    echo "${0} [dev|stg|prod] [collection_name]"
    exit 1
  fi
}

#$1 is collection name
deleteCollection() {
  collection_name=$1
  auth_head=Authorization:${gDodaiRootKey}

  curl -X DELETE -H "${auth_head}" "${gDodaiBaseURL}collection/${collection_name}"
}

#$1 is [dev|stg|prod]
#$2 is [collection name]
main() {
  if [ $# -ne 2 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  deleteCollection "$2"
}

main "$@"
