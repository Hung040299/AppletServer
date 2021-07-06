"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CookieGetter = __importStar(require("./cookie_getter"));
const TestConfig = require("../api/controllers/config");
const main = async () => {
    await CookieGetter.writeCookie(TestConfig.mCookiePath);
    process.exit(0);
};
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfY29va2llLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid3JpdGVfY29va2llLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDhEQUFnRDtBQUNoRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUN4RCxNQUFNLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtJQUN0QixNQUFNLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBRUYsSUFBSSxFQUFFLENBQUMifQ==