#!/bin/bash

sed -i -e "s/var split = err.message.split(path.sep);/var split = err.message.split('\\\n')[0].split(path.sep);/g" "node_modules/bagpipes/lib/fittingTypes/user.js"
