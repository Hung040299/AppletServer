// @flow
"use strict";

const config = require("config");
const log4js = require("log4js");
log4js.configure(config.log4js);

if (process.env.NODE_ENV === "production") {
  const appender = require("fluent-logger").support.log4jsAppender("node", {
    host: config.fluentd.host,
    port: config.fluentd.port,
    timeout: config.fluentd.timeout
  });
  log4js.addAppender(appender);
}

let logger = {
  system: log4js.getLogger("system"),
  access: log4js.getLogger("access"),
  error: log4js.getLogger("error")
};

exports.logger = logger;
