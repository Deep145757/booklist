<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";

  import EditSubject from "$lib/components/subjectsAndTags/subjects/EditSubject.svelte";
  import SelectAvailableSubjects from "$lib/components/subjectsAndTags/subjects/SelectAvailableSubjects.svelte";
  import type { Color, Subject } from "$data/types";

  export let isOpen = false;
  export let onHide = () => {};

  export let colors: Color[];
  export let subjects: Subject[];

  const emptySubject = {
    id: 0,
    name: "",
    backgroundColor: "#847E71",
    textColor: "#ffffff",
    path: ""
  };

  let editingSubject: Subject | null = null;

  const cancelEdit = () => (editingSubject = null);
  const newSubject = () => (editingSubject = emptySubject);
  const editSubject = (subject: Subject) => (editingSubject = subject);

  let deleteShowing: boolean = false;

  $: {
    if (isOpen) {
      cancelEdit();
    }
  }
</script>

<Modal {isOpen} {onHide} headerCaption="Edit Subjects">
  <div class="flex flex-col gap-3">
    {#if !deleteShowing}
      <div class="flex flex-col-reverse sm:flex-row gap-5">
        <SelectAvailableSubjects {subjects} placeholder="Edit subject" currentlySelected={[]} onSelect={item => editSubject(item)} />

        <Button size="med" class="flex flex-row gap-1 items-center self-start sm:ml-auto" on:click={newSubject}>
          <span>New subject </span>
          <i class="far fa-fw fa-plus-square" />
        </Button>
      </div>
    {/if}

    {#if editingSubject}
      <EditSubject {colors} allSubjects={subjects} bind:deleteShowing subject={editingSubject} onComplete={cancelEdit} onCancelEdit={cancelEdit} />
    {/if}
  </div>
</Modal>
