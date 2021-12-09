import { ObjectId } from "mongodb";

import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import dlv from "dlv";

import getDbConnection from "../util/getDbConnection";

import { saveCoverToS3, saveContentToS3, getOpenLibraryCoverUri, getGoogleLibraryUri } from "../util/bookCoverHelpers";

import getSecrets from "../util/getSecrets";
import downloadFromUrl from "../util/downloadFromUrl";
import resizeImage from "../util/resizeImage";

const dbPromise = getDbConnection();

const delay = () => new Promise(res => setTimeout(res, 2500));

async function updateBookSummaryCovers() {
  let count = 1;
  const db = await dbPromise;
  const secrets = await getSecrets();

  const bookSummaries = await db
    .collection("bookSummaries")
    .aggregate([{ $match: { smallImage: new RegExp("nophoto") } }, { $limit: 15 }])
    .toArray();

  let _logs = [];
  const log = (...args) => {
    console.log(...args);
    _logs.push(args.join(" "));
  };

  for (let bookSummary of bookSummaries) {
    let { _id, isbn, title } = bookSummary;

    await delay();
    let res = await downloadFromUrl(getOpenLibraryCoverUri(isbn), 1000);
    if (!res) {
      log("No cover found on OpenLibrary for", title);

      log("Trying Google...");

      let cover = await getGoogleCoverUrl(isbn, secrets);
      if (!cover) {
        log(`Cover not found on Google either for ${title}`);
        continue;
      }

      log("Attempting Google cover", cover);

      res = await downloadFromUrl(cover, 1000);
    }
    if (!res || !("body" in res)) {
      log(`Could not download from Google, either`);

      continue;
    }

    let newImage = await resizeImage(res.body, 50);

    if (newImage) {
      let s3Key = await saveCoverToS3(newImage.body, `bookCovers/bookSummary/${uuid()}-${res.ext}`);

      log("#", count++, title, s3Key);
      await db.collection("bookSummaries").updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: { smallImage: s3Key }
        }
      );
    } else {
      log(`Google cover failed`);
      await db.collection("bookSummaries").updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: { smallImage: "" }
        }
      );
    }
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

  console.log("Saving logs to", `bookCoverSyncingLogs/${dateStr}.txt`);
  await saveContentToS3(_logs.join("\n"), `bookCoverSyncingLogs/${dateStr}.txt`);
  console.log("Logs saved");
}

function getGoogleCoverUrl(isbn, secrets) {
  return new Promise(async resolve => {
    try {
      let response: any = await fetch(getGoogleLibraryUri(isbn, secrets["google-library-key"]));
      if (!response.ok) {
        console.log("Error:", response.statusCode);
        return resolve(null);
      }

      let json = await response.json();
      let items = json.items;

      if (!Array.isArray(items) || !items.length || !items[0]) {
        return resolve(null);
      }

      let imageLinks = dlv(items[0], "volumeInfo.imageLinks");
      if (!imageLinks) {
        return resolve(null);
      }

      let smallImage = imageLinks.smallThumbnail || imageLinks.thumbnail;
      if (smallImage) {
        smallImage = smallImage.replace(/&edge=curl/gi, "");
      }

      return resolve(smallImage || null);
    } catch (err) {
      console.log("Error fetching and processing", err);
      return resolve(null);
    }
  });
}

export const handler = async event => {
  await updateBookSummaryCovers();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Done!" })
  };
};
