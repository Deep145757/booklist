<script lang="ts">
  import type { DisablableSubject, Subject } from "$data/types";
  import { filterSubjects, subjectState } from "$lib/state/subjectsState";

  import GenericLabelSelect from "../GenericLabelSelect.svelte";

  export let onSelect: (item: DisablableSubject) => void;
  export let placeholder = "Subjects";
  export let currentlySelected: number[] = [];

  export let subjects: Subject[];

  let search = "";

  const doSelect = (item: DisablableSubject) => {
    if (item.disabled) {
      return false;
    }
    onSelect(item);
    search = "";
  };

  type LookupHash = { [id: string]: true };
  $: itemHash = currentlySelected.reduce<LookupHash>((hash, _idOrObj) => ((hash[_idOrObj] = true), hash), {});

  $: subjectsPacket = subjectState(subjects);

  $: eligible = filterSubjects(subjectsPacket.subjectsUnwound, search, subjectsPacket.subjectHash, itemHash);
</script>

{#each currentlySelected as id}
  <input type="hidden" name="subjects" value={id} />
{/each}
<GenericLabelSelect {placeholder} noFiltering={true} bind:search options={() => eligible} onItemSelected={doSelect} />
