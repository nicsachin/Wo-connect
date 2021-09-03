import React, { useEffect, useState } from "react";
import { IconInfoSvg } from "../../Common/Components/IconsComponent/Index";
import { Button, Modal } from "react-bootstrap";
import { segmentTrack } from "../../Services/segment";
import { showAlert } from "../../Services/showAlert";

const ContactSupport = (props) => {
  const [description, setDescription] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    if (!description || description.trim() === "") return;
    segmentTrack({
      title: props.title,
      description: description,
      task_id: props.taskId,
      checklist_id: props.checklistId,
    });
    showAlert("Your query has been submitted", "info");
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const onchange = (e) => {
    setDescription(e.target.value);
  };

  return (
    <div
      className="wrapper"
      style={{
        "max-width": "60%",
        "background-color": "#eff3fd",
        padding: "15px",
      }}
    >
      <div style={{ display: "-webkit-inline-box" }}>
        <IconInfoSvg />
        <p className="ml-2">
          <b>Need help setting up tasks? </b>Wobot Team is here to help you
          setup tasks while we work on your feedback to improve this flow
          further. Contact Support to help you out for a seamless experience.
        </p>
      </div>
      <span
        className="ml-4"
        style={{ color: "#3766E8", cursor: "pointer" }}
        onClick={handleShow}
      >
        Contact Support
      </span>
      <Modal show={show} onHide={() => setShow(false)} animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className={"modal-title d-block"}>Add a Comment</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            placeholder="comment"
            className="form-control"
            onChange={onchange}
          />
        </Modal.Body>
        <Modal.Footer className={"justify-content-between align-items-end"}>
          <Button
            className={"btn btn-primary px-4 btn-md"}
            onClick={handleClose}
          >
            send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContactSupport;
