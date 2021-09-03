import React from "react";
import "./style.scss";

const Tag = (props) => {
  return (
    <div
      className={`tag-md tag-block ${props.className ? props.className : ""}`}
    >
      {props.children}
    </div>
  );
};

export default Tag;
