"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class TestConfig {
    static getDodaiRootKey() {
        TestConfig.init();
        return TestConfig.mDodaiRootKey;
    }
    static getTestApiKey() {
        if (TestConfig.mApiKey.length > 0) {
            return TestConfig.mApiKey;
        }
        try {
            const key = fs_1.readFileSync(TestConfig.mCookiePath);
            TestConfig.mApiKey = key.toString();
        }
        catch (e) {
            console.log(`[getTestApiKey] error: ${e}`);
        }
        return TestConfig.mApiKey;
    }
    static getTestRootKey() {
        return TestConfig.mDodaiRootKey;
    }
    static getRegion() {
        return TestConfig.mRegion;
    }
    static init() {
        if (TestConfig.mInited) {
            return;
        }
        const testMode = process.env.MODE;
        console.log(`Run test in ${testMode} mode`);
        if (testMode === "prod") {
            // tslint:disable-next-line:no-string-literal
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            TestConfig.mDodaiRootKey = "rkey_PcVilQMvsh2sJXQpg";
        }
        TestConfig.mInited = true;
    }
}
exports.TestConfig = TestConfig;
TestConfig.mCookiePath = "./auth.txt";
TestConfig.mApiKey = "";
/**********************************************
 * Switch test mode related information
 **********************************************/
TestConfig.mInited = false;
TestConfig.mDodaiRootKey = "rkey_6KnRBSVK4xFz9pVpER";
TestConfig.mRegion = 'JP';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXN0X2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUFrQztBQUVsQyxNQUFhLFVBQVU7SUFJZCxNQUFNLENBQUMsZUFBZTtRQUMzQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsT0FBTyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxNQUFNLENBQUMsYUFBYTtRQUN6QixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQyxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUM7U0FDM0I7UUFDRCxJQUFJO1lBQ0YsTUFBTSxHQUFHLEdBQUcsaUJBQVksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakQsVUFBVSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDckM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDNUM7UUFFRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxjQUFjO1FBQzFCLE9BQU8sVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNsQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQVM7UUFDckIsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFXTyxNQUFNLENBQUMsSUFBSTtRQUNqQixJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDdEIsT0FBTztTQUNSO1FBQ0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLFFBQVEsT0FBTyxDQUFDLENBQUM7UUFFNUMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3ZCLDZDQUE2QztZQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ2xELFVBQVUsQ0FBQyxhQUFhLEdBQUcsd0JBQXdCLENBQUM7U0FBSztRQUMzRCxVQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDOztBQXBESCxnQ0FxREM7QUFuRHdCLHNCQUFXLEdBQUcsWUFBWSxDQUFDO0FBNkJuQyxrQkFBTyxHQUFHLEVBQUUsQ0FBQztBQUU1Qjs7Z0RBRWdEO0FBQ2pDLGtCQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ2hCLHdCQUFhLEdBQUcseUJBQXlCLENBQUM7QUFDakMsa0JBQU8sR0FBRyxJQUFJLENBQUMifQ==