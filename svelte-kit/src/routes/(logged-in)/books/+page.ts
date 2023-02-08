import { BOOKS_CACHE, getCurrentCookieValue } from "$lib/state/cacheHelpers";
import { writable } from "svelte/store";
import { BASIC_LIST_VIEW, GRID_VIEW } from "./bookViews/constants";

export async function load({ url, parent, fetch, depends, ...rest }: any) {
  depends("reload:books");

  const parentData = await parent();
  const cache = getCurrentCookieValue(BOOKS_CACHE) || parentData.booksCache;

  const resp = await fetch(`/api/books?${url.searchParams.toString()}&cache=${cache}`);
  const { books, totalBooks, page, totalPages } = await resp.json();

  const { uxState, showMobile } = parentData;

  const defaultBookView = uxState.bkVw ?? (showMobile ? BASIC_LIST_VIEW : GRID_VIEW);

  return {
    defaultBookView,
    totalBooks: writable(totalBooks),
    books: writable(books),
    page,
    totalPages
  };
}
