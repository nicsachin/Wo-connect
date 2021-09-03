import React from "react";
import { connect, useSelector } from "react-redux";
import "./style.scss";

const LoaderComponent = (props) => {
  const isLoaderVisible = useSelector((state) => state.loader.value);
  const loaderLabel = useSelector((state) => state.loader.label);
  return isLoaderVisible === true ? (
    <div
      className="loader-body"
      style={{
        position: "fixed",
        display: "block",
        zIndex: 1060,
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        opacity: "0.9",
        top: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div className="page-loader-wrapper">
        <div className="page-loader center mb-4">
          <span />{" "}
        </div>
        <p className={"loaderLabel"}>{loaderLabel}</p>
      </div>
    </div>
  ) : (
    <></>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(LoaderComponent);
