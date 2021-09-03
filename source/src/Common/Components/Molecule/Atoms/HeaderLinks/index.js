import React from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import {
  EMPLOYEE,
  REGION,
  SUBREGION,
  LOCATION,
  SCHEDULE,
  SUBSCRIPTION_DETAILS,
  COMPANY_DETAILS,
} from "../../../../../Constants";

const HeaderLinks = (props) => {
  const getClassName = (name) => {
    return window.location.href.indexOf(name) !== -1
      ? "list-inline-item active"
      : "list-inline-item";
  };

  return (
    <div className={"header-Link"}>
      <div className="link-Section">
        <ul className={"list-inline"}>
          <li className={getClassName("/employee")}>
            <Link to={EMPLOYEE}>Users</Link>
          </li>
          <li className={getClassName("/region")}>
            <Link to={REGION}>Regions</Link>
          </li>
          <li className={getClassName("/subregion")}>
            <Link to={SUBREGION}>Cities</Link>
          </li>
          <li className={getClassName("/location")}>
            <Link to={LOCATION}>Locations</Link>
          </li>
          <li className={getClassName("/schedule")}>
            <Link to={SCHEDULE}>Schedules</Link>
          </li>
          <li className={getClassName("/company-details")}>
            <Link to={COMPANY_DETAILS}>Company</Link>
          </li>
          <li className={getClassName("/subscription")}>
            <Link to={SUBSCRIPTION_DETAILS}>Subscriptions</Link>
          </li>
        </ul>
      </div>
      {props.showSubTitle && (
        <p className={"sub-title-Link"}>{props.subTitle}</p>
      )}
    </div>
  );
};

export default HeaderLinks;
