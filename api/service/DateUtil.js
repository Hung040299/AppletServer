"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class DateUtil {
    static convertIso8601(timeStr) {
        if (!timeStr) {
            return undefined;
        }
        // 2019-08-09T00:28:18+00:00
        const parsed = moment_1.default(timeStr);
        if (!parsed.isValid()) {
            return undefined;
        }
        const iso8601Time = parsed.utc().format("YYYY-MM-DDTHH:mm:ssZ");
        return iso8601Time;
    }
    static getCurrentIso8601Time() {
        const now = moment_1.default().toISOString();
        /**
         * By convertIso8601, unify ISO8601 string.
         * ISO8601 string is deffrent between Dodai and meoment.toISOString()
         *    Dodai:  2019-08-09T00:28:18+00:00
         *    Moment: 2019-08-09T00:28:18.000Z
         */
        return DateUtil.convertIso8601(now);
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEYXRlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUE0QjtBQUU1QixNQUFhLFFBQVE7SUFDWixNQUFNLENBQUMsY0FBYyxDQUMxQixPQUEyQjtRQUUzQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFDRCw0QkFBNEI7UUFDNUIsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3JCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxNQUFNLENBQUMscUJBQXFCO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLGdCQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQzs7Ozs7V0FLRztRQUVILE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQVcsQ0FBQztJQUNoRCxDQUFDO0NBQ0Y7QUEzQkQsNEJBMkJDIn0=