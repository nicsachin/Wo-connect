import React, { useCallback, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  API_BASE_URL,
  CHANGEPASSWORD,
  SUCCESS,
  VERIFY,
} from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
import "./style.scss";
import "../style.scss";
import getQueryVariable from "../../../../Services/getQueryVariable";
import Helmet from "react-helmet";
import IconView from "../../IconsComponent/IconView";
import IconViewHide from "../../IconsComponent/IconViewHide";
import { validatePassword } from "../../../../Services/validation";
import RotateBlock from "../../Molecule/RotateBlock";
import CenterBlock from "../../Molecule/Block/CenterBlock";
const VerifyComponent = (props) => {
  const history = useHistory();
  const username = props.user && props.user.email ? props.user.email : null;
  const id = props.user && props.user.id ? props.user.id : null;
  const [digit1, setDigit1] = useState("");
  const [digit2, setDigit2] = useState("");
  const [digit3, setDigit3] = useState("");
  const [digit4, setDigit4] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    if (digit1 && digit2 && digit3 && digit4) {
      try {
        let forgotPasswordResponse = await callApi(
          `${API_BASE_URL}/check-otp`,
          {
            method: "POST",
            body: JSON.stringify({
              otp: `${digit1}${digit2}${digit3}${digit4}`,
              id: id,
            }),
          }
        );
        if (forgotPasswordResponse.status === 200) {
          setOtpVerified(true);
          // history.push(
          //   `${CHANGEPASSWORD}?id=${forgotPasswordResponse.data.id}`
          // );
          // showAlert(forgotPasswordResponse.message);
        }
      } catch (e) {
        showAlert(e, "error");
      }
    } else {
      showAlert("Please enter valid verification code", "error");
    }
  };

  const handleResetCode = async () => {
    if (username) {
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
      showAlert("Something went wrong");
    }
  };

  const handlePasswordChange = async () => {
    if (isPasswordValid && isConfirmPasswordValid) {
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
                      id: id,
                    }),
                  }
                );
                if (forgotPasswordResponse.status === 200) {
                  history.push(SUCCESS, { username: username, password });
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
    } else return;
  };

  const getCodeBoxElement = (index) => {
    return document.getElementById("digit" + index);
  };

  const onKeyUpEvent = (index, event) => {
    const eventCode = event.which || event.keyCode;
    if (getCodeBoxElement(index).value.length === 1) {
      if (index !== 4) {
        getCodeBoxElement(index + 1).focus();
      } else {
        getCodeBoxElement(index).blur();
      }
    }
    if (eventCode === 8 && index !== 1) {
      getCodeBoxElement(index - 1).focus();
    }
  };

  const isInputValueValid = (value) => {
    return value.trim().length === 1;
  };

  const handleOnPaste = (index, e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .trim()
      .slice(0, 4 - (index - 1))
      .split("");
    if (pastedData) {
      let actualindex = index;
      pastedData.map((el) => {
        if (getCodeBoxElement(actualindex)) {
          if (actualindex !== 4) {
            if (actualindex === 1) {
              setDigit1(el);
            }
            if (actualindex === 2) {
              setDigit2(el);
            }
            if (actualindex === 3) {
              setDigit3(el);
            }
            getCodeBoxElement(actualindex + 1).focus();
          } else {
            if (actualindex === 4) {
              setDigit4(el);
            }
            getCodeBoxElement(actualindex).blur();
          }
        }
        actualindex++;
      });
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
          <h3 className={"auth-title mb-3"}>
            {otpVerified ? "Password change" : "Verify your e-mail"}
          </h3>
          <p className=" mb-4">
            {otpVerified
              ? "Your new password must be different from previously used password."
              : `Please enter the 4 digit code sent to your e-mail address ${username}.`}
          </p>
          {otpVerified ? (
            <div className="login-form auth-form-block">
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
                      setIsPasswordValid(validatePassword(e.target.value));
                    }}
                    minlength="8"
                    maxlength="20"
                    name="password"
                    className="form-control mb-0"
                    placeholder="Create your new password"
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
                  Confirm new password
                </label>
                <div className="p-relative">
                  <input
                    //type="password"
                    type={confirmPasswordShown ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setIsConfirmPasswordValid(
                        validatePassword(e.target.value)
                      );
                    }}
                    minlength="8"
                    maxlength="20"
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
                className="btn btn-block btn-primary btn-xl mt-3"
                onClick={handlePasswordChange}
              >
                Change password
              </button>
            </div>
          ) : (
            <div className="login-form verify-code">
              <form className="digit-group">
                <input
                  type="number"
                  id="digit1"
                  name="digit-1"
                  value={digit1}
                  onKeyUp={(event) => onKeyUpEvent(1, event)}
                  onPaste={(event) => handleOnPaste(1, event)}
                  onChange={(e) => {
                    if (isInputValueValid(e.target.value)) {
                      setDigit1(e.target.value);
                    } else {
                      setDigit1(e.target.value.charAt(0));
                    }
                  }}
                />
                <input
                  type="number"
                  id="digit2"
                  name="digit-2"
                  min="0"
                  onKeyUp={(event) => onKeyUpEvent(2, event)}
                  onPaste={(event) => handleOnPaste(2, event)}
                  max="9"
                  value={digit2}
                  onChange={(e) => {
                    if (isInputValueValid(e.target.value)) {
                      setDigit2(e.target.value);
                    } else {
                      setDigit2(e.target.value.charAt(0));
                    }
                  }}
                />
                <input
                  type="number"
                  id="digit3"
                  name="digit-3"
                  onKeyUp={(event) => onKeyUpEvent(3, event)}
                  onPaste={(event) => handleOnPaste(3, event)}
                  value={digit3}
                  onChange={(e) => {
                    if (isInputValueValid(e.target.value)) {
                      setDigit3(e.target.value);
                    } else {
                      setDigit3(e.target.value.charAt(0));
                    }
                  }}
                />
                <input
                  type="number"
                  id="digit4"
                  name="digit-4"
                  onKeyUp={(event) => onKeyUpEvent(4, event)}
                  onPaste={(event) => handleOnPaste(4, event)}
                  value={digit4}
                  onChange={(e) => {
                    if (isInputValueValid(e.target.value)) {
                      setDigit4(e.target.value);
                    } else {
                      setDigit4(e.target.value.charAt(0));
                    }
                  }}
                />
              </form>
              <Link to="#" onClick={handleResetCode}>
                Resend code
              </Link>

              <button
                className="btn btn-block btn-primary btn-xl mt-3"
                onClick={handleSubmit}
              >
                Verify Code
              </button>
            </div>
          )}
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

export default VerifyComponent;
