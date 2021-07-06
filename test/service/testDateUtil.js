"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const assert = __importStar(require("power-assert"));
const DateUtil_1 = require("../../api/service/DateUtil");
describe("TestDateUtil", () => {
    it("rfc1123ToIso8601", () => {
        const rfc1123 = "Tue, 03 Mar 2020 23:03:21 GMT";
        const actual = DateUtil_1.DateUtil.convertIso8601(rfc1123);
        assert.deepStrictEqual(actual, "2020-03-03T23:03:21+00:00");
    });
    it("iso8601 fomat is same as dodai's", () => {
        const expected = "2019-08-09T00:28:18+00:00";
        const actual = DateUtil_1.DateUtil.convertIso8601(expected);
        assert.deepStrictEqual(actual, expected);
    });
    it("invalid string", () => {
        const invalid = "invalid";
        const actual = DateUtil_1.DateUtil.convertIso8601(invalid);
        assert.deepStrictEqual(actual, undefined);
    });
    it("undefined", () => {
        const actual = DateUtil_1.DateUtil.convertIso8601(undefined);
        assert.deepStrictEqual(actual, undefined);
    });
    it("get current", () => {
        const now = new Date().toISOString();
        const expected = DateUtil_1.DateUtil.convertIso8601(now);
        const actual = DateUtil_1.DateUtil.getCurrentIso8601Time();
        assert.notDeepStrictEqual(actual, undefined);
        assert.deepStrictEqual(actual, expected);
    });
    it("convert unix", () => {
        const iso8601 = DateUtil_1.DateUtil.getCurrentIso8601Time();
        const unixMil = new Date().getTime() / 1000;
        const unix = Math.floor(unixMil);
        const actual = moment_1.default.utc(iso8601).unix();
        assert.deepStrictEqual(actual, unix);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdERhdGVVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVzdERhdGVVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG9EQUE0QjtBQUM1QixxREFBdUM7QUFDdkMseURBQXNEO0FBRXRELFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO0lBQzVCLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDMUIsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUM7UUFDaEQsTUFBTSxNQUFNLEdBQUcsbUJBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztJQUM5RCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7UUFDMUMsTUFBTSxRQUFRLEdBQUcsMkJBQTJCLENBQUM7UUFDN0MsTUFBTSxNQUFNLEdBQUcsbUJBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUMxQixNQUFNLE1BQU0sR0FBRyxtQkFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBQ25CLE1BQU0sTUFBTSxHQUFHLG1CQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyQyxNQUFNLFFBQVEsR0FBRyxtQkFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxtQkFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDaEQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBQ3RCLE1BQU0sT0FBTyxHQUFHLG1CQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==