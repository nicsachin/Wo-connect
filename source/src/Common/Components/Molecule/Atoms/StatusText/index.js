import React from "react";
import "./style.scss";

const StatusText = (props) => {
  return (
    <div className={"status-text"}>
      {props.status === "Active" ? (
        <>
          <span className={"status-text-icon green"} />
          Active
        </>
      ) : (
        <>
          <span className={"status-text-icon red"} />
          Inactive
        </>
      )}
    </div>
  );
};

export default StatusText;
