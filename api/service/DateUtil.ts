import moment from "moment";

export class DateUtil {
  public static convertIso8601(
    timeStr: string | undefined
  ): string | undefined {
    if (!timeStr) {
      return undefined;
    }
    // 2019-08-09T00:28:18+00:00
    const parsed = moment(timeStr);
    if (!parsed.isValid()) {
      return undefined;
    }
    const iso8601Time = parsed.utc().format("YYYY-MM-DDTHH:mm:ssZ");
    return iso8601Time;
  }

  public static getCurrentIso8601Time(): string {
    const now = moment().toISOString();
    /**
     * By convertIso8601, unify ISO8601 string.
     * ISO8601 string is deffrent between Dodai and meoment.toISOString()
     *    Dodai:  2019-08-09T00:28:18+00:00
     *    Moment: 2019-08-09T00:28:18.000Z
     */

    return DateUtil.convertIso8601(now) as string;
  }
}
