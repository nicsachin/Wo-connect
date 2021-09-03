import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { API_BASE_URL, VERIFY } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import "../SignupComponent/style.scss";
import Helmet from "react-helmet";
import { validateEmail } from "../../../Services/validation";
import RotateBlock from "../Molecule/RotateBlock";
import CenterBlock from "../Molecule/Block/CenterBlock";
const ForgotPasswordComponent = (props) => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const handleSubmit = async () => {
    setIsEmailValid(validateEmail(username));
    if (username) {
      if (username.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        try {
          let forgotPasswordResponse = await callApi(
            `${API_BASE_URL}/forgot-password`,
            {
              method: "POST",
              body: JSON.stringify({
                username,
              }),
            }
          );
          if (forgotPasswordResponse.status === 200) {
            history.push(`${VERIFY}`, {
              user: {
                email: forgotPasswordResponse.data.email,
                id: forgotPasswordResponse.data.id,
              },
            });
          }
          showAlert(forgotPasswordResponse.message);
        } catch (e) {
          showAlert(e, "error");
        }
      } else {
        showAlert("Please enter your email");
      }
    } else {
      showAlert("Please enter your email");
    }
  };

  return (
    <RotateBlock showAuthBoxFw={false} showAuthBox={true}>
      <Helmet>
        <title>{`Login - Wobot.ai `}</title>
      </Helmet>
      <CenterBlock
        showWobotIcon={true}
        showAuthBottomLink={false}
        showAuthBottomNav={true}
      >
        <div className={"auth-content"}>
          <h3 className={"auth-title"}>Forgot Password</h3>
          <p className={"mb-4"}>
            Please enter your e-mail address to receive a verification code
          </p>
          <div className="login-form">
            <div className={"auth-form-block"}>
              <label htmlFor="inputAddress" className="form-label">
                Email address
              </label>
              <input
                type="text"
                tabIndex={1}
                value={username}
                name="username"
                className={`form-control ${isEmailValid ? "error-red" : ""}`}
                placeholder="e.g. john@example.com"
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsEmailValid(validateEmail(e.target.value));
                }}
              />
              {isEmailValid && (
                <span className="error-msg">Please enter a valid email.</span>
              )}
            </div>
            <button
              className="btn btn-block btn-primary btn-xl mt-5"
              tabIndex={2}
              onClick={handleSubmit}
            >
              Send Email
            </button>
            <Link to="/login" className="d-block mt-3">
              Return to Log In
            </Link>
          </div>
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

export default ForgotPasswordComponent;
