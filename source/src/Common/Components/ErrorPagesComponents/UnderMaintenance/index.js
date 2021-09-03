import React from "react";
import "./style.scss";

const UnderMaintenance = () => {
  return (
    <div className="container">
      {/* <CenterBlock /> */}
      <div className="row">
        <div className="col-lg-12 justify-content-center">
          <div className="align-items-center">
            <div className="wrapper-block-container">
              <div className={"logo"}>
                <img
                  className="mx-auto d-block img-fluid wobot-text-style"
                  src={`/assets/images/wobot-logo.png`}
                  alt="logo"
                />
              </div>
              <div className={"cherry-img"}>
                <img
                  className="mx-auto d-block img-fluid maintenance-style"
                  src={`/assets/images/MaintenancePage.svg`}
                  alt="logo"
                />
              </div>
              <div className={"block-container"}>
                <div className={"block-heading"}>
                  <h3 className="fs-30 fw-700">
                    Hey there! We are improving your experience!
                  </h3>
                  <p className="fs-18 fw-500 text-secondary">
                    The platform will be ready within no time.
                  </p>
                  <p className="mb-0 fs-14 fw-400 heading-primary">
                    If you need updates regarding the downtime, kindly reach us
                    at
                    <span className="primary-color"> @Wobot_ai </span> on
                    Twitter, for
                    <span className="primary-color"> details </span> and{" "}
                    <span className="primary-color"> support</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderMaintenance;
