import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { API_BASE_URL, SUCCESS } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import getQueryVariable from "../../../../Services/getQueryVariable";
import { showAlert } from "../../../../Services/showAlert";
import "../style.scss";
import Helmet from "react-helmet";
import IconView from "../../IconsComponent/IconView";
import IconViewHide from "../../IconsComponent/IconViewHide";
const ChangePasswordComponent = (props) => {
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const id = getQueryVariable("id");

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

  const handleSubmit = async () => {
    if (password) {
      if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
        if (password && confirmPassword) {
          if (password === confirmPassword) {
            try {
              let forgotPasswordResponse = await callApi(
                `${API_BASE_URL}/reset-password`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    password: password,
                    user: id,
                  }),
                }
              );
              if (forgotPasswordResponse.status === 200) {
                history.push(SUCCESS);
              }
              showAlert(forgotPasswordResponse.message);
            } catch (e) {
              showAlert(e, "error");
            }
          } else {
            showAlert("The password and confirmation password do not match");
          }
        } else {
          showAlert("Please fill required fields");
        }
      } else {
        showAlert(
          "password must contain at least 8 characters, including upper,lowercase and numbers.",
          "warning"
        );
      }
    } else {
      showAlert("Please Enter password");
    }
  };

  return (
    <div className="container-fluid">
      <Helmet>
        <title>{`Change Password - Wobot.ai`}</title>
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
              <h4 className="fw-700 mb-5">Update Password</h4>
              <p className={"mb-4"}>
                Your new password must be different from previously used
                password.
              </p>
              <div className="login-form">
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    New password
                  </label>
                  <div className="p-relative">
                    <input
                      type={passwordShown ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      name="password"
                      className="form-control mb-0"
                      placeholder="Create your new password"
                    />
                    <span className="pwd" onClick={togglePasswordVisiblity}>
                      {passwordShown ? <IconView /> : <IconViewHide />}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="inputAddress" className="form-label">
                    Confirm new password
                  </label>
                  <div className="p-relative">
                    <input
                      //type="password"
                      type={confirmPasswordShown ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                      }}
                      name="password"
                      className="form-control mb-0"
                      placeholder="Confirm password"
                    />
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
                  Change password
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
              src={`/assets/images/change-password.svg`}
              className="big-img img-fluid d-block mx-auto"
              alt="login"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordComponent;
