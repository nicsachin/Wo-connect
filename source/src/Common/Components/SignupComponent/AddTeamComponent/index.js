import React, { useEffect, useState } from "react";
import "react-phone-number-input/style.css";
import { showAlert } from "../../../../Services/showAlert";
//import getQueryVariable from "../../../../Services/getQueryVariable";
import { connect } from "react-redux";
import IconClose from "../../IconsComponent/IconClose";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL, CHECKLIST, HOME } from "../../../../Constants";
import { Link, useHistory } from "react-router-dom";
import "./style.scss";
import Helmet from "react-helmet";
import CenterBlock from "../../Molecule/Block/CenterBlock";
import RotateBlock from "../../Molecule/RotateBlock";
import IconArrowNextRight from "../../IconsComponent/IconArrowNextRight";
import { validateEmail } from "../../../../Services/validation";
import IconArrowBack from "../../IconsComponent/IconArrowBackLeft";
import { store } from "../../../../Store";
import updateManifest from "../../../../Services/updateManifest";
import handleOnboardingTrackAPICall from "../handleOnboardingTrackAPICall";

const AddTeamComponent = (props) => {
  const history = useHistory();
  let companyId = "";
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [email3, setEmail3] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmail2Valid, setIsEmail2Valid] = useState(false);
  const [isEmail3Valid, setIsEmail3Valid] = useState(false);
  const [emailArray, setEmailArray] = useState([]);

  useEffect(() => {
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest._id
    ) {
      companyId = props.userData.manifest._id;
    }
  }, []);

  const continueHandler = async (event) => {
    event.preventDefault();
    let validEmails = true;
    let emailsArray = [];
    if (email) {
      emailsArray.push(email);
    }
    if (email2) {
      emailsArray.push(email2);
    }
    if (email3) {
      emailsArray.push(email3);
    }
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest._id
    ) {
      companyId = props.userData.manifest._id;
    }
    if (companyId) {
      // if (emailArray && emailArray.length) {
      if (emailsArray && emailsArray.length) {
        emailsArray.map((el) => {
          if (validateEmail(el)) {
            validEmails = false;
          }
        });
        if (validEmails) {
          try {
            let addTeamResponse = await callApi(`${API_BASE_URL}/team/invite`, {
              method: "POST",
              body: JSON.stringify({
                emails: emailsArray,
                company: companyId,
              }),
            });
            if (addTeamResponse.status === 200) {
              handleOnboardingTrackAPICall("add-team").then((a) => {
                if (
                  props &&
                  props.userData &&
                  props.userData.user &&
                  props.userData.user.email &&
                  props.userData.user._id &&
                  props.userData.manifest &&
                  props.userData.manifest.company &&
                  props.userData.manifest.company.name
                ) {
                  window.analytics.track(
                    `Added teammates successfully | Add team page | Onboarding`,
                    {
                      title: `Added teammates successfully | Add team page | Onboarding`,
                      email: props.userData.user.email,
                      username: props.userData.user.username,
                      companyName: props.userData.manifest.company.name,
                      user_id: props.userData.user._id,
                      company_id: props.userData.manifest._id,
                    }
                  );
                }
                history.push(HOME);
              });
            }
            showAlert(addTeamResponse.message);
          } catch (e) {
            showAlert(e, "error");
          }
        }
      } else {
        //history.push(HOME);
        showAlert("Please add email address");
      }
    } else {
      showAlert("something went wrong");
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        setEmailArray((prevVals) => [...prevVals, email]);
        setEmail("");
      } else {
        showAlert("Please add valid email address");
      }
    } else {
      showAlert("Please enter email address");
    }
  };

  const cancelEmail = (index) => {
    let list = [...emailArray];
    list.splice(index, 1);
    setEmailArray(list);
    setEmail("");
  };

  return (
    <RotateBlock
      showAuthHeader={true}
      showAuthBoxFw={true}
      showAuthBox={false}
      authHeadingTitle="Invite Your Team"
      authSubTitle="Optimize your work by collaborating with your team members. Invite them via this simple step."
    >
      <Helmet>
        <title>{`Invite Your Team | Wobot.ai`}</title>
        <meta
          name="description"
          content="Collaborate with your team members in one step."
        />
      </Helmet>
      <CenterBlock
        showBottomPagination={true}
        showAuthBottomLink={false}
        showAuthBottomNav={true}
        showWobotIcon={false}
      >
        <div className={"auth-content"}>
          <div className={"row"}>
            <div className={"col-xl col-lg col-md-6"}>
              <div className={"invite-form-block"}>
                <div className={"form-header"}>
                  <h5 className={"form-title"}>
                    Following users will recieve an invitation email.
                  </h5>
                </div>
                <div className={"form-block text-align-left"}>
                  <form>
                    <div className="form-group">
                      <input
                        value={email}
                        type="email"
                        name="username"
                        minlength="2"
                        maxlength="80"
                        // className="form-control"
                        className={`form-control ${
                          isEmailValid ? "error-red" : ""
                        }`}
                        placeholder="e.g. user.one@example.com"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsEmailValid(validateEmail(e.target.value));
                        }}
                      />
                      {isEmailValid && (
                        <span className="error-msg">Email is not valid</span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        value={email2}
                        type="email"
                        name="username"
                        minlength="2"
                        maxlength="80"
                        className={`form-control ${
                          isEmail2Valid ? "error-red" : ""
                        }`}
                        placeholder="e.g. user.two@example.com"
                        onChange={(e) => {
                          setEmail2(e.target.value);
                          setIsEmail2Valid(validateEmail(e.target.value));
                        }}
                      />
                      {isEmail2Valid && (
                        <span className="error-msg">Email is not valid</span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        value={email3}
                        type="email"
                        name="username"
                        minlength="2"
                        maxlength="80"
                        className={`form-control ${
                          isEmail3Valid ? "error-red" : ""
                        }`}
                        placeholder="e.g. user.three@example.com"
                        onChange={(e) => {
                          setEmail3(e.target.value);
                          setIsEmail3Valid(validateEmail(e.target.value));
                        }}
                      />
                      {isEmail3Valid && (
                        <span className="error-msg">Email is not valid</span>
                      )}
                    </div>
                  </form>
                  <span className={"text-muted"}>
                    (You can always add more later)
                  </span>
                </div>
              </div>
            </div>
            <div className={"col-xl col-lg col-md-6 align-self-center"}>
              <div className={"image-block"}>
                <img
                  src={`/assets/images/invite.svg`}
                  className="img-fluid d-block mx-auto"
                  alt="help"
                />
              </div>
            </div>
          </div>
          <div className={"auth-action-button text-right mt-4"}>
            <div>
              <Link
                to={HOME}
                className="link"
                onClick={() => {
                  handleOnboardingTrackAPICall("add-team");
                  if (
                    props &&
                    props.userData &&
                    props.userData.user &&
                    props.userData.user.email &&
                    props.userData.user._id &&
                    props.userData.manifest &&
                    props.userData.manifest.company &&
                    props.userData.manifest.company.name
                  ) {
                    window.analytics.track(
                      `Click on Skip for now | Add team page | Onboarding`,
                      {
                        title: `Click on Skip for now | Add team page | Onboarding`,
                        user: props.userData.user.email,
                        username: props.userData.user.username,
                        companyName: props.userData.manifest.company.name,
                        user_id: props.userData.user._id,
                        company_id: props.userData.manifest._id,
                      }
                    );
                  }
                }}
              >
                Skip for now
              </Link>
              <button
                className={"btn btn-primary btn-md btn-icon-block ml-4"}
                type="button"
                onClick={(e) => {
                  if (
                    props &&
                    props.userData &&
                    props.userData.user &&
                    props.userData.user.email &&
                    props.userData.user._id &&
                    props.userData.manifest &&
                    props.userData.manifest.company &&
                    props.userData.manifest.company.name
                  ) {
                    window.analytics.track(
                      `Click on Invite & Continue | Add team page | Onboarding`,
                      {
                        title: `Click on Invite & Continue | Add team page | Onboarding`,
                        user: props.userData.user.email,
                        username: props.userData.user.username,
                        companyName: props.userData.manifest.company.name,
                        user_id: props.userData.user._id,
                        company_id: props.userData.manifest._id,
                      }
                    );
                  }
                  continueHandler(e);
                }}
              >
                Invite & Finish <IconArrowNextRight />
              </button>
            </div>
          </div>
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddTeamComponent);
