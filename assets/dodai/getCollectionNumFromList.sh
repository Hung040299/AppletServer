#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh

#$1 is collection name.
gCollectionName=${1}
gDataJson="./data/${1}.json"
gDeleteFields=("owner" "createdAt" "sections" "updatedAt" "version")

gCountDataScript="./getCollectionDataNum.sh"
gCountFileScript="./getCollectionFileNum.sh"

#$1 is target json
deleteNeedlessFields() {
  block=${1}
  fieldNum=${#gDeleteFields[@]}

  for i in $(seq 0 "$((fieldNum - 1))"); do
    block=$(echo "${block}" | jq "del(.${gDeleteFields[$i]})")
  done
  echo "$block"
}

#$1 is target json
uploadJson() {
  data=${1}
  #deleteNeedlessFields "$data"
  udata=$(deleteNeedlessFields "$data")
  echo "$udata" >result.txt
  #echo "$gProdRootKey $gProdDodaiURL"
  curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gProdRootKey}" \
    -d "${udata}" \
    "${gProdDodaiURL}${gCollectionName}" --insecure
  echo ""
}

uploadJsons() {
  echo "uploading ${gDataJson}..."
  datas=$(cat <"${gDataJson}")
  num=$(echo "${datas}" | jq length)
  echo "data num: ${num}"

  for i in $(seq 0 "$((num - 1))"); do
    # for i in $(seq 3 3); do
    data=$(echo "${datas}" | jq .["${i}"])
    uploadJson "${data}"
  done
}

usage() {
  cat <<EOS
usage:
$0 [dev|stg|prod] [collection_list_json]
EOS
}

#$1 is target environment
#$2 is target collection info json
getCountFromCollection() {
  collectionName=$(echo "${2}" | jq -r .name)
  collectionType=$(echo "${2}" | jq -r .type)
  echo "getting count ${collectionName}, type=${collectionType} in ${1}"
  if [ "${collectionType}" = "data" ]; then
    echo "   count as datastore"
    bash "${gCountDataScript}" "${1}" "${collectionName}"
  elif [ "${collectionType}" = "file" ]; then
    echo "   count as filestore"
    bash "${gCountFileScript}" "${1}" "${collectionName}"
  else
    echo "    error unknown type: ${collectionType}"
  fi
  echo ""
  echo ""
}

#$1 is target enviroment
#$2 is json path of collections
getCountFromCollections() {
  echo "deleting collections datas..."
  datas=$(cat <"${2}")
  num=$(echo "${datas}" | jq length)
  echo "data num: ${num}"

  for i in $(seq 0 "$((num - 1))"); do
    #for i in $(seq 0 "$((1 - 1))"); do
    data=$(echo "${datas}" | jq .["${i}"])
    getCountFromCollection "$1" "${data}"
  done
}

main() {
  if [ $# -ne 2 ]; then
    usage
    exit 1
  fi
  libSetTargetConfig "$1"
  getCountFromCollections "$@"
}

main "$@"
