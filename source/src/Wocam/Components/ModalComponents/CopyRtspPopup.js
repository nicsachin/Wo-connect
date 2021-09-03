import { Modal } from "react-bootstrap";
import React, { useState } from "react";
import callApi from "../../../Services/callApi";
import { API_BASE_URL } from "../../../Constants";
import { showAlert } from "../../../Services/showAlert";
import Service from "../../utils/Service";

function CopyRtspPopup(props) {
  //password state
  const [password, setPassword] = useState("");

  // action to copy rtsp
  function copyRtsp(cameraId, props) {
    try {
      callApi(
        `${API_BASE_URL}/rtsp/get/${cameraId}`,
        { method: "POST", body: JSON.stringify({ password }) },
        { showLoader: false, callManifest: false, loaderLabel: "" }
      )
        .then((res) => {
          if (res.status === 200 && res.data.rtsp) {
            Service.copyToClipboard(res.data.rtsp);
            closeModal(props);
          } else {
            showAlert("Rtsp not found", "error");
            closeModal(props);
          }
        })
        .catch((e) => {
          showAlert(e);
        });
    } catch (e) {}
  }

  //close the modal
  function closeModal(props) {
    setPassword("");
    props.onHide();
  }

  return (
    <Modal
      size="md"
      className="action-popup"
      show={props.visibility}
      onHide={() => {
        closeModal(props);
      }}
    >
      <Modal.Header closeButton>
        <div className="modal-title d-block">
          <h5 className="mb-2">Enter your password to perform this action</h5>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            copyRtsp(props.cameraId, props);
          }}
        >
          <input
            type="password"
            value={password}
            placeholder={"**********"}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className={"form-control"}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-link fs-14 btn-sm"
          onClick={() => {
            closeModal(props);
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            copyRtsp(props.cameraId, props);
          }}
        >
          Copy
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default CopyRtspPopup;
