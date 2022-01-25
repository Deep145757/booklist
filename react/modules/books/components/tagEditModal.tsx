import React, { FunctionComponent, useState, useContext, useRef, useEffect } from "react";

import { Button } from "app/components/ui/Button";
import CustomColorPicker from "app/components/ui/CustomColorPicker";
import GenericLabelSelect from "app/components/subjectsAndTags/genericLabelSelect";
import ColorsPalette from "app/components/ui/ColorsPalette";
import Modal from "app/components/ui/Modal";

import UpdateTag from "graphQL/tags/updateTag.graphql";
import CreateTag from "graphQL/tags/createTag.graphql";
import DeleteTagMutation from "graphQL/tags/deleteTag.graphql";

import { useMutation } from "micro-graphql-react";
import { filterTags, useTagsState } from "app/state/tagsState";
import { MutationOf, Mutations } from "graphQL/graphql-typings";
import { useColors } from "app/state/colorsState";
import Stack from "app/components/layout/Stack";
import FlowItems from "app/components/layout/FlowItems";
import FlexRow from "app/components/layout/FlexRow";

interface ILocalProps {
  onDone: any;
  editModalOpen: boolean;
}

type EditTagProps = { doSave: any; onCancel: any; onDelete: any; editingTag: any; saving: any; setNewTagName: any; setEditingValue: any };

const EditTag: FunctionComponent<EditTagProps> = props => {
  let { colors } = useColors();
  let textColors = ["#ffffff", "#000000"];

  const { editingTag, saving, setNewTagName, setEditingValue, doSave, onCancel, onDelete } = props;
  const setNewTagBackgroundColor = value => setEditingValue("backgroundColor", value);
  const setNewTagTextColor = value => setEditingValue("textColor", value);

  const inputEl = useRef(null);
  useEffect(() => inputEl.current.focus({ preventScroll: true }), []);

  return (
    <FlexRow>
      <div className="col-xs-12 col-sm-6">
        <div className="form-group">
          <label>Tag name</label>
          <input ref={inputEl} className="form-control" value={editingTag.name} onChange={evt => setNewTagName(evt.target.value)} />
          <div
            className="label label-default"
            style={{ backgroundColor: editingTag.backgroundColor, color: editingTag.textColor, alignSelf: "flex-start" }}
          >
            {editingTag.name.trim() || "<label preview>"}
          </div>
        </div>
      </div>
      <div className="col-xs-6 hidden-xs"></div>
      <div className="col-xs-12 col-sm-6">
        <div className="form-group">
          <label>Label color</label>
          <ColorsPalette currentColor={editingTag.backgroundColor} colors={colors} onColorChosen={setNewTagBackgroundColor} />
          <CustomColorPicker labelStyle={{ marginLeft: "3px" }} onColorChosen={setNewTagBackgroundColor} currentColor={editingTag.backgroundColor} />
        </div>
      </div>
      <div className="col-xs-12 col-sm-6">
        <div className="form-group">
          <label>Text color</label>
          <ColorsPalette colors={textColors} onColorChosen={setNewTagTextColor} />
          <CustomColorPicker labelStyle={{ marginLeft: "3px" }} onColorChosen={setNewTagTextColor} currentColor={editingTag.backgroundColor} />
        </div>
      </div>

      <div className="col-xs-12">
        <FlowItems pushLast={true}>
          <Button disabled={saving} preset="primary-xs" onClick={doSave}>
            Save <i className={`far fa-fw ${saving ? "fa-spinner fa-spin" : "fa-save"}`} />
          </Button>
          <Button disabled={saving} preset="default-xs" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={onDelete} preset="danger-xs">
            Delete <i className="far fa-fw fa-trash" />
          </Button>
        </FlowItems>
      </div>
    </FlexRow>
  );
};

const TagEditModal: FunctionComponent<ILocalProps> = props => {
  const [state, setStateRaw] = useState({
    editingTag: null,
    editingTagName: "",
    tagSearch: "",
    deletingId: ""
  } as any);

  const setState = newState => {
    if (typeof newState === "function") {
      setStateRaw(newState);
    } else {
      setStateRaw(state => ({ ...state, ...newState }));
    }
  };

  const setTagSearch = value => setState({ tagSearch: value });

  const newTag = () => startEditing({ _id: "", name: "", backgroundColor: "", textColor: "" });
  const editTag = tag => {
    startEditing(tag);
    setTagSearch("");
  };
  const startEditing = tag => setState({ editingTag: tag, editingTagName: tag.name, deletingId: "" });
  const cancelTagEdit = () => setState({ editingTag: null, deletingId: "" });

  const setNewTagName = value => setEditingValue("name", value);
  const setEditingValue = (name, value) => setState(state => ({ ...state, editingTag: { ...state.editingTag, [name]: value } }));

  const { runMutation: updateTag } = useMutation<MutationOf<Mutations["updateTag"]>>(UpdateTag);
  const { runMutation: createTag } = useMutation<MutationOf<Mutations["createTag"]>>(CreateTag);

  const createOrUpdateTag = () => {
    const { editingTag } = state;
    setState({ saving: true });

    const { _id, name, backgroundColor, textColor } = editingTag;
    const variables: any = { _id: _id || void 0, name, backgroundColor, textColor };
    const promise = _id ? updateTag(variables) : createTag(variables);

    (promise as any).then((resp: any) => {
      cancelTagEdit();
      setTagSearch("");
      setState({ saving: false });
    });
  };

  let { tags } = useTagsState();

  let { onDone, editModalOpen } = props;
  let { editingTag, editingTagName, tagSearch, deletingId } = state;

  let deletingTag = deletingId ? tags.find(t => t._id == deletingId) : null;
  let deleteInfo = deletingTag ? { _id: deletingTag._id, name: deletingTag.name } : null;
  let searchedTags = filterTags(tags, tagSearch);

  let onDelete = e => setState({ deletingId: editingTag._id });

  return (
    <Modal focusHeaderCloseButton={true} isOpen={!!editModalOpen} onHide={onDone} headerCaption="Edit Tags">
      <Stack>
        <FlowItems pushLast={true} xsFlowReverse={true}>
          <GenericLabelSelect
            inputProps={{ placeholder: "Edit tag", value: tagSearch, onChange: evt => setTagSearch(evt.target.value) }}
            suggestions={searchedTags}
            onSuggestionSelected={item => editTag(item)}
          />
          <Button onClick={newTag} preset="info-xs">
            <span className="visible-xs">Add new tag </span>
            <i className="far fa-fw fa-plus-square" />
          </Button>
        </FlowItems>

        {editingTag ? (
          <div>
            {deleteInfo ? (
              <PendingDeleteTagInfo tag={editingTag} onDelete={cancelTagEdit} onCancel={() => setState({ deletingId: "" })} />
            ) : (
              <EditTag
                doSave={createOrUpdateTag}
                onCancel={cancelTagEdit}
                saving={state.saving}
                {...{ editingTag, setNewTagName, setEditingValue, onDelete }}
              />
            )}
          </div>
        ) : null}
        <hr />
      </Stack>
      <Button onClick={onDone}>Close</Button>
    </Modal>
  );
};

const PendingDeleteTagInfo = ({ tag, onDelete, onCancel }) => {
  const { runMutation: deleteTag, running } = useMutation<MutationOf<Mutations["deleteTag"]>>(DeleteTagMutation);
  const runDelete = () => Promise.resolve(deleteTag({ _id: tag._id })).then(onDelete);

  return (
    <Stack>
      <div className="alert alert-danger alert-slimmer" style={{ alignSelf: "flex-start" }}>
        <FlowItems tighter={true}>
          <span>Delete {tag.name}?</span>
        </FlowItems>
      </div>
      <FlowItems>
        <Button disabled={running} onClick={runDelete} preset="danger-xs">
          {running ? (
            <span>
              Deleting <i className="far fa-spinner fa-spin"></i>
            </span>
          ) : (
            "Delete it!"
          )}
        </Button>
        <Button disabled={running} onClick={onCancel} className="btn btn-xs">
          Cancel
        </Button>
      </FlowItems>
    </Stack>
  );
};

export default TagEditModal;
