#! /bin/bash -eu
# shellcheck shell=bash

if [ ! -z "$2" ] && [ "$2" = "iot" ]; then
  gProjRoot="/home/riapps/iot/git/river_applet_server"
  gServerName="iot-applet"
else
  gProjRoot="/home/riapps/git/river_applet_server"
  gServerName="applet"
fi

gConfigDir=${gProjRoot}/config
gNginxConfSrc="${gProjRoot}/etc/nginx/nginx.conf"
gNginxConfDst="/etc/nginx/nginx.conf"

attension() {
  echo "Don't forget to run \$git pull origin before execute..."
  read -r -p "Hit enter: "
}

gotoProjRoot() {
  cd "${gProjRoot}"
}

clearAll() {
  git reset --hard
  git clean -xfd
}

runNpmInstall() {
  npm install
}

compileTypescript() {
  echo "compiling typescript"
  npx tsc --project .
  echo "finish compiling typescript"
}

#$1 is target env
setConfigFile() {
  pushd "${gConfigDir}"
  yamlFile="development_dev_applet.yaml"
  if [ "$1" = "dev" ]; then
    yamlFile="development_dev_applet.yaml"
  elif [ "$1" = "stg" ]; then
    yamlFile=" development_stg_applet.yaml"
  elif [ "$1" = "prod" ]; then
    yamlFile="production.yaml"
  else
    echo "unknown option: $1"
    exit 1
  fi
  echo "use yaml: ${yamlFile}"
  cp -f ${yamlFile} default.yaml
  cp -f ${yamlFile} development.yaml
  popd
}

runWorkAroundScript() {
  bash ./assets/workaround.sh
}

stopServer() {
  pm2 stop "${gServerName}"
}
startServer() {
  pm2 start "ecosystem.config.js"
}

setupServer() {
  stopServer
  #  clearAll
  if [ "$1" != "prod" ]; then
    runNpmInstall
  fi
  runWorkAroundScript
  compileTypescript
  setConfigFile "$1"
  startServer
}
setupNginx() {
  sudo cp -f "${gNginxConfSrc}" "${gNginxConfDst}"
  sudo nginx -s reload
}

usage() {
  cat <<EOS
usage:
  $0 [dev|stg|prod]
EOS
}

#$1
checkoption() {
  if [ "$1" = "dev" ]; then
    echo "target: dev"
  elif [ "$1" = "stg" ]; then
    echo "target: stg"
  elif [ "$1" = "prod" ]; then
    echo "target: prod"
  else
    usage
    exit 1
  fi
}

setupAutoLaunch() {
  pm2 startup
  sudo env PATH="$PATH:/usr/local/bin" /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u riapps --hp /home/riapps
  pm2 save

  sudo systemctl enable nginx
}

updatePm2Config() {
  sudo cp -f ecosystem_iot.config.js ecosystem.config.js
}

main() {
  checkoption "$1"
  # attension
  gotoProjRoot
  if [ ! -z "$2" ] && [ "$2" = "iot" ]; then
    updatePm2Config
  fi

  setupServer "$1"
  #  setupNginx
  setupAutoLaunch
}

main "$@"
