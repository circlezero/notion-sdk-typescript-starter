import axios, { AxiosRequestConfig } from "axios";
import dotenv from "dotenv";
import * as https from "https";
import {
  getHtmlDecode,
  getKosdaqVolumeList,
  getKospiVolumeList,
  getUpperLimitList,
} from "./util";

dotenv.config();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const axiosConfig: AxiosRequestConfig = {
  httpsAgent,
  responseType: "arraybuffer",
};

const client = axios.create(axiosConfig);

async function main() {
  // 상한가 크롤링 데이터
  await client
    .get("https://finance.naver.com/sise/sise_upper.naver")
    .then((response) => {
      let root = getHtmlDecode(response);
      const upperLimitList = getUpperLimitList(root);
      console.log("상한가 종목 : ", upperLimitList);
    });

  // 거래 상위 크롤링 데이터 (KOSPI)
  await client
    .get("https://finance.naver.com/sise/sise_quant.naver?sosok=0")
    .then((response) => {
      let root = getHtmlDecode(response);
      const kospiVolumeList = getKospiVolumeList(root);
      console.log("코스피 거래량 종목 : ", kospiVolumeList);
    });

  // 거래 상위 크롤링 데이터(KOSDAQ)
  await client
    .get("https://finance.naver.com/sise/sise_quant.naver?sosok=1")
    .then((response) => {
      let root = getHtmlDecode(response);
      const kosdaqVolumeList = getKosdaqVolumeList(root);
      console.log("코스닥 거래량 종목 : ", kosdaqVolumeList);
    });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
