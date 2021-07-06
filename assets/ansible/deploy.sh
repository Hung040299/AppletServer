#! /bin/bash -eu

# shellcheck disable=SC1091
source ./lib.sh

npmInstall() {
  pushd "$gServerRoot"
  npm install ER_Proto_Block_Server
  npm pack
  mv river_applet_server-0.0.1.tgz "${gServerRoot}/assets/ansible"
  popd
}

cleanSource() {
  pushd "$gServerRoot"
  git clean -xfd
  popd
}

createZip() {
  pushd "$gServerRoot/../"
  zip -ry "${gServerName}.zip" "$gServerName"
  mv "${gServerName}.zip" "${gServerRoot}/assets/ansible"
  popd
}

#$1 is target environment. [dev|stg|prod]
startAnsible() {
  export ANSIBLE_HOST_KEY_CHECKING=False
  if [ ! -z "$4" ] && [ "$4" = "iot" ]; then
    # deploy IoT branch
    ansible-playbook -i ./hosts simple_iot.yaml --private-key="$2" -u "$3" -v --extra-vars "{\"target\":\"${1}\"}"
  else
    # deploy normal branch
    ansible-playbook -i ./hosts simple.yaml --private-key="$2" -u "$3" -v --extra-vars "{\"target\":\"${1}\"}"
  fi
}

main() {
  echo "start $0 deploying..."
  #npmInstall

  #cleanSource
  #createZip
  checkTarget "$1"
  startAnsible "$1" "$2" "$3" "$4"
}

main "$@"
