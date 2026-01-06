import { JinKouJueResult, SiWei, ShenShaInfo } from "./type";
import { TianDe, YueDe, TianMa, TianXi, JieSha, SangChe, FeiLian, SiQiu, SiMu, TianGui, TianYi, ShengQi, riLu } from "../maps/shensha";
import { TianGanWuHe, LiuHe, LiuChong, DiZhiNumber, DiZhiArray, TianGanArray } from "../maps/ganZhi";
import { YiMa } from "../maps/ma";
import { YangGui, YinGui, YinYang } from "../maps/shenJiang";

// 辅助：获取干支的干和支
// ganZhi 可能是 "甲" (len 1), "子" (len 1), "甲子" (len 2)
const splitGanZhi = (ganZhi: string): { gan: string, zhi: string } => {
    if (ganZhi.length === 1) {
        if (TianGanArray.includes(ganZhi)) return { gan: ganZhi, zhi: "" };
        if (DiZhiArray.includes(ganZhi)) return { gan: "", zhi: ganZhi };
    }
    if (ganZhi.length === 2) {
        return { gan: ganZhi[0], zhi: ganZhi[1] };
    }
    return { gan: "", zhi: "" };
};

// 辅助：检查课内是否包含某元素（干或支）
const checkInLesson = (target: string, siWei: SiWei): boolean => {
    // 检查四个位置
    // 人元 (干)
    if (siWei.renYuan.ganZhi.includes(target)) return true;
    // 贵神 (干支)
    if (siWei.guiShen.ganZhi.includes(target)) return true;
    // 将神 (干支)
    if (siWei.jiangShen.ganZhi.includes(target)) return true;
    // 地分 (支)
    if (siWei.diFen.ganZhi.includes(target)) return true;
    
    return false;
};

// 辅助：获取前N位或后N位地支
const getOffsetZhi = (startZhi: string, offset: number): string => {
    let idx = DiZhiArray.indexOf(startZhi); // 0-11
    if (idx === -1) return "";
    
    let targetIdx = (idx + offset) % 12;
    if (targetIdx < 0) targetIdx += 12;
    return DiZhiArray[targetIdx];
};

// 辅助：获取干支在课中的位置
const getPositions = (target: string, siWei: SiWei): string[] => {
    const pos: string[] = [];
    if (siWei.renYuan.ganZhi.includes(target)) pos.push("人元");
    if (siWei.guiShen.ganZhi.includes(target)) pos.push("贵神");
    if (siWei.jiangShen.ganZhi.includes(target)) pos.push("将神");
    if (siWei.diFen.ganZhi.includes(target)) pos.push("地分");
    return pos;
};

export const getShenSha = (result: JinKouJueResult): ShenShaInfo[] => {
    const shenShaList: ShenShaInfo[] = [];
    const dateInfo = result.date;
    const siWei = result.siWei;
    
    // 解析时间四柱
    const baziParts = dateInfo.bazi.split(" ");
    const yearGanZhi = baziParts[0];
    const monthGanZhi = baziParts[1];
    const dayGanZhi = baziParts[2];
    
    const yearZhi = yearGanZhi[1];
    const monthZhi = monthGanZhi[1];
    const dayGan = dayGanZhi[0];
    const dayZhi = dayGanZhi[1];

    // 辅助函数：快速添加
    const addIfIn = (name: string, val: string, desc: string, type: '吉' | '凶') => {
        if (!val) return;
        const pos = getPositions(val, siWei);
        if (pos.length > 0) {
            shenShaList.push({ name, value: val, position: pos, description: desc, type });
        }
    };

    // --- 吉神 ---

    // 天德 (正丁二申庚...)
    const tianDeVal = TianDe[monthZhi as keyof typeof TianDe];
    addIfIn("天德", tianDeVal, "主化解百祸，逢凶化吉", "吉");
    
    // 天德合
    if (tianDeVal) {
        let tianDeHe = TianGanArray.includes(tianDeVal) ? TianGanWuHe[tianDeVal as keyof typeof TianGanWuHe] : LiuHe[tianDeVal as keyof typeof LiuHe];
        addIfIn("天德合", tianDeHe, "主解百祸，吉庆，化凶解忧", "吉");
    }

    // 月德 (寅午戌月在丙...)
    const yueDeVal = YueDe[monthZhi as keyof typeof YueDe];
    addIfIn("月德", yueDeVal, "主和睦，万事顺达", "吉");
    
    // 月德合
    if (yueDeVal) {
        addIfIn("月德合", TianGanWuHe[yueDeVal as keyof typeof TianGanWuHe], "作用同月德，吉庆稍次", "吉");
    }

    // 天赦 (春戊寅，夏甲午，秋戊申，冬甲子)
    const monthIdx = DiZhiArray.indexOf(monthZhi);
    let season = "";
    if (monthIdx >= 2 && monthIdx <= 4) season = "春";
    else if (monthIdx >= 5 && monthIdx <= 7) season = "夏";
    else if (monthIdx >= 8 && monthIdx <= 10) season = "秋";
    else season = "冬";
    
    let sheVals: string[] = [];
    if (season === "春" && dayGanZhi === "戊寅") sheVals = ["戊", "寅"];
    if (season === "夏" && dayGanZhi === "甲午") sheVals = ["甲", "午"];
    if (season === "秋" && dayGanZhi === "戊申") sheVals = ["戊", "申"];
    if (season === "冬" && dayGanZhi === "甲子") sheVals = ["甲", "子"];
    sheVals.forEach(v => addIfIn("天赦", v, "主解刑禁、官司、危险之灾", "吉"));

    // 天喜/天医 (正月戌...)
    addIfIn("天喜", TianXi[monthZhi as keyof typeof TianXi], "主家中喜庆、婚姻、进财", "吉");
    addIfIn("天医", TianYi[monthZhi as keyof typeof TianYi], "问病忧中有乐，得良医", "吉");

    // 天马
    addIfIn("天马", TianMa[monthZhi as keyof typeof TianMa], "主办事迅速，逃亡远去不归", "吉");

    // 驿马
    addIfIn("驿马", YiMa[dayZhi as keyof typeof YiMa], "主求事迅速，升迁远行", "吉");

    // 三奇
    const lessonStems = new Set<string>();
    const checkStem = (gz: string) => { if (gz.length > 0 && TianGanArray.includes(gz[0])) lessonStems.add(gz[0]); };
    checkStem(siWei.renYuan.ganZhi);
    checkStem(siWei.guiShen.ganZhi);
    checkStem(siWei.jiangShen.ganZhi);

    const addSanQi = (stems: string[], name: string) => {
        if (stems.every(s => lessonStems.has(s))) {
            stems.forEach(s => addIfIn(name, s, "利见大人，百事吉昌", "吉"));
        }
    };
    addSanQi(["甲", "戊", "庚"], "天三奇");
    addSanQi(["乙", "丙", "丁"], "地三奇");
    addSanQi(["壬", "癸", "辛"], "人三奇");

    // 生气
    addIfIn("生气", ShengQi[monthZhi as keyof typeof ShengQi], "绝处逢生，开辟新事业", "吉");

    // 六甲 (人元见甲)
    if (siWei.renYuan.ganZhi === "甲") {
        shenShaList.push({ name: "六甲", value: "甲", position: ["人元"], description: "主有不测之喜，为头目", type: "吉" });
    }

    // --- 凶煞 ---

    // 劫煞
    addIfIn("劫煞", JieSha[dayZhi as keyof typeof JieSha], "常人主凶伤、官司", "凶");

    // 截命灾煞 (甲己见申酉...)
    const jieMingMap: {[key: string]: string[]} = {
        "甲": ["申", "酉"], "己": ["申", "酉"], "乙": ["午", "未"], "庚": ["午", "未"],
        "丙": ["辰", "巳"], "辛": ["辰", "巳"], "丁": ["寅", "卯"], "壬": ["寅", "卯"],
        "戊": ["子", "丑"], "癸": ["子", "丑"]
    };
    (jieMingMap[dayGan] || []).forEach(v => addIfIn("截命灾煞", v, "求谋不通，出行受阻", "凶"));

    // 五鬼
    const wuGuiMap: {[key: string]: string[]} = {
        "甲": ["巳", "午"], "己": ["巳", "午"], "乙": ["寅", "卯"], "庚": ["寅", "卯"],
        "丙": ["子", "丑"], "辛": ["子", "丑"], "丁": ["戌", "亥"], "壬": ["戌", "亥"],
        "戊": ["申", "酉"], "癸": ["申", "酉"]
    };
    (wuGuiMap[dayGan] || []).forEach(v => addIfIn("五鬼", v, "损财、官司、车祸", "凶"));

    // 丧门 (太岁前二), 吊客 (太岁后二)
    addIfIn("丧门", getOffsetZhi(yearZhi, 2), "主凶丧、孝服、哭泣", "凶");
    addIfIn("吊客", getOffsetZhi(yearZhi, -2), "主阴私、凶伤、亲朋凶丧", "凶");

    // 丧车, 天鬼
    addIfIn("丧车", SangChe[monthZhi as keyof typeof SangChe], "主病灾、车祸、血光", "凶");
    addIfIn("天鬼", TianGui[monthZhi as keyof typeof TianGui], "主凶灾，鬼变", "凶");

    // 灭门
    const isYangMonth = ["子", "寅", "辰", "午", "申", "戌"].includes(monthZhi);
    addIfIn("灭门", getOffsetZhi(monthZhi, isYangMonth ? -3 : 3), "忌迁居、嫁娶，主病灾", "凶");

    // 天罗/地网
    const tianLuo = getOffsetZhi(dayZhi, 1);
    addIfIn("天罗", tianLuo, "主牢狱官司", "凶");
    addIfIn("地网", LiuChong[tianLuo as keyof typeof LiuChong], "主牢狱官司", "凶");

    // 关/隔/锁
    const checkStack = (bottom: string, top: string, name: string) => {
        if (siWei.diFen.ganZhi === bottom && siWei.jiangShen.ganZhi.endsWith(top)) {
            shenShaList.push({ name, value: `${bottom}${top}`, position: ["地分", "将神"], description: "关节不通，囚禁", type: "凶" });
        }
        if (siWei.jiangShen.ganZhi.endsWith(bottom) && siWei.guiShen.ganZhi.endsWith(top)) {
            shenShaList.push({ name, value: `${bottom}${top}`, position: ["将神", "贵神"], description: "关节不通，囚禁", type: "凶" });
        }
    };
    checkStack("酉", "寅", "关");
    checkStack("卯", "戌", "隔");
    checkStack("卯", "申", "锁");

    // 四绝
    const checkPair = (z1: string, z2: string, name: string) => {
        const p1 = getPositions(z1, siWei), p2 = getPositions(z2, siWei);
        if (p1.length > 0 && p2.length > 0) {
            shenShaList.push({ name, value: `${z1}${z2}`, position: [...new Set([...p1, ...p2])], description: "主办事难成，劳而无功", type: "凶" });
        }
    };
    checkPair("寅", "酉", "金绝"); checkPair("卯", "申", "木绝"); checkPair("午", "亥", "水绝"); checkPair("子", "巳", "火绝");

    // 四败
    const hasWuXing = (wx: string) => [siWei.renYuan, siWei.guiShen, siWei.jiangShen, siWei.diFen].some(p => p.wuXing === wx);
    if (getPositions("酉", siWei).length > 0 && (hasWuXing("水") || hasWuXing("土"))) addIfIn("四败", "酉", "主拘禁、口舌", "凶");
    if (getPositions("卯", siWei).length > 0 && hasWuXing("火")) addIfIn("四败", "卯", "主拘禁、口舌", "凶");
    if (getPositions("子", siWei).length > 0 && hasWuXing("木")) addIfIn("四败", "子", "主拘禁、口舌", "凶");
    if (getPositions("午", siWei).length > 0 && hasWuXing("金")) addIfIn("四败", "午", "主拘禁、口舌", "凶");

    // 天盗
    ["子"].forEach(v => {
        const pos = [];
        if (siWei.guiShen.ganZhi.endsWith(v)) pos.push("贵神");
        if (siWei.jiangShen.ganZhi.endsWith(v)) pos.push("将神");
        if (pos.length > 0) shenShaList.push({ name: "天盗", value: v, position: pos, description: "主被盗、失财", type: "凶" });
    });

    // 飞廉, 四丘, 四墓
    addIfIn("飞廉", FeiLian[monthZhi as keyof typeof FeiLian], "主迅速，非常惊骇", "凶");
    addIfIn("四丘", SiQiu[monthZhi as keyof typeof SiQiu], "主争论田土坟墓", "凶");
    addIfIn("四墓", SiMu[monthZhi as keyof typeof SiMu], "主争讼坟墓之事", "凶");

    // 望门煞
    if (JieSha[dayZhi as keyof typeof JieSha]) {
        addIfIn("望门煞", LiuChong[JieSha[dayZhi as keyof typeof JieSha] as keyof typeof LiuChong], "主妄想、空想", "凶");
    }

    // 病符, 官符
    addIfIn("病符", getOffsetZhi(yearZhi, -1), "主大病、灾祸", "凶");
    const isDay = YinYang[baziParts[3][1] as keyof typeof YinYang] === "阳";
    const guiRenZhi = isDay ? YangGui[dayGan as keyof typeof YangGui] : YinGui[dayGan as keyof typeof YinGui];
    addIfIn("官符", LiuChong[guiRenZhi as keyof typeof LiuChong], "主官司刑法", "凶");

    // 六丁, 禄倒, 马倒
    if (siWei.renYuan.ganZhi === "丁") addIfIn("六丁", "丁", "主家中不安宁", "凶");
    const yearLu = riLu[yearGanZhi[0] as keyof typeof riLu];
    if (yearLu) addIfIn("禄倒", getOffsetZhi(yearLu, 1), "主百事不顺", "凶");
    const yearMa = YiMa[yearZhi as keyof typeof YiMa];
    if (yearMa) addIfIn("马倒", getOffsetZhi(yearMa, 1), "主百事不顺", "凶");

    return shenShaList;
};
