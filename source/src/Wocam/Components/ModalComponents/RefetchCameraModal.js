import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import {
  IconView,
  IconViewHide,
} from "../../../Common/Components/IconsComponent/Index";
import Select from "react-select";
import callApi from "../../../Services/callApi";
import { API_BASE_URL } from "../../../Constants";
import { showAlert } from "../../../Services/showAlert";
import "../RecorderListComponent/RecorderDetailsComponent/style.scss";
import FetchCameraDetailsModal from "./FetchCameraDetailsModal";
import { getFetchCameraLoadingLabel } from "../../Resources";

const RefetchCameraModalComponent = (props) => {
  const [password, setPassword] = useState("");
  const [cameraFetched, setCameraFetched] = useState(false);
  const [cameraAdded, setCameraAdded] = useState([]);
  const [show, setShow] = useState(false);
  const [apiPayload, setApiPayload] = useState({});

  const refetchCameraApiCall = async () => {
    try {
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
          `Click on fetch Cameras | ${props.data.module}`,
          {
            title: `Click on fetch Cameras | ${props.data.module}`,
            email: props.userData.user.email,
            username: props.userData.user.username,
            companyName: props.userData.manifest.company.name,
            user_id: props.userData.user._id,
            company_id: props.userData.manifest._id,
          }
        );
      }
      if (password) {
        /**
         * Fetch Camera them add dvr
         * */
        let fetchCameraDetails = await callApi(
          `${API_BASE_URL}/fetch-camera`,
          {
            method: "POST",
            body: JSON.stringify({
              host: props.data.dvrDetails.host,
              port: props.data.dvrDetails.port,
              username: props.data.dvrDetails.username,
              password,
              channels: `${props.data.dvrDetails.channels}`,
              stream: "sub",
              manufacturer: props.data.dvrDetails.manufacturer,
            }),
          },
          {
            showLoader: true,
            callManifest: true,
            loaderLabel: getFetchCameraLoadingLabel(
              props.data.dvrDetails.channels
            ),
          }
        );

        if (
          fetchCameraDetails.status === 200 &&
          fetchCameraDetails.data &&
          fetchCameraDetails.data.length
        ) {
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
              `fetched cameras successfully| ${props.data.module}`,
              {
                title: `fetched cameras successfully| ${props.data.module}`,
                email: props.userData.user.email,
                username: props.userData.user.username,
                companyName: props.userData.manifest.company.name,
                user_id: props.userData.user._id,
                company_id: props.userData.manifest._id,
              }
            );
          }

          let apiBody = {
            channels: `${props.data.dvrDetails.channels}`,
            dvr: props.data.dvrDetails.dvr,
            manufacturer: props.data.dvrDetails.manufacturer,
            host: props.data.dvrDetails.host,
            port: props.data.dvrDetails.port,
            username: props.data.dvrDetails.username,
            password,
            region: props.data.dvrDetails._region,
            stream: "sub",
            city: props.data.dvrDetails._city,
            location: props.data.dvrDetails._location,
            timezone: props.data.deviceInfo
              ? props.data.deviceInfo.timeZone
              : null,
            cameraOfflineAlertDuration:
              props.data.dvrDetails.cameraOfflineAlertDuration,
            emailIds: props.data.dvrDetails.emailIds,
          };
          apiBody = { ...apiBody, connectedCamera: fetchCameraDetails.data };
          setApiPayload(apiBody);
          setShow(true);
          closeModal();
        }
      } else showAlert("Password is required", "error");
    } catch (e) {
      showAlert(e, "error");
    }
  };

  const updateCameraApiCall = async (connectedCamera) => {
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
        `Clicked on Update from refetch cameras pop up| ${props.data.module}`,
        {
          title: `Clicked on Update from refetch cameras pop up| ${props.data.module}`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
    try {
      let payload = { ...apiPayload, connectedCamera };

      let updateCameraResponse = await callApi(
        `${API_BASE_URL}/dvr/update/${props.data.dvrDetails._id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (updateCameraResponse.status === 200) {
        showAlert(updateCameraResponse.message);
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
            `Updated cameras successfully| ${props.data.module}`,
            {
              title: `Updated cameras successfully| ${props.data.module}`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            }
          );
        }
        let dvr = await callApi(
          `${API_BASE_URL}/dvr/${props.data.dvrDetails._id}`
        );
        if (dvr.status === 200 && dvr.data) {
          props.data.setDvrDetails(dvr.data);
        }
        closeModal();
        setShow(false);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  const closeModal = () => {
    if (
      props &&
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
        `Closed refetch cameras pop up | ${props.data.module}`,
        {
          title: `Closed refetch cameras pop up | ${props.data.module}`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
    setPassword("");
    setCameraAdded([]);
    setCameraFetched(false);

    //props.data.closeModal();
    props.data.setRefetchCameraModalVisiblity(false);
  };

  return (
    <div>
      {/*    Fetch camera details modal*/}
      <FetchCameraDetailsModal
        data={{
          show,
          closeModal,
          setShow,
          apiPayload,
          dvrDetails: props.data.dvrDetails,
          successLabel:
            props.data.dvrDetails && Object.keys(props.data.dvrDetails).length
              ? "Continue & Update NVR"
              : " Continue & Add NVR",
          successCallback: (connectedCamera) => {
            updateCameraApiCall(connectedCamera);
          },
        }}
      />
      {/*    */}
      <Modal
        className="action-popup"
        show={props.data.visibility}
        onHide={() => {
          closeModal();
        }}
      >
        <Modal.Header closeButton>
          <h6 className="fw-600">Access credentials</h6>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-popup">
            <div className="credentials mb-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Public IP address</label>
                  <input
                    value={props.data.dvrDetails.host}
                    disabled={true}
                    type="text"
                    className="form-control"
                    placeholder=""
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">RTSP Port</label>
                  <input
                    value={props.data.dvrDetails.port}
                    disabled={true}
                    type="number"
                    className="form-control"
                    placeholder="554"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">NVR username</label>
                  <input
                    value={props.data.dvrDetails.username}
                    disabled={true}
                    type="text"
                    className="form-control"
                    placeholder="Enter Username"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">NVR password</label>
                  <div className="p-relative">
                    <input
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                      }}
                      type={props.data.passwordShown ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter password"
                    />
                    <span
                      className="pwd"
                      onClick={props.data.togglePasswordVisiblity}
                    >
                      {props.data.passwordShown ? (
                        <IconView />
                      ) : (
                        <IconViewHide />
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Channels Supported</label>
                  <Select
                    value={{
                      label: props.data.dvrDetails.channels,
                      value: props.data.dvrDetails.channels,
                    }}
                    isDisabled={true}
                  ></Select>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-tertiary btn-sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            className="btn btn-primary btn-sm"
            onClick={() => {
              refetchCameraApiCall();
            }}
          >
            Fetch cameras
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(RefetchCameraModalComponent);
