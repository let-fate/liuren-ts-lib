import { getLiuRenByDate, getJinKouJueByDate } from "../src";

describe("LiuRen and JinKouJue Tests", () => {
    it("should return the liuren by date", () => {
        const result = getLiuRenByDate(new Date());
        console.log("LiuRen Result:", result);
    });

    it("should return the jinkoujue by date", () => {
        const result = getJinKouJueByDate(new Date(), "子");
        console.log("JinKouJue Result:", JSON.stringify(result, null, 2));
    });
});