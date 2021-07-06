"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const puppeteer_1 = require("puppeteer");
const util_1 = require("../utility/util");
/* tslint:disable: no-var-requires */
const TestConfig = require("../api/controllers/config");
/* tslint:enable: no-var-requires */
const wait = async (msec) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, msec);
    });
};
exports.getCookie = async () => {
    return exports.getCookieWithEmail(TestConfig.mEmailAddr, TestConfig.mPassword);
};
exports.getCookieWithEmail = async (email, pass) => {
    const browser = await puppeteer_1.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const option = {};
    option.waitUntil = "networkidle0";
    option.timeout = 30000;
    await page.goto(TestConfig.mRiverURL, option);
    util_1.TestUtil.log("getting auth cookie");
    await page.type("#login-email-input", email);
    await page.type("#login-password-input", pass);
    // TestUtil.log("getting screenshot");
    // // await page.screenshot({ path: "home2.png", fullPage: true });
    // TestUtil.log("finish getting screenshot");
    util_1.TestUtil.log("start login");
    await page.click("#login-submit");
    let loginFlg = false;
    for (let i = 0; i < 10; i++) {
        const cur = page.url();
        util_1.TestUtil.log(`current url: ${cur}`);
        if (cur === TestConfig.mRiverLoginedURL) {
            loginFlg = true;
            break;
        }
        util_1.TestUtil.log(`${cur} !== ${TestConfig.mRiverLoginedURL}`);
        await wait(1000);
    }
    if (!loginFlg) {
        util_1.TestUtil.log("timeout fail to login!!");
        return Promise.resolve("");
    }
    util_1.TestUtil.log("login success!!");
    // await page.screenshot({ path: "home2.png", fullPage: true });
    const cookies = await page.cookies();
    let authCookieFlg = false;
    let authCookie = "";
    for (const cookie of cookies) {
        if (cookie.name === "Authorization") {
            authCookieFlg = true;
            authCookie = cookie.value;
            break;
        }
    }
    if (!authCookieFlg) {
        util_1.TestUtil.log("Cookie is not obtained!!");
        return Promise.resolve("");
    }
    authCookie = authCookie.replace(/\%20/g, " ");
    util_1.TestUtil.log(`cookie: ${authCookie}`);
    await page.close();
    await browser.close();
    return Promise.resolve(authCookie);
};
exports.writeCookie = async (path) => {
    util_1.TestUtil.log(`writing cookie to ${path}...`);
    try {
        const data = await exports.getCookie();
        fs.writeFileSync(path, data);
    }
    catch (e) {
        util_1.TestUtil.log(`error: ${e}`);
        return Promise.reject(false);
    }
    util_1.TestUtil.log(`finish writeing cookie to ${path}`);
    return Promise.resolve(true);
};
exports.main = async () => {
    await exports.writeCookie(TestConfig.mCookiePath);
    process.exit(0);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llX2dldHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvb2tpZV9nZXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHlDQUE0RDtBQUM1RCwwQ0FBMkM7QUFFM0MscUNBQXFDO0FBQ3JDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3hELG9DQUFvQztBQUVwQyxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsSUFBWSxFQUFpQixFQUFFO0lBQ2pELE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDM0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFVyxRQUFBLFNBQVMsR0FBRyxLQUFLLElBQXFCLEVBQUU7SUFDbkQsT0FBTywwQkFBa0IsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6RSxDQUFDLENBQUM7QUFFVyxRQUFBLGtCQUFrQixHQUFHLEtBQUssRUFDckMsS0FBYSxFQUNiLElBQVksRUFDSyxFQUFFO0lBQ25CLE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFFLGNBQWMsQ0FBRSxFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNyQyxNQUFNLE1BQU0sR0FBNEIsRUFBRSxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBRXZCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMs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