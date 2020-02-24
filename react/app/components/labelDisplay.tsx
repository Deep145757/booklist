import React from "react";

export const LabelDisplay = props => {
  let item = props.item,
    extraStyles = props.style || {},
    extraClasses = props.className || "";

  return (
    <span
      style={{ backgroundColor: item.backgroundColor, color: item.textColor || "white", ...extraStyles }}
      className={"label label-default noselect " + extraClasses}
    >
      {props.children || item.name}
    </span>
  );
};

export const EditableExpandableLabelDisplay = props => {
  let { item, expanded } = props;
  let extraStyles = props.style || {};
  let extraClasses = props.className || "";

  return (
    <span
      style={{ backgroundColor: item.backgroundColor, color: item.textColor || "white", ...extraStyles }}
      className={"label label-default noselect " + extraClasses}
    >
      {expanded ? (
        <a onClick={props.doRemove} style={{ color: item.textColor || "white", cursor: "pointer" }}>
          <i className="fad fa-chevron-down"></i>
        </a>
      ) : (
        <a onClick={props.doRemove} style={{ color: item.textColor || "white", cursor: "pointer" }}>
          <i className="fad fa-chevron-right"></i>
        </a>
      )}
      <span style={{ marginLeft: 5, paddingLeft: 5, borderLeft: "1px solid white" }}>{props.name}</span>

      {props.children || item.name}
      <a onClick={props.doRemove} style={{ color: item.textColor || "white", cursor: "pointer", marginLeft: "5px" }}>
        <i className="fal fa-pencil-alt"></i>
      </a>
    </span>
  );
};

export const RemovableLabelDisplay = props => {
  let item = props.item;
  let extraStyles = props.style || {};
  let extraClasses = props.className || "";

  return (
    <span
      style={{ backgroundColor: item.backgroundColor, color: item.textColor || "white", ...extraStyles }}
      className={"label label-default noselect " + extraClasses}
    >
      <a onClick={props.doRemove} style={{ color: item.textColor || "white", cursor: "pointer" }}>
        X
      </a>
      <span style={{ marginLeft: 5, paddingLeft: 5, borderLeft: "1px solid white" }}>{props.name}</span>
      {props.children || item.name}
    </span>
  );
};
