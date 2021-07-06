#! /bin/bash -eu
# shellcheck shell=bash

gDockerImage="blockbuilder:latest"
gServerRoot="$(git rev-parse --show-toplevel)"
gServerName=$(basename "${gServerRoot}")

ansibleUsage() {
  cat <<EOS
Usage:
  After put id_rsa_access.pem  into current directly.
  ./$0 [dev|stg|prod]
EOS
}

usageInstallDocker() {
  cat <<EOS
docker command is not found.
Please install docker.
  Ubuntu
     sudo apt-get install docker docker.io containerd runc
  Mac
    Install docker from the following url.
      https://docs.docker.com/docker-for-mac/install/
EOS
}

checkDockerInstalled() {
  echo "checking docker..."
  if [ -z "$(which docker)" ]; then
    usageInstallDocker
    exit 0
  fi
  echo "docker command is already installed!"
}

buildDockerImage() {
  echo "building docker image...."
  sudo -S docker build -t "${gDockerImage}" .
  echo "finish building docker image."
}

buildDockerImageIfNeed() {
  echo "checking docker image..."
  result=$(sudo -S docker image ls -q "${gDockerImage}")
  # echo "${result}"
  if [ -z "${result}" ]; then
    echo "found docker image: ${gDockerImage}"
    buildDockerImage
  else
    echo "found docker image: ${gDockerImage}"
  fi
}

#$1 is target environment. [dev|stg|prod]
checkTarget() {
  if [ "$1" = "dev" ]; then
    echo "target is dev"
  elif [ "$1" = "stg" ]; then
    echo "target is stg"
  elif [ "$1" = "prod" ]; then
    echo "target is prod"
  else
    echo "unknow target: $1"
    ansibleUsage
    exit 1
  fi

}
