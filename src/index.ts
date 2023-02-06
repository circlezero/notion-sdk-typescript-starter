import { Client } from "@notionhq/client";
import axios from "axios";
import dotenv from "dotenv";
import { StockItemModel } from "./model";
import {
  getKosdaqVolumeList,
  getKospiVolumeList,
  getUpperLimitList,
} from "./network";
import {
  getHtmlDecode,
  parseKosdaqVolumeList,
  parseKospiVolumeList,
  parseUpperLimitList,
} from "./util";

dotenv.config();

async function main() {
  let todayList: StockItemModel[] = [];
  await axios
    .all([getUpperLimitList(), getKospiVolumeList(), getKosdaqVolumeList()])
    .then(
      axios.spread((res1, res2, res3) => {
        const upperList = parseUpperLimitList(getHtmlDecode(res1));
        const kospiVolumeList = parseKospiVolumeList(getHtmlDecode(res2));
        const kosdaqVolumeList = parseKosdaqVolumeList(getHtmlDecode(res3));
        todayList = [...upperList, ...kospiVolumeList, ...kosdaqVolumeList];
      })
    );

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  const database_id = process.env.STOCK_ANALYSIS_DATABASE_ID || "";
  const todayDate = new Date().toISOString();

  for (let i = 0; i < todayList.length; i++) {
    const stock = todayList[i];
    await notion.pages.create({
      parent: {
        type: "database_id",
        database_id,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: stock.name,
              },
            },
          ],
        },
        Code: {
          rich_text: [
            {
              text: {
                content: stock.code,
              },
            },
          ],
        },
        Type: {
          select: {
            name: stock.type === "VOLUME" ? "거래량" : "상한가",
          },
        },
        Market: {
          select: {
            name: stock.market === "KOSDAQ" ? "코스닥" : "코스피",
          },
        },
        Date: {
          date: {
            start: todayDate,
            time_zone: "Asia/Seoul",
          },
        },
      },
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
