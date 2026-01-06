import { DateInfo, getDateByObj } from "../common/date";
import { DiZhiArray, DiZhiNumber, TianGanArray, TianGanNumber } from "../maps/ganZhi";
import { YueJiang, YueJiangName } from "../maps/yueJiang";
import { YangGui, YinGui, YinYang, ShunNi, ShenJiangArray } from "../maps/shenJiang";
import { WuXing } from "../maps/wuXing";
import { JinKouJueResult, Position, SiWei } from "./type";
import { getShenSha } from "./shenSha";

// 五鼠遁：日干 -> 地支 -> 干
export const getWuShuDun = (dayGan: string, diZhi: string): string => {
    // 甲己还加甲
    const startGanMap: { [key: string]: string } = {
        "甲": "甲", "己": "甲",
        "乙": "丙", "庚": "丙",
        "丙": "戊", "辛": "戊",
        "丁": "庚", "壬": "庚",
        "戊": "壬", "癸": "壬"
    };
    
    const startGan = startGanMap[dayGan];
    const startGanIndex = TianGanArray.indexOf(startGan);
    
    // 子对应 startGan
    // 地支 index: 子=0, 丑=1...
    const zhiIndex = DiZhiArray.indexOf(diZhi);
    
    const targetGanIndex = (startGanIndex + zhiIndex) % 10;
    return TianGanArray[targetGanIndex];
};

// 获取地分上的将神
export const getJiangShen = (yueJiang: string, timeZhi: string, diFen: string): string => {
    // 月将加时：月将落在时支上
    // 求地分上的将
    // 顺行
    const yueJiangIdx = DiZhiNumber[yueJiang as keyof typeof DiZhiNumber] - 1; // 0-11
    const timeZhiIdx = DiZhiNumber[timeZhi as keyof typeof DiZhiNumber] - 1;
    const diFenIdx = DiZhiNumber[diFen as keyof typeof DiZhiNumber] - 1;
    
    // 差值
    let diff = diFenIdx - timeZhiIdx;
    
    let jiangShenIdx = (yueJiangIdx + diff) % 12;
    if (jiangShenIdx < 0) jiangShenIdx += 12;
    
    return DiZhiArray[jiangShenIdx];
};

// 获取地分上的贵神
export const getGuiShen = (dayGan: string, timeZhi: string, diFen: string): string => {
    // 1. 确定昼夜
    const isDay = YinYang[timeZhi as keyof typeof YinYang] === "阳";
    
    // 2. 确定贵人起始地支
    let guiRenStartZhi = "";
    if (isDay) {
        guiRenStartZhi = YangGui[dayGan as keyof typeof YangGui];
    } else {
        guiRenStartZhi = YinGui[dayGan as keyof typeof YinGui];
    }
    
    // 3. 确定顺逆
    // 贵人落在亥子丑寅卯辰为顺，巳午未申酉戌为逆
    const shunNi = ShunNi[guiRenStartZhi as keyof typeof ShunNi];
    const isShun = shunNi === "顺";
    
    // 4. 计算地分上的神
    // 神序列：贵人, 腾蛇, 朱雀... (ShenJiangArray)
    // 贵人起始位置：guiRenStartZhi
    // 目标位置：diFen
    
    const startZhiIdx = DiZhiNumber[guiRenStartZhi as keyof typeof DiZhiNumber] - 1;
    const diFenIdx = DiZhiNumber[diFen as keyof typeof DiZhiNumber] - 1;
    
    let step = 0;
    if (isShun) {
        step = diFenIdx - startZhiIdx;
    } else {
        step = startZhiIdx - diFenIdx;
    }
    
    // normalize step
    step = step % 12;
    if (step < 0) step += 12;
    
    const shenIndex = step; // 0 is 贵人
    return ShenJiangArray[shenIndex];
};

// 辅助：获取五行
export const getWuXing = (name: string): string => {
    // 这里的 name 可能是 干、支、神、将
    // 干支五行在 WuXing 中有
    if (WuXing[name as keyof typeof WuXing]) {
        return WuXing[name as keyof typeof WuXing];
    }
    
    // 神将五行需要转换
    // 贵人(丑土), 腾蛇(巳火), 朱雀(午火), 六合(卯木), 勾陈(辰土), 青龙(寅木)
    // 天空(戌土), 白虎(申金), 太常(未土), 玄武(子水), 太阴(酉金), 天后(亥水)
    const shenMap: {[key: string]: string} = {
        "贵人": "丑", "腾蛇": "巳", "朱雀": "午", "六合": "卯",
        "勾陈": "辰", "青龙": "寅", "天空": "戌", "白虎": "申",
        "太常": "未", "玄武": "子", "太阴": "酉", "天后": "亥"
    };
    
    if (shenMap[name]) {
        return WuXing[shenMap[name] as keyof typeof WuXing];
    }
    
    // 尝试反查 YueJiangName
    // name 可能是 "登明"
    for (const [zhi, yueName] of Object.entries(YueJiangName)) {
        if (yueName === name) {
            return WuXing[zhi as keyof typeof WuXing];
        }
    }
    
    return "";
}

// 辅助：获取神将对应的地支
export const getShenGanZhi = (name: string): string => {
     const shenMap: {[key: string]: string} = {
        "贵人": "丑", "腾蛇": "巳", "朱雀": "午", "六合": "卯",
        "勾陈": "辰", "青龙": "寅", "天空": "戌", "白虎": "申",
        "太常": "未", "玄武": "子", "太阴": "酉", "天后": "亥"
    };
    return shenMap[name] || name;
}

export const getJinKouJueByDateInfo = (dateInfo: DateInfo, diFen: string): JinKouJueResult => {
     // 提取日干
     const dayGan = dateInfo.bazi.split(" ")[2].substring(0, 1);
     // 提取时支
     const timeZhi = dateInfo.bazi.split(" ")[3].substring(1, 2);
     // 月将
     const yueJiang = dateInfo.yuejiang;
 
     // 1. 人元
     const renYuanName = getWuShuDun(dayGan, diFen);
     
    // 2. 贵神
    const guiShenName = getGuiShen(dayGan, timeZhi, diFen);
    const guiShenZhi = getShenGanZhi(guiShenName);
    const guiShenGan = getWuShuDun(dayGan, guiShenZhi);

    // 3. 将神
    const jiangShenZhi = getJiangShen(yueJiang, timeZhi, diFen); // 返回的是地支
    // 将神使用别名
    const jiangShenName = YueJiangName[jiangShenZhi as keyof typeof YueJiangName] || jiangShenZhi;
    const jiangShenGan = getWuShuDun(dayGan, jiangShenZhi);

    // 组装
    const siWei: SiWei = {
        renYuan: {
            name: renYuanName,
            ganZhi: renYuanName,
            wuXing: getWuXing(renYuanName)
        },
        guiShen: {
            name: guiShenName,
            ganZhi: guiShenGan + guiShenZhi,
            wuXing: getWuXing(guiShenName)
        },
        jiangShen: {
            name: jiangShenName, // 使用别名，如 大吉
            ganZhi: jiangShenGan + jiangShenZhi, // 干支
            wuXing: getWuXing(jiangShenZhi) // 五行用地支查更准
        },
        diFen: {
            name: diFen,
            ganZhi: diFen,
            wuXing: getWuXing(diFen)
        }
    };

    const result: JinKouJueResult = {
        date: dateInfo,
        diFen: diFen,
        siWei: siWei,
        shenSha: []
    };
    
    // 计算神煞
    result.shenSha = getShenSha(result);
 
     return result;
}

export const getJinKouJue = (date: Date, diFen: string): JinKouJueResult => {
    const dateInfo = getDateByObj(date);
    return getJinKouJueByDateInfo(dateInfo, diFen);
};
