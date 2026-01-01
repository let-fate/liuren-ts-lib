import sixtyJiaZi from "./maps/sixtyJiaZi";
import { LiuRenResult, LuNianResult } from "./type";
import { getDateByObj, getDateBySiZhu } from "./utils/date";
import { getDunGan } from "./utils/dunGan";
import { fillSanChuan, getSanChuan } from "./utils/sanChuan";
import { getShenSha } from "./utils/shenSha";
import { getSiKe } from "./utils/siKe";
import { getTianDiPan } from "./utils/tianDiPan";

// 导出金口诀相关
export * from "./jinKouJue";
export * from "./jinKouJue/type";

export const getLiuRenByDate = (time: Date): LiuRenResult => {
    const date = getDateByObj(time)
    const riGan = date.bazi.split(" ")[2].substring(0, 1)
    const tianDiPan = getTianDiPan(date)
    const siKe = getSiKe(date, tianDiPan)
    const dunGan = getDunGan(date, tianDiPan)
    const sanChuan = fillSanChuan(getSanChuan(siKe, tianDiPan), tianDiPan, dunGan, riGan)
    const shenSha = getShenSha(date)
    const result: LiuRenResult = {
        dateInfo: date,
        tiandipan: tianDiPan,
        siKe: siKe,
        dunGan: dunGan,
        sanChuan: sanChuan,
        shenSha: shenSha
    }
    return result
}
export const getLiuRenBySiZhu = (year: string, month: string, day: string, hour: string): LiuRenResult => {
    const date = getDateBySiZhu(year, month, day, hour)
    const riGan = date.bazi.split(" ")[2].substring(0, 1)
    const tianDiPan = getTianDiPan(date)
    const siKe = getSiKe(date, tianDiPan)
    const dunGan = getDunGan(date, tianDiPan)
    const sanChuan = fillSanChuan(getSanChuan(siKe, tianDiPan), tianDiPan, dunGan, riGan)
    const shenSha = getShenSha(date)
    const result: LiuRenResult = {
        dateInfo: date,
        tiandipan: tianDiPan,
        siKe: siKe,
        dunGan: dunGan,
        sanChuan: sanChuan,
        shenSha: shenSha
    }
    return result
}
export const getNianMing = (time: Date, gender: number): LuNianResult => {
    const date = getDateByObj(time)
    const year = date.bazi.split(" ")[0]
    const yearNumber = time.getFullYear()
    const nowNumber = new Date().getFullYear()
    const age = nowNumber - yearNumber
    // gender 1 为男 起丙寅顺排 2 为女 起壬申逆排
    let luNian = ""
    const genderString = gender == 1 ? "男" : "女"
    if (gender == 1) {
        const startYear = sixtyJiaZi.indexOf("丙寅")
        const startIndex = (startYear + age)
        luNian = sixtyJiaZi[startIndex % 60]
    } else {
        const startYear = sixtyJiaZi.indexOf("壬申")
        let startIndex = (startYear - age)
        if (startIndex < 0) {
            startIndex = 60 + startIndex
        }
        luNian = sixtyJiaZi[startIndex % 60]
    }
    const result: LuNianResult = {
        year: year,
        gender: genderString,
        luNian: luNian
    }
    return result
}
