#! /bin/bash -eu

# shellcheck disable=SC1091

source ./lib.sh

main() {
  pushd "$gServerRoot"
  npm install
  popd
}

main
