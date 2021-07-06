#!/bin/bash -eu
# shellcheck shell=bash
MODE=""
if [ $# -eq 2 ]; then
  if [ "$2" == "stg" -o "$2" == "dev" ]; then
    MODE="$2"
  fi
fi

source dodaiInfo.sh $MODE

#$1 is collection name.
gCollectionName=${1}
gDataJson="./data/${1}.json"
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

#$1 is target json
uploadJson() {
  data=${1}
  #deleteNeedlessFields "$data"
  udata=$(deleteNeedlessFields "$data")
  echo "$udata" >result.txt
  echo "$gDodaiRootKey $gDodaiURL"
  echo "curl -X POST"
  echo "-H \"Content-Type: application/json\""
  echo "-H \"Authorization: ${gDodaiRootKey}\""
  echo "\"${gDodaiURL}${gCollectionName}\" --insecure"
  curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gDodaiRootKey}" \
    -d "${udata}" \
    "${gDodaiURL}${gCollectionName}" --insecure
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

printUsage() {
  cat <<EOS
usage:
$0 [collection_name] [stg|dev]
EOS
}

main() {
  if [ $# -gt 2 ]; then
    printUsage
    exit 1
  fi

  # config and load
  uploadJsons
}

main "$@"
