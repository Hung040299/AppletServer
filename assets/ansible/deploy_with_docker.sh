#! /bin/bash -eu

# shellcheck disable=SC1091
source ./lib.sh

gSecretkey="id_rsa_access.pem"

checkSecretkey() {
  if [ ! -f "$1" ]; then
    echo "Please set second paramater as ssh secret key and put ssh secret key in current directory!!"
    exit 1
  fi
  echo "ssh secret key find"
}

checkAccountName() {
  if [ -z "$1" ]; then
    echo "Please set deploy account as third parameter"
    exit 1
  fi
}

startDocker() {
  # shellcheck disable=SC2086
  sudo docker run \
    -v ${gServerRoot}:/tmp/${gServerName}:Z \
    -w /tmp/river_applet_server/assets/ansible \
    --rm -it "$gDockerImage" \
    /bin/bash -c "bash ./deploy.sh $1 $2 $3 $4"
}

npmSetup() {
  pushd "$gServerRoot"
  npm install
  npm install ER_Proto_Block_Server
  npm install
  popd
}

createZip() {

  pushd "${gServerRoot}/../"
  zip -ry river_applet_server.zip river_applet_server -X "${gServerRoot}/assets/ansible/id_rsa_access.pem"
  mv river_applet_server.zip "${gServerRoot}/assets/ansible"
  popd
}

main() {
  checkTarget "$1"
  checkSecretkey "$2"
  checkAccountName "$3"
  checkDockerInstalled
  if [ "$1" != "prod" ]; then
    npmSetup
  fi

  createZip
  startDocker "$1" "$2" "$3" "$4"
}

main "$@"
