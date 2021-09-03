import React from "react";
import { Link } from "react-router-dom";
import { HOME } from "../../../../Constants";
import "./style.scss";

const page404Component = () => {
  return (
    <div className="container">
      {/* <CenterBlock /> */}
      <div className="row">
        <div className="col-lg-12 align-items-center">
          <div className="justify-content-center">
            <div className="logo">
              <img
                className="mx-auto d-block img-fluid wobot-text-style"
                src={`/assets/images/wobot-logo.png`}
                alt="logo"
              />
            </div>
            <div className={"cherry-img"}>
              <img
                className="mx-auto d-block img-fluid img-style"
                src={`/assets/images/404ErrorPage.svg`}
                alt="logo"
              />
            </div>
            <div className="contnet-404 mxw-350">
              <h3 className="fs-40 fw-700">Opps!</h3>
              <p className="fs-18 fw-500 heading-primary mt-60">
                The page you're looking does not exist
              </p>
              <p className="mb-0 fs-14 fw-400 heading-primary mt-60">
                Don't panic! Click on the button below and go back to the home
                screen
              </p>
              <Link to={HOME} className="btn btn-sm btn-primary mt-4 mb-4">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page404Component;
