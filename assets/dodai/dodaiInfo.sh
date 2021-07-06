#!/bin/bash -eu
# shellcheck shell=bash
# shellcheck disable=SC2034

gProdRootKey="rkey_PcVilQMvsh2sJXQpg"
gProdDodaiBaseURL="https://localhost:8888/v1/a_88Rqf1hf/"
gProdDodaiURL="${gProdDodaiBaseURL}g_6fWqhPHK/data/"

gDevRootKey="rkey_6KnRBSVK4xFz9pVpER"
gDevDodaiBaseURL="https://st-dod.riiiver.com/v1/a_QknrkGVJ/"
gDevDodaiURL="${gDevDodaiBaseURL}g_h6hfcK3x/data/"

gStgRootKey="rkey_wQ33ngqWBD5LiDU5Xm"
gStgDodaiBaseURL="https://st-dod.riiiver.com/v1/a_jf02fuwj/"
gStgDodaiURL="${gStgDodaiBaseURL}g_HfrQEfKt/data/"

gDodaiBaseURL=""
gDodaiRootKey=""
gDodaiURL=""
gDodaiFileURL=""

# $1 dev or stg or prod
if [ "$1" = "prod" ]; then
  echo "setting for production"
  gDodaiRootKey="${gProdRootKey}"
  gDodaiBaseURL="${gProdDodaiBaseURL}"
  gDodaiURL="${gProdDodaiURL}"
elif [ "$1" = "stg" ]; then
  echo "setting for staging"
  gDodaiRootKey="${gStgRootKey}"
  gDodaiBaseURL="${gStgDodaiBaseURL}"
  gDodaiURL="${gStgDodaiURL}"
elif [ "$1" = "dev" ]; then
  echo "setting for development"
  gDodaiRootKey="${gDevRootKey}"
  gDodaiBaseURL="${gDevDodaiBaseURL}"
  gDodaiURL="${gDevDodaiURL}"
else
  echo "unknown target: ${1}"
  exit 1
fi
gDodaiFileURL=$(dirname ${gDodaiURL})/file/
#echo "gDodaiFileURL: ${gDodaiFileURL}"

# $1 dev or stg or prod
libSetTargetConfig() {
  if [ "$1" = "prod" ]; then
    echo "setting for production"
    gDodaiRootKey="${gProdRootKey}"
    gDodaiBaseURL="${gProdDodaiBaseURL}"
    gDodaiURL="${gProdDodaiURL}"
  elif [ "$1" = "stg" ]; then
    echo "setting for staging"
    gDodaiRootKey="${gStgRootKey}"
    gDodaiBaseURL="${gStgDodaiBaseURL}"
    gDodaiURL="${gStgDodaiURL}"
  elif [ "$1" = "dev" ]; then
    echo "setting for development"
    gDodaiRootKey="${gDevRootKey}"
    gDodaiBaseURL="${gDevDodaiBaseURL}"
    gDodaiURL="${gDevDodaiURL}"
  else
    echo "unknown target: ${1}"
    exit 1
  fi
  gDodaiFileURL=$(dirname ${gDodaiURL})/file/
  #echo "gDodaiFileURL: ${gDodaiFileURL}"
}
