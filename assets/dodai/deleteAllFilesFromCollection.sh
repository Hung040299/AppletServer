#! /bin/bash -eu
# shellcheck shell=bash

source dodaiInfo.sh
gMetadataScript="./getAllFileMetaData.sh"

#$1 is enviroment name
#$2 is collection name
#$3 is target file metadata
deleteOneData() {
  # echo "$2"
  metadata=$3
  collection=$2
  id=$(echo "${metadata}" | jq -r ._id)
  filename=$(echo "${metadata}" | jq -r .filename)
  echo "id: ${id}, filename: ${filename}"

  #deleteNeedlessFields "$data"
  url="${gDodaiFileURL}${collection}/${id}"
  echo "deleting one data by ${url}"
  curl -X DELETE \
    -H "Content-Type: application/json" \
    -H "Authorization: ${gDodaiRootKey}" \
    -G --data-urlencode "allVersions=true" \
    "$url" --insecure
  echo ""

}

#$1 is enviroment name
#$2 is collection name
deleteAllData() {
  dataJson=$(bash ${gMetadataScript} "$1" "$2" | sed -e "/^setting for /d")

  num=$(echo "${dataJson}" | jq length)
  echo "file num: ${num}"

  for i in $(seq 0 $((num - 1))); do
    # for i in $(seq 0 $((1 - 1))); do
    data=$(echo "${dataJson}" | jq .["${i}"])
    # echo "deleting ${data}"
    deleteOneData "$1" "$2" "$data"
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
  deleteAllData "$@"
}

main "$@"
