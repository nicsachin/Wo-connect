import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./style.scss";
import { store } from "../../../Store";
import { API_BASE_URL, EMPLOYEE } from "../../../Constants";
import axios from "axios";
import { getHeaders } from "../../../Services/getHeaders";
import { showAlert } from "../../../Services/showAlert";
import callApi from "../../../Services/callApi";
import { connect, useSelector } from "react-redux";
import { toggleLoaderAction } from "../../../Store/actions";
import updateManifest from "../../../Services/updateManifest";
import { validateEmail, validateEmpty } from "../../../Services/validation";
import { compDetError } from "../../Resources";
import { Settings } from "../../../Services/segmentEventDetails";
import { segmentTrack } from "../../../Services/segment";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import Block from "../../../Common/Components/Molecule/Block";
import getTokenFromHubSpot from "../../../Services/getTokenFromHubSpot";
import ManifestService from "../../../Services/ManifestService";

let defaultErrorLabels = {
  // dvr: "",
  // manufacturer: "",
  // ip: "",
  // port: "",
  // username: "",
  // password: "",
  // channels: "",
  // region: "",
  // branch: "",
  // rtsp: "",
  name: "",
  industry: "",
  country: "",
  email: "",
};

const cList = require("./country.json");

const CompanyDetailsComponent = (props) => {
  const [isCountryValid, setIsCountryValid] = useState(false);
  const [isIndustryValid, setIsIndustryValid] = useState(false);
  const [error, setError] = useState(defaultErrorLabels);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [image, setImage] = useState("");
  const [mobile, setPhoneNumber] = useState("0");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState([]);
  const [teamSize, setTeamSize] = useState("dummy");
  const [locationSize, setLocationSize] = useState("1-10");
  const [selectedIndustry, setSelectedIndustry] = useState({});
  const [selectedCountry, setSelectedCountry] = useState({});
  const [country, setCountry] = useState(cList);

  const { manifest } = useSelector((state) => state.userData);

  const getIndustryData = async () => {
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
        setIndustry(arr);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  useEffect(() => {
    getIndustryData();
  }, []);

  useEffect(() => {
    if (manifest) {
      if (manifest.company.name) {
        setName(manifest.company.name);
      }
      if (manifest.company.email) {
        setEmail(manifest.company.email);
      }
      if (manifest.company.logo) {
        setImage(manifest.company.logo);
      }
      if (manifest.company.teamSize) {
        setTeamSize(manifest.company.teamSize);
      }
      if (manifest.company.noOfLocations) {
        setLocationSize(manifest.company.noOfLocations);
      }
      if (manifest.company.industries && manifest.company.industries.length) {
        setSelectedIndustry({
          label: manifest.company.industries[0].industry,
          value: manifest.company.industries[0]._id,
        });
      }
      if (manifest.company.country) {
        setSelectedCountry({
          label: manifest.company.country,
          value: manifest.company.country,
        });
      }
    }
  }, [industry]);
  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      name,
      industry: selectedIndustry.value,
      country: selectedCountry.value,
      email,
      // dvr: dvr,
      // manufacturer: manufacturer.value,
      // ip,
      // port,
      // username,
      // password,
      // region: subRegion.value,
      // branch: location.value,
      // channels: channel.value,
    };

    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: compDetError[key] };
        validationSuccess = false;
      }
    }
    if (email && validateEmail(email)) {
      errorInForm = { ...errorInForm, email: compDetError.invalidEmail };
      validationSuccess = false;
    }

    // if (industry && !validateEmpty(industry)) {
    //   errorInForm = { ...errorInForm, industry: compDetError.industry };
    //   validationSuccess = false;
    // }

    setError(errorInForm);
    return validationSuccess;
  };

  const handleFileUpload = async (data) => {
    const formData = new FormData();
    formData.append("file", data.target.files[0]);
    props.toggleLoaderAction(true);

    try {
      axios({
        method: "PUT",
        url: `${API_BASE_URL}/logo/update`,
        data: formData,
        headers: {
          ...getHeaders(),
          "content-type": "multipart/form-data",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            setImage(res && res.data && res.data.data && res.data.data.logo);
          } else {
            showAlert(res.message, "error");
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
      showAlert(e.message, "error");
      props.toggleLoaderAction(false);
    }
  };

  const updateCompany = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      if (teamSize && locationSize) {
        props.toggleLoaderAction(true);
        try {
          const updateCompanyDetailResponse = await callApi(
            `${API_BASE_URL}/company-info/update`,
            {
              method: "PUT",
              body: JSON.stringify({
                name,
                email,
                mobile,
                teamSize,
                noOfLocations: locationSize,
                industries: selectedIndustry.value,
                country: selectedCountry.value,
              }),
            }
          );
          if (
            updateCompanyDetailResponse &&
            updateCompanyDetailResponse.status === 200
          ) {
            if (store.getState().userData)
              updateManifest().then((d) => {
                // if (
                //   process.env.REACT_APP_ENVIRONMENT === "app"
                //   &&ManifestService.userIsAdmin()
                // ) {
                if (process.env.REACT_APP_ENVIRONMENT === "app") {
                  getTokenFromHubSpot();
                }
                window.analytics.group(props.userData.manifest._id, {
                  email: email,
                  name: name,
                  isDemo: props.userData.manifest.company.demo,
                  mobile: mobile,
                  signed_up_at: props.userData.manifest.created_at,
                });
                segmentTrack({ title: Settings.companyProfile.updateDetail });
              });
          }
          setTimeout(() => {
            props.toggleLoaderAction(false);
          }, 800);
          showAlert("Profile has been updated", "info");
        } catch (e) {
          console.log(e);
          showAlert(e, "error");
        }
      } else {
        showAlert("Please fill all details");
      }
    } else return 0;
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Settings"}
          breadcrumb={[
            { name: "Settings", link: EMPLOYEE },
            { name: "Company Details" },
          ]}
          showSubTitle={false}
        ></PageTitle>
        <HeaderLinks
          showSubTitle={true}
          subTitle={
            <p>
              You can edit your company and workspace related settings here.
            </p>
          }
        />
        <div className={"row"}>
          <div className={"col-lg-6"}>
            <Block>
              <div className={"content-wrapper mt-4 mb-4"}>
                <small>Profile Picture Recommended: 150x150 px</small>
                <div className="profile-block d-flex align-items-center">
                  <div className="wrapper text-center">
                    <div className="img-block mt-3">
                      <img
                        className="img-fluid mx-auto"
                        src={`${
                          image === ""
                            ? "/assets/images/user-profile.png"
                            : image
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
                      {props.userData?.manifest?.company?.name}
                    </p>
                  </div>
                </div>
                <div className={"form-wrapper mt-4 row"}>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Company name
                      </label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        // className={`form-control ${
                        //   isCompanyNameValid ? "error-red" : ""
                        // }`}

                        placeholder="e.g. Alpha Inc"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError({ ...error, name: "" });
                          // setIsCompanyNameValid(validateEmpty(e.target.value));
                        }}
                      />
                      {/* {isCompanyNameValid && (
                        <span className="error-msg">Please enter a Name.</span>
                      )} */}
                      {error.name ? (
                        <span className="error-msg">{error.name}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Industry
                      </label>
                      <Select
                        options={industry}
                        value={selectedIndustry}
                        onChange={(value) => {
                          setSelectedIndustry(value);
                          setError({ ...error, industry: "" });
                          // setIsIndustryValid(validateEmpty(selectedIndustry.value));
                        }}
                      />
                      {error.industry ? (
                        <span className="error-msg">{error.name}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Country
                      </label>
                      <Select
                        options={country}
                        value={selectedCountry}
                        onChange={(selectedValue) => {
                          setSelectedCountry(selectedValue);
                          setError({ ...error, country: "" });
                          // setIsCountryValid(validateEmpty(selectedValue.value));
                        }}
                      />
                      {error.country ? (
                        <span className="error-msg">{error.country}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={"col-lg-6 col-md-12"}>
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Primary admin email
                      </label>
                      <input
                        type="email"
                        name="username"
                        className="form-control"
                        // className={`form-control ${isEmailValid ? "error-red" : ""}`}
                        disabled={true}
                        placeholder="e.g. email@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError({ ...error, email: "" });
                          if (validateEmail(e.target.value)) {
                            setError({
                              ...error,
                              email: compDetError.invalidEmail,
                            });
                          }
                          // setIsEmailValid(validateEmpty(e.target.value));
                          // setIsEmailValid(validateEmail(e.target.value));
                        }}
                      />
                      {/* {isEmailValid && (
                        <span className="error-msg">Email Is Not Valid</span>
                      )} */}
                      {error.email ? (
                        <span className="error-msg">{error.email}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={"col-lg-12"}>
                    {/*<div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Company size
                      </label>
                      <div className="radio-toolbar">
                        <input
                          type="radio"
                          id="radio120"
                          name="radioFruit"
                          value="1-20"
                          onClick={() => setTeamSize("1-20")}
                          checked={teamSize === "1-20"}
                        />
                        <label for="radio120">1-20</label>

                        <input
                          type="radio"
                          id="radio2150"
                          name="radioFruit"
                          value="21-50"
                          onClick={() => setTeamSize("21-50")}
                          checked={teamSize === "21-50"}
                        />
                        <label for="radio2150">21-50</label>

                        <input
                          type="radio"
                          id="radio51200"
                          name="radioFruit"
                          value="51-200"
                          onClick={() => setTeamSize("51-200")}
                          checked={teamSize === "51-200"}
                        />
                        <label for="radio51200">51-200</label>

                        <input
                          type="radio"
                          id="radio201500"
                          name="radioFruit"
                          value="201-500"
                          onClick={() => setTeamSize("201-500")}
                          checked={teamSize === "201-500"}
                        />
                        <label for="radio201500">201-500</label>

                        <input
                          type="radio"
                          id="radio500"
                          name="radioFruit"
                          value="500+"
                          onClick={() => setTeamSize("500+")}
                          checked={teamSize === "500+"}
                        />
                        <label for="radio500">500+</label>
                      </div>
                    </div>*/}
                    <div className="form-group">
                      <label htmlFor="inputAddress" className="form-label">
                        Location size
                      </label>
                      <div class="radio-toolbar">
                        <input
                          type="radio"
                          id="radio1201"
                          name="radiolocation"
                          value="1-10"
                          onChange={() => setLocationSize("1-10")}
                          checked={locationSize === "1-10"}
                        />
                        <label for="radio1201">1-10</label>

                        <input
                          type="radio"
                          id="radio21502"
                          name="radiolocation"
                          value="10-50"
                          onChange={() => setLocationSize("10-50")}
                          checked={locationSize === "10-50"}
                        />
                        <label for="radio21502">10-50</label>

                        <input
                          type="radio"
                          id="radio512003"
                          name="radiolocation"
                          value="50-150"
                          onChange={() => setLocationSize("50-150")}
                          checked={locationSize === "50-150"}
                        />
                        <label for="radio512003">50-150</label>

                        <input
                          type="radio"
                          id="radio2015004"
                          name="radiolocation"
                          value="150+"
                          onChange={() => setLocationSize("150+")}
                          checked={locationSize === "150+"}
                        />
                        <label for="radio2015004">150+</label>
                      </div>
                    </div>
                    <div className="d-flex">
                      <button
                        type={"submit"}
                        className="btn btn-primary btn-md mt-3"
                        onClick={(event) => {
                          segmentTrack({
                            title: Settings.companyProfile.updateChangesBotton,
                          });
                          updateCompany(event);
                        }}
                      >
                        Update Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Block>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

// export default connect(mapStateToProps, null)(TatComponent);
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
)(CompanyDetailsComponent);
