<script lang="ts">
  import Alert from "$lib/components/ui/Alert.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import InputGroup from "$lib/components/ui/Input/InputGroup.svelte";
</script>

<div class="demo-root">
  <div data-reach-dialog-content class="mock-modal">
    <h4>Book Search</h4>
    <hr />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <div class="flex flex-col gap-2">
          <InputGroup labelText="Title">
            <Input slot="input" placeholder="Search title" value="The Slefish Gene" />
          </InputGroup>

          <Alert type="warning">Did you spell this right?</Alert>
        </div>
      </div>
      <div>
        <div class="flex flex-col gap-2">
          <InputGroup labelText="Publisher">
            <Input slot="input" placeholder="Publisher" value="Basic Books" />
          </InputGroup>

          <Alert type="success">Looks good to me!</Alert>
        </div>
      </div>
      <div>
        <div class="flex flex-col gap-2">
          <InputGroup labelText="Author">
            <Input slot="input" placeholder="Author" />
          </InputGroup>
          <Alert type="error">Author is required!</Alert>
        </div>
      </div>
    </div>
    <hr />
    <div class="flex flex-row">
      <Button theme="primary">Filter</Button>
      <Button class="ml-auto">Close</Button>
    </div>
  </div>
  <Alert type="info" class="mt-2">This color theme will be saved locally, and remembered the next time you browse here (on the same device)</Alert>
</div>
