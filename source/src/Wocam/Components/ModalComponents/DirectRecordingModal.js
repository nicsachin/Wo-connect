import React, { useCallback, useEffect, useState } from "react";
import { Modal, Nav, Popover, OverlayTrigger } from "react-bootstrap";
import callApi from "../../../Services/callApi";
import { API_BASE_URL, CHECKLIST } from "../../../Constants";
import { showAlert } from "../../../Services/showAlert";
import Select from "react-select";
import { colourStyles } from "../../../Services/colourStyles";
import { connect } from "react-redux";
import AddScheduleModal from "../../../Settings/Components/ModalComponents/AddScheduleModal";
import IconAdd from "../../../Common/Components/IconsComponent/IconAdd";
import "./style.scss";
import { Link } from "react-router-dom";
import { IconInfoSvg } from "../../../Common/Components/IconsComponent/Index";
import scheduleInfo from "../../../Common/Components/Molecule/ScheduleInfo";
import CheckboxBlock from "../../../Common/Components/Molecule/Atoms/CheckboxBlock";
let apiConfig = { callManifest: false, showLoader: false, loaderLabel: "" };

const DirectRecordingModal = (props) => {
  const [schedule, setSchedule] = useState({ list: [], selected: [] });
  const [recordingType, setRecordingType] = useState("default");
  const [assignees, setAssignees] = useState({ list: [], selected: [] });
  const [addScheduleModalVisibility, setAddScheduleModalVisibility] = useState(
    false
  );
  const [error, setError] = useState({ schedule: null, recordingType: null });
  const [viewMore, setViewMore] = useState(false);

  //for getting schedule list
  const setScheduleListFromApi = () => {
    callApi(`${API_BASE_URL}/schedule/get/100/0?sort=-1`, {}, apiConfig)
      .then((resp) => {
        if (resp.status === 200 && resp?.data?.data?.length) {
          let selectedSchedule = [];
          if (
            props?.camera?.directRecording?.length &&
            props?.camera?.directRecording[0]?.schedules?.length
          )
            selectedSchedule = props.camera.directRecording[0].schedules.map(
              (el) => el._id
            );

          setSchedule({
            list: resp.data.data.map((el) => {
              return {
                label: el.schedule,
                value: el._id,
                startTime: el.startTime,
                endTime: el.endTime,
                endsOn: el.endsOn,
                cronText: el.cronText,
              };
            }),
            selected: selectedSchedule,
          });
        }
      })
      .catch((e) => {
        showAlert(e, "error");
      });
  };

  //for getting team list
  const setTeamListFromApi = () => {
    callApi(`${API_BASE_URL}/team/get/100/0`, {}, apiConfig)
      .then((resp) => {
        if (resp.status === 200 && resp?.data?.data?.length) {
          let selectedAssignee = [];
          if (
            props?.camera?.directRecording?.length &&
            props?.camera?.directRecording[0]?.assignee?.length
          )
            selectedAssignee = props.camera.directRecording[0].assignee.map(
              (el) => {
                if (el.type === "Assignee") {
                  return { label: el.user.email, value: el.user._id };
                }
              }
            );

          setAssignees({
            list: resp.data.data.map((el) => {
              return { label: el.email, value: el._id };
            }),
            selected: selectedAssignee,
          });
        }
      })
      .catch((e) => {
        showAlert(e, "error");
      });
  };

  useEffect(() => {
    if (props.visibility && props.camera) {
      setScheduleListFromApi();
      setTeamListFromApi();
    }
  }, [props.visibility]);

  const closeModal = (props) => {
    setAssignees({ list: [], selected: [] });
    setRecordingType("default");
    setSchedule({ list: [], selected: [] });
    setAddScheduleModalVisibility(false);
    setError({ schedule: null, recordingType: null });

    setTimeout(() => {
      props.onHide();
    }, 200);
  };

  const setupRecording = () => {
    if (schedule?.selected?.length && recordingType) {
      let payload = {
        schedule: schedule.selected,
        usecaseType: recordingType,
        assignee: assignees?.selected?.length
          ? assignees.selected.map((el) => el.value)
          : [],
      };
      callApi(`${API_BASE_URL}/setup/recording/${props.camera._id}`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.status === 200) {
            showAlert(res.message);
            closeModal(props);
          }
        })
        .catch((e) => {
          showAlert(e, "error");
        });
    } else {
      let errors = { ...error };
      if (!schedule.selected.length)
        errors = { ...errors, schedule: "Please select a schedule" };
      setError(errors);
    }
  };

  function renderScheduleList() {
    if (schedule?.list?.length) {
      return schedule.list.map((el, index) => {
        if (viewMore || index < 4)
          return (
            <div key={index} className={"col-lg-6"}>
              <div
                className={
                  "d-flex align-items-baseline justify-content-between schedule-tag"
                }
              >
                <CheckboxBlock
                  checked={schedule.selected.indexOf(el.value) !== -1}
                  onChange={(event) => {
                    if (event.target.checked)
                      setSchedule({
                        ...schedule,
                        selected: [...schedule.selected, el.value],
                      });
                    else {
                      let arr = schedule.selected;
                      arr.splice(schedule.selected.indexOf(el.value), 1);
                      setSchedule({ ...schedule, selected: arr });
                    }
                  }}
                >
                  {el.label}
                </CheckboxBlock>
                <OverlayTrigger
                  trigger={["hover", "focus"]}
                  placement="right"
                  overlay={scheduleInfo(el)}
                >
                  <button className={"btn info-popup"}>
                    <IconInfoSvg />
                  </button>
                </OverlayTrigger>
              </div>
            </div>
          );
      });
    } else
      return (
        <p className={"col-md-12 bg-white schedule-tab"}>No schedules found</p>
      );
  }

  function renderViewMoreButton() {
    if (schedule.list.length > 4) {
      if (viewMore)
        return (
          <button
            className={"mt-1 btn p-0 link curser-p"}
            onClick={() => {
              setViewMore(false);
            }}
          >
            View less
          </button>
        );
      else
        return (
          <button
            className={"mt-1 btn p-0 link curser-p"}
            onClick={() => {
              setViewMore(true);
            }}
          >
            View more
          </button>
        );
    } else return null;
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
          <h4 className="mb-2">Setup Recording</h4>
          <p>Record the videos of the cameras directly here.</p>
          <div className={"info-block mt-4"}>
            <span>
              <IconInfoSvg />
            </span>
            <p className={"mb-0"}>
              For automatic process compliance monitoring, you can setup the
              tasks on the camera.
              <Link
                to={CHECKLIST}
                className={"link ml-1 fw-500"}
                target={"_blank"}
              >
                Setup Tasks
              </Link>
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div
          className={"d-flex justify-content-between align-items-center mb-4"}
        >
          <h5 className={"mb-0"}>Schedule</h5>
          <button
            className={"btn btn-textIcon"}
            title={"Add a schedule"}
            onClick={() => {
              setAddScheduleModalVisibility(true);
            }}
          >
            <span>
              <IconAdd /> Add schedule
            </span>
          </button>
        </div>
        <div className={"row schedule-tag-block"}>{renderScheduleList()}</div>
        <div
          className={"d-flex justify-content-between align-items-center mt-2"}
        >
          <span>
            {" "}
            {error.schedule ? (
              <span className="error-msg">{error.schedule}</span>
            ) : null}
          </span>
          <span>{renderViewMoreButton()}</span>
        </div>
        {/*  add a schedule*/}
        <AddScheduleModal
          data={{
            show: addScheduleModalVisibility,
            setShow: setAddScheduleModalVisibility,
            action: "create",
            setAction: () => {},
            successCallback: () => {
              setScheduleListFromApi();
            },
          }}
        />
        <div className={"type-select mt-5"}>
          <h5>Recording Type</h5>
          <Nav
            variant="pills"
            defaultActiveKey={
              props?.camera?.directRecording?.length &&
              props?.camera?.directRecording[0]?.usecaseType
                ? props.camera.directRecording[0].usecaseType
                : "default"
            }
            onSelect={(selected) => {
              setRecordingType(selected);
            }}
          >
            {props?.userData?.manifest?.usecaseType
              ? props.userData.manifest.usecaseType.map((el, index) => {
                  return (
                    <Nav.Item>
                      <Nav.Link eventKey={el.value}>{el.label}</Nav.Link>
                    </Nav.Item>
                  );
                })
              : null}
          </Nav>
        </div>
        <div className={"task-select mt-4"}>
          <h5>Task Assignee</h5>
          <Select
            styles={colourStyles}
            isMulti={true}
            value={assignees.selected}
            onChange={(selectedOption) => {
              setAssignees({ ...assignees, selected: selectedOption });
            }}
            options={assignees.list}
          />
        </div>
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
        <button className="btn btn-primary btn-sm" onClick={setupRecording}>
          Setup Recording
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(DirectRecordingModal);
