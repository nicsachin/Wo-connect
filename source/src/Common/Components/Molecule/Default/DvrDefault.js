import React from "react";
import { IconAdd } from "../../IconsComponent/Index";
import "./style.scss";

const DvrDefault = (props) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center">
              <div className="default-img-block">
                <img
                  className="mx-auto d-block img-fluid img-style"
                  src={`/assets/images/dvrCross.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h4 className="text-primary">No Details found</h4>
                <p className="mb-0 fs-14 fw-400 text-primary mt-60">
                  No details were found. Once you add a NVR, all the information
                  will appear here.
                </p>
                <button
                  className="btn btn-primary btn-sm btn-text-icon mt-3"
                  onClick={() => {
                    props.setShow(true);
                  }}
                >
                  <span className={"icon-sm"}>
                    <IconAdd /> Add DVR/NVR
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DvrDefault;
