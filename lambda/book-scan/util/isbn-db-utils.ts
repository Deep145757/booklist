import { toUtf8 } from "@aws-sdk/util-utf8-node";

import { getOpenLibraryCoverUri } from "../../util/bookCoverHelpers";
import { invoke } from "../../util/invokeLambda";
import { IS_DEV } from "../../util/environment";

const COVER_PROCESSING_LAMBDA = `process-book-cover-${IS_DEV ? "dev" : "live"}-processCover`;

type ImageData = {
  mobileImage: string;
  mobileImagePreview: any;
  smallImage: string;
  smallImagePreview: any;
  mediumImage: string;
  mediumImagePreview: any;
};

const getEmptyImageData = (): ImageData => ({
  mobileImage: "",
  mobileImagePreview: null,
  smallImage: "",
  smallImagePreview: null,
  mediumImage: "",
  mediumImagePreview: null
});

export async function getBookFromIsbnDbData(book, userId) {
  console.log("Processing:", JSON.stringify(book));

  let isbn = book.isbn13 || book.isbn;

  let imageData: ImageData = getEmptyImageData();
  if (book.image) {
    console.log("Processing image");
    try {
      let lambdaResult = await invoke(COVER_PROCESSING_LAMBDA, { url: book.image, userId });
      let bookCoverResults = JSON.parse(toUtf8(lambdaResult.Payload));

      console.log("Book covers from ISBN DB", bookCoverResults);

      if (bookCoverResults == null) {
        console.log("No book covers from ISBN DB");
        let lambdaResult = await invoke(COVER_PROCESSING_LAMBDA, { url: getOpenLibraryCoverUri(isbn), userId });
        bookCoverResults = JSON.parse(toUtf8(lambdaResult.Payload));

        console.log("Book covers from OpenLibrary", bookCoverResults);
      }

      if (bookCoverResults != null) {
        Object.assign(imageData, bookCoverResults);
      }
    } catch (err) {
      console.log("Error processing image", err);
    }
  }

  const newBook = {
    title: book.title || book.title_long,
    isbn,
    ean: "",
    pages: book.pages,
    ...imageData,
    publicationDate: book.date_published, // TODO
    publisher: book.publisher,
    authors: book.authors || [],
    editorialReviews: [],
    subjects: [],
    userId
  };

  if (book.synopsys) {
    newBook.editorialReviews.push({
      source: "Synopsys",
      content: book.synopsys
    });
  }

  if (book.overview) {
    newBook.editorialReviews.push({
      source: "Overview",
      content: book.overview
    });
  }

  return newBook;
}
