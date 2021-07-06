"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const power_assert_1 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const util_1 = require("../../utility/util");
/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */
const root_key = config.root_key;
const server = config.server;
const userKey = config.dummy_user_key;
const version = config.version;
const deviceId = "putAppletSuspendBody201908";
const putAppletSuspendBody = {
    deviceId: `${deviceId}`,
    deviceSuspendFlg: false,
    deviceSuspendCode: "900"
};
describe("controllers", () => {
    /*************************************************************************
     * Test PUT /appletSuspend
     ************************************************************************/
    describe("PUT /appletSuspend", () => {
        it("it should accept request with valid parameters", async () => {
            // Create an applet with special device Id
            const appletPostBody = util_1.TestUtil.getSamplePostApplet();
            appletPostBody.deviceId = deviceId;
            let resp = await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", userKey)
                .send(appletPostBody);
            power_assert_1.default.deepStrictEqual(resp.status, 201);
            const appletId = resp.body.id;
            try {
                // Apply appletSuspend
                resp = await supertest_1.default(server)
                    .put("/api/admin/appletSuspend")
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .send(putAppletSuspendBody)
                    .expect("Content-Type", /json/);
                power_assert_1.default.deepEqual(resp.status, 201);
                // Check if appletSuspend is added to the created applet
                resp = await supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, appletId: appletId })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200);
                power_assert_1.default.deepStrictEqual(resp.status, 200);
                power_assert_1.default.deepStrictEqual(resp.body.applets.length, 1);
                power_assert_1.default.deepStrictEqual(resp.body.applets[0].applet.AppletSuspend.device.deviceId, deviceId);
                console.log(JSON.stringify(resp.body.applets[0].applet));
            }
            catch (e) {
                console.log(e);
                throw e;
            }
            finally {
                await util_1.TestUtil.deleteApplet(appletId);
            }
        });
        it("it should reject request if deviceSuspendFlg is true and deviceSuspendCode is empty", async (done) => {
            const exampleReqBody = putAppletSuspendBody;
            exampleReqBody.deviceSuspendFlg = true;
            delete exampleReqBody.deviceSuspendCode;
            supertest_1.default(server)
                .put("/api/admin/appletSuspend")
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .send(exampleReqBody)
                .expect(400)
                .expect("Content-Type", /json/)
                .end(done);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5fYXBwbGV0U3VzcGVuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFkbWluX2FwcGxldFN1c3BlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLDZDQUE4QztBQUU5QyxxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLG9DQUFvQztBQUVwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUN0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9CLE1BQU0sUUFBUSxHQUFHLDRCQUE0QixDQUFDO0FBQzlDLE1BQU0sb0JBQW9CLEdBQUc7SUFDM0IsUUFBUSxFQUFFLEdBQUcsUUFBUSxFQUFFO0lBQ3ZCLGdCQUFnQixFQUFFLEtBQUs7SUFDdkIsaUJBQWlCLEVBQUUsS0FBSztDQUN6QixDQUFDO0FBRUYsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7SUFDM0I7OzhFQUUwRTtJQUMxRSxRQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLEVBQUUsQ0FBQyxnREFBZ0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM5RCwwQ0FBMEM7WUFDMUMsTUFBTSxjQUFjLEdBQUcsZUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDdEQsY0FBYyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztpQkFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQztpQkFDcEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztpQkFDakMsR0FBRyxDQUFD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