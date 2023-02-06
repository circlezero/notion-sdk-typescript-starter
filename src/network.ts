import axios, { AxiosRequestConfig } from "axios";
import * as https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const axiosConfig: AxiosRequestConfig = {
  httpsAgent,
  responseType: "arraybuffer",
};

const client = axios.create(axiosConfig);

// 네이버 증권 상한가 종목
export function getUpperLimitList() {
  return client.get("https://finance.naver.com/sise/sise_upper.naver");
}

// 네이버 증권 거래상위 코스피 종목
export function getKospiVolumeList() {
  return client.get("https://finance.naver.com/sise/sise_quant.naver?sosok=0");
}

// 네이버 증권 거래상위 코스닥 종목
export function getKosdaqVolumeList() {
  return client.get("https://finance.naver.com/sise/sise_quant.naver?sosok=1");
}
