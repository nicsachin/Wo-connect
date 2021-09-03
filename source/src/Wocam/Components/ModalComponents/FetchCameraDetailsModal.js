import React, { useEffect, useState } from "react";
import { FormCheck, Modal } from "react-bootstrap";
import "./style.scss";

const FetchCameraDetailsModal = (props) => {
  const [activeCameras, setActiveCameras] = useState([]);
  const [channelIds, setChannelIds] = useState([]);
  const countOfCamerasBasedOnStatus = (cameras) => {
    let obj = { active: [], inactive: [] };
    for (let i = 0; i < cameras.length; i++) {
      if (cameras[i].status === "Active") {
        obj.active.push(cameras[i]);
      }
    }
    setActiveCameras(obj.active);
    return obj;
  };

  useEffect(() => {
    if (props.data?.apiPayload?.connectedCamera)
      countOfCamerasBasedOnStatus(props.data.apiPayload.connectedCamera);
  }, [props.data]);

  const closeModal = () => {
    setActiveCameras([]);
    setChannelIds([]);
    props.data.closeModal();

    props.data.setShow(false);
  };

  const getCameraListHeader = (props) => {
    if (!activeCameras.length) return "We are not able to connect any camera.";
    return `We’re able to connect ${activeCameras.length} out of the ${props.data.apiPayload?.connectedCamera?.length} cameras. These cameras were on the following channels:`;
  };

  const handleToggleChange = (checked, channel) => {
    if (checked && channelIds.indexOf(channel) === -1) {
      setChannelIds([...channelIds, channel]);
    } else if (!checked) {
      setChannelIds(channelIds.filter((el) => el !== channel));
    }
  };

  useEffect(() => {
    setChannelIds([]);
  }, [props.data.show]);

  const cameraExistInSystem = (channelId) =>
    props.data.dvrDetails.connectedCamera.filter(
      (el) => el.channelId === channelId
    ).length > 0;

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
            {activeCameras.length + " Active Cameras Detected"}
          </h4>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-form">
          <p>{getCameraListHeader(props)}</p>

          {/*based on update or add request*/}
          {/*update request*/}

          {props.data?.dvrDetails &&
          Object.keys(props.data.dvrDetails).length ? (
            <div className={"wrapper-block"}>
              <div className={"row"}>
                <div className={"col-6"}>
                  <p className={"fs-14 fw-500"}>Existing cameras:</p>
                  <ul className={"refetch-cam-list"}>
                    {props.data?.dvrDetails?.connectedCamera
                      ? props.data.dvrDetails.connectedCamera.map(
                          (el, index) => {
                            //   if (el.status === "Active")
                            return (
                              <li className={"type-list-items"} key={index}>
                                <span className={"mr-2"}>{el.camera}</span>{" "}
                                <small>({el.status})</small>
                                {/*<small>{statusMapper(el.channelId)}</small>*/}
                              </li>
                            );
                          }
                        )
                      : null}
                  </ul>
                </div>
                <div className={"col-6"}>
                  <p className={"fs-14 fw-500"}>New cameras:</p>
                  <ul className={"refetch-cam-list"}>
                    {props.data?.apiPayload?.connectedCamera
                      ? props.data.apiPayload.connectedCamera.map(
                          (el, index) => {
                            // if (el.status === "Inactive" && checkIfActive(el.channelId))
                            if (
                              el.status === "Active" &&
                              !cameraExistInSystem(el.channelId)
                            )
                              return (
                                <li
                                  className={
                                    "type-list-items fetchCameraContainer"
                                  }
                                  key={index}
                                >
                                  <div>
                                    <span className={"mr-2"}>
                                      {props.data.dvrDetails.dvr}-{el.camera}
                                    </span>{" "}
                                    <small>({el.status})</small>
                                  </div>
                                  <div>
                                    {/*<small>{statusMapper(el.rtsp)}</small>*/}
                                    <label className={"ml-4"}>
                                      <FormCheck
                                        id={`switchEnabled${el.channelId}`}
                                        type="switch"
                                        checked={
                                          channelIds.indexOf(el.channelId) !==
                                          -1
                                        }
                                        onChange={(event) => {
                                          handleToggleChange(
                                            event.target.checked,
                                            el.channelId
                                          );
                                        }}
                                      />
                                    </label>
                                  </div>
                                </li>
                              );
                          }
                        )
                      : null}
                  </ul>
                </div>
              </div>
              <div className={"row"}>
                <div className={"col-12 mt-4"}>
                  <p>
                    If you continue, these two lists will be merged and
                    available in the system.
                    <br />
                    The existing disconnected cameras will be deactivated, as a
                    result of which their tasks will be halted.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <ol className={"type-list mb-2"}>
                {activeCameras && activeCameras.length && props.data.apiPayload
                  ? activeCameras.map((el, index) => {
                      return (
                        <li
                          className={"type-list-items fetchCameraContainer"}
                          key={index}
                        >
                          <div>
                            <span className={"mr-2"}>
                              {props.data.apiPayload.dvr}-{el.camera}
                            </span>
                            <small>({el.status})</small>
                          </div>
                          <div>
                            <label className={"ml-4"}>
                              <FormCheck
                                id={`switchEnabled${el.channelId}`}
                                type="switch"
                                checked={
                                  channelIds.indexOf(el.channelId) !== -1
                                }
                                onChange={(event) => {
                                  handleToggleChange(
                                    event.target.checked,
                                    el.channelId
                                  );
                                }}
                              />
                            </label>
                          </div>
                        </li>
                      );
                    })
                  : null}
              </ol>
              {/*this will be shown when some cameras are not fetched properly or are inactive*/}
              {activeCameras.length ===
              props.data.apiPayload?.connectedCamera?.length ? (
                <></>
              ) : (
                <p>
                  If you're unable to see other cameras, maybe they're not
                  functioning properly or are facing network issues. These
                  cameras can always be reconnected later through NVR details
                  page.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-tertiary btn-sm"
          onClick={() => {
            closeModal();
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            let camerasToConnect = channelIds.length
              ? props.data.apiPayload.connectedCamera.filter(
                  (el) => channelIds.indexOf(el.channelId) !== -1
                )
              : [];

            if (
              props.data.dvrDetails &&
              props.data.dvrDetails.connectedCamera.length
            ) {
              for (
                let i = 0;
                i < props.data.dvrDetails.connectedCamera.length;
                i++
              ) {
                let statusToAdd =
                  props.data.dvrDetails.connectedCamera[i].status;
                if (
                  props?.data?.apiPayload?.connectedCamera &&
                  props.data.apiPayload.connectedCamera.length
                ) {
                  let obj = props.data.apiPayload.connectedCamera.filter(
                    (el) =>
                      el.channelId ===
                      props.data.dvrDetails.connectedCamera[i].channelId
                  );
                  camerasToConnect.push({ ...obj[0], status: statusToAdd });
                }
              }
            }
            props.data.successCallback(camerasToConnect);
          }}
        >
          {props.data.successLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default FetchCameraDetailsModal;
