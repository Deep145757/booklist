import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8";
import type { Page } from "playwright";

const client = new LambdaClient({
  region: "us-east-1"
});

const playwright: any = process.env.stage ? require("playwright-aws-lambda") : require("playwright");

export async function getBookRelatedItems(isbn: string) {
  const browser = process.env.stage
    ? await playwright.launchChromium({
        headless: true
      })
    : await playwright.chromium.launch({
        headless: true
      });
  try {
    const page: Page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
      }
    });

    console.log("Attempting url", `https://www.amazon.com/dp/${isbn}`);
    await page.goto(`https://www.amazon.com/dp/${isbn}`, {});
    await page.waitForTimeout(100);

    const title = await page.title();
    if (/page not found/i.test(title)) {
      console.log("Page not found when syncing related items");
      return null;
    }

    for (let i = 1; i <= 15; i++) {
      try {
        await page.evaluate(() => window.scrollTo(0, i * 300));
        await page.waitForTimeout(250);
      } catch (er) {}
    }

    let allCarousels = await page.locator("[data-a-carousel-options]").all();
    console.log("Found", allCarousels.length, "carousels");
    if (!allCarousels.length) {
      console.log("Trying again ...");
      try {
        await page.waitForSelector("[data-a-carousel-options]", { timeout: 5000 });
        allCarousels = await page.locator("[data-a-carousel-options]").all();
        console.log("Second attempt found:", allCarousels.length, "carousels");
      } catch (er) {
        console.log("Second attemt failed");
      }
    }

    const allBookResults = new Map();

    for (const carousel of allCarousels) {
      console.log("Processing carousel");
      const carouselEl = await carousel.elementHandle();
      const headerEl = await carouselEl.$(".a-carousel-heading");

      if (headerEl == null) {
        console.log("No carousel heading found");
        continue;
      } else {
        const results = await processCarousel(page, carousel);
        console.log("Found", results.length, "in", (await headerEl.innerText()).replace(/\n/g, " "));

        for (const book of results) {
          if (!allBookResults.has(book.isbn)) {
            allBookResults.set(book.isbn, book);
          }
        }
      }
    }

    const allResults = [...allBookResults.values()];
    await processImages(allResults);

    return allResults;
  } finally {
    await browser?.close();
  }
}

async function processImages(books: any[]) {
  for (const book of books) {
    const command = new InvokeCommand({
      FunctionName: "process-book-cover-live-processCover",
      Payload: fromUtf8(JSON.stringify({ url: book.img, userId: "similar-books" }))
    });
    const response = await client.send(command);

    if (response.Payload) {
      try {
        const respJson = JSON.parse(toUtf8(response.Payload));

        delete book.img;
        book.smallImage = respJson.smallImage;
        book.smallImagePreview = respJson.smallImagePreview;
        book.mobileImage = respJson.mobileImage;
        book.mobileImagePreview = respJson.mobileImagePreview;
      } catch (er) {
        console.log("Error syncing book cover");
      }
    } else {
      console.log("can't process");
    }
  }
}

async function processCarousel(page, carousel) {
  const results = await getResults(carousel);

  if (results.length) {
    const nextPage = await carousel.locator("a.a-carousel-goto-nextpage");
    if (nextPage) {
      await nextPage.click({ force: true });
      await page.waitForTimeout(5000);

      const page2 = await getResults(carousel);
      results.push(...page2);
    }
  }

  return results;
}

async function getResults(carousel) {
  const resultsMap = new Map();

  const cards = await carousel.locator("li.a-carousel-card").all();

  for (const card of cards) {
    const bookInfo = await getBookInfo(card);
    if (bookInfo && !resultsMap.get(bookInfo.isbn)) {
      resultsMap.set(bookInfo.isbn, bookInfo);
    }
  }

  return [...resultsMap.values()];
}

async function getBookInfo(card) {
  const coreBookData = await getCoreData(card);
  if (!coreBookData) {
    return null;
  } else {
    const author = await getAuthor(card);
    if (author) {
      console.log("Found author", author);
      return { ...coreBookData, author };
    } else {
      console.log("No author found");
      return null;
    }
  }
}

async function getCoreData(card) {
  let isbn = "";
  let img = "";
  let title = "";

  const anchors = await card.locator("a").all();
  for (const a of anchors) {
    const href = await a.getAttribute("href");

    if (href) {
      const match = href.match(/\/dp\/([a-zA-Z0-9]+)\//);

      if (match) {
        const isbnMaybe = match[1];
        if (isbnMaybe.length >= 10 && [...isbnMaybe.slice(0, 9)].every(c => !isNaN(c))) {
          if (!isbn) {
            isbn = isbnMaybe;
            console.log("Found isbn", isbn);
          } else if (isbn !== isbnMaybe) {
            continue;
          }

          const imgMaybe = (await a.locator("img").all())[0];
          if (imgMaybe) {
            const src = await imgMaybe.getAttribute("src");

            const paths = src.split("/");
            paths[paths.length - 1] = paths[paths.length - 1].replace(/\..*(\..*)$/, (match, ext) => ext);

            img = paths.join("/");
          } else if (!title) {
            title = await a.innerText();
          }
        }
      }
    }
  }
  console.log("Results found", { isbn, title, img });
  if (isbn && title && img) {
    return { isbn: isbn.toUpperCase(), title: title.trim(), img };
  }
}

async function getAuthor(card) {
  const author = await card.locator(".a-size-small").all();
  for (const a of author) {
    return a.innerText();
  }
}

export async function getAuthorFromBookPage(isbn: string) {
  const REAL_BROWSER = false;

  const browser = process.env.stage
    ? await playwright.launchChromium({
        headless: !REAL_BROWSER
      })
    : await playwright.chromium.launch({
        headless: !REAL_BROWSER
      });
  try {
    const page: Page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
      }
    });

    await page.goto(`https://www.amazon.com/dp/${isbn}`, {});
    await page.waitForTimeout(REAL_BROWSER ? 14000 : 4000);
    const robot = await page.getByText("Sorry, we just need to make sure you're not a robot").all();

    if (robot.length) {
      console.log("ROBOT");
      return -1;
    }

    const title = await page.title();
    if (/page not found/i.test(title)) {
      console.log("Page not found when syncing author");
      return null;
    }

    const allAuthorElements = await page.locator("span.author").all();

    for (const author of allAuthorElements) {
      console.log("Author Element");
      const innerHtml = await author.innerHTML();
      console.log("Author Element innerHTML", innerHtml);

      const totalText = await author.innerText();
      console.log({ totalText });
      let anchors = await author.locator("a.contributorNameID").all();

      console.log({ anchors_length: anchors.length });

      if (!anchors.length) {
        console.log("Nothing with 'contributorNameID' found, settling for regular anchors");
        anchors = await author.locator("a").all();
      }

      for (const anchor of anchors) {
        const text = await anchor.innerText();
        console.log({ text });
        if (text && text.length) {
          console.log("================================");
          console.log("Returning:", `'${text.trim()}'`);
          console.log("================================");
          return text.trim();
        }
      }

      console.log("----------");
    }
  } catch (er) {
    console.log("Error", er);
  } finally {
    await browser?.close();
  }
}
