import React from "react";
import { Link } from "react-router-dom";
import { HOME } from "../../../../Constants";
import "./style.scss";

const page500Component = () => {
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
                src={`/assets/images/500ErrorPage.svg`}
                alt="logo"
              />
            </div>
            <div className="contnet-404 mxw-350">
              <h3 className="fs-30 fw-700">Internal Server Error.</h3>
              <p className="fs-18 fw-500 heading-primary mt-60">
                Apologies! Something went wrong.
              </p>
              <p className="mb-0 fs-14 fw-400 text-primary mt-60">
                Stay calm; there may be a minor error in the internal server.
                Try again after some time.
              </p>
              <Link to={HOME} className="btn btn-sm btn-primary mt-4 mb-4">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page500Component;
