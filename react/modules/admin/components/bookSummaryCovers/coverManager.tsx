import React, { useState } from "react";
import { useQuery } from "micro-graphql-react";

import SummaryQuery from "graphQL/admin/bookSummaryCoverInfo.graphql";
import UpdateBookSummary from "graphQL/bookSummary/updateBookSummary.graphql";
import styles from "./styles.module.css";
const { bookList, bookDisplay, img, bookInfo, title, author } = styles;

import ajaxUtil from "util/ajaxUtil";
import { getBookInfo } from "util/isbnDb";
import { QueryOf, Queries, BookSummaryBulkMutationResult } from "graphql-typings";
import { Form, SubmitIconButton } from "app/components/ui/Form";
import { useAppState } from "app/state/appState";
import { graphqlClient } from "util/graphql";
import { Button } from "app/components/ui/Button";
import Stack from "app/components/layout/Stack";

const updateSmallCover = ({ _id, url, userId, loginToken }) => {
  const request = { userId, loginToken, url, size: "small" };
  return ajaxUtil.postWithCors(
    process.env.UPLOAD_BOOK_COVER_FROM_URL,
    request,
    res => {
      if (res.url && !res.error) {
        return graphqlClient.processMutation(UpdateBookSummary, { _id, bookSummary: { smallImage: res.url } });
      }
    },
    err => {
      return { failure: true, url: "" };
    }
  );
};

const BookSummaryDisplay = props => {
  const { book } = props;
  const [{ userId, loginToken }] = useAppState();
  const [newUrl, setNewUrl] = useState("");
  const [newImg, setNewImg] = useState("");

  const changeImg = () => {
    return updateSmallCover({ _id: book._id, url: newUrl, userId, loginToken }).then(() => setNewUrl(""));
  };

  const useFetchedImage = () => {
    return updateSmallCover({ _id: book._id, url: newImg, userId, loginToken }).then(() => setNewImg(""));
  };

  const go = () => {
    getBookInfo(book.isbn).then(res => {
      if (res?.result?.book?.image) {
        setNewImg(res?.result?.book?.image);
      }
    });
  };

  return (
    <div className={bookDisplay}>
      <div className={img}>
        <img src={book.smallImage} />
      </div>
      <div className={bookInfo}>
        <div className={title}>
          <a target="_blank" href={`https://amazon.com/s?k=${book.title.replace(/\s+/g, "+")}`}>
            {book.title}
          </a>
        </div>
        <div className={author}>{(book.authors || []).join(", ")}</div>
        <Form submit={changeImg}>
          <div className="btn-group">
            <input className="form-control" placeholder="New Cover URL" value={newUrl} onChange={evt => setNewUrl(evt.target.value)} />
            <SubmitIconButton disabled={!newUrl} className="btn btn-default">
              <i className="far fa-cloud-upload-alt" />
            </SubmitIconButton>
          </div>
        </Form>
        <Stack style={{ marginTop: "10px" }}>
          <Button preset="default-xs" style={{ alignSelf: "flex-start" }} onClick={go}>
            Find Cover Image
          </Button>
          {newImg ? (
            <>
              <img style={{ alignSelf: "center" }} src={newImg} />
              <Button onClick={useFetchedImage} preset="primary">
                Save
              </Button>
            </>
          ) : null}
        </Stack>
      </div>
    </div>
  );
};

export default props => {
  const [missingCoversFilter, setMissingCoversFilter] = useState(true);

  const imgFilter = missingCoversFilter ? "nophoto" : void 0;

  const { data, loaded } = useQuery<QueryOf<Queries["allBookSummarys"]>>(SummaryQuery, { smallImage: imgFilter });
  const bookSummaries = data ? data.allBookSummarys.BookSummarys : [];

  return (
    <div className={bookList}>
      <label>
        Books missing covers <input type="checkbox" checked={missingCoversFilter} onChange={evt => setMissingCoversFilter(evt.target.checked)} />
      </label>
      <br />
      <br />
      {loaded ? (
        <div>
          {bookSummaries.map(book => (
            <BookSummaryDisplay key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <span>
          Loading ... <i className="fa fa-spinner fa-spin" />
        </span>
      )}
    </div>
  );
};
