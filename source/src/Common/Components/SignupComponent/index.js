import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { ADDCOMPANY, API_BASE_URL, HOME } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { IconView, IconViewHide } from "../IconsComponent/Index";
import { IconSignUpMoniter } from "../IconsComponent/Index";
import SignUpLeftBlock from "./SignUpLeftBlock/SignUpLeftBlock";
import Helmet from "react-helmet";
import { validateEmail, validatePassword } from "../../../Services/validation";
import RotateBlock from "../Molecule/RotateBlock";
import CenterBlock from "../Molecule/Block/CenterBlock";
import "./style.scss";
import { SetLocalStorageKey } from "../../../Services/localStorageService";
import getQueryVariable from "../../../Services/getQueryVariable";

const SignupComponent = () => {
  const history = useHistory();
  const recaptchaRef = React.createRef();

  const test = getQueryVariable("test");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [agree, setAgree] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const signUpHandler = (event) => {
    event.preventDefault();
    setIsPasswordValid(validatePassword(password));
    setIsEmailValid(validateEmail(username));
    if (username && password) {
      if (username.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        if (passwordStatus) {
          if (agree) {
            try {
              recaptchaRef.current
                .execute()
                .then((res) => {
                  if (res) {
                    callApi(`${API_BASE_URL}/account/check`, {
                      method: "POST",
                      body: JSON.stringify({
                        email: username,
                      }),
                    })
                      .then((checkEmailresponse) => {
                        if (checkEmailresponse.status === 200) {
                          if (username) {
                            window.analytics.track(
                              `verified email successfully | Onboarding`,
                              {
                                title: `verified email successfully | Onboarding`,
                                email: username,
                              }
                            );
                          }
                          SetLocalStorageKey("username", username);
                          SetLocalStorageKey("password", password);
                          if (test === "true") {
                            history.push(`${ADDCOMPANY}?test=${test}`);
                          } else {
                            history.push(ADDCOMPANY);
                          }

                          // history.push({
                          //   pathname: ADDCOMPANY,
                          //   credentials: {
                          //     username,
                          //     password,
                          //   },
                          // });
                        } else {
                          showAlert(checkEmailresponse.message, "error");
                        }
                      })
                      .catch((e) => {
                        showAlert(e, "error");
                      });
                  } else {
                    showAlert(
                      "Please verify that you are not a robot",
                      "error"
                    );
                  }
                })
                .catch((e) => {
                  showAlert(e, "error");
                });
            } catch (e) {
              showAlert(e, "error");
            }
          } else {
            showAlert(
              "Please indicate that you have read and agree to the Terms of services and Privacy Policy",
              "error"
            );
          }
        } else {
          showAlert(
            "password must contain at least 8 characters, including upper,lowercase and numbers.",
            "warning"
          );
        }
      } else {
        showAlert("Please add valid email address");
      }
    } else {
      showAlert("Please fill all details");
    }
  };

  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div className={"container-fluid signup-container p-0"}>
      <Helmet>
        <title>{`Signup | Wobot.ai`}</title>
        <meta name="description" content="Signup to Wobot account" />
      </Helmet>
      <div className={"row signup-row"}>
        <SignUpLeftBlock />
        <div
          className={"col-lg-7 col-12 signup-right-block align-items-center"}
        >
          <CenterBlock
            showAuthBottomLink={true}
            showAuthBottomNav={false}
            authBottomText="Already a member?"
            authBottomLink={"/login"}
            authBottomLinkText="Sign In"
            showWobotIcon={true}
            showAuthBoxWrapFw={false}
            showAuthBoxWrap={true}
          >
            <div className={"auth-content p-0"}>
              <h3 className={"auth-title mt-4"}>Create Your Account</h3>
              <form className="auth-form-block" onSubmit={signUpHandler}>
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    Work email
                  </label>
                  <input
                    type="text"
                    value={username}
                    name="username"
                    minlength="2"
                    tabIndex={1}
                    className={`form-control ${
                      isEmailValid ? "error-red" : ""
                    }`}
                    placeholder="e.g. john@example.com"
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setIsEmailValid(validateEmail(e.target.value));
                    }}
                  />
                  {isEmailValid && (
                    <span className="error-msg">Email is not valid</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    Password
                  </label>
                  <div className="p-relative">
                    <input
                      type={passwordShown ? "text" : "password"}
                      value={password}
                      tabIndex={2}
                      minlength="8"
                      maxlength="20"
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setIsPasswordValid(
                          validatePassword(event.target.value)
                        );
                        event.target.value.match(
                          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/
                        )
                          ? setPasswordStatus(true)
                          : setPasswordStatus(false);
                      }}
                      name="password"
                      className={`form-control mb-0 ${
                        isPasswordValid ? "" : "error-red"
                      }`}
                      placeholder="e.g. ••••••••"
                    />
                    <span className="pwd" onClick={togglePasswordVisiblity}>
                      {passwordShown ? <IconView /> : <IconViewHide />}
                    </span>
                  </div>
                  {isPasswordValid ? null : (
                    <span className="error-msg">
                      Password must contain at least 8 characters, including
                      upper,lowercase and numbers.
                    </span>
                  )}
                </div>

                <div className="checkbox-inline checkbox mt-4 mb-4">
                  <label>
                    <input
                      type="checkbox"
                      data-ng-model="example.check"
                      className="check-with-label"
                      tabIndex={3}
                      value=""
                      id="flexCheckDefault"
                      onChange={() => {
                        setAgree(!agree);
                      }}
                    />
                    <span class="box inline"></span>{" "}
                    <span>
                      I agree to&nbsp;
                      <a
                        href="https://wobot.ai/terms-of-service/"
                        target="_blank"
                      >
                        Terms of Service
                      </a>
                      &nbsp;and&nbsp;
                      <a
                        href="https://wobot.ai/privacy-policy/"
                        target="_blank"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                </div>
                <button
                  className="btn btn-block btn-primary btn-xl mt-3"
                  tabIndex={4}
                  type={"submit"}
                  onClick={() => {
                    if (username) {
                      window.analytics.track(
                        `Clicked on created an account | Onboarding`,
                        {
                          title: `Clicked on created an account | Onboarding`,
                          user: username,
                        }
                      );
                    }
                  }}
                >
                  Create Account
                </button>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  size="invisible"
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                />
              </form>
            </div>
          </CenterBlock>
        </div>
      </div>
    </div>
  );
};

export default SignupComponent;
