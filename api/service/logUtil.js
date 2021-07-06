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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvZ1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBUTtBQUNSLFlBQVksQ0FBQztBQUViLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFaEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7SUFDekMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO1FBQ3ZFLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUk7UUFDekIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUN6QixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPO0tBQ2hDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUI7QUFFRCxJQUFJLE1BQU0sR0FBRztJQUNYLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUNsQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDbEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0NBQ2pDLENBQUM7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyJ9