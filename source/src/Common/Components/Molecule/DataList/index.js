import React from "react";
import "./style.scss";

const DataList = (props) => {
  return (
    <tr>
      <th className={"data-title"}>{props.dataLabel}</th>
      <th className={"data-string"}>{props.dataString}</th>
    </tr>
  );
};

export default DataList;
