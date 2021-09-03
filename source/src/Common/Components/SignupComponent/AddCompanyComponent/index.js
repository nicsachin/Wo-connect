import React, { useEffect, useState } from "react";
import "react-phone-number-input/style.css";
//import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import { useHistory } from "react-router-dom";
import "./style.scss";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
import {
  ADDCOMPANY,
  ADDLOCATION,
  ADDTEAM,
  API_BASE_URL,
} from "../../../../Constants";
import { connect } from "react-redux";
import {
  addDeviceInfoToStoreAction,
  addUserDataToStoreAction,
} from "../../../../Store/actions";
import Helmet from "react-helmet";
import {
  validateDropDown,
  validateEmpty,
} from "../../../../Services/validation";
import RotateBlock from "../../Molecule/RotateBlock";
import CenterBlock from "../../Molecule/Block/CenterBlock";
import {
  DeleteLocalStorageKey,
  GetLocalStorageKey,
} from "../../../../Services/localStorageService";
import { addCompError } from "../Resources";
import getTokenFromHubSpot from "../../../../Services/getTokenFromHubSpot";
import getQueryVariable from "../../../../Services/getQueryVariable";

let defaultErrorLabels = {
  name: "",
  companyName: "",
  locationSize: "",
};

const AddCompanyComponent = (props) => {
  const history = useHistory();
  const test = getQueryVariable("test");
  const [name, setName] = useState("");
  //const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(defaultErrorLabels);
  const [companyName, setCompanyName] = useState("");
  const [insustries, setIndustries] = useState([]);
  const [teamSize, setTeamSize] = useState("dummy");
  const [locationSize, setLocationSize] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isCompanyNameValid, setIsCompanyNameValid] = useState(false);
  const [isIndustryValid, setIsIndustryValid] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const getindustrydata = async () => {
    try {
      let getIndustryResponse = await callApi(`${API_BASE_URL}/industry/get`, {
        method: "GET",
      });
      if (getIndustryResponse.status === 200) {
        let arr = [];
        getIndustryResponse.data.map((item) => {
          arr.push({ value: item._id, label: item.industry });
          return "";
        });
        setIndustries(arr);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  useEffect(() => {
    getindustrydata();
  }, []);

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      name: name,
      companyName: companyName,
      locationSize: locationSize.length,
    };
    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: addCompError[key] };
        validationSuccess = false;
      }
    }
    // if (name && validateEmpty(name)) {
    //   errorInForm = { ...errorInForm, email: addCompError.name };
    //   validationSuccess = false;
    // }

    // if (role && !validateEmpty(role)) {
    //   errorInForm = { ...errorInForm, role: addEmpError.role };
    //   validationSuccess = false;
    // }
    setError(errorInForm);
    return validationSuccess;
  };

  const signUpandler = async (event) => {
    event.preventDefault();
    handleValidation();
    setIsIndustryValid(validateDropDown(selectedIndustries));

    let selectedIndustryArray = [];
    selectedIndustries.map((item, index) => {
      selectedIndustryArray.push(item.value);
      return "";
    });

    if (
      selectedIndustryArray &&
      selectedIndustryArray.length &&
      name &&
      //phoneNumber &&
      teamSize &&
      locationSize &&
      companyName
    ) {
      //if (isValidPhoneNumber(phoneNumber)) {
      try {
        let signUpResponse = await callApi(
          `${API_BASE_URL}/account/create`,
          {
            method: "POST",
            module: "signup",
            body: JSON.stringify({
              name,
              email: JSON.parse(localStorage.getItem("username")),
              teamSize: teamSize,
              noOfLocations: locationSize,
              company: companyName,
              password: JSON.parse(localStorage.getItem("password")),
              industries: selectedIndustryArray,
              couponCode,
              test: test === "true" ? true : false,
            }),
          },
          {
            showLoader: true,
            callManifest: false,
            loaderLabel: "",
          }
        );
        if (signUpResponse.status === 200) {
          props.addUserDataToStore(signUpResponse.data);
          sleep(200).then((d) => {
            //history.push(`${ADDTEAM}?id=${signUpResponse.data.manifest._id}`);
            // if (process.env.REACT_APP_ENVIRONMENT === "app") {
            //   getTokenFromHubSpot();
            // }
            if (
              signUpResponse &&
              signUpResponse.data &&
              Object.keys(signUpResponse.data).length &&
              signUpResponse.data.user &&
              Object.keys(signUpResponse.data.user).length &&
              signUpResponse.data.user.role &&
              signUpResponse.data.user.role !== "Account Manager" &&
              signUpResponse.data.manifest &&
              signUpResponse.data.manifest._id &&
              signUpResponse.data.manifest.company &&
              signUpResponse.data.manifest.company.name
            ) {
              if (window?.analytics?.identify && window?.analytics?.track) {
                window.analytics.identify(signUpResponse.data.user._id, {
                  name: signUpResponse.data.user.name,
                  email: signUpResponse.data.user.email,
                  username: signUpResponse.data.user.username,
                  mobile: signUpResponse.data.user.mobile,
                  role: signUpResponse.data.user.role,
                  company: {
                    id: signUpResponse.data.manifest._id,
                    email: signUpResponse.data.manifest.company.email,
                    name: signUpResponse.data.manifest.company.name,
                    isDemo: signUpResponse.data.manifest.company.demo,
                    test: signUpResponse.data.manifest.company.test,
                    mobile: signUpResponse.data.user.mobile,
                    signed_up_at: signUpResponse.data.manifest.created_at,
                  },
                });
                window.analytics.track(
                  `User sign up successfully | Onboarding`,
                  {
                    title: `verified email successfully | Onboarding`,
                    name: signUpResponse.data.user.name,
                    email: signUpResponse.data.user.email,
                    username: signUpResponse.data.user.username,
                    user_id: signUpResponse.data.user._id,
                  }
                );
              }
            }
            DeleteLocalStorageKey("username");
            DeleteLocalStorageKey("password");
            history.push(ADDLOCATION);
            showAlert(signUpResponse.message);
          });
        }
      } catch (e) {
        showAlert(e, "error");
      }
      // } else {
      //   showAlert("Please Enter valid phone num");
      // }
    } else {
      showAlert("Please fill all details");
    }
  };

  return (
    <RotateBlock showAuthBoxFw={false} showAuthBox={true}>
      <Helmet>
        <title>{`Add Company | Wobot.ai`}</title>
        <meta name="description" content="Enter your company details" />
      </Helmet>
      <CenterBlock
        showAuthBottomLink={false}
        showAuthBottomNav={true}
        showWobotIcon={true}
        showAuthBoxWrapFw={false}
        showAuthBoxWrap={true}
      >
        <div className={"auth-content"}>
          <h3 className={"auth-title mb-2"}>
            It's a delight to have you onboard
          </h3>
          <p className={"mb-4"}>
            Help us know you better.
            <br />
            (This is how we optimize Wobot as per your business needs)
          </p>
          <form className="auth-form-block" onSubmit={signUpandler}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Your name
              </label>
              <input
                type="text"
                name="name"
                minlength="2"
                maxlength="50"
                className={`form-control ${isNameValid ? "error-red" : ""}`}
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => {
                  // setError({ ...error, name: "" });
                  // setIsNameValid(validateEmpty(e.target.value));
                  setName(e.target.value);

                  if (validateEmpty(e.target.value)) {
                    setError({
                      ...error,
                      name: addCompError.name,
                    });
                  } else {
                    setError({ ...error, name: "" });
                  }
                }}
              />
              {error.name ? (
                <span className="error-msg">{error.name}</span>
              ) : null}
              {/* {isNameValid && (
                <span className="error-msg">Name is required</span>
              )} */}
            </div>
            <div className="form-group">
              <label htmlFor="cname" className="form-label">
                Company name
              </label>
              <input
                type="text"
                name="cname"
                className={`form-control ${
                  isCompanyNameValid ? "error-red" : ""
                }`}
                placeholder="e.g. Alpha Inc"
                value={companyName}
                onChange={(e) => {
                  // setError({ ...error, name: "" });
                  // setIsCompanyNameValid(validateEmpty(e.target.value));
                  setCompanyName(e.target.value);
                  if (validateEmpty(e.target.value)) {
                    setError({
                      ...error,
                      companyName: addCompError.companyName,
                    });
                  } else {
                    setError({ ...error, companyName: "" });
                  }
                }}
              />
              {error.companyName ? (
                <span className="error-msg">{error.companyName}</span>
              ) : null}
              {/* {isCompanyNameValid && (
                <span className="error-msg">Company name is required</span>
              )} */}
            </div>
            <div className="form-group">
              <label htmlFor="insustries" className="form-label">
                Industry
              </label>
              <Select
                options={insustries}
                //isMulti
                onChange={(value) => {
                  setSelectedIndustries([value]);
                  setIsIndustryValid(validateDropDown([value]));
                }}
              />
              {isIndustryValid && (
                <span className="error-msg">Please select an industry</span>
              )}
            </div>
            {/*<div className="form-group">*/}
            {/*  <label htmlFor="radioFruit" className="form-label">*/}
            {/*    Company size (Employees)*/}
            {/*  </label>*/}
            {/*  <div class="radio-toolbar">*/}
            {/*    <input*/}
            {/*      type="radio"*/}
            {/*      id="radio120"*/}
            {/*      name="radioFruit"*/}
            {/*      value="1-20"*/}
            {/*      onChange={(e) => setTeamSize(e.target.value)}*/}
            {/*    />*/}
            {/*    <label for="radio120">1-20</label>*/}

            {/*    <input*/}
            {/*      type="radio"*/}
            {/*      id="radio2150"*/}
            {/*      name="radioFruit"*/}
            {/*      value="21-50"*/}
            {/*      onChange={(e) => setTeamSize(e.target.value)}*/}
            {/*    />*/}
            {/*    <label for="radio2150">21-50</label>*/}

            {/*    <input*/}
            {/*      type="radio"*/}
            {/*      id="radio51200"*/}
            {/*      name="radioFruit"*/}
            {/*      value="51-200"*/}
            {/*      onChange={(e) => setTeamSize(e.target.value)}*/}
            {/*    />*/}
            {/*    <label for="radio51200">51-200</label>*/}

            {/*    <input*/}
            {/*      type="radio"*/}
            {/*      id="radio201500"*/}
            {/*      name="radioFruit"*/}
            {/*      value="201-500"*/}
            {/*      onChange={(e) => setTeamSize(e.target.value)}*/}
            {/*    />*/}
            {/*    <label for="radio201500">201-500</label>*/}

            {/*    <input*/}
            {/*      type="radio"*/}
            {/*      id="radio500"*/}
            {/*      name="radioFruit"*/}
            {/*      value="500+"*/}
            {/*      onChange={(e) => setTeamSize(e.target.value)}*/}
            {/*    />*/}
            {/*    <label for="radio500">500+</label>*/}
            {/*  </div>*/}
            {/*</div>*/}
            <div className="form-group">
              <label htmlFor="inputAddress" className="form-label">
                Number of locations
              </label>
              <div class="radio-toolbar">
                <input
                  type="radio"
                  id="radio1201"
                  name="radiolocation"
                  value="1-10"
                  onChange={(e) => setLocationSize(e.target.value)}
                />
                <label for="radio1201">1-10</label>

                <input
                  type="radio"
                  id="radio21502"
                  name="radiolocation"
                  value="10-50"
                  onChange={(e) => setLocationSize(e.target.value)}
                />
                <label for="radio21502">10-50</label>

                <input
                  type="radio"
                  id="radio512003"
                  name="radiolocation"
                  value="50-150"
                  onChange={(e) => setLocationSize(e.target.value)}
                />
                <label for="radio512003">50-150</label>

                <input
                  type="radio"
                  id="radio2015004"
                  name="radiolocation"
                  value="150+"
                  onChange={(e) => setLocationSize(e.target.value)}
                />
                <label for="radio2015004">150+</label>
              </div>
            </div>
            {error.locationSize ? (
              <span className="error-msg-addlocation">
                {error.locationSize}
              </span>
            ) : null}

            {/*coupon code*/}

            <div className="form-group">
              <label htmlFor="cname" className="form-label">
                Coupon code
              </label>
              <input
                type="text"
                name="cname"
                className={`form-control`}
                placeholder="**********"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                }}
              />
            </div>
            {/**/}
            <button
              className="btn btn-block btn-primary btn-xl mt-3"
              type={"submit"}
            >
              Continue
            </button>
          </form>
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
    addDeviceInfo: (data) => {
      dispatch(addDeviceInfoToStoreAction(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCompanyComponent);
