import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import {
  IconArrowNextRight,
  IconHelp,
} from "../../../../Common/Components/IconsComponent/Index";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import renderHTML from "react-render-html";
import ContactSupport from "../../../Containers/ContactSupport";
import replaceHtml from "../../../../Services/replaceHtml";

const createOption = (label, value, city, r) => ({
  label,
  value,
  city,
  region: r,
});

const ConfigComponent = (props) => {
  const [complianceType, setComplianceType] = useState({});
  const [coolDownPeriod, setCoolDownPeriod] = useState("");
  const [monitoringType, setMonitoringType] = useState("");
  const [monitoringMode, setMonitoringMode] = useState("Watch & Record");
  const [tat, onChangeTurnAroundTime] = useState();
  const [selectedTat, setSelectedTat] = useState({});
  const [imageChecked, setImageChecked] = useState(false);
  const [videoChecked, setVideoChecked] = useState(false);
  const [isComplianceDetection, setComplianceDetection] = useState(false);
  const [isNonComplianceDetection, setNonComplianceDetection] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const { manifest } = useSelector((state) => state.userData);

  const isValid = () => {
    if (
      props &&
      props.checklistId &&
      props.selectedTask &&
      props.selectedTask._id
    ) {
      switch (props.selectedTask.taskType.toLowerCase()) {
        case "artificial intelligence": {
          /* if (!tat) {
                        showAlert('All field are required', "error");
                        return false;
                    }*/
          if (isNonComplianceDetection || isComplianceDetection) {
            return true;
          } else {
            showAlert("All field are required", "error");
            return false;
          }
        }
        case "human intelligence": {
          if (!monitoringType || !monitoringMode) {
            showAlert("All field are required", "error");
            return false;
          } else return true;
        }
        case "manual": {
          if (imageChecked || videoChecked) {
            return true;
          } else {
            showAlert("All field are required", "error");
            return false;
          }
        }
        default: {
          return true;
        }
      }
    } else {
      showAlert("All field are required", "error");
      return false;
    }
  };

  const createChecklist = async () => {
    if (!isValid()) return;
    let body = {
      checklist: props.checklistId,
      id: props.selectedTask._id,
      complianceType: complianceType,
      tat: tat,
      taggedMediaType: [],
    };
    if (monitoringMode !== "") body.monitoringMode = monitoringMode;
    if (monitoringType !== "") body.monitoringType = monitoringType;
    if (imageChecked) body.taggedMediaType.push("Image");
    if (videoChecked) body.taggedMediaType.push("Video");
    if (coolDownPeriod !== "")
      body.cooldownPeriod = (coolDownPeriod || "").toString();

    const { data, status } = await callApi(
      `${API_BASE_URL}/onboard/checklist/create`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    if (data._id) {
      props.setTaskId(data._id);
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
        window.analytics.track(`Step 1 | Configured task | Checklist`, {
          title: `Step 1 | Configured task | Checklist`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
          task_Id: props.selectedTask._id,
        });
      }
    }
  };

  const getTat = () => {
    return ((manifest && manifest.tat) || []).map((el) => {
      return createOption(el.time, el.id);
    });
  };

  const getTaskBySubTask = async () => {
    if (!props.checklistId || !props.selectedTask || !props.selectedTask._id)
      return;
    const { data } = await callApi(
      `${API_BASE_URL}/onboard/task/${props.checklistId}/${props.selectedTask._id}`
    );
    if (data && data.previous) {
      if (data.previous.monitoringMode) {
        setMonitoringMode(data.previous.monitoringMode);
      }
      if (data.previous.taggedMediaType) {
        setMonitoringMode(data.previous.monitoringMode);
      }
      if (data.previous.monitoringType) {
        setMonitoringType(data.previous.monitoringType);
      }
      setCoolDownPeriod(+data.previous.cooldownPeriod);
      const getPrevTat = (manifest.tat || []).filter((obj) => {
        return obj.id === data.previous.tat;
      });
      if (getPrevTat.length) {
        if (getPrevTat && getPrevTat[0])
          setSelectedTat(createOption(getPrevTat[0].time, getPrevTat[0].id));
        if (getPrevTat && getPrevTat[0])
          onChangeTurnAroundTime(getPrevTat[0].id);
      } else {
        onChangeTurnAroundTime(getTat()[0].time, getTat()[0].id);
      }
      if (
        data.previous.complianceType &&
        (data.previous.complianceType.type || "").toLowerCase() ===
          "compliance violation" &&
        data.previous.complianceType.label !== ""
      ) {
        setNonComplianceDetection(true);
        setComplianceType(getCompliance("compliance violation"));
      }
      if (
        data.previous.complianceType &&
        (data.previous.complianceType.type || "").toLowerCase() ===
          "process compliance" &&
        data.previous.complianceType.label !== ""
      ) {
        setComplianceType(getCompliance("process compliance"));
        setComplianceDetection(true);
      }
      if (
        props.selectedTask.complianceType &&
        props.selectedTask.complianceType.length
      ) {
        let removeEmpty = props.selectedTask.complianceType.filter(
          (o) => o.label !== ""
        );
        if (removeEmpty && removeEmpty.length === 1) {
          if (
            removeEmpty &&
            removeEmpty[0] &&
            (removeEmpty[0].type || "").toLowerCase() === "compliance violation"
          ) {
            setNonComplianceDetection(true);
          }
          if (
            removeEmpty &&
            removeEmpty[0] &&
            (removeEmpty[0].type || "").toLowerCase() === "process compliance"
          ) {
            setComplianceDetection(true);
          }
          setComplianceType(removeEmpty[0]);
        }
      }
      props.setTaskId(data.previous._id);
      props.setPreviousJSON(data.previous.existing);
      props.setSelectedLocations(
        data.previous.location.map((el) => {
          let city = manifest.regions.filter((o) => el.parent === o._id)[0];
          let r = manifest.regions.filter((o) => city.parent === o._id)[0];
          return createOption(el.area, el._id, city, r);
        })
      );

      props.setPrevLocations(
        data.previous.location.map((el) => {
          let city = manifest.regions.filter((o) => el.parent === o._id)[0];
          let r = manifest.regions.filter((o) => city.parent === o._id)[0];
          return createOption(el.area, el._id, city, r);
        })
      );
    }

    let first = getTat() && getTat()[0];
    if (first && !selectedTat.value) setSelectedTat(first);
  };

  const getCompliance = (val) => {
    const name = (
      (props.selectedTask && props.selectedTask.complianceType) ||
      []
    ).filter((c) => {
      return (c.type || "").toLowerCase() === val;
    });
    if (name && name.length) {
      return name[0] && name[0];
    } else return false;
  };

  useEffect(() => {
    getTaskBySubTask();
  }, [props.selectedTask._id]);

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
        size="lg"
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
          <div className="col-lg-12 align-self-center mb-4">
            <div className="title">
              <h3 className="fs-22 mb-3 header-primary">
                {props.selectedTask && (props.selectedTask.model || "")}
                {/*<OverlayTrigger*/}
                {/*  key={"1"}*/}
                {/*  placement={"right"}*/}
                {/*  overlay={*/}
                {/*    <Tooltip id={`tooltip-right`}>View task details</Tooltip>*/}
                {/*  }*/}
                {/*>*/}
                {/*  <span*/}
                {/*    className="ml-2 curser-btn"*/}
                {/*    onClick={() => setShowDescription(true)}*/}
                {/*  >*/}
                {/*    <IconHelp />*/}
                {/*  </span>*/}
                {/*</OverlayTrigger>*/}
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
                      props.isCompleted ? "isCompleted active" : ""
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() =>
                        props.isCompleted && props.setCurrentIndex(1)
                      }
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
                      props.isCompleted ? "isCompleted active" : ""
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() =>
                        props.isCompleted && props.setCurrentIndex(2)
                      }
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
            </div>
          </div>
          <div className="radio-block col-md-12 mb-4 mt-50">
            <p className="fw-500">I want to monitor:</p>
            <div className="form-check mb-3">
              {getCompliance("process compliance").label && (
                <>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault1"
                    checked={isComplianceDetection}
                    onClick={(e) => {
                      setComplianceDetection(true);
                      setNonComplianceDetection(false);
                      setComplianceType(getCompliance("process compliance"));
                    }}
                  />
                  <label
                    className="form-check-label fw-400"
                    htmlFor="flexRadioDefault1"
                  >
                    {getCompliance("process compliance").label}
                  </label>
                </>
              )}
            </div>
            <div className="form-check">
              {getCompliance("compliance violation").label && (
                <>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                    checked={isNonComplianceDetection}
                    onClick={(e) => {
                      setComplianceDetection(false);
                      setNonComplianceDetection(true);
                      setComplianceType(getCompliance("compliance violation"));
                    }}
                  />
                  <label
                    className="form-check-label fw-400"
                    htmlFor="flexRadioDefault2"
                  >
                    {getCompliance("compliance violation").label}
                  </label>
                </>
              )}
            </div>
          </div>
          {props.selectedTask &&
            (props.selectedTask.taskType || "").toLowerCase() ===
              "human intelligence" && (
              <div className="radio-block col-md-6 mb-4 mt-50">
                <p className="fw-500">Viewing and tagging to be done by:</p>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="setViewingAndTagging"
                    id="setViewingAndTagging"
                    onClick={(e) => {
                      setMonitoringType("Self");
                    }}
                    checked={monitoringType === "Self"}
                  />
                  <label
                    className="form-check-label fw-400"
                    htmlFor="setViewingAndTagging"
                  >
                    Self/My Team
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="setViewingAndTagging"
                    id="setViewingAndTagging"
                    onClick={(e) => {
                      setMonitoringType("Wobot");
                    }}
                    checked={monitoringType === "Wobot"}
                  />
                  <label
                    className="form-check-label fw-400"
                    htmlFor="setViewingAndTagging"
                  >
                    Wobot team
                  </label>
                </div>
              </div>
            )}
          {props.selectedTask &&
            (props.selectedTask.taskType || "").toLowerCase() === "manual" && (
              <div className="radio-block col-md-6 mb-4 mt-50">
                <p className="fw-500">Media upload type:</p>
                <div className="checkbox-inline checkbox mb-3">
                  <label
                    className="form-check-label fw-400"
                    htmlFor="mediaUploadImage"
                  >
                    <input
                      className="form-check-input check-with-label"
                      data-ng-model="example.check"
                      type="checkbox"
                      name="mediaUploadImage"
                      checked={imageChecked}
                      onClick={(e) => {
                        setImageChecked(e.target.checked);
                      }}
                      id="mediaUploadImage"
                    />
                    <span className="box inline" />
                    Image
                  </label>
                </div>
                <div className="checkbox-inline checkbox">
                  <label
                    className="form-check-label fw-400"
                    htmlFor="mediaUploadVideo"
                  >
                    <input
                      className="form-check-input check-with-label"
                      data-ng-model="example.check"
                      type="checkbox"
                      name="mediaUploadVideo"
                      checked={videoChecked}
                      id="mediaUploadVideo"
                      onClick={(e) => {
                        setVideoChecked(e.target.checked);
                      }}
                    />
                    <span className="box inline" />
                    Video
                  </label>
                </div>
              </div>
            )}
          {props.selectedTask &&
            (props.selectedTask.taskType || "").toLowerCase() ===
              "human intelligence" && (
              <div className="radio-block col-md-6 mb-4 mt-50">
                {/*<p className="fw-500">I want the team to view:</p>
                                    <div className="form-check mb-3">
                                        <input className="form-check-input" type="radio" name="setTeamToView"
                                               id="setTeamToView"
                                               onClick={(e) => {
                                                   setMonitoringMode('Watch')
                                                   setIsUpdate(true)
                                               }}
                                               checked={monitoringMode === 'Watch'}
                                        />
                                        <label className="form-check-label fw-400" htmlFor="setTeamToView">
                                            Live feed
                                        </label>
                                    </div>*/}
                <div className="form-check">
                  {/*<input className="form-check-input" type="radio" name="setTeamToView"
                                               id="setTeamToView"
                                               onClick={(e) => {
                                                   setMonitoringMode('Watch & Record')
                                                   setIsUpdate(true)
                                               }}
                                               checked={monitoringMode === 'Watch & Record'}
                                        />
                                        <label className="form-check-label fw-400" htmlFor="setTeamToView">
                                            Playback video delivered at 12:00 AM
                                        </label>*/}
                </div>
              </div>
            )}
          <div className="select-block col-md-6 row mt-50">
            {/*<div className="col-lg-6 col-md-6 col-sm-12 mb-2">*/}
            {/*    <label htmlFor="inputEmail4" className="fw-500">Turn around time (in minutes)</label>*/}
            {/*    <Select options={getTat()}*/}
            {/*            value={selectedTat}*/}
            {/*            onChange={(data) => {*/}
            {/*                setSelectedTat(data);*/}
            {/*                onChangeTurnAroundTime(data.value)*/}
            {/*            }}*/}
            {/*    />*/}
            {/*</div>*/}
            {props.selectedTask &&
              (props.selectedTask.taskType || "").toLowerCase() ===
                "artificial intelligence" && (
                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                  <label htmlFor="inputEmail4" className="fw-500">
                    Cooldown period (in seconds)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={coolDownPeriod}
                    onChange={(e) => {
                      setCoolDownPeriod(e.target.value);
                    }}
                  />
                </div>
              )}
          </div>
          <div className="col-lg-12 mt-5">
            <ContactSupport
              checklistId={props.checklistId}
              taskId={props.selectedTask._id}
              title={"Step 1 | Contact Support | Checklist Set Up"}
            />
          </div>
          <div className="col-lg-12">
            <div className="block-group mt-5">
              <Link
                to="#"
                className="btn btn-icon-block btn-primary btn-md"
                onClick={() => createChecklist()}
              >
                Save and Next <IconArrowNextRight />
              </Link>
              <Link to="#" onClick={props.saveAndGoToNext} className="link">
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

export default connect(mapStateToProps)(ConfigComponent);
