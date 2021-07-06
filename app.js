"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./api/datadog/tracer");
const sec = __importStar(require("ER_Proto_Block_Server/lib/security"));
const express_1 = __importDefault(require("express"));
const swagger_express_mw_1 = __importDefault(require("swagger-express-mw"));
const pushService_1 = require("./api/service/pushService");
const setting = require("config");
// Env vars
const port = process.env.PORT || 10010;
// Secret management using node-config. Force crash if sufficient config/*.yaml is not prepared (StrictMode)
process.env.NODE_CONFIG_STRICT_MODE = "true";
const app = express_1.default();
// Root app config
const config = {
    appRoot: __dirname,
    swaggerSecurityHandlers: {
        JWTToken: sec.verifyJWTToken
    }
};
console.log(`config: ${JSON.stringify(setting, null, " ")}`);
const alreadySentErrorHandler = (err, req, res, next) => {
    if (err.message.includes("ERR_HTTP_HEADERS_SENT")) {
        // Do nothing; this is known error of swagger-node-runner 0.5.13 when response is already sent by securityHandlers
        // See https://github.com/theganyo/swagger-node-runner/blob/v0.5.13/lib/connect_middleware.js#L53
        // or issue https://github.com/theganyo/swagger-node-runner/issues/87
    }
    else if (err.code) {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(err));
    }
    else {
        next();
    }
};
pushService_1.PushService.loadAllCerts(0);
// Start app
swagger_express_mw_1.default.create(config, (err, swaggerExpress) => {
    if (err) {
        throw err;
    }
    // install middleware
    swaggerExpress.register(app);
    app.use(alreadySentErrorHandler);
    app.listen(port);
    console.log(`Use '${sec.generateEncryptedAppKey()}' for AppKey API authentication.`);
});
module.exports = app; // for testing
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FBQ2IsZ0NBQThCO0FBQzlCLHdFQUEwRDtBQUMxRCxzREFBd0I7QUFDeEIsNEVBQWdEO0FBQ2hELDJEQUF3RDtBQUV4RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbEMsV0FBVztBQUNYLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUN2Qyw0R0FBNEc7QUFDNUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxNQUFNLENBQUM7QUFFN0MsTUFBTSxHQUFHLEdBQUcsaUJBQUMsRUFBRSxDQUFDO0FBRWhCLGtCQUFrQjtBQUNsQixNQUFNLE1BQU0sR0FBRztJQUNiLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLHVCQUF1QixFQUFFO1FBQ3ZCLFFBQVEsRUFBRSxHQUFHLENBQUMsY0FBYztLQUM3QjtDQUNGLENBQUM7QUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUU3RCxNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxHQUFRLEVBQUUsSUFBUyxFQUFFLEVBQUU7SUFDMUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO1FBQ2pELGtIQUFrSDtRQUNsSCxpR0FBaUc7UUFDakcscUVBQXFFO0tBQ3RFO1NBQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ25CLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDL0I7U0FBTTtRQUNMLElBQUksRUFBRSxDQUFDO0tBQ1I7QUFDSCxDQUFDLENBQUM7QUFFRix5QkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUU1QixZQUFZO0FBQ1osNEJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBUSxFQUFFLGNBQW1CLEVBQUUsRUFBRTtJQUM5RCxJQUFJLEdBQUcsRUFBRTtRQUNQLE1BQU0sR0FBRyxDQUFDO0tBQ1g7SUFFRCxxQkFBcUI7SUFDckIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFakMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVqQixPQUFPLENBQUMsR0FBRyxDQUNULFFBQVEsR0FBRyxDQUFDLHVCQUF1QixFQUFFLGtDQUFrQyxDQUN4RSxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLGNBQWMifQ==