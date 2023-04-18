import { StockItemModel } from "./model";
import {
  exceptETFnETN,
  getStockCommonData,
  isLeTenMillion,
  isLeTwentyBillion,
  isMarketCapLeTenB,
  isPriceLeOneK,
} from "./util";

/**
 * KOSPI, KOSDAQ의 상한가 종목을 반환한다.
 */
export function parseUpperLimitList($: cheerio.Root) {
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
export function parseKospiVolumeList($: cheerio.Root) {
  const kospiVolumeList: StockItemModel[] = [];
  const tableBody = $("#contentarea .box_type_l table tbody");

  tableBody.each((_, el) => {
    const rows = $(el).children();

    for (let i = 2; i < rows.length - 2; i++) {
      const row = $(rows[i]);
      if (row.children().length === 1) continue;
      if (isPriceLeOneK(row)) continue;
      if (isMarketCapLeTenB(row)) continue;
      if (isLeTwentyBillion(row)) continue;
      if (isLeTenMillion(row)) break;

      const stockItem = row.children("td:nth-child(2)");
      const { code, name } = getStockCommonData(stockItem);

      if (exceptETFnETN(name)) continue;

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
export function parseKosdaqVolumeList($: cheerio.Root) {
  const kosdaqVolumeList: StockItemModel[] = [];
  const tableBody = $("#contentarea .box_type_l table tbody");
  tableBody.each((_, el) => {
    const rows = $(el).children();

    for (let i = 2; i < rows.length - 2; i++) {
      const row = $(rows[i]);
      if (row.children().length === 1) continue;
      if (isPriceLeOneK(row)) continue;
      if (isMarketCapLeTenB(row)) continue;
      if (isLeTwentyBillion(row)) continue;
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
