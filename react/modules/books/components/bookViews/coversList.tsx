import React, { SFC, useState, Suspense, useContext, FunctionComponent } from "react";
import LazyModal from "app/components/ui/LazyModal";

const BookEditModal = LazyModal(() => import(/* webpackChunkName: "book-view-edit-modals" */ "app/components/editBook/editModal"));
const DetailsView = LazyModal(() => import(/* webpackChunkName: "book-view-edit-modals" */ "./detailView"));

import coversClasses from "./coversList.module.scss";
import { CoverMedium } from "app/components/bookCoverComponent";
import Loading from "app/components/loading";
import { useCodeSplitModal } from "modules/books/util";
import { BooksModuleContext } from "modules/books/books";

const { coversList } = coversClasses;

const BookViewCovers: FunctionComponent<{ books: any }> = props => {
  const { actions } = useContext(BooksModuleContext);
  const { saveEditingBook } = actions;

  const [displaying, setDisplaying] = useState(null);

  const [bookPreviewing, openBookPreview, closeBookPreview] = useCodeSplitModal(null);
  const [bookEditing, openBookEditModalWith, closeBookEdit] = useCodeSplitModal(null);

  const previewBook = book => {
    setDisplaying(book);
    openBookPreview();
  };

  const doSave = book => {
    Promise.resolve(saveEditingBook(book)).then(() => closeBookEdit());
  };

  const closeModal = () => closeBookPreview(false);

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <DetailsView book={displaying} isOpen={bookPreviewing} onClose={closeModal} editBook={openBookEditModalWith} />

        <BookEditModal
          title={bookEditing ? `Edit ${bookEditing.title}` : ""}
          bookToEdit={bookEditing}
          isOpen={!!bookEditing}
          saveBook={doSave}
          saveMessage={"Saved"}
          onClosing={() => openBookEditModalWith(null)}
        />
      </Suspense>
      <div>
        <div style={{ border: 0 }} className={coversList}>
          {props.books.map((book, i) => (
            <figure onClick={() => previewBook(book)}>
              <div>
                <CoverMedium url={book.mediumImage} />
              </div>
              <figcaption>{book.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookViewCovers;
