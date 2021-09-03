import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { IconWobot } from "../../../IconsComponent/Index";
import "./style.scss";

const CenterBlock = (props) => {
  const isActive = (pathname) => window.location.pathname === pathname;

  return (
    <div className={"auth-login-layout auth-login"}>
      <div className={"content-header"}>
        <h3 className={"auth-header-title"}>{props.authHeadingTitle}</h3>
        <p className={"auth-header-subtitle"}>{props.authSubTitle}</p>
      </div>
      <div className={"auth-card"}>
        <div className={"auth-card-padding auth-card-center "}>
          {props.showWobotIcon && (
            <div className={"auth-logo-box"}>
              <IconWobot />
            </div>
          )}
          {props.children}
        </div>
      </div>
      {props.showBottomPagination && (
        <div className={"card-pagination"}>
          <ul className={"list-inline"}>
            {/* <Link
              to={
                props.userData &&
                props.userData.manifest &&
                props.userData.manifest.regions.length > 0
                  ? "#"
                  : "/add-location"
              }
            > */}
            <li
              className={
                isActive("/add-location")
                  ? "list-inline-item active"
                  : "list-inline-item"
              }
            >
              <span>1</span>
            </li>
            {/* </Link> */}

            {/* <Link
              to={
                props.userData &&
                props.userData.manifest &&
                props.userData.manifest.regions.length > 0
                  ? props.userData &&
                    props.userData.manifest &&
                    (props.userData.manifest.camera.length > 0 ||
                      props.userData.manifest.dvrs.length > 0)
                    ? "#"
                    : "/connect-camera"
                  : "/add-location"
              }
            > */}
            {/* <Link to={"/connect-camera"}> */}
            <li
              className={
                isActive("/connect-camera")
                  ? "list-inline-item active"
                  : "list-inline-item"
              }
            >
              <span>1</span>
            </li>
            {/* </Link> */}
            {/* <Link
              to={
                props.userData &&
                props.userData.manifest &&
                props.userData.manifest.regions.length > 0
                  ? props.userData &&
                    props.userData.manifest &&
                    props.userData.manifest.employees.length > 0
                    ? "#"
                    : "/add-team"
                  : "/add-location"
              }
            > */}
            <li
              className={
                isActive("/add-team")
                  ? "list-inline-item active"
                  : "list-inline-item"
              }
            >
              <span>1</span>
            </li>
            {/* </Link> */}
          </ul>
        </div>
      )}
      <div className={"auth-bottom-content "}>
        {props.showAuthBottomLink && (
          <div className={"auth-bottom-link"}>
            <p className={"mb-0"}>
              <span className={"fs-14 fw-500"}>{props.authBottomText}</span>
              <Link className={"link"} to={props.authBottomLink}>
                {props.authBottomLinkText}
              </Link>
            </p>
          </div>
        )}
        {props.showAuthBottomNav && (
          <div className={"auth-bottom-nav"}>
            <ul className={"list-inline"}>
              <li className={"list-inline-item"}>
                <a href="https://wobot.ai/terms-of-service/" target="_blank">
                  Terms of use
                </a>
              </li>
              <li className={"list-inline-item"}>
                <a href="https://wobot.ai/privacy-policy/" target="_blank">
                  Privacy policy
                </a>{" "}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(CenterBlock);
