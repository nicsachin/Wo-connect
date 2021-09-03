import React from "react";
import { IconAdd } from "../../IconsComponent/Index";
import "./style.scss";

const PlaybackDefault = (props) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center">
              <div className="default-img-block">
                <img
                  className="mx-auto d-block img-fluid img-style"
                  src={`/assets/images/live-video.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h4 className=" text-primary">Quickly Add Details</h4>
                <p className="mb-0 fs-14 fw-400 text-primary mt-60">
                  Stay in line with the best practices by viewing pre-recorded
                  videos of events. Quickly schedule tasks for your cameras and
                  view playbacks here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaybackDefault;
