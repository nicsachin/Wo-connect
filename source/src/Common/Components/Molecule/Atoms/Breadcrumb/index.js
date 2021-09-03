import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";
import IconHomeTwo from "../../../IconsComponent/SidebarMain/IconHome";

const Breadcrumb = (props) => {
  return (
    <ul className={"breadcrumb list-inline"}>
      {props.data.map((obj) => {
        return (
          <li className={"list-inline-item"}>
            {/* Breadcrumb-sub-link */}
            <Link to={obj.link} className={"muted-link"}>
              {obj.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default Breadcrumb;
