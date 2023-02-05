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
function getStockCommonData(stock: cheerio.Cheerio): StockCommonModel {
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
function isLeTenMillion(row: cheerio.Cheerio): boolean {
  const volumeStr = row.children("td:nth-child(6)").text();
  const volumeInt = Number(volumeStr.split(",").join(""));
  return volumeInt < 10_000_000;
}

/**
 * KOSPI, KOSDAQ의 상한가 종목을 반환한다.
 */
export function getUpperLimitList($: cheerio.Root) {
  const UpperLimitList: StockItemModel[] = [];
  const tableBody = $("#contentarea .box_type_l table tbody");

  tableBody.each((tableIdx, el) => {
    const rows = $(el).children();

    for (let i = 2; i < rows.length - 2; i++) {
      const stockItem = $(rows[i]).children("td:nth-child(4)");
      const { code, name } = getStockCommonData(stockItem);
      if (tableIdx === 0) {
        UpperLimitList.push({
          code,
          name,
          market: "KOSPI",
          type: "UPPER",
        });
      }

      if (tableIdx === 1) {
        UpperLimitList.push({
          code,
          name,
          market: "KOSDAQ",
          type: "UPPER",
        });
      }
    }
  });

  return UpperLimitList;
}

/**
 * KOSPI의 거래량 1000만 이상의 종목을 반환한다.
 */
export function getKospiVolumeList($: cheerio.Root) {
  const kospiVolumeList: StockItemModel[] = [];
  const tableBody = $("#contentarea .box_type_l table tbody");

  tableBody.each((_, el) => {
    const rows = $(el).children();

    for (let i = 2; i < rows.length - 2; i++) {
      const row = $(rows[i]);
      if (row.children().length === 1) continue;
      if (isLeTenMillion(row)) break;

      const stockItem = row.children("td:nth-child(2)");
      const { code, name } = getStockCommonData(stockItem);

      kospiVolumeList.push({
        code,
        name,
        market: "KOSPI",
        type: "VOLUME",
      });
    }
  });
  return kospiVolumeList;
}

/**
 * KOSDAQ의 거래량 1000만 이상의 종목을 반환한다.
 */
export function getKosdaqVolumeList($: cheerio.Root) {
  const kosdaqVolumeList: StockItemModel[] = [];
  const tableBody = $("#contentarea .box_type_l table tbody");
  tableBody.each((_, el) => {
    const rows = $(el).children();

    for (let i = 2; i < rows.length - 2; i++) {
      const row = $(rows[i]);
      if (row.children().length === 1) continue;
      if (isLeTenMillion(row)) break;

      const stockItem = row.children("td:nth-child(2)");
      const { code, name } = getStockCommonData(stockItem);

      kosdaqVolumeList.push({
        code,
        name,
        market: "KOSDAQ",
        type: "VOLUME",
      });
    }
  });
  return kosdaqVolumeList;
}
