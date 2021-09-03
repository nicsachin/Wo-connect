import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import {
  IconView,
  IconViewHide,
} from "../../../Common/Components/IconsComponent/Index";
import { getSubregionOrLocation } from "../../../Services/wocam";
import { validateIPaddress } from "../../../Services/validation";
import callApi from "../../../Services/callApi";
import { API_BASE_URL } from "../../../Constants";
import { showAlert } from "../../../Services/showAlert";
import { connect } from "react-redux";
import {
  CameraError,
  dvrError,
  getFetchCameraLoadingLabel,
} from "../../Resources";
import FetchCameraDetailsModal from "./FetchCameraDetailsModal";
import Service from "../../utils/Service";
import { colourStyles } from "../../../Services/colourStyles";

let defaultOptionValue = { label: "All", value: "" };
const channelList = [
  { label: "4", value: "4" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
  { label: "32", value: "32" },
  { label: "64", value: "64" },
];

let defaultErrorLabels = {
  dvr: "",
  manufacturer: "",
  ip: "",
  port: "",
  username: "",
  password: "",
  channels: "",
  region: "",
  branch: "",
  rtsp: "",
};
const AddDvrModal = (props) => {
  /**
   * React select
   */
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

  /**
   * for add dvr
   * */
  const [dvr, setDvr] = useState("");
  const [ip, setIp] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [location, setLocation] = useState("");
  const [port, setPort] = useState("");
  const [channel, setChannel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cameraOfflineAlertDuration, setCameraOfflineAlertDuration] = useState(
    "15"
  );
  const [notifyUsers, setNotifyUsers] = useState("");
  const [loading, setLoading] = useState(false);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [subregionList, setSubregionList] = useState([]);
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [locationList, setLocationList] = useState([]);
  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(true);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };
  const [error, setError] = useState(defaultErrorLabels);

  const [show, setShow] = useState(false);
  const [apiPayload, setApiPayload] = useState({});

  /**
   * Populate manufacturers
   * */
  const initializeFields = () => {
    if (!notifyUsers) {
      setNotifyUsers(Service.getEmailFromManifest());
    }
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

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      dvr: dvr,
      manufacturer: manufacturer.value,
      ip,
      port,
      username,
      password,
      region: subRegion.value,
      branch: location.value,
      channels: channel.value,
      notifyUsers,
      cameraOfflineAlertDuration,
    };

    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: dvrError[key] };
        validationSuccess = false;
      }
    }

    if (
      cameraOfflineAlertDuration &&
      parseInt(cameraOfflineAlertDuration) < 5
    ) {
      errorInForm = {
        ...errorInForm,
        cameraOfflineAlertDuration: dvrError.cameraOfflineAlertDuration,
      };
      validationSuccess = false;
    }

    if (!notifyUsers) {
      errorInForm = { ...errorInForm, notifyUsers: dvrError.email };
      validationSuccess = false;
    }
    setError(errorInForm);
    return validationSuccess;
  };

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
        `Canceled ${props.data.dvrDetails ? "Edit" : "Add"} DVR/NVR pop up | ${
          props.data.module
        }`,
        {
          title: `Canceled ${
            props.data.dvrDetails ? "Edit" : "Add"
          } DVR/NVR pop up | ${props.data.module}`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
    props.data.setShow(false);
    setDvr("");
    setIp("");
    setManufacturer("");
    setRegion("");
    setSubRegion("");
    setLocation("");
    setPort("");
    setChannel("");
    // setSubregionList([]);
    setLocationList([]);
    setUsername("");
    setPassword("");
    setLoading(false);
    setCameraOfflineAlertDuration("15");
    setShow(false);

    setError(defaultErrorLabels);
  };

  const fetchCameraDetails = async () => {
    if (handleValidation()) {
      setLoading(true);
      let apiBody = Service.trimPayload({
        dvr,
        manufacturer: manufacturer.value,
        host: ip,
        port,
        username,
        password,
        region: subRegion.parent,
        stream: "sub",
        city: subRegion.value,
        location: location.value,
        timezone: props.deviceInfo ? props.deviceInfo.timeZone : null,
        cameraOfflineAlertDuration,
        emailIds: notifyUsers,
      });

      try {
        /**
         * Fetch Camera them add dvr
         * */
        let fetchCameraDetails = await callApi(
          `${API_BASE_URL}/fetch-camera`,
          {
            method: "POST",
            body: JSON.stringify({
              host: ip,
              port,
              username,
              password,
              channels: channel.value,
              stream: "sub",
              manufacturer: manufacturer.value,
            }),
          },
          {
            showLoader: true,
            callManifest: true,
            loaderLabel: getFetchCameraLoadingLabel(channel.value),
          }
        );

        if (fetchCameraDetails.status === 200 && fetchCameraDetails.data) {
          apiBody = {
            ...apiBody,
            connectedCamera: fetchCameraDetails.data,
            channels: channel.value,
          };

          setApiPayload(apiBody);
          props.data.setShow(false);
          setShow(true);
        } else {
        }
      } catch (e) {
        setLoading(false);
        showAlert(e, "error");
      }
    } else return 0;
  };

  /**
   * To add dvr
   * */
  const addDvr = async (connectedCamera) => {
    try {
      let payload = { ...apiPayload, connectedCamera };
      let res = await callApi(`${API_BASE_URL}/setup/dvr`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.status === 200) {
        /**
         * @checkAndCreateLiveView
         * */
        let camerasPayload = [];
        for (let k in res.data.cameraDetails) {
          if (
            res.data.cameraDetails[k].status === "Active" &&
            camerasPayload.length <= 6
          ) {
            camerasPayload.push(res.data.cameraDetails[k]._id);
          }
        }
        if (camerasPayload.length) {
          await Service.checkAndCreateLiveView(camerasPayload);
        }
        props.data.successCallback();
        setLoading(false);
        showAlert(res.message);
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
            `Added DVR successfully | ${props.data.module}`,
            {
              title: `Added DVR successfully | ${props.data.module}`,
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
      setLoading(false);
      showAlert(e, "error");
    }
  };

  const updateDvr = async (connectedCamera) => {
    let payload = { ...apiPayload, connectedCamera };
    let res = await callApi(
      `${API_BASE_URL}/dvr/update/${props.data.dvrDetails._id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    if (res.status === 200) {
      setLoading(false);
      let dvr = await callApi(
        `${API_BASE_URL}/dvr/${props.data.dvrDetails._id}`
      );
      if (dvr.status === 200 && dvr.data) {
        props.data.setDvrDetails(dvr.data);
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
          `DVR edited successfully | ${props.data.module}`,
          {
            title: `DVR edited successfully | ${props.data.module}`,
            email: props.userData.user.email,
            username: props.userData.user.username,
            companyName: props.userData.manifest.company.name,
            user_id: props.userData.user._id,
            company_id: props.userData.manifest._id,
          }
        );
      }
      showAlert(res.message);
      closeModal();
    }
  };

  useEffect(() => {
    initializeFields();
  }, [props.userData]);

  useEffect(() => {
    if (props.data.dvrDetails && Object.keys(props.data.dvrDetails).length) {
      setDvr(props.data.dvrDetails.dvr);
      setManufacturer({
        label: props.data.dvrDetails.manufacturer,
        value: props.data.dvrDetails.manufacturer,
      });
      setIp(props.data.dvrDetails.host);
      setPort(props.data.dvrDetails.port);
      setChannel({
        label: props.data.dvrDetails.channels,
        value: props.data.dvrDetails.channels,
      });
      setUsername(props.data.dvrDetails.username);
      setSubRegion({
        label: props.data.dvrDetails.city,
        value: props.data.dvrDetails._city,
        parent: props.data.dvrDetails._region,
      });
      setLocation({
        label: props.data.dvrDetails.location,
        value: props.data.dvrDetails._location,
      });
      setCameraOfflineAlertDuration(
        props.data.dvrDetails.cameraOfflineAlertDuration
      );
    }
  }, [props.data]);

  return (
    <div>
      <FetchCameraDetailsModal
        data={{
          show,
          setShow,
          closeModal,
          apiPayload,
          dvrDetails: props.data.dvrDetails,
          successLabel:
            props.data.dvrDetails && Object.keys(props.data.dvrDetails).length
              ? "Continue & Update NVR"
              : " Continue & Add NVR",
          successCallback: (camerasToConnect) => {
            props.data.dvrDetails && Object.keys(props.data.dvrDetails).length
              ? updateDvr(camerasToConnect)
              : addDvr(camerasToConnect);
          },
        }}
      />
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
              {props.data.dvrDetails ? "Edit NVR" : "Add NVR"}
            </h4>
          </div>
        </Modal.Header>

        <Modal.Body>
          <div className="modal-form">
            <form>
              <div className="details mb-4">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="inputEmail4">NVR name</label>
                    <input
                      type="text"
                      value={dvr}
                      onChange={(e) => {
                        setDvr(e.target.value);
                        setError({ ...error, dvr: "" });
                      }}
                      className="form-control"
                      placeholder="e.g. Main Office NVR 1"
                    />
                    {error.dvr ? (
                      <span className="error-msg">{error.dvr}</span>
                    ) : null}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="inputEmail4">Manufacturer name</label>
                    <Select
                      options={manufacturerList}
                      value={manufacturer}
                      onChange={(selectedOption) => {
                        setError({ ...error, manufacturer: "" });
                        setManufacturer(selectedOption);
                      }}
                    />
                    {error.manufacturer ? (
                      <span className="error-msg">{error.manufacturer}</span>
                    ) : null}
                  </div>
                </div>
                <div className="mb-3  mt-3">
                  <div className="credentials mb-3">
                    <p className="fw-700">Access Credentials</p>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inputEmail4">Public IP address</label>

                      <input
                        value={ip}
                        onChange={(e) => {
                          setError({ ...error, ip: "" });
                          setIp(e.target.value);
                        }}
                        type="text"
                        className="form-control"
                        placeholder="Enter public IP or DDNS"
                      />
                      {error.ip ? (
                        <span className="error-msg">{error.ip}</span>
                      ) : null}
                      {/* {
                                    isIpAddressValid && <span className="error-msg">
                                        Provide an IP Address
                                      </span>
                                  } */}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inputEmail4">RTSP port</label>
                      <input
                        value={port}
                        onChange={(event) => {
                          setError({ ...error, port: "" });
                          setPort(event.target.value);
                        }}
                        type="number"
                        className="form-control"
                        placeholder="e.g. 554"
                      />
                      {error.port ? (
                        <span className="error-msg">{error.port}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inputEmail4">NVR username</label>
                      <input
                        value={username}
                        onChange={(e) => {
                          setError({ ...error, username: "" });
                          setUsername(e.target.value);
                        }}
                        type="text"
                        className="form-control"
                        name="NVR username"
                        placeholder="Enter username"
                        autoComplete="off"
                      />

                      {error.username ? (
                        <span className="error-msg">{error.username}</span>
                      ) : null}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inputEmail4">NVR password</label>
                      <div className="p-relative">
                        <input
                          value={password}
                          onChange={(event) => {
                            setError({ ...error, password: "" });
                            setPassword(event.target.value);
                          }}
                          type={passwordShown ? "text" : "password"}
                          name="NVR password"
                          className="form-control"
                          placeholder="Enter password"
                          autoComplete="off"
                        />

                        {error.password ? (
                          <span className="error-msg">{error.password}</span>
                        ) : null}

                        <span className="pwd" onClick={togglePasswordVisiblity}>
                          {passwordShown ? <IconView /> : <IconViewHide />}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inputEmail4">Channels Supported</label>
                      <Select
                        value={channel}
                        onChange={(selectedValue) => {
                          setError({ ...error, channels: "" });
                          setChannel(selectedValue);
                        }}
                        options={channelList}
                      ></Select>

                      {error.channels ? (
                        <span className="error-msg">{error.channels}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="credentials mb-4">
                <p className="fw-700">Add to Location</p>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="inputEmail4">Region & City</label>
                    <Select
                      styles={colourStyles}
                      value={subRegion}
                      isDisabled={props.data.dvrDetails}
                      onChange={(selectedOption) => {
                        setError({ ...error, region: "" });

                        setLocation([]);
                        setSubRegion(selectedOption);
                        setLocationList(
                          getSubregionOrLocation(
                            selectedOption.value,
                            "location"
                          )
                        );
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
                      value={location}
                      isDisabled={props.data.dvrDetails}
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
              <div className="credentials mb-4">
                <p className="fw-700">Notification Settings</p>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="inputEmail4">
                      Camera offline alert duration (minutes)
                    </label>
                    <input
                      value={cameraOfflineAlertDuration}
                      onChange={(event) => {
                        if (parseInt(event.target.value) >= 5)
                          setError({
                            ...error,
                            cameraOfflineAlertDuration: "",
                          });
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
                    <label htmlFor="inputEmail4">Notify users</label>
                    <input
                      value={notifyUsers}
                      onChange={(event) => {
                        if (event.target.value)
                          setError({ ...error, notifyUsers: "" });
                        setNotifyUsers(event.target.value);
                      }}
                      type="text"
                      className="form-control"
                      placeholder="Enter email"
                    />
                    {error.notifyUsers ? (
                      <span className="error-msg">{error.notifyUsers}</span>
                    ) : null}
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

          {props.data.dvrDetails ? (
            <button
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
                    `Clicked on Update DVR/NVR | ${props.data.module}`,
                    {
                      title: `Clicked on Update DVR/NVR | ${props.data.module}`,
                      email: props.userData.user.email,
                      username: props.userData.user.username,
                      companyName: props.userData.manifest.company.name,
                      user_id: props.userData.user._id,
                      company_id: props.userData.manifest._id,
                    }
                  );
                }
                fetchCameraDetails();
              }}
            >
              Update NVR
            </button>
          ) : (
            <button
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
                    `Clicked on Add Dvr | ${props.data.module}`,
                    {
                      title: `Clicked on Add Dvr | ${props.data.module}`,
                      email: props.userData.user.email,
                      username: props.userData.user.username,
                      companyName: props.userData.manifest.company.name,
                      user_id: props.userData.user._id,
                      company_id: props.userData.manifest._id,
                    }
                  );
                }
                fetchCameraDetails();
                // addDvr()
              }}
            >
              Add NVR
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddDvrModal);
