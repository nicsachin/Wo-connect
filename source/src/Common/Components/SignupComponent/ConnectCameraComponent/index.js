import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconAddCircle,
  IconArrowNextRight,
  IconCameraTwo,
  IconNVR,
  IconQuestation,
} from "../../IconsComponent/Index";
import "./style.scss";
import { connect } from "react-redux";
import { ADDTEAM, API_BASE_URL } from "../../../../Constants";
import IconChecked from "../../IconsComponent/IconChecked";
import AddCameraModal from "../../../../Wocam/Components/ModalComponents/AddCameraModal";
import AddDvrModal from "../../../../Wocam/Components/ModalComponents/AddDvrModal";
import CenterBlock from "../../Molecule/Block/CenterBlock";
import RotateBlock from "../../Molecule/RotateBlock";
import IconArrowBack from "../../IconsComponent/IconArrowBackLeft";
import Helmet from "react-helmet";
import updateManifest from "../../../../Services/updateManifest";
import { store } from "../../../../Store";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
import handleOnboardingTrackAPICall from "../handleOnboardingTrackAPICall";
import Select from "react-select";
import { Button } from "react-bootstrap";
import axios from "axios";
import {Cookies} from "react-cookie";

const ConnectCameraComponent = (props) => {
  const [isDvrAdded, setIsDvrAdded] = useState(false);
  const [isCameraAdded, setIsCameraAdded] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDvrModal, setShowDvrModal] = useState(false);

  const [companyMeta, setCompanyMeta] = useState({
    company: "",
    locations: [],
  });
  const [locationSelected, setLocationSelected] = useState({});

  useEffect(() => {
    if (
      props?.userData?.manifest &&
      Object.keys(props.userData.manifest).length !== 0
    ) {
      let locations = props.userData.manifest.regions
        ? props.userData.manifest.regions
            .filter((el) => el.type === "location")
            .map((el) => {
              return { label: el.area, value: el._id };
            })
        : [];
      setCompanyMeta({ company: props.userData.manifest.company, locations });
    }
  }, [props]);

  function downloadScript() {
    if (companyMeta.company.username && locationSelected.value) {
      const deviceName = `${companyMeta.company.username}-${locationSelected.value}`;

      //main algorithm to download bash file
      const str = `curl -sfkL 'https://experience.aikaan.io/api/_external/img/v1/user/4a249431-096e-47f2-9f9f-41d618ae7959/dgp/fba1be43-ee48-4c30-9fce-6b69af04abab/fwshellscript?package_type=ipkg' | sh\n echo "**script-installed**"\ncd /opt/aikaan/bin/support/inventory\nrm mender-inventory-name\ntouch mender-inventory-name\n echo "#!/bin/sh" >> mender-inventory-name\necho "echo \\"device_name=${deviceName}\\"" >> mender-inventory-name\nchmod +x ./mender-inventory-name\necho "**device-name-added**"\n/opt/aikaan/bin/supervisorctl restart mender`;
      const element = document.createElement("a");
      const readme = document.createElement("a");

      const file = new Blob([str]);
      const readmeFile = new Blob(["Just run command : sudo  bash myFile.sh"]);

      element.href = URL.createObjectURL(file);
      readme.href = URL.createObjectURL(readmeFile);

      element.download = "myFile.sh";
      readme.download = "readme.txt";

      document.body.appendChild(element); // Required for this to work in FireFox
      document.body.appendChild(readme);

      readme.click();
      element.click();
    } else {
      return showAlert("Please select a location", "warning");
    }
  }


  function checkPublicIp() {
      if (companyMeta.company.username && locationSelected.value) {
          const deviceName = `${companyMeta.company.username}-${locationSelected.value}`;


          fetch("https://experience.aikaan.io/dm/api/dm/v1/df2?limit=10&offset=0&profileType=0" ,
              {
                  credentials: 'omit',
                  method : "POST" ,
                  body:JSON.stringify({
                      "search_key": deviceName,
                      "sort_by": {
                          "column": "created_at",
                          "order": "desc"
                      },
                      "devices": [],
                      "filters": {
                          "dgp": [],
                          "tg": [],
                          "tags": []
                      },
                      "filters_op": 0
                  })
              })
              .then(res=>{
                  console.log('first response' , res)
                  return res.json()})
              .then(res=>{
                  console.log('response' , res);
              }).catch(e=>{
                  console.log('error' ,e);
          })

      }
      else {
          return showAlert("Please download and install the script first", "warning");
      }
  }


  return (
    <RotateBlock
      showAuthHeader={true}
      showAuthBoxFw={true}
      showAuthBox={false}
      authHeadingTitle="Add Your First Camera"
      authSubTitle="Wobot is built around the network of your existing CCTV cameras. Quickly add your camera details and get started with live monitoring and alerts."
    >
      <Helmet>
        <title>{`Add Cameras | Wobot.ai`}</title>
        <meta name="description" content="Add your existing cameras." />
      </Helmet>
      <CenterBlock
        showBottomPagination={true}
        showAuthBottomLink={false}
        showAuthBottomNav={true}
        showWobotIcon={false}
      >
        <div className={"auth-content"}>
          <div className={"row"}>
            <div className={"col-lg-6 col-md-12"}>
              <div className={"card-box-block float-right-block panel-fh"}>
                <div className={"card-box-content"}>
                  <div className={"card-box-icon"}>
                    <IconNVR />
                  </div>
                  <div className={"card-box-text"}>
                    <h5 className={"card-box-title"}>Add DVR/NVR Details</h5>
                    <p className={"card-box-subtitle"}>
                      Connect your DVR/NVR to add all the linked cameras at
                      once.
                    </p>
                  </div>
                </div>
                <div className={"inner-card-box"}>
                  <div className={"inner-card-content"}>
                    {props &&
                    props.userData &&
                    props.userData.manifest &&
                    props.userData.manifest.dvrs.length ? (
                      <span className={"inner-card-icon"}>
                        <IconChecked />
                      </span>
                    ) : (
                      ""
                    )}
                    {props &&
                    props.userData &&
                    props.userData.manifest &&
                    props.userData.manifest.dvrs.length ? (
                      <div className={"inner-card-text"}>
                        <p className={"mb-0 inner-card-title"}>
                          <span>{props.userData.manifest.dvrs.length}</span> NVR
                          Added
                        </p>
                      </div>
                    ) : (
                      <div className={"inner-card-text"}>
                        <p className={"mb-1 inner-card-title"}>
                          {" "}
                          No DVR/NVR Added
                        </p>
                        <span className={"inner-card-sub-title"}>
                          Add a DVR/NVR to start recording
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={"inner-card-button"}
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        props &&
                        props.userData &&
                        props.userData.user &&
                        props.userData.user.email &&
                        props.userData.manifest &&
                        props.userData.manifest.company &&
                        props.userData.manifest.company.name
                      ) {
                        window.analytics.track(
                          `Clicked on Add DVR/NVR Detail card | dvr pop up open | Onboarding`,
                          {
                            title: `Clicked on Add DVR/NVR Detail card | dvr pop up open | Onboarding`,
                            user: props.userData.user.email,
                            username: props.userData.user.username,
                            company: props.userData.manifest.company.name,
                          }
                        );
                      }
                      setShowDvrModal(true);
                    }}
                  >
                    <span>
                      <IconAddCircle />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-lg-6 col-md-12"}>
              <div className={"card-box-block panel-fh"}>
                <div className={"card-box-content"}>
                  <div className={"card-box-icon"}>
                    <IconCameraTwo />
                  </div>
                  <div className={"card-box-text"}>
                    <h5 className={"card-box-title"}>Add a Single Camera</h5>
                    <p className={"card-box-subtitle"}>
                      Directly add a standalone camera that you want to monitor.
                    </p>
                  </div>
                </div>
                <div className={"inner-card-box"}>
                  <div className={"inner-card-content"}>
                    {props &&
                    props.userData &&
                    props.userData.manifest &&
                    props.userData.manifest.camera ? (
                      <span className={"inner-card-icon"}>
                        <IconChecked />
                      </span>
                    ) : (
                      ""
                    )}
                    {props &&
                    props.userData &&
                    props.userData.manifest &&
                    props.userData.manifest.camera ? (
                      <div className={"inner-card-text"}>
                        <p className={"mb-1 inner-card-title"}>
                          <span>{props.userData.manifest.camera}</span> Camera
                          Added
                        </p>
                      </div>
                    ) : (
                      <div className={"inner-card-text"}>
                        <p className={"mb-1 inner-card-title"}>
                          {" "}
                          No Camera Added
                        </p>
                        <span className={"inner-card-sub-title"}>
                          Add a camera to start recording
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={"inner-card-button"}
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        props &&
                        props.userData &&
                        props.userData.user &&
                        props.userData.user.email &&
                        props.userData.manifest &&
                        props.userData.manifest.company &&
                        props.userData.manifest.company.name
                      ) {
                        window.analytics.track(
                          `Clicked on Add direct camera card | camera pop up open | Onboarding`,
                          {
                            title: `Clicked on Add direct camera card | camera pop up open | Onboarding`,
                            user: props.userData.user.email,
                            username: props.userData.user.username,
                            company: props.userData.manifest.company.name,
                          }
                        );
                      }
                      setShowCameraModal(true);
                    }}
                  >
                    <span>
                      <IconAddCircle />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"row justify-content-center"}>
            <div className="col-lg-12 col-md-12 col-sm-12 mb-3 card-tans-text">
              <h6 className={"card-tans-title"}>Don't have a public ip ?</h6>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
              <label htmlFor="inputEmail4">Select location : </label>
              <Select
                value={locationSelected}
                onChange={(el) => {
                  setLocationSelected(el);
                }}
                options={companyMeta.locations}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
              <Button
                className="btn btn-primary btn-sm"
                onClick={downloadScript}
              >
                Download
              </Button>
            </div>

              <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
                  <p
                      className="link curser-p"
                      onClick={checkPublicIp}
                  >
                      check public ip
                  </p>
              </div>
          </div>

          <div className={"center-block"}>
            <div className={"card-trans-block"}>
              <div className={"card-trans-icon"}>
                <img
                  src={`/assets/images/consulting.svg`}
                  className="big-img img-fluid d-block mx-auto notify-message-img"
                  alt="help"
                />
              </div>
              <div className={"card-tans-text"}>
                <h6 className={"card-tans-title mb-2"}>
                  Don't have details handy?
                </h6>
                <ul className={"mb-0"}>
                  {/* <li>
                    <Link className={"link"} to="/">
                      Check Live Demo
                    </Link>
                  </li> */}
                  <li>
                    <a
                      href="http://help.wobot.ai/the-go-to-guide-for-adding-dvr/nvrs"
                      className="link"
                      target="_blank"
                    >
                      Find the Guide Here
                    </a>
                  </li>
                  <li>
                    <a
                      href="http://help.wobot.ai/kb-tickets/new"
                      className="link"
                      target="_blank"
                    >
                      Contact Wobot’s Support Team
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://demo.wobot.ai/"
                      className="link"
                      target="_blank"
                    >
                      Live Demo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <AddCameraModal
            data={{
              show: showCameraModal,
              setShow: setShowCameraModal,
              successCallback: () => {
                setIsCameraAdded(true);
              },
              module: "Onboarding",
            }}
          />
          <AddDvrModal
            data={{
              show: showDvrModal,
              setShow: setShowDvrModal,
              successCallback: () => {
                setIsDvrAdded(true);
              },
              module: "Onboarding",
            }}
          />
        </div>
        <div className={"auth-action-button text-right mt-4"}>
          <Link
            to={ADDTEAM}
            className="link"
            onClick={() => {
              handleOnboardingTrackAPICall("connect-camera");
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
                  `Click on Skip for now | connect camera page | Onboarding`,
                  {
                    title: `Click on Skip for now | connect camera page | Onboarding`,
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
          <Link
            className={"btn btn-primary btn-md btn-icon-block ml-4"}
            to={ADDTEAM}
            onClick={() => {
              handleOnboardingTrackAPICall("connect-camera");
              if (
                props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.email &&
                props.userData.manifest &&
                props.userData.manifest.company &&
                props.userData.manifest.company.name
              ) {
                window.analytics.track(
                  `Click on next | Add your camera page | Onboarding`,
                  {
                    title: `Click on next | Add your camera page | Onboarding`,
                    user: props.userData.user.email,
                    username: props.userData.user.username,
                    company: props.userData.manifest.company.name,
                  }
                );
              }
            }}
          >
            {" "}
            Next <IconArrowNextRight />
          </Link>
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(ConnectCameraComponent);
