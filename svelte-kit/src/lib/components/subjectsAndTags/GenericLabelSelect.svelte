<script lang="ts">
  import AutoSuggest from "svelte-helpers/AutoSuggest.svelte";
  import GenericLabelDisplayItem from "./GenericLabelDisplayItem.svelte";

  export let options: any;
  export let placeholder = "";
  export let inputProps = { class: "md:text-sm text-base" };
  export let search = "";
  export let onItemSelected: (option: any, inputEl: HTMLInputElement) => void;
  export let noFiltering = false;

  let inputStyles = "width: 100px; border-top-width: 0; border-right-width: 0; border-left-width: 0; border-radius: 0;";
</script>

<div class="generic-label-select">
  <AutoSuggest
    keyField="id"
    {options}
    {inputProps}
    {placeholder}
    {onItemSelected}
    {inputStyles}
    {noFiltering}
    filterField="name"
    bind:currentSearch={search}
  >
    <span slot="result" let:option>
      <GenericLabelDisplayItem item={option} />
    </span>
  </AutoSuggest>
</div>

<style>
  .generic-label-select :global(.options-root) {
    z-index: 999 !important;
  }
</style>
