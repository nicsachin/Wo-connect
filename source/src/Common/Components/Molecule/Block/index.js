import React from "react";
import "./style.scss";

const BlocksComponent = (props) => {
  return <div className={"element-block panel-fh "}>{props.children}</div>;
};

export default BlocksComponent;
