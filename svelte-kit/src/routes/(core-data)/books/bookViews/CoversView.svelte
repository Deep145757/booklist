<script lang="ts">
  import BookDetailsModal from "./BookDetailsModal.svelte";
  import BookCover from "$lib/components/ui/BookCover.svelte";
  import type { Book, Subject, Tag } from "$data/types";

  export let books: Book[];
  export let subjects: Subject[];
  export let tags: Tag[];
  export let isPublic: boolean;

  let previewing: boolean = false;
  let bookPreviewing: Book | null = null;

  const previewBook = (book: Book) => {
    previewing = true;
    bookPreviewing = book;
  };
</script>

<BookDetailsModal isOpen={previewing} onHide={() => (previewing = false)} viewingBook={bookPreviewing} {subjects} {tags} {isPublic} />

<div>
  <div class="flex flex-col items-center mt-4">
    <div style="border: 0" class="covers-list flex justify-center flex-wrap m-[-15px] max-w-7xl">
      {#each books as book}
        <figure
          class="w-[120px] m-3 flex flex-col cursor-pointer border border-neutral-300 rounded p-[5px] transition-[transform_box-shadow] hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-300"
          on:click={() => previewBook(book)}
          on:keydown={() => {}}
        >
          <div class="self-center">
            <BookCover imgClasses="max-w-full" size="medium" {book} />
          </div>
          <figcaption class="whitespace-nowrap overflow-hidden text-ellipsis text-xs font-bold mt-auto p-[2px]">
            {book.title}
          </figcaption>
        </figure>
      {/each}
    </div>
  </div>
</div>
