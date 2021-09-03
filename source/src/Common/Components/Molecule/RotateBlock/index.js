import React from "react";
import "./style.scss";

const RotateBlock = (props) => {
  return (
    <div className={"auth-root"}>
      <div className={"box-rotate-fixed"}>
        <div className={"box-strip box-strip-middle"}></div>
        <div className={"box-strip box-strip-top-right"}></div>
        <div className={"box-strip box-strip-bottom-left"}></div>
      </div>

      <div className={"auth-layout container"}>
        <div className={"auth-header"}>
          <div className={"logo-box"}>
            <img
              className="img-fluid logo-img"
              src={`/assets/images/wobot-logo.png`}
              alt="logo"
            />
          </div>
          {props.showAuthHeader && (
            <div className={"content-header"}>
              <h3 className={"auth-header-title"}>{props.authHeadingTitle}</h3>
              <p className={"auth-header-subtitle"}>{props.authSubTitle}</p>
            </div>
          )}
        </div>

        {props.showAuthBox && (
          <div className={"auth-box-wrapper"}>
            <div className={"content-box"}>{props.children}</div>
          </div>
        )}

        {props.showAuthBoxFw && (
          <div className={"auth-box-wrapper wrapper-fw"}>
            <div className={"content-box"}>{props.children}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RotateBlock;
