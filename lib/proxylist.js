import axios from "axios";
import * as cheerio from "cheerio";

export default async function getNewProxy() {
  let { data } = await axios.get("https://free-proxy-list.net/");
  let $ = cheerio.load(data);

  let proxies = [];
  
  $("tbody tr").each((_, element) => {
    let tds = $(element).find("td");
    let ip = $(tds[0]).text();
    let port = $(tds[1]).text();
    let https = $(tds[6]).text().toLowerCase();

    if (https === "yes") {
      proxies.push({ ip, port });
    }
  });

  if (proxies.length === 0) {
    throw new Error("No HTTPS proxy available");
  }

  return proxies[Math.floor(Math.random() * proxies.length)];
}
