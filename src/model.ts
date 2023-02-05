export interface StockCommonModel {
  /** 종목 코드 */
  code: string;

  /** 종목 명 */
  name: string;
}

export interface StockItemModel extends StockCommonModel {
  market: "KOSPI" | "KOSDAQ";

  /**
   * VOLUME - 거래량
   *
   * UPPER - 상한가
   */
  type: "VOLUME" | "UPPER";
}
