import React, { useEffect, useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import "../CompanyDetailsComponent/style.scss";
import axios from "axios";
import { API_BASE_URL } from "../../../Constants";
import { getHeaders } from "../../../Services/getHeaders";
import { showAlert } from "../../../Services/showAlert";
import callApi from "../../../Services/callApi";
import { connect, useSelector } from "react-redux";
import { toggleLoaderAction } from "../../../Store/actions";
import { validatePassword } from "../../../Services/validation";
import { Button, Modal } from "react-bootstrap";
import IconView from "../../../Common/Components/IconsComponent/IconView";
import IconViewHide from "../../../Common/Components/IconsComponent/IconViewHide";
import { store } from "../../../Store";
import updateManifest from "../../../Services/updateManifest";
import {
  validateEmail,
  validateEmpty,
  validateMobile,
} from "../../../Services/validation";
import { profileError } from "../../Resources";
import { segmentTrack } from "../../../Services/segment";
import { Settings } from "../../../Services/segmentEventDetails";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import BlocksComponent from "../../../Common/Components/Molecule/Block";
import ManifestService from "../../../Services/ManifestService";
import getTokenFromHubSpot from "../../../Services/getTokenFromHubSpot";

let defaultErrorLabels = {
  name: "",
  email: "",
  mobile: "",
  currPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const EmployeeProfileComponent = (props) => {
  const [updatePasswordShow, setUpdatePasswordShow] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [error, setError] = useState(defaultErrorLabels);
  const [mobile, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [password, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { user } = useSelector((state) => state.userData);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  useEffect(() => {
    if (user && user.displayImage) {
      setImage(user.displayImage);
    }
    if (user && user.mobile) {
      setPhoneNumber(user.mobile);
    }
    if (user && user.email) {
      setEmail(user.email);
    }
    if (user && user.name) {
      setName(user.name);
    }
  }, []);

  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const [newPasswordShown, setNewPasswordShown] = useState(false);
  const toggleNewPasswordVisiblity = () => {
    setNewPasswordShown(!newPasswordShown);
  };

  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };
  const { userData } = props;

  const handleFileUpload = async (data) => {
    const formData = new FormData();
    formData.append("file", data.target.files[0]);
    props.toggleLoaderAction(true);
    try {
      axios({
        method: "PUT",
        url: `${API_BASE_URL}/display-image/update`,
        data: formData,
        headers: {
          ...getHeaders(),
          "content-type": "multipart/form-data",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            setImage(
              res && res.data && res.data.data && res.data.data.displayImage
            );
            showAlert("Profile image has been updated", "info");
          }
        })
        .catch((e) => {
          if (e.response && e.response.data && e.response.data.message) {
            showAlert(e.response.data.message, "error");
          } else {
            showAlert(e, "error");
          }
        })
        .finally((e) =>
          setTimeout(() => {
            props.toggleLoaderAction(false);
          }, 800)
        );
    } catch (e) {
      showAlert(e, "error");
      props.toggleLoaderAction(false);
    }
  };
  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      name: name,
      email: email,
      mobile: mobile,
      currPassword: password,
      newPassword: newPassword,
      confirmNewPassword,
      //  role: selectedRole,
    };
    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: profileError[key] };
        validationSuccess = false;
      }
    }
    // if (name === "") {
    //   errorInForm = { ...errorInForm, name: profileError.name };
    //   validationSuccess = false;
    // }
    if (password && !validatePassword(password)) {
      errorInForm = { ...errorInForm, currPassword: profileError.currPassword };
      validationSuccess = false;
    }
    if (newPassword && !validatePassword(newPassword)) {
      errorInForm = { ...errorInForm, newPassword: profileError.newPassword };
      validationSuccess = false;
    }
    if (confirmNewPassword && !validatePassword(confirmNewPassword)) {
      errorInForm = {
        ...errorInForm,
        confirmNewPassword: profileError.confirmNewPassword,
      };
      validationSuccess = false;
    }

    setError(errorInForm);
    return validationSuccess;
  };
  const updateEmployee = async () => {
    segmentTrack({ title: Settings.employeeProfile.updateChangesClick });
    if (handleValidation) {
      if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) && !name == "") {
        if (!validateEmpty(mobile) || !validateMobile(mobile)) {
          // setIsNameValid(validateEmpty(name));
          // setIsEmailValid(validateEmpty(email));
          props.toggleLoaderAction(true);
          try {
            const employeeDetailUpdateResponse = await callApi(
              `${API_BASE_URL}/account/update`,
              {
                method: "PUT",
                body: JSON.stringify({
                  name,
                  email,
                  mobile,
                }),
              }
            );
            if (
              employeeDetailUpdateResponse &&
              employeeDetailUpdateResponse.status === 200
            ) {
              if (store.getState().userData)
                updateManifest().then((d) => {
                  // if (
                  //   process.env.REACT_APP_ENVIRONMENT === "app" &&
                  //   ManifestService.userIsAdmin()
                  // ) {
                  if (process.env.REACT_APP_ENVIRONMENT === "app") {
                    getTokenFromHubSpot();
                  }

                  if (
                    props &&
                    props.userData &&
                    props.userData.user &&
                    props.userData.user.email &&
                    props.userData.user._id &&
                    props.userData.user.role &&
                    props.userData.user.role !== "Account Manager" &&
                    props.userData.manifest &&
                    props.userData.manifest.company &&
                    props.userData.manifest.company.name &&
                    props.userData.manifest._id
                  ) {
                    window.analytics.group(props.userData.user._id, {
                      name: name,
                      email: email,
                      username: props.userData.user.username,
                      mobile: mobile,
                      role: props.userData.user.role,
                    });
                    window.analytics.identify(props.userData.user._id, {
                      companyName: props.userData.manifest.company.name,
                      name: name,
                      email: email,
                      username: props.userData.user.username,
                      mobile: mobile,
                      company_id: props.userData.manifest._id,
                    });
                    window.analytics.track(
                      `Updated User profile details successfully | Settings`,
                      {
                        title: `Updated User profile details successfully | Settings`,
                        email: email,
                        username: props.userData.user.username,
                        companyName: props.userData.manifest.company.name,
                        user_id: props.userData.user._id,
                        company_id: props.userData.manifest._id,
                      }
                    );
                  }
                  showAlert("Profile has been updated", "info");
                });
            }
          } catch (e) {
            console.log(e);
          }
          setTimeout(() => {
            props.toggleLoaderAction(false);
          }, 800);
          setError({ ...error, mobile: "" });
        } else {
          setError({
            ...error,
            mobile: profileError.mobile,
          });
        }
      } else return 0;
    } else return 0;
  };

  const updatePassword = async () => {
    if (!handleValidation()) return;
    if (password && newPassword && confirmNewPassword) {
      // if (!isConfirmPasswordValid && !isNewPasswordValid) {
      if (confirmNewPassword !== newPassword)
        return showAlert("Confirm password and new password doesn't match");
      try {
        const res = await callApi(`${API_BASE_URL}/password/update`, {
          method: "POST",
          body: JSON.stringify({
            password,
            newPassword,
          }),
        });
        if (res && res.status === 200) {
          closeTo();
          showAlert("Your password has been updated");
        }
      } catch (e) {
        showAlert("Current password is incorrect.", "error");
      }
      // } else {
      //   showAlert(
      //     "password must contain at least 8 characters, including upper,lowercase and numbers.",
      //     "warning"
      //   );
      // }
    }
    // } else {
    //   showAlert("Please fill all details", "error");
    // }
  };

  const closeTo = () => {
    setUpdatePasswordShow(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsNewPasswordValid(false);
    setIsConfirmPasswordValid(false);
    setPasswordShown(false);
    setNewPasswordShown(false);
    setConfirmPasswordShown(false);
    setError(defaultErrorLabels);
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        {/* <PageTitle
          pageTitle={"User Profile"}
          breadcrumb={[
            { name: "User-Profile"}
          ]}
          showSubTitle={true}
          subTitle={"Here you can edit your personal profile settings."}
        /> */}
        <div className={"row"}>
          <div className={"col-lg-6"}>
            <BlocksComponent>
              <div className={"content-wrapper mt-4 mb-4"}>
                <small>Profile Picture Recommended: 150x150 px</small>
                <div className="profile-block d-flex align-items-center">
                  <div className="wrapper text-center">
                    <div className="img-block mt-3">
                      <img
                        className="img-fluid mx-auto"
                        src={`${
                          image ? image : "/assets/images/user-profile.png"
                        }`}
                        alt="user-profile"
                      />
                      <div className="import-block hover">
                        <label for="myFile"> Upload</label>
                        <input
                          id="myFile"
                          type="file"
                          name="filename"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="content-block">
                    <p className="title mb-0">
                      {" "}
                      {props &&
                      props.userData &&
                      props.userData.user &&
                      props.userData.user.name
                        ? props.userData.user.name
                        : "user"}
                    </p>
                  </div>
                </div>
                <form
                  className={"form-wrapper mt-4 row"}
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateEmployee();
                  }}
                >
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Full name
                      </label>
                      <input
                        type="text"
                        name="username"
                        className={`form-control ${
                          isNameValid ? "error-red" : ""
                        }`}
                        placeholder="e.g. Alpha Inc"
                        value={name}
                        onChange={(value) => {
                          setName(value.target.value);

                          if (value.target.value == "") {
                            setError({ ...error, name: profileError.name });
                          } else {
                            setError({ ...error, name: "" });
                            // setIsFormError(false);
                            // } else {
                            // setIsFormError(true);
                          }
                        }}
                      />
                      {error.name ? (
                        <span className="error-msg">{error.name}</span>
                      ) : null}

                      {/* {isNameValid && (
                        <span className="error-msg">Please enter a username.</span>
                      )} */}
                    </div>
                  </div>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="username"
                        className={`form-control ${
                          isEmailValid ? "error-red" : ""
                        }`}
                        value={email}
                        // disabled={true}
                        placeholder="e.g. email@email.com"
                        onChange={(value) => {
                          setEmail(value.target.value);
                          if (
                            validateEmail(value.target.value) ||
                            validateEmpty(value.target.value)
                          ) {
                            setError({
                              ...error,
                              email: profileError.invalidEmail,
                            });
                          } else {
                            setError({ ...error, email: "" });
                            //   setIsFormError(false);
                            // } else {
                            //   setIsFormError(true);
                          }
                        }}
                      />
                      {error.email ? (
                        <span className="error-msg">{error.email}</span>
                      ) : null}
                      {/* {isEmailValid && (
                        <span className="error-msg" id="error-Mvalidate">
                          Email Is Not Valid
                        </span>
                      )} */}
                    </div>
                  </div>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Phone Number
                      </label>
                      <PhoneInput
                        placeholder="Enter phone number"
                        className="form-control"
                        // defaultCountry="IN"
                        value={mobile}
                        onChange={(value) => {
                          setPhoneNumber(value);
                          if (
                            // value != "+91" &&
                            // value != undefined &&
                            validateMobile(value)
                          ) {
                            // if (!validateEmpty(num) && validateMobile(num)) {
                            setError({
                              ...error,
                              mobile: profileError.mobile,
                            });
                          } else {
                            setError({ ...error, mobile: "" });
                          }
                        }}
                      />
                      {error.mobile ? (
                        <span className="error-msg">{error.mobile}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={"col-lg-12 mt-3"}>
                    <div className="d-flex align-items-center">
                      <button
                        type={"submit"}
                        className="btn btn-primary btn-md"
                        // onClick={() => {
                        //   updateEmployee();
                        // }}
                      >
                        Update Profile
                      </button>
                      <button
                        href="#"
                        className="btn link"
                        onClick={(event) => {
                          event.preventDefault();
                          setUpdatePasswordShow(true);
                        }}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </BlocksComponent>
            <div className="form-group">
              <Modal
                size="md"
                show={updatePasswordShow}
                onHide={() => closeTo()}
                aria-labelledby="region-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="region-modal">
                    <h4>Update Password</h4>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="region-body">
                    <div className="roi-labels mb-4">
                      <div className="form-group">
                        <label
                          htmlFor="inputEmail3"
                          className=" col-form-label"
                        >
                          Current password
                        </label>
                        <div className="p-relative">
                          <input
                            type={passwordShown ? "text" : "password"}
                            className="form-control"
                            placeholder="Current password"
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              if (
                                !validatePassword(e.target.value) ||
                                validateEmpty(e.target.value)
                              ) {
                                setError({
                                  ...error,
                                  currPassword: profileError.currPassword,
                                });
                              } else {
                                setError({
                                  ...error,
                                  currPassword: "",
                                });
                              }
                            }}
                          />
                          <span
                            className="pwd"
                            onClick={togglePasswordVisiblity}
                          >
                            {passwordShown ? <IconView /> : <IconViewHide />}
                          </span>
                        </div>
                        {error.currPassword ? (
                          <span className="error-msg">
                            {error.currPassword}
                          </span>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="inputEmail3"
                          className=" col-form-label"
                        >
                          New password
                        </label>
                        <div className="p-relative">
                          <input
                            type={newPasswordShown ? "text" : "password"}
                            placeholder="New password"
                            onChange={(event) => {
                              setNewPassword(event.target.value);
                              // setIsNewPasswordValid(
                              //   validatePassword(event.target.value)
                              // );
                              if (
                                !validatePassword(event.target.value) ||
                                validateEmpty(event.target.value)
                              ) {
                                setError({
                                  ...error,
                                  newPassword: profileError.newPassword,
                                });
                              } else {
                                setError({
                                  ...error,
                                  newPassword: "",
                                });
                              }
                            }}
                            name="password"
                            // className={`form-control mb-0 ${
                            //   isNewPasswordValid ? "" : "error-red"
                            // }`}
                            className="form-control"
                          />
                          <span
                            className="pwd"
                            onClick={toggleNewPasswordVisiblity}
                          >
                            {newPasswordShown ? <IconView /> : <IconViewHide />}
                          </span>
                        </div>
                        {/* {isNewPasswordValid ? null : (
                        <span className="error-msg">
                          Password must contain at least 8 characters, including
                          upper,lowercase and numbers.
                        </span>
                      )} */}
                        {error.newPassword ? (
                          <span className="error-msg">{error.newPassword}</span>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="inputEmail3"
                          className=" col-form-label"
                        >
                          Confirm new password
                        </label>
                        <div className="p-relative">
                          <input
                            type={confirmPasswordShown ? "text" : "password"}
                            placeholder="Confirm new password"
                            onChange={(event) => {
                              setConfirmNewPassword(event.target.value);
                              // setIsConfirmPasswordValid(
                              //   validatePassword(event.target.value)
                              // );
                              if (
                                !validatePassword(event.target.value) ||
                                validateEmpty(event.target.value)
                              ) {
                                setError({
                                  ...error,
                                  confirmNewPassword:
                                    profileError.confirmNewPassword,
                                });
                              } else {
                                setError({
                                  ...error,
                                  confirmNewPassword: "",
                                });
                              }
                            }}
                            name="password"
                            // className={`form-control mb-0 ${
                            //   isConfirmPasswordValid ? "" : "error-red"
                            // }`}
                            className="form-control"
                          />
                          <span
                            className="pwd"
                            onClick={toggleConfirmPasswordVisiblity}
                          >
                            {confirmPasswordShown ? (
                              <IconView />
                            ) : (
                              <IconViewHide />
                            )}
                          </span>
                          {error.confirmNewPassword ? (
                            <span className="error-msg">
                              {error.confirmNewPassword}
                            </span>
                          ) : null}
                        </div>
                        {/* {isConfirmPasswordValid ? null : (
                        <span className="error-msg">
                          Password must contain at least 8 characters, including
                          upper,lowercase and numbers.
                        </span>
                      )} */}
                      </div>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button className="btn btn-tertiary btn-sm" onClick={closeTo}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    variant="primary"
                    onClick={() => updatePassword()}
                  >
                    Update password
                  </button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleLoaderAction: (data) => {
      dispatch(toggleLoaderAction(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmployeeProfileComponent);
