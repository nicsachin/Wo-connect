import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { API_BASE_URL } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
import {
  IconArrowNextRight,
  IconHelp,
} from "../../../../Common/Components/IconsComponent/Index";
import AddUser from "./addUser";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import renderHTML from "react-render-html";
import ContactSupport from "../../../Containers/ContactSupport";
import replaceHtml from "../../../../Services/replaceHtml";

const AssignUserComponent = (props) => {
  let body = [];

  const [executiveUser, setExecutiveUser] = useState([]);
  const [assigneeUser, setAssigneeUser] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [deletedUsers, setDeletedUsers] = useState([]);

  const deleteUser = async (deletedUsers) => {
    await callApi(`${API_BASE_URL}/assign/user/delete`, {
      method: "DELETE",
      body: JSON.stringify({
        ids: deletedUsers.map((o) => o.value),
      }),
    });
  };

  const saveAndNext = async () => {
    for (let i of props.locations) {
      if (
        !i.assignee ||
        !i.executive ||
        !i.assignee.length ||
        !i.executive.length
      )
        return showAlert(
          "Please add at least one assignee and one executive for each location",
          "error"
        );
      for (let o of i.assignee || []) {
        body.push({
          user: o.value,
          location: i._id,
          type: "Assignee",
        });
      }
      for (let o of i.executive || []) {
        body.push({
          user: o.value,
          location: i._id,
          type: "Executive",
        });
      }
    }
    console.log(deletedUsers);

    let del = deletedUsers.filter(
      (o) => !body.find((i) => o.value === i.user && o.location === i.location)
    );

    if (del.length) await deleteUser(del);

    if (!executiveUser.length || !assigneeUser.length)
      return showAlert(
        "Please add at least one assignee and one executive",
        "error"
      );

    if (body.length) {
      try {
        const resp = await callApi(
          `${API_BASE_URL}/assign/user/${props.taskId}`,
          {
            method: "POST",
            body: JSON.stringify(body),
          }
        );
        if (resp && resp.status === 200) {
          if (
            props &&
            props.userData &&
            props.userData.user &&
            props.userData.user.email &&
            props.userData.manifest &&
            props.userData.manifest.company &&
            props.userData.manifest.company.name &&
            props.userData.user._id &&
            props.userData.manifest._id
          ) {
            window.analytics.track(`Step 4 | Assign user step completed`, {
              title: `Step 4 | Assign user step completed`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            });
          }
        }
      } catch (e) {
        showAlert(e, "error");
      }
    }
    showAlert("Task Saved");
    props.saveAndGoToNext();
    props.fetchList();
  };

  const getInfo = (val) => {
    if ((val || "").toLowerCase() === "human intelligence") {
      return "Task involves human-viewing of the videos for the detection";
    } else if ((val || "").toLowerCase() === "artificial intelligence") {
      return `Task involves Wobot's AI models doing the detection automatically`;
    } else if ((val || "").toLowerCase() === "manual") {
      return "";
    }
  };

  return (
    <div className="wobot-panel-main">
      <Modal
        show={showDescription}
        onHide={() => setShowDescription(false)}
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="modal-title d-block">
              {props.selectedTask && (props.selectedTask.model || "")}
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.selectedTask &&
            props.selectedTask.description &&
            renderHTML(replaceHtml(props.selectedTask.description))}
        </Modal.Body>
        <Modal.Footer className="justify-content-between align-items-end">
          <Button
            className="btn btn-primary px-4 btn-md"
            onClick={() => setShowDescription(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="main-body-wrapper">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-6 align-self-center mb-4">
            <div className="title">
              <h3 className="fs-22 mb-3 header-primary">
                {(props.selectedTask && props.selectedTask.model) || ""}
                <span
                  className="ml-2 curser-btn IconHelp"
                  onClick={() => setShowDescription(true)}
                >
                  <IconHelp />
                </span>
              </h3>
              {props.selectedTask &&
                props.selectedTask.taskType &&
                ["right"].map((placement, index) => (
                  <OverlayTrigger
                    key={index}
                    placement={placement}
                    overlay={
                      <Tooltip id={`tooltip-${placement}`}>
                        {getInfo(props.selectedTask.taskType)}
                      </Tooltip>
                    }
                  >
                    <div className="tag-block tag-lg tag-default">
                      {props.selectedTask.taskType}
                    </div>
                  </OverlayTrigger>
                ))}
            </div>
          </div>
          <div className="col-12">
            <div className="steps-block">
              <ul className="list-inline progressbar">
                <li
                  className={`list-inline-item ${
                    props.isCompleted ? "isCompleted active" : "active"
                  }`}
                >
                  <span
                    className="curser-btn"
                    onClick={() => props.setCurrentIndex(0)}
                  >
                    configure
                  </span>
                </li>
                <li
                  className={`list-inline-item ${
                    props.isCompleted ? "isCompleted active" : "active"
                  }`}
                >
                  <span
                    className="curser-btn"
                    onClick={() => props.setCurrentIndex(1)}
                  >
                    Select Camera
                  </span>
                </li>
                <li
                  className={`list-inline-item ${
                    props.isCompleted ? "isCompleted active" : "active"
                  }`}
                >
                  <span
                    className="curser-btn"
                    onClick={() => props.setCurrentIndex(2)}
                  >
                    Add Schedule
                  </span>
                </li>
                <li
                  className={`list-inline-item ${
                    props.isCompleted ? "isCompleted active" : "active"
                  }`}
                >
                  <span
                    className="curser-btn"
                    onClick={() => props.setCurrentIndex(3)}
                  >
                    Assign User
                  </span>
                </li>
              </ul>
            </div>
            <div className="mxw-850 info-content mb-4">
              <p>
                Select the team members/users who will be responsible to
                complete this task as well as manage the raised tickets.
              </p>
            </div>
            <div className="block">
              {props.locations.map((el, index) => {
                return (
                  <div className="block" key={index}>
                    <AddUser
                      key={index}
                      deletedUsers={deletedUsers}
                      el={el}
                      index={index}
                      taskId={props.taskId}
                      setExecutiveUser={setExecutiveUser}
                      setAssigneeUser={setAssigneeUser}
                      setDeletedUsers={setDeletedUsers}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <ContactSupport
                checklistId={props.checklistId}
                taskId={props.selectedTask._id}
                title={"Step 4 | Contact Support | Checklist Set Up"}
              />
            </div>
            <div className="block-group mt-5">
              <Link
                to="#"
                className="btn btn-icon-block btn-primary btn-md"
                onClick={() => {
                  saveAndNext();
                }}
              >
                Save and Go To Next Task <IconArrowNextRight />{" "}
              </Link>
              <Link to="#" className="link" onClick={props.saveAndGoToNext}>
                Skip task{" "}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(AssignUserComponent);
