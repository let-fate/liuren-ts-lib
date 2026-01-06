import { getShenSha } from "../src/jinKouJue/shenSha";
import { JinKouJueResult } from "../src/jinKouJue/type";
import { DateInfo } from "../src/common/date";

// Helper to create mock result
const createMockResult = (monthBranch: string, dayGanZhi: string, lesson: { ren: string, gui: string, jiang: string, di: string }): JinKouJueResult => {
    // Determine year/month based on branch for simplicity or just mock bazi
    // Year defaults to JiaZi
    const bazi = `甲子 丙${monthBranch} ${dayGanZhi} 丁卯`; 
    // Mock DateInfo
    const dateInfo: DateInfo = {
        bazi: bazi,
        date: "Mock Date",
        kong: [],
        yima: "",
        yuejiang: "",
        xun: "",
        dingma: "",
        tianma: ""
    };
    
    return {
        date: dateInfo,
        diFen: lesson.di,
        siWei: {
            renYuan: { name: lesson.ren, ganZhi: lesson.ren, wuXing: "" },
            guiShen: { name: "Gui", ganZhi: lesson.gui, wuXing: "" },
            jiangShen: { name: "Jiang", ganZhi: lesson.jiang, wuXing: "" },
            diFen: { name: lesson.di, ganZhi: lesson.di, wuXing: "" }
        },
        shenSha: []
    };
};

describe("ShenSha Calculation", () => {
    it("should detect TianDe in Yin month with Ding", () => {
        // Yin Month (寅), TianDe is Ding (丁)
        // Lesson has Ding in RenYuan
        const result = createMockResult("寅", "甲子", { ren: "丁", gui: "戊辰", jiang: "己巳", di: "午" });
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "天德")).toBe(true);
    });

    it("should detect JieSha for ShenZiChen day seeing Si", () => {
        // Day Zi (子), JieSha is Si (巳)
        // Lesson has Si in DiFen
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "戊辰", jiang: "己巳", di: "巳" });
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "劫煞")).toBe(true);
    });

    it("should detect TianShe on Spring WuYin day", () => {
        // Month Yin (Spring), Day WuYin
        const result = createMockResult("寅", "戊寅", { ren: "甲", gui: "乙丑", jiang: "丙寅", di: "卯" });
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "天赦")).toBe(true);
    });

    it("should detect SanQi (Jia Wu Geng)", () => {
        // Lesson contains Jia, Wu, Geng
        // Ren: Jia, Gui: WuChen, Jiang: GengWu
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "戊辰", jiang: "庚午", di: "子" });
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "天三奇")).toBe(true);
    });
    
    it("should detect Guan (You Shang Jian Yin)", () => {
        // DiFen: You, Jiang: Yin
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "戊辰", jiang: "甲寅", di: "酉" });
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "关")).toBe(true);
    });

    it("should detect GuanFu (TianYi Opposite)", () => {
        // Day Jia, Time Wu (Day -> YangGui -> Chou).
        // GuanFu = Opposite of Chou = Wei.
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "辛未", jiang: "甲寅", di: "酉" });
        // Need to ensure bazi time branch is Wu (午)
        result.date.bazi = "甲子 丙寅 甲子 庚午";
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "官符")).toBe(true);
    });

    it("should detect LuDao (Year Lu + 1)", () => {
        // Year Jia (Lu in Yin). LuDao = Mao.
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "丁卯", jiang: "甲寅", di: "酉" });
        result.date.bazi = "甲子 丙寅 甲子 庚午"; // Year Jia
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "禄倒")).toBe(true);
    });

    it("should detect MaDao (Year Ma + 1)", () => {
        // Year Zi (ShenZiChen -> Ma in Yin). MaDao = Mao.
        const result = createMockResult("寅", "甲子", { ren: "甲", gui: "丁卯", jiang: "甲寅", di: "酉" });
        result.date.bazi = "戊子 丙寅 甲子 庚午"; // Year Zi
        const shenShas = getShenSha(result);
        expect(shenShas.some(s => s.name === "马倒")).toBe(true);
    });
});
