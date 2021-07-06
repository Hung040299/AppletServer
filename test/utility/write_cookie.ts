import * as CookieGetter from "./cookie_getter";
const TestConfig = require("../api/controllers/config");
const main = async () => {
  await CookieGetter.writeCookie(TestConfig.mCookiePath);
  process.exit(0);
};

main();
