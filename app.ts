"use strict";
import "./api/datadog/tracer";
import * as sec from "ER_Proto_Block_Server/lib/security";
import e from "express";
import SwaggerExpress from "swagger-express-mw";
import { PushService } from "./api/service/pushService";

const setting = require("config");

// Env vars
const port = process.env.PORT || 10010;
// Secret management using node-config. Force crash if sufficient config/*.yaml is not prepared (StrictMode)
process.env.NODE_CONFIG_STRICT_MODE = "true";

const app = e();

// Root app config
const config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    JWTToken: sec.verifyJWTToken
  }
};

console.log(`config: ${JSON.stringify(setting, null, " ")}`);

const alreadySentErrorHandler = (err: any, req: any, res: any, next: any) => {
  if (err.message.includes("ERR_HTTP_HEADERS_SENT")) {
    // Do nothing; this is known error of swagger-node-runner 0.5.13 when response is already sent by securityHandlers
    // See https://github.com/theganyo/swagger-node-runner/blob/v0.5.13/lib/connect_middleware.js#L53
    // or issue https://github.com/theganyo/swagger-node-runner/issues/87
  } else if (err.code) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(err));
  } else {
    next();
  }
};

PushService.loadAllCerts(0);

// Start app
SwaggerExpress.create(config, (err: any, swaggerExpress: any) => {
  if (err) {
    throw err;
  }

  // install middleware
  swaggerExpress.register(app);
  app.use(alreadySentErrorHandler);

  app.listen(port);

  console.log(
    `Use '${sec.generateEncryptedAppKey()}' for AppKey API authentication.`
  );
});

module.exports = app; // for testing
