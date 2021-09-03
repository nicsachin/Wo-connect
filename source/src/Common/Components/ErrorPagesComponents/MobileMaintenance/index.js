import React from "react";
import "./style.scss";
import { IconAppStore, IconPlayStore } from "../../IconsComponent/Index";

const MobileMaintenanceComponent = () => {
  return (
    <div className={"mobile-page"}>
      <div className="container">
        {/* <CenterBlock /> */}
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center">
              <div className="wobot">
                <img
                  className="mx-auto d-block img-fluid wobot-text-style"
                  src={`/assets/images/wobot-logo_icon-blue.svg`}
                  alt="logo"
                />
                <img
                  className="mx-auto d-block"
                  src={`/assets/images/conent.svg`}
                  alt="logo"
                />
                <img
                  className="mx-auto d-block"
                  src={`/assets/images/fade1.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h3 className="fs-30 text-secondary">Err!</h3>
                <p className="mb-0 fs-14 fw-400 text-primary mt-60">
                  We are currently unavailable on the mobile browser. Please
                  switch to the desktop site and stream live events seamlessly.
                </p>
                {/* <div className="app-icons">
                  <div className={"app-icon-block mr-2"}>
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      className="store-icon"
                    >
                      <IconAppStore />
                    </a>
                  </div>
                  <div className={"app-icon-block ml-2"}>
                    <a
                      href="https://www.apple.com/app-store/"
                      target="_blank"
                      className="store-icon"
                    >
                      <IconPlayStore />
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMaintenanceComponent;
