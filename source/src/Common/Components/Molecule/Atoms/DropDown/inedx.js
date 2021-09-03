import React from "react";
import "./style.scss";

const DropDown = (props) => {
  return (
    <div ref={props.refStatus} className={props.activeStatus}>
      {props.dropDownContent}
    </div>
  );
};

export default DropDown;
