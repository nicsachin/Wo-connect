import React from "react";
import { getIcon } from "../IconsComponent/SidebarMain/Index";
import { IconArrowNextRight } from "../IconsComponent/Index";
import { Link } from "react-router-dom";
import "./style.scss";
const CardComponent = (props) => {
  return (
    <div className="col-xl-4 col-lg-6 col-md-6">
      <Link to={props.obj.link}>
        <div className={`card-block ${props.obj.customHoverClass}`}>
          <div className="title-block">
            <div className={`icon-block ${props.obj.customClass}`}>
              {getIcon(props.obj.icon)}
            </div>
            <div className="content-block">
              <h5 className="mb-1">{props.obj.title}</h5>
              <p className="mb-0">{props.obj.details}</p>
            </div>
          </div>
          <p>{props.obj.caption}</p>
          <div className={`bottom-block ${props.obj.customBottomClass}`}>
            <span>{props.obj.counter}</span>
            <Link to={props.obj.link} onClick={props.handleShow}>
              {props.obj.action} <IconArrowNextRight />
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CardComponent;
