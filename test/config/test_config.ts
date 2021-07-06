import { readFileSync } from "fs";

export class TestConfig {

  public static readonly mCookiePath = "./auth.txt";

  public static getDodaiRootKey(): string {
    TestConfig.init();
    return TestConfig.mDodaiRootKey;
  }

  public static getTestApiKey(): string {
    if (TestConfig.mApiKey.length > 0) {
      return TestConfig.mApiKey;
    }
    try {
      const key = readFileSync(TestConfig.mCookiePath);
      TestConfig.mApiKey = key.toString();
    } catch (e) {
      console.log(`[getTestApiKey] error: ${e}`);
    }

    return TestConfig.mApiKey;
  }

  public static getTestRootKey(): string {
    return TestConfig.mDodaiRootKey;
  }

  public static getRegion(): string {
    return TestConfig.mRegion;
  }

  private static mApiKey = "";

  /**********************************************
   * Switch test mode related information
   **********************************************/
  private static mInited = false;
  private static mDodaiRootKey = "rkey_6KnRBSVK4xFz9pVpER";
  private static readonly mRegion = 'JP';

  private static init() {
    if (TestConfig.mInited) {
      return;
    }
    const testMode = process.env.MODE;
    console.log(`Run test in ${testMode} mode`);

    if (testMode === "prod") {
      // tslint:disable-next-line:no-string-literal
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
      TestConfig.mDodaiRootKey = "rkey_PcVilQMvsh2sJXQpg";    }
    TestConfig.mInited = true;
  }
}
