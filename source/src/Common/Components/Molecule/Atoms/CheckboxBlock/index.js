import React from "react";
import "./style.scss";

const CheckboxBlock = (props) => {
  return (
    <div className="checkbox-inline checkbox mt-4 mb-4">
      <label>
        <input
          checked={props.checked}
          type="checkbox"
          data-ng-model="example.check"
          className="check-with-label"
          tabIndex={props.tabIndex}
          id={props.checkboxID}
          onChange={props.onChange}
        />
        <span class="box inline"></span>{" "}
        <span className={"checkbox-label"}>{props.children}</span>
      </label>
    </div>
  );
};

export default CheckboxBlock;
