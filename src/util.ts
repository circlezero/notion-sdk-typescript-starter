import { AxiosResponse } from "axios";
import iconv from "iconv-lite";
import { load } from "cheerio";
import { StockCommonModel, StockItemModel } from "./model";

export function getHtmlDecode(data: AxiosResponse<any, any>): cheerio.Root {
  let contentType = data.headers["content-type"];

  let charset = contentType.includes("charset=")
    ? contentType.split("charset=")[1]
    : "UTF-8";

  let decodeData = iconv.decode(data.data, charset);
  let dom = load(decodeData);
  return dom;
}

/**
 * 종목의 이름과, 종목 번호를 반환하는 함수
 *
 * @param stock Stock의 정보가 담겨있는 td Column의 Dom
 * @returns {StockCommonModel} Code, Name이 담겨있는 Object
 */
export function getStockCommonData(stock: cheerio.Cheerio): StockCommonModel {
  const stockName = stock.text();
  const stockCode = stock.children("a").attr()["href"].split("code=")[1];
  return {
    name: stockName,
    code: stockCode,
  };
}

/**
 * 종목의 거래량이 천만 이하 인지 확인하여 boolean을 반환한다.
 */
export function isLeTenMillion(row: cheerio.Cheerio): boolean {
  const volumeStr = row.children("td:nth-child(6)").text();
  const volumeInt = Number(volumeStr.split(",").join(""));
  return volumeInt < 10_000_000;
}

/**
 * 종목의 거래대금이 200억 이상인지 확인하여 boolean을 반환한다.
 */
export function isLeTwentyBillion(row: cheerio.Cheerio): boolean {
  const amountStr = row.children("td:nth-child(7)").text();
  const amountInt = Number(amountStr.split(",").join(""));
  return amountInt < 20_000;
}

/**
 * ETF 종목인지 확인하기
 */
export function exceptETFnETN(name: string): boolean {
  if (
    name.includes("선물") ||
    name.includes("ETN") ||
    name.includes("KODEX") ||
    name.includes("TIGER") ||
    name.includes("인버스") ||
    name.includes("레버리지")
  ) {
    return true;
  }

  return false;
}

/**
 * 상한가 종목은 거래량에서 제외한다.
 */
export function exceptUpperLimitList(
  upperLimitList: StockItemModel[],
  volumeList: StockItemModel[]
): StockItemModel[] {
  const exceptList = volumeList.filter((volumeItem) => {
    return !upperLimitList.some((upperLimitItem) => {
      return upperLimitItem.code === volumeItem.code;
    });
  });

  return exceptList;
}

/**
 * 현재가가 1000원 이하인 동전주는 제외한다.
 */
export function isPriceLeOneK(row: cheerio.Cheerio): boolean {
  const currentPriceStr = row.children("td:nth-child(3)").text();
  const currentPriceInt = Number(currentPriceStr.split(",").join(""));
  return currentPriceInt < 1_000;
}

/**
 * 시가 총액이 1,000억원을 넘지 않는 종목은 제외한다.
 */
export function isMarketCapLeTenB(row: cheerio.Cheerio): boolean {
  const marketCapStr = row.children("td:nth-child(10)").text();
  const marketCapInt = Number(marketCapStr.split(",").join(""));
  return marketCapInt < 1_000;
}
