import React from "react";
import "./style.scss";
import { Dropdown } from "react-bootstrap";
const Dropbutton = (props) => {
  return (
    <Dropdown className={"btn"}>
      <Dropdown.Toggle
        variant="default p-0"
        id="dropdown-basic"
        className={"drop-btn"}
      >
        {props.dropMenuItem}
      </Dropdown.Toggle>
      <Dropdown.Menu>{props.children}</Dropdown.Menu>
    </Dropdown>
  );
};

export default Dropbutton;
