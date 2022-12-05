import { searchBooks, updateBook } from "$data/books";
import { toJson } from "$lib/util/formDataHelpers";

export async function load(params: any) {
  const s = +new Date();
  const books = searchBooks(params.url.searchParams.get("search"));
  const e = +new Date();

  //console.log(params);
  //console.log(params.url.searchParams.get('search'));
  //console.log(junkRes);

  // console.log({ books });
  // console.log('--------------------------');

  return {
    books
  };
}

export const actions = {
  async saveBook({ request }: any) {
    const formData: URLSearchParams = await request.formData();
    console.log("Saving book", formData);
    console.log("Form data toString", [...formData.entries()]);

    const fields = toJson(formData, {
      strings: ["_id", "title"],
      arrays: ["author"]
    });
    console.log({ fields });
    await updateBook(fields);

    return { success: true };
  }
};
