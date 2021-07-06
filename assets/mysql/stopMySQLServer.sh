#! /bin/bash
# shellcheck shell=bash
set -eu

pushd "docker"
docker-compose down
popd
