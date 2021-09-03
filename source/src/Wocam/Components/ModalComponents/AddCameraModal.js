import { Modal } from "react-bootstrap";
import {
  IconView,
  IconViewHide,
} from "../../../Common/Components/IconsComponent/Index";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { getSubregionOrLocation } from "../../../Services/wocam";
import { connect } from "react-redux";
import { CameraError } from "../../Resources";
import { colourStyles } from "../../../Services/colourStyles";

import {
  validateIPaddress,
  validateRTSPUrl,
} from "../../../Services/validation";
import Service from "../../utils/Service";

let defaultOptionValue = { label: "All", value: "" };
// const colourStyles = {
//   control: (styles) => ({ ...styles, backgroundColor: "white" }),
//   option: (styles, { isDisabled }) => {
//     return {
//       ...styles,
//       backgroundColor: isDisabled ? "#EFF3FD" : isDisabled,
//       color: isDisabled ? "#000" : isDisabled,
//     };
//   },
//   input: (styles) => ({ ...styles }),
//   placeholder: (styles) => ({ ...styles }),
//   singleValue: (styles) => ({ ...styles }),
// };

let defaultErrorLabels = {
  camera: "",
  manufacturer: "",
  ip: "",
  port: "",
  username: "",
  password: "",
  channelId: "",
  region: "",
  branch: "",
  rtsp: "",
};

const AddCameraModal = (props) => {
  const [showRtspField, setShowRtspField] = useState(false);
  const [IPAddress, setIPAddress] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [channelId, setChannelId] = useState("");
  const [manufacturerList, setManufacturerList] = useState([]);
  const [
    dvrIsPresentInCameraDetails,
    setDvrIsPresentInCameraDetails,
  ] = useState(false);

  const [camera, setCamera] = useState("");
  const [rtsp, setRtsp] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [location, setLocation] = useState("");
  const [cameraOfflineAlertDuration, setCameraOfflineAlertDuration] = useState(
    "15"
  );
  const [email, setEmail] = useState("");
  // const [storedClipDuration, setStoredClipDuration] = useState("");
  // const [cloudStorageStream, setCloudStorageStream] = useState("");
  const [passwordShown, setPasswordShown] = useState(true);
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [subregionList, setSubregionList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [error, setError] = useState(defaultErrorLabels);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      camera: camera,
      manufacturer: manufacturer.value,
      ip: IPAddress,
      port,
      username,
      password,
      region: subRegion.value,
      branch: location.value,
      channelId,
      rtsp,
      cameraOfflineAlertDuration,
    };

    let skip = showRtspField
      ? ["username", "password", "ip", "port", "channelId"]
      : ["rtsp"];

    // in case of camera added from dvr we don't want to validate rtsp
    if (dvrIsPresentInCameraDetails) skip = [...skip, "rtsp"];

    for (let key in obj) {
      if (obj[key] || skip.indexOf(key) !== -1) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: CameraError[key] };
        validationSuccess = false;
      }
    }

    if (
      IPAddress &&
      !validateIPaddress(IPAddress) &&
      skip.indexOf("ip") === -1
    ) {
      errorInForm = { ...errorInForm, ip: CameraError.invalidIp };
      validationSuccess = false;
    }

    if (rtsp && !validateRTSPUrl(rtsp) && skip.indexOf("rtsp") === -1) {
      errorInForm = { ...errorInForm, rtsp: CameraError.invalidRTSP };
      validationSuccess = false;
    }

    if (
      cameraOfflineAlertDuration &&
      parseInt(cameraOfflineAlertDuration) < 5
    ) {
      errorInForm = {
        ...errorInForm,
        cameraOfflineAlertDuration: CameraError.cameraOfflineAlertDuration,
      };
      validationSuccess = false;
    }

    if (!email) {
      errorInForm = { ...errorInForm, email: CameraError.email };
      validationSuccess = false;
    }

    setError(errorInForm);
    return validationSuccess;
  };

  /**
   * API call for add camera
   * */
  const addCameraApiCall = async (rtspUrl, rtspMain) => {
    if (rtspUrl) {
      let apiBody = {
        camera,
        manufacturer: manufacturer.value,
        rtsp: rtspUrl,
        region: subRegion.parent,
        city: subRegion.value,
        location: location.value,
        emailIds: email.split(",").map((el) => el.trim()),
        cameraOfflineAlertDuration,
        timezone: props.deviceInfo ? props.deviceInfo.timeZone : null,
        channelId: showRtspField ? "" : channelId,
        host: showRtspField ? "" : IPAddress,
        port: showRtspField ? "" : port,
        username: showRtspField ? "" : username,
        password: showRtspField ? "" : password,
        stream: "sub",
        rtspMain: showRtspField ? "" : rtspMain,
      };

      try {
        const url = `${API_BASE_URL}/setup/camera`;
        const method = "POST";

        let res = await callApi(url, {
          method,
          body: JSON.stringify(apiBody),
        });
        if (res.status === 200) {
          /**
           * @checkAndCreateLiveView
           * */
          await Service.checkAndCreateLiveView([res.data._id]);
          props.data.successCallback();
          showAlert(res.message);
          if (
            props.data &&
            props.data.module &&
            props.data.module === "Onboarding"
          ) {
            try {
              callApi(`${API_BASE_URL}/onboard`, {
                method: "POST",
                body: JSON.stringify({
                  onboarded: ["connect-camera"],
                }),
              });
            } catch (e) {
              showAlert(e, "error");
            }
          }
          if (
            props &&
            props.userData &&
            props.userData.user &&
            props.userData.user.email &&
            props.userData.manifest &&
            props.userData.manifest.company &&
            props.userData.manifest.company.name &&
            props.userData.user._id &&
            props.userData.manifest._id &&
            props.data &&
            props.data.module
          ) {
            window.analytics.track(
              `Added camera successfully | ${props.data.module}`,
              {
                title: `Added camera successfully | ${props.data.module}`,
                email: props.userData.user.email,
                username: props.userData.user.username,
                companyName: props.userData.manifest.company.name,
                user_id: props.userData.user._id,
                company_id: props.userData.manifest._id,
              }
            );
          }
          closeModal();
        }
      } catch (e) {
        showAlert(e, "error");
      }
    } else {
      showAlert("RTSP URL required", "error");
    }
  };
  /**
   * To add or update camera
   * */
  const addCamera = async () => {
    let isFormValidated = handleValidation();

    if (isFormValidated) {
      //Check if rtsp is present otherwise make api call to get rtsp
      if (
        !showRtspField &&
        IPAddress &&
        port &&
        username &&
        password &&
        channelId &&
        manufacturer
      ) {
        let apiBody = Service.trimPayload({
          host: IPAddress,
          port,
          username,
          password,
          channelId,
          stream: "sub",
          manufacturer: manufacturer.value,
        });

        try {
          const url = `${API_BASE_URL}/camera/connection/check`;
          const method = "POST";
          let res = await callApi(url, {
            method,
            body: JSON.stringify(apiBody),
          });
          if (res.status === 200 && res.data && res.data.rtsp) {
            addCameraApiCall(res.data.rtsp, res.data.rtspMain);
          }
        } catch (e) {
          showAlert(e, "error");
        }
      } else addCameraApiCall(rtsp);
    } else return 0;
  };

  const updateCamera = async () => {
    let isFormValidated = handleValidation();
    if (isFormValidated) {
      let apiBody = Service.trimPayload({
        camera,
        manufacturer: manufacturer.value,
        rtsp,
        rtspMain: rtsp,
        region: subRegion.parent,
        city: subRegion.value,
        location: location.value,
        emailIds: email.split(",").map((el) => el.trim()),
        cameraOfflineAlertDuration,
        timezone: props.deviceInfo ? props.deviceInfo.timeZone : null,
      });

      try {
        let res = await callApi(
          `${API_BASE_URL}/camera/update/${props.data.cameraDetails._id}`,
          {
            method: "PUT",
            body: JSON.stringify(apiBody),
          }
        );
        if (res.status === 200) {
          let cam = await callApi(
            `${API_BASE_URL}/camera/${props.data.cameraDetails._id}`
          );
          if (cam.status === 200 && cam.data) {
            if (
              props &&
              props.userData &&
              props.userData.user &&
              props.userData.user.email &&
              props.userData.manifest &&
              props.userData.manifest.company &&
              props.userData.manifest.company.name &&
              props.userData.user._id &&
              props.userData.manifest._id &&
              props.data &&
              props.data.module
            ) {
              window.analytics.track(
                `Edited camera details | ${props.data.module}`,
                {
                  title: `Edited camera details | ${props.data.module}`,
                  email: props.userData.user.email,
                  username: props.userData.user.username,
                  companyName: props.userData.manifest.company.name,
                  user_id: props.userData.user._id,
                  company_id: props.userData.manifest._id,
                }
              );
            }
            props.data.setCameraDetails(cam.data);
            if (cam.data.thumbnail)
              props.data.setCameraImage(cam.data.thumbnail);
          }
          showAlert(res.message);

          closeModal();
        }
      } catch (e) {
        showAlert(e, "error");
      }
    } else return 0;
  };

  const initializeFields = () => {
    /**
     * Populate manufacturers
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.manufacturer
    ) {
      setManufacturerList(
        props.userData.manifest.manufacturer.map((el) => {
          return { label: el, value: el };
        })
      );
    }

    /**
     * Populate regions and region-subregion combined list
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      // let regions = [];
      let regionsAndSubregions = [];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          // regions.push({value: el._id, label: el.area});
          /**
           * For combined list
           * */
          regionsAndSubregions.push({
            value: el._id,
            label: el.area,
            isDisabled: true,
          });
          let subregionList = getSubregionOrLocation(el._id, "city");
          for (let subregion of subregionList) {
            regionsAndSubregions.push({
              value: subregion.value,
              label: subregion.label,
              parent: el._id,
            });
          }
        }
      }
      setRegionAndSubregionCombinedList(regionsAndSubregions);
      setSubregionList(regionsAndSubregions);
    }
  };

  useEffect(() => {
    initializeFields();
  }, [props.userData]);

  useEffect(() => {
    if (!email) {
      setEmail(Service.getEmailFromManifest());
    }
    /**
     * for update camera request
     * */

    if (
      props.data.cameraDetails &&
      Object.keys(props.data.cameraDetails).length
    ) {
      setCamera(props.data.cameraDetails.camera);
      setShowRtspField(true);
      setManufacturer({
        label: props.data.cameraDetails.manufacturer,
        value: props.data.cameraDetails.manufacturer,
      });
      if (
        props.data.cameraDetails.dvr &&
        Object.keys(props.data.cameraDetails.dvr).length
      ) {
        setDvrIsPresentInCameraDetails(true);
        setRtsp(props.data.cameraDetails.rtsp);
      }
      setSubRegion({
        label: props.data.cameraDetails.city,
        value: props.data.cameraDetails._city,
        parent: props.data.cameraDetails._region,
      });
      setLocation({
        label: props.data.cameraDetails.location,
        value: props.data.cameraDetails._location,
      });
      setCameraOfflineAlertDuration(
        props.data.cameraDetails.cameraOfflineAlertDuration
      );
      setEmail(props.data.cameraDetails.emailIds.join(","));
    }
  }, [props.data]);

  useEffect(() => {
    setError(defaultErrorLabels);
  }, [showRtspField]);
  /**
   * Close modal and deletes values
   * */
  const closeModal = () => {
    if (
      props &&
      props.userData &&
      props.userData.user &&
      props.userData.user.email &&
      props.userData.manifest &&
      props.userData.manifest.company &&
      props.userData.manifest.company.name &&
      props.userData.user._id &&
      props.userData.manifest._id &&
      props.data &&
      props.data.module
    ) {
      window.analytics.track(
        `Canceled ${
          props.data.cameraDetails ? "Edit" : "Add"
        } Camera pop up | ${props.data.module}`,
        {
          title: `Canceled ${
            props.data.cameraDetails ? "Edit" : "Add"
          } Camera pop up | ${props.data.module}`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
    props.data.setShow(false);
    setCamera("");
    setRtsp("");
    setManufacturer("");
    setRegion("");
    setSubRegion("");
    setLocation("");
    setCameraOfflineAlertDuration("15");

    // setStoredClipDuration("");
    // setCloudStorageStream("");
    setLocationList([]);
    setDvrIsPresentInCameraDetails(false);
    //    RTSP creating fields
    setShowRtspField(false);
    setIPAddress("");
    setPort("");
    setUsername("");
    setPassword("");
    setChannelId("");
    setError(defaultErrorLabels);
  };

  return (
    <Modal
      size="lg"
      show={props.data.show}
      onHide={() => {
        closeModal();
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="form-popup"
    >
      <Modal.Header closeButton>
        <div className="modal-title d-block">
          <h4 className="mb-2">
            {props.data.cameraDetails ? "Edit camera" : "Add Camera"}
          </h4>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-form">
          <form onSubmit={props.data.cameraDetails ? addCamera : updateCamera}>
            <div className="details mb-3">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Camera name</label>
                  <input
                    type="text"
                    value={camera}
                    onChange={(event) => {
                      setError({ ...error, camera: "" });

                      setCamera(event.target.value);
                    }}
                    class="form-control"
                    placeholder="e.g. Lobby area camera"
                  />
                  {error.camera ? (
                    <span className="error-msg">{error.camera}</span>
                  ) : null}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Manufacturer name</label>
                  <Select
                    value={manufacturer}
                    onChange={(selectedOption) => {
                      setError({ ...error, manufacturer: "" });
                      setManufacturer(selectedOption);
                    }}
                    options={manufacturerList}
                  />
                  {error.manufacturer ? (
                    <span className="error-msg">{error.manufacturer}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="details mb-3">
              <div className="row">
                {/*RTSP or credentials input fields */}
                <div className="col-md-12 mb-3">
                  <div className="row ml-0">
                    {props.data.cameraDetails ? null : (
                      <div>
                        <p className="fw-700 mr-1">Access Credentials</p>
                        <p>
                          {showRtspField ? (
                            <a
                              href="#"
                              className="link"
                              onClick={(event) => {
                                event.preventDefault();
                                setShowRtspField(!showRtspField);
                              }}
                            >
                              Enter details instead?{" "}
                            </a>
                          ) : (
                            <a
                              href="#"
                              className="link"
                              onClick={(event) => {
                                event.preventDefault();
                                setShowRtspField(!showRtspField);
                              }}
                            >
                              Have an RTSP URL Instead?{" "}
                            </a>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  {showRtspField ? (
                    dvrIsPresentInCameraDetails ? null : (
                      <div className={"row"}>
                        <div className="col-md-12">
                          <label htmlFor="inputEmail4">Public RTSP URL</label>
                          <input
                            type="url"
                            disabled={dvrIsPresentInCameraDetails}
                            className="form-control"
                            value={rtsp}
                            onChange={(event) => {
                              setError({ ...error, rtsp: "" });
                              setRtsp(event.target.value);
                              if (!validateRTSPUrl(event.target.value)) {
                                setError({
                                  ...error,
                                  rtsp: CameraError.invalidRTSP,
                                });
                              }
                            }}
                            placeholder="Enter the public RTSP URL"
                          />

                          {error.rtsp ? (
                            <span className="error-msg">{error.rtsp}</span>
                          ) : null}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className={"row"}>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="inputEmail4">Public IP address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={IPAddress}
                          onChange={(event) => {
                            setError({ ...error, ip: "" });
                            setIPAddress(event.target.value);

                            if (!validateIPaddress(event.target.value)) {
                              setError({ ...error, ip: CameraError.invalidIp });
                            }
                          }}
                          placeholder="Enter public IP or DDNS"
                        />
                        {error.ip ? (
                          <span className="error-msg">{error.ip}</span>
                        ) : null}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="inputEmail4">RTSP port</label>
                        <input
                          type="text"
                          className="form-control"
                          value={port}
                          onChange={(event) => {
                            setError({ ...error, port: "" });
                            setPort(event.target.value);
                          }}
                          placeholder="e.g. 554"
                        />
                        {error.port ? (
                          <span className="error-msg">{error.port}</span>
                        ) : null}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="inputEmail4">NVR username</label>
                        <input
                          type="text"
                          className="form-control"
                          value={username}
                          onChange={(event) => {
                            setError({ ...error, username: "" });

                            setUsername(event.target.value);
                          }}
                          name="NVR username"
                          placeholder="Enter username"
                          autoComplete="off"
                        />
                        {error.username ? (
                          <span className="error-msg">{error.username}</span>
                        ) : null}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="inputEmail4">Password</label>
                        <div className="p-relative">
                          <input
                            type={passwordShown ? "text" : "password"}
                            name="NVR password"
                            className="form-control"
                            value={password}
                            onChange={(event) => {
                              setError({ ...error, password: "" });
                              setPassword(event.target.value);
                            }}
                            placeholder="Enter password"
                            autoComplete="off"
                          />
                          {error.password ? (
                            <span className="error-msg">{error.password}</span>
                          ) : null}
                          <span
                            className="pwd"
                            onClick={togglePasswordVisiblity}
                          >
                            {passwordShown ? <IconView /> : <IconViewHide />}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6 ">
                        <label htmlFor="inputEmail4">Channel ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={channelId}
                          onChange={(event) => {
                            setError({ ...error, channelId: "" });

                            setChannelId(event.target.value);
                          }}
                          placeholder="Enter channel ID"
                        />
                        {error.channelId ? (
                          <span className="error-msg">{error.channelId}</span>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="credentials mb-3">
              <p className="fw-700">Add to Location</p>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Region & City</label>
                  <Select
                    styles={colourStyles}
                    isDisabled={props.data.cameraDetails}
                    value={subRegion}
                    onChange={(selectedOption) => {
                      setError({ ...error, region: "" });

                      /**
                       * To flush out previous value
                       * */
                      // setSubRegion([]);
                      setLocation([]);
                      setSubRegion(selectedOption);
                      setLocationList(
                        getSubregionOrLocation(selectedOption.value, "location")
                      );
                      // setSubregionList(getSubregionOrLocation(selectedOption.value, "city"))
                    }}
                    options={subregionList}
                  />

                  {error.region ? (
                    <span className="error-msg">{error.region}</span>
                  ) : null}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Location</label>
                  <Select
                    isDisabled={props.data.cameraDetails}
                    value={location}
                    onChange={(selectedOption) => {
                      setError({ ...error, branch: "" });

                      setLocation(selectedOption);
                    }}
                    options={locationList}
                  />

                  {error.branch ? (
                    <span className="error-msg">{error.branch}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="credentials mb-3">
              <p className="fw-700">Notifications</p>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">
                    Camera offline alert duration (minutes)
                  </label>
                  <input
                    value={cameraOfflineAlertDuration}
                    onChange={(event) => {
                      if (parseInt(event.target.value) >= 5)
                        setError({ ...error, cameraOfflineAlertDuration: "" });
                      if (
                        Service.validateCameraOfflineAlert(event.target.value)
                      )
                        setCameraOfflineAlertDuration(event.target.value);
                      else setCameraOfflineAlertDuration("");
                    }}
                    type="number"
                    className="form-control"
                    placeholder="e.g. 30"
                  />

                  {error.cameraOfflineAlertDuration ? (
                    <span className="error-msg">
                      {error.cameraOfflineAlertDuration}
                    </span>
                  ) : null}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Email</label>
                  <input
                    value={email}
                    onChange={(event) => {
                      if (event.target.value) setError({ ...error, email: "" });
                      setEmail(event.target.value);
                    }}
                    type="text"
                    className="form-control"
                    placeholder="Enter email"
                  />
                  {error.email ? (
                    <span className="error-msg">{error.email}</span>
                  ) : (
                    <small className="fs-12 fw-200 light-color">
                      Alert will be sent to these email ids
                    </small>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-link fs-14 btn-sm"
          onClick={() => {
            closeModal();
          }}
        >
          Cancel
        </button>
        {props.data.cameraDetails ? (
          <button
            type={"submit"}
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (
                props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.email &&
                props.userData.manifest &&
                props.userData.manifest.company &&
                props.userData.manifest.company.name &&
                props.userData.user._id &&
                props.userData.manifest._id &&
                props.data &&
                props.data.module
              ) {
                window.analytics.track(
                  `Clicked on Update Camera | ${props.data.module}`,
                  {
                    title: `Clicked on Update Camera | ${props.data.module}`,
                    email: props.userData.user.email,
                    username: props.userData.user.username,
                    companyName: props.userData.manifest.company.name,
                    user_id: props.userData.user._id,
                    company_id: props.userData.manifest._id,
                  }
                );
              }
              updateCamera();
            }}
          >
            Update Camera{" "}
          </button>
        ) : (
          <button
            type={"submit"}
            className="btn btn-primary btn-sm"
            onClick={(event) => {
              if (
                props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.email &&
                props.userData.manifest &&
                props.userData.manifest.company &&
                props.userData.manifest.company.name &&
                props.userData.user._id &&
                props.userData.manifest._id &&
                props.data &&
                props.data.module
              ) {
                window.analytics.track(
                  `Clicked on Add Camera | ${props.data.module}`,
                  {
                    title: `Clicked on Add Camera | ${props.data.module}`,
                    email: props.userData.user.email,
                    username: props.userData.user.username,
                    companyName: props.userData.manifest.company.name,
                    user_id: props.userData.user._id,
                    company_id: props.userData.manifest._id,
                  }
                );
              }
              addCamera(event);
            }}
          >
            Add Camera
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddCameraModal);
