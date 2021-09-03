import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { API_BASE_URL, HOME, routes_4 } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import getQueryVariable from "../../../../Services/getQueryVariable";
import { showAlert } from "../../../../Services/showAlert";
import "../style.scss";
import Helmet from "react-helmet";
import IconView from "../../IconsComponent/IconView";
import IconViewHide from "../../IconsComponent/IconViewHide";
import {
  addUserDataToStoreAction,
  changeActiveSidebarAction,
} from "../../../../Store/actions";
import { connect } from "react-redux";
import { validatePassword } from "../../../../Services/validation";

const SetupPasswordComponent = (props) => {
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = getQueryVariable("token");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };
  useEffect(async () => {
    //    @verify token
    try {
      let res = await callApi(`${API_BASE_URL}/account/verify-token`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      if (res.status === 200 && res.data?.name) {
        setName(res.data.name);
      }
    } catch (e) {
      showAlert(e, "error");
      setTimeout(() => {
        history.goBack();
      }, 1000);
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!name.length) return setNameError("Please enter your name");
    else setNameError("");

    if (isPasswordValid && isConfirmPasswordValid) {
      if (password) {
        if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
          if (password && confirmPassword) {
            if (password === confirmPassword) {
              try {
                let forgotPasswordResponse = await callApi(
                  `${API_BASE_URL}/setup-password`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      password: password,
                      token: token,
                      name,
                    }),
                  }
                );
                if (
                  forgotPasswordResponse.status === 200 &&
                  forgotPasswordResponse.data.user &&
                  forgotPasswordResponse.data.user.email
                ) {
                  /**
                   * user login
                   * */
                  try {
                    let loginResponse = await callApi(`${API_BASE_URL}/login`, {
                      method: "POST",
                      body: JSON.stringify({
                        username: forgotPasswordResponse.data.user.email,
                        password,
                      }),
                    });
                    if (loginResponse.status === 200) {
                      props.addUserDataToStore(loginResponse.data);

                      // identified user using segment
                      if (
                        loginResponse &&
                        loginResponse.data &&
                        Object.keys(loginResponse.data).length &&
                        loginResponse.data.user &&
                        Object.keys(loginResponse.data.user).length &&
                        loginResponse.data.user.role &&
                        loginResponse.data.user.role !== "Account Manager"
                      ) {
                        window.analytics.identify(loginResponse.data.user._id, {
                          name: loginResponse.data.user.name,
                          email: loginResponse.data.user.email,
                          username: loginResponse.data.user.username,
                          mobile: loginResponse.data.user.mobile,
                        });
                      }
                      history.push(HOME);
                    }
                  } catch (e) {
                    showAlert(e, "error");
                  }
                }
                showAlert("Password setup completed!");
              } catch (e) {
                showAlert(e, "error");
              }
            } else {
              showAlert("The password and confirmation password do not match");
            }
          } else {
            showAlert("Please fill required fields");
          }
        }
      } else {
        showAlert("Please Enter password");
      }
    }
  };

  return (
    <div className="container-fluid">
      <Helmet>
        <title>{`Setup Password - Wobot.ai`}</title>
      </Helmet>
      <div className="row">
        <div className="col-lg-6 col-12 login-wrapper">
          <div className="wobot-login-wrapper">
            <div className="wobot-login-block">
              <div className="wobot-login-logo">
                <img
                  className="login-logo img-fluid"
                  src={`/assets/images/wobot-logo.png`}
                  alt="logo"
                />
              </div>
              <h4 className="fw-700 mb-5">Setup Password</h4>
              <p className={"mb-4"}>
                You're nearly there. Set your password below to get started.
              </p>
              <div className="login-form">
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    Name
                  </label>
                  <div className="p-relative">
                    <input
                      type={"text"}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      name="name"
                      className="form-control mb-0"
                      placeholder="Enter your name here"
                    />
                  </div>
                  {!nameError.length ? null : (
                    <span className="error-msg">{nameError}</span>
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsPasswordValid(validatePassword(e.target.value));
                      }}
                      minlength="8"
                      maxlength="20"
                      name="password"
                      className="form-control mb-0"
                      placeholder="Create your password"
                    />
                    {isPasswordValid ? null : (
                      <span className="error-msg">
                        Password must contain at least 8 characters, including
                        upper,lowercase and numbers.
                      </span>
                    )}
                    <span className="pwd" onClick={togglePasswordVisiblity}>
                      {passwordShown ? <IconView /> : <IconViewHide />}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    Confirm password
                  </label>
                  <div className="p-relative">
                    <input
                      //type="password"
                      type={confirmPasswordShown ? "text" : "password"}
                      value={confirmPassword}
                      minlength="8"
                      maxlength="20"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setIsConfirmPasswordValid(
                          validatePassword(e.target.value)
                        );
                      }}
                      name="password"
                      className="form-control mb-0"
                      placeholder="Confirm password"
                    />
                    {isConfirmPasswordValid ? null : (
                      <span className="error-msg">
                        Password must contain at least 8 characters, including
                        upper,lowercase and numbers.
                      </span>
                    )}
                    <span
                      className="pwd"
                      onClick={toggleConfirmPasswordVisiblity}
                    >
                      {confirmPasswordShown ? <IconView /> : <IconViewHide />}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-xl mt-3"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="col-lg-6 col-12 align-self-center login-bg login-wrapper"
          style={{
            backgroundImage: `url(${"assets/images/wobot_icon-white.png"})`,
            backgroundRepeat: "space",
            backgroundPosition: "center",
          }}
        >
          <div className="login-block">
            <img
              src={`/assets/images/setup-password.svg`}
              className="big-img img-fluid d-block mx-auto"
              alt="login"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(null, mapDispatchToProps)(SetupPasswordComponent);
