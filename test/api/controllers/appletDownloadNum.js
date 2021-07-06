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
const appletID4GET = config.appletID4GET;
const appletID4GET2 = config.appletID4GET2;
const toolID = config.toolID;
const categoryID = config.categoryID;
const deviceID = config.deviceID;
const deviceID2 = config.deviceID2;
const fakeDeviceID = config.fakeDeviceID;
const vendorID = config.vendorID;
const version = config.version;
const ownerID = config.ownerID;
const ownerID2 = config.ownerID2;
const appletID = config.appletID;
const fakeAppletID = config.fakeAppletID;
const fakeAppletID2 = config.fakeAppletID2;
const dummy_user_key = config.dummy_user_key;
describe("controllers", () => {
    /* Test entry */
    describe("users", () => {
        /*************************************************************************
         * Test GET /appletDownloadNum
         ************************************************************************/
        describe("GET /appletDownloadNum", () => {
            it("should accept request", async (done) => {
                const appletId = await util_1.TestUtil.postSampleApplet(server);
                supertest_1.default(server)
                    .get("/api/appletDownloadNum")
                    .query({ appletId: appletId })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(res => {
                    power_assert_1.default.deepStrictEqual(res.body.num, 0);
                    power_assert_1.default.deepStrictEqual(res.body.appletId, appletId);
                })
                    .end(done);
            });
            it("should get 404 if appletID is not valid", done => {
                supertest_1.default(server)
                    .get("/api/appletDownloadNum")
                    .query({ appletId: fakeAppletID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
    }); /* users */
}); /* controllers */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0RG93bmxvYWROdW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBsZXREb3dubG9hZE51bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUFrQztBQUNsQywwREFBZ0M7QUFFaEMsNkNBQThDO0FBRTlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25DLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9CLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUMzQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBRTdDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLGdCQUFnQjtJQUNoQixRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNyQjs7a0ZBRTBFO1FBQzFFLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7WUFDdEMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtnQkFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztxQkFDN0IsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO3FCQUM3QixHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQztxQkFDcEMsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNaLHNCQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxzQkFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDdEQsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNuRCxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsd0JBQXdCLENBQUM7cUJBQzdCLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsQ0FBQztxQkFDakMsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUM7cUJBQ3BDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVc7QUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIifQ==