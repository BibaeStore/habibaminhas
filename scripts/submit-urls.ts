const HOST = "habibaminhas.com";
const KEY = "a155454dc54c4df0bb73b71327652d5d";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

async function submitUrls() {
  console.log("=========================================");
  console.log("   INDEXNOW BULK URL SUBMISSION SCRIPT   ");
  console.log("=========================================\n");

  console.log(`1. Fetching sitemap from: ${SITEMAP_URL}...`);
  try {
    const sitemapRes = await fetch(SITEMAP_URL);
    if (!sitemapRes.ok) {
      throw new Error(`Failed to fetch sitemap: ${sitemapRes.status} ${sitemapRes.statusText}`);
    }
    
    const xmlText = await sitemapRes.text();
    
    // Parse URLs using regex
    const urlRegex = /<loc>(https:\/\/habibaminhas\.com\/[^<]*)<\/loc>/g;
    const urls: string[] = [];
    let match;
    while ((match = urlRegex.exec(xmlText)) !== null) {
      urls.push(match[1]);
    }

    if (urls.length === 0) {
      console.error("❌ Error: No URLs found in the sitemap.");
      process.exit(1);
    }

    console.log(`\nFound ${urls.length} URLs in the sitemap.`);
    console.log("Sample URLs:");
    urls.slice(0, 5).forEach(u => console.log(` - ${u}`));
    if (urls.length > 5) console.log(` ... and ${urls.length - 5} more.`);

    console.log(`\n2. Submitting to IndexNow API at: ${INDEXNOW_ENDPOINT}...`);
    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    };

    const indexnowRes = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    console.log(`IndexNow Response Status: ${indexnowRes.status} ${indexnowRes.statusText}`);

    if (indexnowRes.status === 200) {
      console.log("\n✅ SUCCESS: URLs submitted successfully to IndexNow!");
      console.log("Search engines will crawl and update these pages shortly.");
    } else if (indexnowRes.status === 202) {
      console.log("\n✅ ACCEPTED: URLs received. IndexNow key validation is pending.");
    } else {
      console.error(`\n❌ FAILED (Status Code ${indexnowRes.status})`);
      if (indexnowRes.status === 400) {
        console.error("Reason: Bad Request. Invalid format or payload parameters.");
      } else if (indexnowRes.status === 403) {
        console.error("Reason: Forbidden. The key is not valid, or the key file was not found at the keyLocation.");
        console.error(`Make sure ${KEY_LOCATION} is live and reachable.`);
      } else if (indexnowRes.status === 422) {
        console.error("Reason: Unprocessable Entity. The host doesn't match the key location.");
      } else if (indexnowRes.status === 429) {
        console.error("Reason: Too Many Requests. Rate limit exceeded.");
      }
      process.exit(1);
    }
  } catch (error: any) {
    console.error("\n❌ Error running the submit script:", error.message);
    process.exit(1);
  }
}

submitUrls();
