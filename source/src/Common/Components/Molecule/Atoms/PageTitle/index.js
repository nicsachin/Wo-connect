import React from "react";
import Breadcrumb from "../Breadcrumb";
import "./style.scss";

const PageTitle = (props) => {
  return (
    <div className={"header-section"}>
      <div className={"flex-wrapper"}>
        <div className={"header-block"}>
          <Breadcrumb data={props.breadcrumb} />
          {/* Page Title */}
          <div className={"header-title"}>
            {/* <span className={"rtsp-cursor mr-2"} onClick={()=>{history.goBack()}}><IconArrowLeft/></span> */}
            <h4 className={"header-primary"}>{props.pageTitle} </h4>
            {props.titleMeta}
          </div>
          {props.showSubTitle && (
            <p className={"sub-title"}>{props.subTitle}</p>
          )}
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default PageTitle;
