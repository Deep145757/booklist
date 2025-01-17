<script lang="ts">
  import { page } from "$app/stores";
  import type { Book, Subject } from "$data/types";
  import DisplaySelectedSubjects from "$lib/components/subjectsAndTags/subjects/DisplaySelectedSubjects.svelte";
  import SelectAvailableSubjects from "$lib/components/subjectsAndTags/subjects/SelectAvailableSubjects.svelte";

  import Modal from "$lib/components/ui/Modal.svelte";
  import StandardModalFooter from "$lib/components/ui/StandardModalFooter.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import ActionButton from "$lib/components/ui/Button/ActionButton.svelte";

  import { Tabs, TabHeaders, TabHeader, TabContents, TabContent } from "$lib/components/layout/tabs/index";

  import { enhance } from "$app/forms";
  import type { UpdatesTo } from "$lib/state/dataUpdates";

  $: subjects = $page.data.subjects;
  export let modifyingBooks: any[];
  export let isOpen: boolean;
  export let onSave: (id: number | number[], updates: UpdatesTo<Book>) => void;
  export let onHide: () => void;

  let addingSubjects: number[] = [];
  let removingSubjects: number[] = [];

  const resetSubjects = () => {
    addingSubjects = [];
    removingSubjects = [];
  };

  $: {
    if (isOpen) {
      resetSubjects();
    }
  }

  let saving = false;
  const save = () => {
    saving = true;
    const updates = {
      arraySync: {
        subjects: {
          push: addingSubjects,
          pull: removingSubjects
        }
      }
    };
    return async ({}) => {
      onSave(
        modifyingBooks.map(b => b.id),
        updates
      );
      saving = false;
      onHide();
    };
  };
  const addingSubjectSet = (adding: boolean, { id }: Subject) =>
    (addingSubjects = adding ? addingSubjects.concat(id) : addingSubjects.filter(x => x != id));
  const subjectSelectedToAdd = addingSubjectSet.bind(null, true);

  const removingSubjectSet = (adding: boolean, { id }: Subject) =>
    (removingSubjects = adding ? removingSubjects.concat(id) : removingSubjects.filter(x => x != id));
  const subjectSelectedToRemove = removingSubjectSet.bind(null, true);

  const dontAddSubject = addingSubjectSet.bind(null, false);
  const dontRemoveSubject = removingSubjectSet.bind(null, false);

  let closeModal: () => void;
</script>

<Modal {isOpen} {onHide} headerCaption="Add / Remove Subjects" standardFooter={false}>
  <form method="post" action="?/setBooksSubjects" use:enhance={save}>
    <Tabs defaultTab="subjects">
      <TabHeaders>
        <TabHeader tabName="subjects">Choose subjects</TabHeader>
        <TabHeader tabName="books">For books</TabHeader>
      </TabHeaders>
      <TabContents>
        <TabContent tabName="subjects">
          {#each modifyingBooks as b}
            <input type="hidden" name="ids" value={b.id} />
          {/each}
          {#each addingSubjects as s}
            <input type="hidden" name="add" value={s} />
          {/each}
          {#each removingSubjects as s}
            <input type="hidden" name="remove" value={s} />
          {/each}
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <SelectAvailableSubjects {subjects} placeholder="Adding" currentlySelected={addingSubjects} onSelect={subjectSelectedToAdd} />
            </div>
            <div class="md:col-span-3 flex items-center">
              <DisplaySelectedSubjects {subjects} currentlySelected={addingSubjects} onRemove={dontAddSubject} />
            </div>

            <div>
              <SelectAvailableSubjects {subjects} placeholder="Removing" currentlySelected={removingSubjects} onSelect={subjectSelectedToRemove} />
            </div>
            <div class="md:col-span-3 flex items-center">
              <DisplaySelectedSubjects {subjects} currentlySelected={removingSubjects} onRemove={dontRemoveSubject} />
            </div>

            <div class="md:col-span-4">
              <Button size="sm" type="button" on:click={resetSubjects}>Reset subjects</Button>
            </div>
          </div>
        </TabContent>
        <TabContent tabName="books">
          <div class="flex flex-col gap-2 text-sm">
            {#each modifyingBooks as book (book.id)}
              <div>{book.title}</div>
            {/each}
          </div>
        </TabContent>
      </TabContents>
    </Tabs>
    <StandardModalFooter bind:closeModal>
      <div class="flex flex-row">
        <ActionButton running={saving} theme="primary">Save</ActionButton>

        <Button type="button" class="ml-auto" on:click={closeModal}>Cancel</Button>
      </div>
    </StandardModalFooter>
  </form>
</Modal>
