import { getJinKouJue } from "../src/jinKouJue";
import { getDateByObj } from "../src/utils/date";

describe('JinKouJue', () => {
  it('should calculate correct SiWei for a given date and DiFen', () => {
    // 2025年7月25日 10时13分
    // 八字：乙巳 癸未 乙未 辛巳
    // 月将：午 (大暑)
    // 地分：子
    const date = new Date(2025, 6, 25, 10, 13); // Month is 0-indexed
    const diFen = "子";
    
    const result = getJinKouJue(date, diFen);
    
    console.log(JSON.stringify(result, null, 2));

    // 验证基本信息
    expect(result.date.bazi).toContain("乙未"); // 日柱
    expect(result.date.bazi).toContain("辛巳"); // 时柱
    expect(result.date.yuejiang).toBe("午");

    // 验证四位
    // 人元: 乙日遁子 -> 丙
    expect(result.siWei.renYuan.name).toBe("丙");
    expect(result.siWei.renYuan.wuXing).toBe("火");

    // 将神: 月将午加时巳 -> 地分子 -> 丑
    // 丑对应的月将名为 大吉
    expect(result.siWei.jiangShen.name).toBe("大吉");
    expect(result.siWei.jiangShen.ganZhi).toBe("丑");
    expect(result.siWei.jiangShen.wuXing).toBe("土");
    
    // 贵神: 乙日昼贵在子，顺行至子 -> 贵人
    // 乙己鼠猴乡，乙日阳贵(昼)在子。子为顺。
    // 起点子，终点子 -> 贵人
    expect(result.siWei.guiShen.name).toBe("贵人");
    expect(result.siWei.guiShen.wuXing).toBe("土");

    // 地分
    expect(result.siWei.diFen.name).toBe("子");
    expect(result.siWei.diFen.wuXing).toBe("水");
  });

  it('should handle night GuiShen and reverse order correctly', () => {
    // 换个时间测试阴贵和逆行
    // 甲日 酉时 (夜) 地分 寅
    // 甲戊庚牛羊。甲夜贵在未(羊)。
    // 未在(巳午未...)，逆行。
    // 贵人起未，逆数到寅。
    // 未(贵), 午(蛇), 巳(雀), 辰(合), 卯(勾), 寅(龙).
    // 应该是青龙。
    
    // 构造时间：甲子日 酉时
    // 2024-01-01 (甲子日) 18:00 (酉时)
    const date = new Date(2024, 0, 1, 18, 0); 
    const diFen = "寅";
    
    const result = getJinKouJue(date, diFen);
    
    // 检查日干是否为甲
    const dayGan = result.date.bazi.split(" ")[2].substring(0, 1);
    expect(dayGan).toBe("甲");
    
    // 检查时支是否为酉
    const timeZhi = result.date.bazi.split(" ")[3].substring(1, 2);
    expect(timeZhi).toBe("酉");
    
    // 贵神预期：青龙
    expect(result.siWei.guiShen.name).toBe("青龙");
  });
});
