<script lang="ts">
  import type { Book, Subject, Tag } from "$data/types";
  import BookRow from "./BookRow.svelte";
  import { changeFilter, searchState } from "../state/searchState";
  import { selectedBooks, selectionState } from "../state/selectionState";

  export let isPublic: boolean;
  export let books: Book[];
  export let subjects: Subject[];
  export let tags: Tag[];

  $: ({ sortField, sortDirection } = $searchState);

  $: allBooksSelected = books.length === $selectedBooks.length;
  function toggleCheckAll() {
    if (allBooksSelected) {
      selectionState.clear();
    } else {
      selectionState.selectAll(books);
    }
  }
</script>

<table style="position: relative; align-self: start;" class="table w-full max-w-full">
  <thead>
    <tr>
      {#if !isPublic}
        <th class="p-0" style="text-align: center; width: 25px;">
          <button class="raw-button" style="font-size: 12pt" on:click={toggleCheckAll}>
            <i class={"fal fa-fw " + (!!allBooksSelected ? "fa-check-square" : "fa-square")} />
          </button>
        </th>
      {/if}
      <th class="p-0" style="width: 60px" />
      <th class="p-0" style="min-width: 200px">
        <a class="bold" href={$changeFilter.withSort("title")}>
          Title
          {#if sortField == "title"}<i class={"far fa-angle-" + (sortDirection == "asc" ? "up" : "down")} />{/if}
        </a>
      </th>
      <th class="p-0" style="min-width: 90px;">Subjects</th>
      <th class="p-0" style="min-width: 90px;">Tags</th>
      <th class="p-0" style="min-width: 90px;" />
      <th class="p-0" />
      <th class="p-0" style="min-width: 85px; ">
        <a class="bold" href={$changeFilter.withSort("pages")}>
          Pages
          {#if sortField == "pages"}<i class={"far fa-angle-" + (sortDirection == "asc" ? "up" : "down")} />{/if}
        </a>
      </th>
      <th class="p-0">
        <a class="bold" href={$changeFilter.withSort("id")}>
          Added
          {#if sortField == "id"}<i class={"far fa-angle-" + (sortDirection == "asc" ? "up" : "down")} />{/if}
        </a>
      </th>
    </tr>
  </thead>
  <tbody>
    {#each books as book (book.id)}
      <BookRow {book} {subjects} {tags} {isPublic} />
    {/each}
  </tbody>
</table>
