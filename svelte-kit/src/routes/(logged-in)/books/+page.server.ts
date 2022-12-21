import { updateBook, updateBooksSubjects } from "$data/books";
import { toJson } from "$lib/util/formDataHelpers";

type Book = {
  _id: string;
  title: string;
  authors: string[];
};

export const actions = {
  async saveBook({ request }: any) {
    const formData: URLSearchParams = await request.formData();

    const fields = toJson(formData, {
      strings: ["_id", "title"],
      arrays: ["authors", "tags", "subjects"]
    }) as Book;
    fields.authors = fields.authors.filter(a => a);

    await updateBook(fields);

    return { success: true, updates: { fieldsSet: fields } };
  },
  async setBooksSubjects({ request }: any) {
    const formData: URLSearchParams = await request.formData();

    const fields = toJson(formData, {
      arrays: ["_ids", "add", "remove"]
    }) as any;

    await updateBooksSubjects(fields._ids, fields.add, fields.remove);

    return { success: true };
  }
};
