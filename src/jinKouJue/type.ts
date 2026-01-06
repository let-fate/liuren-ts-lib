import { DateInfo } from "../common/date";

export interface ShenShaInfo {
    name: string;        // 神煞名称，如 "天德"
    value: string;       // 触发神煞的干支，如 "丁"
    position: string[];  // 所在位置，如 ["人元", "地分"]
    description: string; // 作用说明
    type: '吉' | '凶';
}

export interface Position {
    name: string; // 名称，如 甲、贵人、登明、子
    ganZhi: string; // 对应的干支/地支，如 甲、丑、亥、子
    wuXing: string; // 五行，如 木、土、水、水
}

export interface SiWei {
    renYuan: Position; // 人元 (干)
    guiShen: Position; // 贵神 (神)
    jiangShen: Position; // 将神 (将)
    diFen: Position;   // 地分 (方)
}

export interface JinKouJueResult {
    date: DateInfo;
    diFen: string;
    siWei: SiWei;
    shenSha: ShenShaInfo[]; // 神煞列表
    // 后续可以加入五动三动等断语
}

