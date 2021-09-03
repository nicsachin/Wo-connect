import React from "react";
import "./style.scss";

const StatusTag = (props) => {
  function renderStatusTag(props) {
    if (props.status === "Active") {
      return (
        <>
          <span className={"status-icon green"} />
          Active
        </>
      );
    } else if (props.status === "Inactive") {
      return (
        <>
          <span className={"status-icon red"} />
          Inactive
        </>
      );
    }
  }

  return <div className={"status-tag"}>{renderStatusTag(props)}</div>;
};

export default StatusTag;
