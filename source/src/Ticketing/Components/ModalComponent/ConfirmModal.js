import React from "react";
import { Modal } from "react-bootstrap";
import "./style.scss";

const ConfirmModal = (props) => {
  return (
    <Modal
      className="action-popup"
      show={props.visibility}
      onHide={props.onHide}
    >
      {/* <Modal.Header /> */}
      <Modal.Body>
        <div className="modal-popup mt-2">
          <p className="fs-18 fw-500">{props.headerText}</p>
          <p className="mb-0 fs-14">{props.paragraphText}</p>
        </div>
      </Modal.Body>
      <div className="divider" />
      <Modal.Footer>
        <div className="align-right m-0">
          <button
            variant="secondary"
            // className="btn-tertiary btn-xs btn"
            className="btn btn-link fw-400 fs-14 btn-sm"
            onClick={props.cancelOnclick}
          >
            Cancel
          </button>
          <button
            variant="primary"
            className="btn btn-primary ml-2"
            onClick={props.confirmOnclick}
          >
            Confirm
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
