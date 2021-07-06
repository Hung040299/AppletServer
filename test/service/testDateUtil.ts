import moment from "moment";
import * as assert from "power-assert";
import { DateUtil } from "../../api/service/DateUtil";

describe("TestDateUtil", () => {
  it("rfc1123ToIso8601", () => {
    const rfc1123 = "Tue, 03 Mar 2020 23:03:21 GMT";
    const actual = DateUtil.convertIso8601(rfc1123);
    assert.deepStrictEqual(actual, "2020-03-03T23:03:21+00:00");
  });

  it("iso8601 fomat is same as dodai's", () => {
    const expected = "2019-08-09T00:28:18+00:00";
    const actual = DateUtil.convertIso8601(expected);
    assert.deepStrictEqual(actual, expected);
  });

  it("invalid string", () => {
    const invalid = "invalid";
    const actual = DateUtil.convertIso8601(invalid);
    assert.deepStrictEqual(actual, undefined);
  });

  it("undefined", () => {
    const actual = DateUtil.convertIso8601(undefined);
    assert.deepStrictEqual(actual, undefined);
  });

  it("get current", () => {
    const now = new Date().toISOString();
    const expected = DateUtil.convertIso8601(now);
    const actual = DateUtil.getCurrentIso8601Time();
    assert.notDeepStrictEqual(actual, undefined);
    assert.deepStrictEqual(actual, expected);
  });

  it("convert unix", () => {
    const iso8601 = DateUtil.getCurrentIso8601Time();
    const unixMil = new Date().getTime() / 1000;
    const unix = Math.floor(unixMil);
    const actual = moment.utc(iso8601).unix();
    assert.deepStrictEqual(actual, unix);
  });
});
