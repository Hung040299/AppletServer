import * as fs from "fs";
import { DirectNavigationOptions, launch } from "puppeteer";
import { TestUtil } from "../utility/util";

/* tslint:disable: no-var-requires */
const TestConfig = require("../api/controllers/config");
/* tslint:enable: no-var-requires */

const wait = async (msec: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
};

export const getCookie = async (): Promise<string> => {
  return getCookieWithEmail(TestConfig.mEmailAddr, TestConfig.mPassword);
};

export const getCookieWithEmail = async (
  email: string,
  pass: string
): Promise<string> => {
  const browser = await launch({ args: [ '--no-sandbox' ] });
  const page = await browser.newPage();
  const option: DirectNavigationOptions = {};
  option.waitUntil = "networkidle0";
  option.timeout = 30000;

  await page.goto(TestConfig.mRiverURL, option);

  TestUtil.log("getting auth cookie");
  await page.type("#login-email-input", email);
  await page.type("#login-password-input", pass);
  // TestUtil.log("getting screenshot");
  // // await page.screenshot({ path: "home2.png", fullPage: true });
  // TestUtil.log("finish getting screenshot");
  TestUtil.log("start login");
  await page.click("#login-submit");
  let loginFlg = false;
  for (let i = 0; i < 10; i++) {
    const cur = page.url();
    TestUtil.log(`current url: ${cur}`);
    if (cur === TestConfig.mRiverLoginedURL) {
      loginFlg = true;
      break;
    }
    TestUtil.log(`${cur} !== ${TestConfig.mRiverLoginedURL}`);
    await wait(1000);
  }
  if (!loginFlg) {
    TestUtil.log("timeout fail to login!!");
    return Promise.resolve("");
  }
  TestUtil.log("login success!!");
  // await page.screenshot({ path: "home2.png", fullPage: true });

  const cookies = await page.cookies();
  let authCookieFlg = false;
  let authCookie: string = "";
  for (const cookie of cookies) {
    if (cookie.name === "Authorization") {
      authCookieFlg = true;
      authCookie = cookie.value;
      break;
    }
  }
  if (!authCookieFlg) {
    TestUtil.log("Cookie is not obtained!!");
    return Promise.resolve("");
  }
  authCookie = authCookie.replace(/\%20/g, " ");
  TestUtil.log(`cookie: ${authCookie}`);
  await page.close();
  await browser.close();
  return Promise.resolve(authCookie);
};

export const writeCookie = async (path: string): Promise<boolean> => {
  TestUtil.log(`writing cookie to ${path}...`);
  try {
    const data = await getCookie();
    fs.writeFileSync(path, data);
  } catch (e) {
    TestUtil.log(`error: ${e}`);
    return Promise.reject(false);
  }
  TestUtil.log(`finish writeing cookie to ${path}`);
  return Promise.resolve(true);
};

export const main = async () => {
  await writeCookie(TestConfig.mCookiePath);
  process.exit(0);
};
