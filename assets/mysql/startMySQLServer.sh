#! /bin/bash
# shellcheck shell=bash
set -eu

gDockerImage="applet_mysql"
gDockerFolder="./docker"

buildDockerImage() {
  pushd "${gDockerFolder}"
  docker build -t "${gDockerImage}" .
  popd
}

main() {
  exist=$(docker image ls -q ${gDockerImage})
  if [ -z "${exist}" ]; then
    buildDockerImage
  fi

  pushd "${gDockerFolder}"
  docker-compose up -d
  popd

  # use phpmyadmin and disable ssl
  # docker run -p 8080:80 -p ${gPort}:${gPort} --name "${gContainerName}" -it "${gDockerImage}" --default-authentication-plugin=mysql_native_password --skip-ssl
}

main
