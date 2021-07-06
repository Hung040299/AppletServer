#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

#$1 is collection name.
gCollectionName=${2}
gDataJson="./data/${2}.json"
gDeleteFields=("owner" "createdAt" "sections" "updatedAt" "version")

#$1 is target json
deleteNeedlessFields() {
  block=${1}
  fieldNum=${#gDeleteFields[@]}

  for i in $(seq 0 "$((fieldNum - 1))"); do
    block=$(echo "${block}" | jq "del(.${gDeleteFields[$i]})")
  done
  echo "$block"
}

#$1 is dataId
deleteData() {
  dataId=${1}
  #deleteNeedlessFields "$data"
  url="${gDodaiURL}${gCollectionName}/${dataId}"
  echo "deleting ${dataId} from ${url}"
  curl -X DELETE \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gDodaiRootKey}" \
    "$url" --insecure
  echo ""
}

deleteDatas() {
  echo "deleting ${gDataJson}..."
  datas=$(cat <"${gDataJson}")
  num=$(echo "${datas}" | jq length)
  echo "data num: ${num}"

  for i in $(seq 0 "$((num - 1))"); do
    # for i in $(seq 3 3); do
    data=$(echo "${datas}" | jq .["${i}"])
    dataId=$(echo "$data" | jq -r ._id)
    deleteData "${dataId}"
  done
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
  deleteDatas
}

main "$@"
