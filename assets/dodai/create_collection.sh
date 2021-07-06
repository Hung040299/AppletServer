#! /bin/bash -eu
# shellcheck shell=bash

source ./dodaiInfo.sh

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod] [collection_name] [collection_type (data | file)]
EOS
}

# $1 is collection_name
# $2 is collection_type
createCollection() {
  collection_name=$1
  collection_type=$2
  auth_head=Authorization:${gDodaiRootKey}
  if [ "${collection_type}" == "data" ]; then
    # create Datastore
    post_json="{\"type\":\"data\",\"name\":\"${collection_name}\",\"readPermission\":1,\"writePermission\":1}"
  elif [ "${collection_type}" == "file" ]; then
    #create Filestore
    post_json="{\"type\":\"file\",\"name\":\"${collection_name}\",\"readPermission\":1,\"writePermission\":1}"
  fi
  echo "post json: ${post_json}"
  curl -X POST -H "${auth_head}" -H "Content-Type : application/json" -d "${post_json}" "${gDodaiBaseURL}collection"
}

main() {
  if [ $# -ne 3 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  collection_name=$2
  collection_type=$3
  createCollection "${collection_name}" "${collection_type}"
}

main "$@"
