import React, { useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./style.scss";
import { API_BASE_URL } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
import {
  IconArrowNextRight,
  IconHelp,
} from "../../../../Common/Components/IconsComponent/Index";
import ListSchedule from "./listSchedule";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import renderHTML from "react-render-html";
import AddScheduleModal from "../../../../Settings/Components/ModalComponents/AddScheduleModal";
import ContactSupport from "../../../Containers/ContactSupport";
import replaceHtml from "../../../../Services/replaceHtml";

const ScheduleComponent = (props) => {
  const [scheduleShow, setScheduleShow] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [action, setAction] = useState();

  const handleClose = () => {
    setScheduleShow(false);
  };

  const addCameraAndSchedule = async () => {
    if (!props.taskId) return;
    const data = [];
    let error = false;
    (props.locations || []).forEach((obj) => {
      const c = props.selectedCamera.filter((c) => c._location === obj.id);
      let o = {
        location: obj.id,
        schedules: (obj.schedule || []).map((el) => el._id),
        camera: c.map((el) => el._id),
      };
      data.push(o);
      if (!o.schedules.length) {
        error = true;
        showAlert(
          `Please select at least one schedule for location ${obj.area}`,
          "error"
        );
      }
      if (!o.camera.length) {
        error = true;
        showAlert(
          `Please select at least one camera for location ${obj.area}`,
          "error"
        );
      }
    });
    // props.prevLocations.forEach((obj) => {
    //     let old = props.locations.filter((o) => {
    //         return o._id !== obj.value;
    //     });
    //     console.log(old, "old")
    //     if (old) {
    //         deleteLocations.push(old);
    //     }
    // })
    // console.log(deleteLocations, "heeee");
    // if (deleteLocations.length) {
    //     try {
    //         await callApi(`${API_BASE_URL}/onboard/task/delete/?task=${props.taskId}/?location=${deleteLocations.toString()}`, {
    //             method: "DELETE",
    //         })
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    if (!error)
      try {
        const res = await callApi(
          `${API_BASE_URL}/assign/task/${props.taskId}`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        if (res && res.status === 200) {
          props.setCurrentIndex();
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
            window.analytics.track(
              `Step 3 | Add schedule step completed | Checklist`,
              {
                title: `Step 3 | Add schedule step completed | Checklist`,
                email: props.userData.user.email,
                username: props.userData.user.username,
                companyName: props.userData.manifest.company.name,
                user_id: props.userData.user._id,
                company_id: props.userData.manifest._id,
              }
            );
          }
        }
      } catch (e) {
        const err = e.split("\n").filter((n) => n !== "");
        let others = err.length > 1 ? `and ${err.length} others` : "";
        showAlert(`${err[0]} ${others}`, "error");
      }
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
              <OverlayTrigger
                key={"1"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>View task details</Tooltip>
                }
              >
                <h3 className="fs-22 mb-3 header-primary">
                  {(props.selectedTask && props.selectedTask.model) || ""}
                  <span
                    className="ml-2 curser-btn"
                    onClick={() => setShowDescription(true)}
                  >
                    <IconHelp />
                  </span>
                </h3>
              </OverlayTrigger>

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
                <ul className="list-inline progressbar">
                  <OverlayTrigger
                    key={"1"}
                    placement={"top"}
                    overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                  >
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
                  </OverlayTrigger>
                  <OverlayTrigger
                    key={"1"}
                    placement={"top"}
                    overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                  >
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
                  </OverlayTrigger>
                  <OverlayTrigger
                    key={"1"}
                    placement={"top"}
                    overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                  >
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
                  </OverlayTrigger>
                  <OverlayTrigger
                    key={"1"}
                    placement={"top"}
                    overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                  >
                    <li
                      className={`list-inline-item ${
                        props.isCompleted ? "isCompleted active" : ""
                      }`}
                    >
                      <span
                        className="curser-btn"
                        onClick={() =>
                          props.isCompleted && props.setCurrentIndex(3)
                        }
                      >
                        Assign User
                      </span>
                    </li>
                  </OverlayTrigger>
                </ul>
              </ul>
            </div>
            <div className="mxw-850 info-content">
              {
                <p>
                  Configure the schedule you want the task to run on. You can
                  select multiple schedules for each location.
                </p>
              }
            </div>
            {props.locations.map((el, index) => {
              return (
                <ListSchedule
                  updateList={updateList}
                  setScheduleShow={setScheduleShow}
                  taskId={props.taskId}
                  id={el._id}
                  key={index}
                  el={el}
                />
              );
            })}
          </div>
          <div className="col-lg-12 mt-4">
            <ContactSupport
              checklistId={props.checklistId}
              taskId={props.selectedTask._id}
              title={"Step 3 | Contact Support | Checklist Set Up"}
            />
          </div>
          <div className="col-12">
            <div className="block-group mt-5">
              <Link
                to="#"
                className="btn btn-icon-block btn-primary btn-md"
                onClick={() => {
                  addCameraAndSchedule();
                }}
              >
                Save and Next <IconArrowNextRight />
              </Link>
              <Link to="#" onClick={props.saveAndGoToNext} className="link">
                Skip task{" "}
              </Link>
            </div>
          </div>
          <AddScheduleModal
            data={{
              show: scheduleShow,
              setShow: setScheduleShow,
              action: "create",
              setAction,
              successCallback: () => {
                setUpdateList(!updateList);
              },
              module: "Checklist",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ScheduleComponent);
