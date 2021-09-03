import React from "react";
import "./style.scss";

const ActionBlock = (props) => {
  return (
    <div className={"action-block"}>
      {props.showActionBtn && (
        <div className={"action-btn"}>{props.children}</div>
      )}
      {props.showActionList && (
        <ul className={"list-inline mb-0"}>{props.children}</ul>
      )}
    </div>
  );
};

export default ActionBlock;
