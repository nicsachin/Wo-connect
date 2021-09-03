import React from "react";
import "./style.scss";
import IconConfirmCircle from "../../IconsComponent/IconConfirmCircle";
const SignUpLeftBlock = () => {
  return (
    <>
      <div className={"col-lg-5 col-12  signup-left-block align-items-center"}>
        <div className={"signup-left-wrapper"}>
          <div className={"logo-singup"}>
            <img
              src={`/assets/images/wobot-logo_white.svg`}
              alt="logo"
              className={"img-fluid"}
            />
          </div>
          <div className={"singup-left-content"}>
            <div className={"singup-content-wrapper"}>
              <h4 className={"singup-content-heading"}>
                Turn your Cameras into an analytics tool
              </h4>
            </div>
            <div className={"middle-img mt-3"}>
              <img
                src={`/assets/images/mockup-signup-large.png`}
                alt="img"
                className={"img-fluid mx-auto d-block"}
              />
            </div>
            <div>
              <ul className={"singup-bullet-list mb-0"}>
                <li>
                  <span className={"signup-list-icon"}>
                    <IconConfirmCircle className={"signup-icon-svg"} />
                  </span>
                  <span className={"signup-list-para"}>
                    Onboard your cameras in less than 10 minutes{" "}
                  </span>
                </li>
                <li>
                  <span className={"signup-list-icon"}>
                    <IconConfirmCircle className={"signup-icon-svg"} />
                  </span>
                  <span className={"signup-list-para"}>
                    Choose from over 100s of tasks to automate for your cameras
                  </span>
                </li>
                <li>
                  <span className={"signup-list-icon"}>
                    <IconConfirmCircle className={"signup-icon-svg"} />
                  </span>
                  <span className={"signup-list-para"}>
                    Know what your cameras are seeing on-the-go
                  </span>
                </li>
                <li>
                  <span className={"signup-list-icon"}>
                    <IconConfirmCircle className={"signup-icon-svg"} />
                  </span>
                  <span className={"signup-list-para"}>
                    Free for lifetime up to 10 cameras
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SignUpLeftBlock;
