"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const power_assert_1 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const util_1 = require("../../utility/util");
const config = require("./config");
const server = config.server;
const root_key = config.root_key;
const dummy_user_key = config.dummy_user_key;
describe("controllers", () => {
    /* Test entry */
    describe("users", () => {
        /*************************************************************************
         * Test GET /createownapplets
         ************************************************************************/
        it("should accept request if id is valid", async () => {
            const blockServer = "http://127.0.0.1:10011"; // Refer to package.json
            const deviceId = "testDeviceId201908";
            const putAppletSuspendBody = {
                deviceId: `${deviceId}`,
                deviceSuspendFlg: true,
                deviceSuspendCode: "900"
            };
            // Create suspeneded action block
            const blockPostBody = util_1.TestUtil.getSamplePostBlock();
            blockPostBody.blockType = "action";
            let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
            power_assert_1.default.deepEqual(resp.status, 201);
            const aBlkId = resp.body.id;
            // Create suspeneded trigger block
            blockPostBody.blockType = "trigger";
            resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
            power_assert_1.default.deepEqual(resp.status, 201);
            const tBlkId = resp.body.id;
            // Create suspeneded service block
            blockPostBody.blockType = "service";
            resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
            power_assert_1.default.deepEqual(resp.status, 201);
            const sBlkId = resp.body.id;
            // Create an applet with special device Id and assign suspended blocks to applet
            const appletPostBody = util_1.TestUtil.getSamplePostApplet();
            appletPostBody.deviceId = deviceId;
            appletPostBody.action = aBlkId;
            appletPostBody.trigger = tBlkId;
            appletPostBody.service = sBlkId;
            resp = await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(appletPostBody);
            power_assert_1.default.deepEqual(resp.status, 201);
            const appletId = resp.body.id;
            try {
                const putBody = util_1.TestUtil.getSuspendBlock();
                putBody.blockId = aBlkId;
                resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                power_assert_1.default.deepEqual(resp.status, 200);
                putBody.blockId = tBlkId;
                resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                power_assert_1.default.deepEqual(resp.status, 200);
                putBody.blockId = sBlkId;
                resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                power_assert_1.default.deepEqual(resp.status, 200);
                // Put enable appletSuspend
                resp = await supertest_1.default(server)
                    .put("/api/admin/appletSuspend")
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .send(putAppletSuspendBody)
                    .expect(201)
                    .expect("Content-Type", /json/);
                // Get the result
                resp = await supertest_1.default(server)
                    .get("/api/suspendCreateownapplets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/);
                power_assert_1.default.deepStrictEqual(resp.status, 200);
                power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend.length > 0, true);
                let i = 0;
                // At least our post is in the records
                for (i = 0; i < resp.body.AppletSuspend.length; i++) {
                    console.log(JSON.stringify(resp.body.AppletSuspend[i]));
                    if (resp.body.AppletSuspend[i].action) {
                        power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend[i].action.blockSuspendFlg, true);
                    }
                    else if (resp.body.AppletSuspend[i].trigger) {
                        power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend[i].trigger.blockSuspendFlg, true);
                    }
                    else if (resp.body.AppletSuspend[i].service) {
                        power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend[i].service.blockSuspendFlg, true);
                    }
                    else if (resp.body.AppletSuspend[i].device) {
                        power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend[i].device.deviceSuspendFlg, true);
                    }
                }
            }
            catch (e) {
                console.error(e);
                throw e;
            }
            finally {
                // Clean up useless applet
                await util_1.TestUtil.deleteApplet(appletId);
                resp = await util_1.TestUtil.deleteBlock(blockServer, aBlkId);
                power_assert_1.default.deepStrictEqual(resp.status, 204);
                resp = await util_1.TestUtil.deleteBlock(blockServer, tBlkId);
                power_assert_1.default.deepStrictEqual(resp.status, 204);
                resp = await util_1.TestUtil.deleteBlock(blockServer, sBlkId);
                power_assert_1.default.deepStrictEqual(resp.status, 204);
            }
        });
        it("should accept request if id is valid", async () => {
            try {
                // Get the result
                const resp = await supertest_1.default(server)
                    .get("/api/suspendCreateownapplets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/);
                power_assert_1.default.deepStrictEqual(resp.status, 200);
                console.log(resp.body);
                power_assert_1.default.deepStrictEqual(resp.body.AppletSuspend.length, 0);
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VzcGVuZENyZWF0ZW93bmFwcGxldHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdXNwZW5kQ3JlYXRlb3duYXBwbGV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLGdFQUFrQztBQUNsQywwREFBZ0M7QUFDaEMsNkNBQThDO0FBRTlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUU3QyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixnQkFBZ0I7SUFDaEIsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDckI7O2tGQUUwRTtRQUMxRSxFQUFFLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEQsTUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQUMsQ0FBQyx3QkFBd0I7WUFDdEUsTUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUM7WUFDdEMsTUFBTSxvQkFBb0IsR0FBRztnQkFDM0IsUUFBUSxFQUFFLEdBQUcsUUFBUSxFQUFFO2dCQUN2QixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixpQkFBaUIsRUFBRSxLQUFLO2FBQ3pCLENBQUM7WUFFRixpQ0FBaUM7WUFDakMsTUFBTSxhQUFhLEdBQUcsZUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDcEQsYUFBYSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxlQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNoRSxzQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxD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