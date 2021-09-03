import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { DebounceInput } from "react-debounce-input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import cronstrue from "cronstrue";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { scheduleError } from "../../Resources";
import { API_BASE_URL } from "../../../Constants";
import { segmentTrack } from "../../../Services/segment";
import { Settings } from "../../../Services/segmentEventDetails";

let defaultErrorLabels = {
  // dvr: "",
  // manufacturer: "",
  // ip: "",
  // port: "",
  // username: "",
  // password: "",
  // channels: "",
  // region: "",
  // branch: "",
  // rtsp: "",
  name: "",
  fromTime: "",
  tillTime: "",
  radio: "",
};

const AddScheduleModal = (props) => {
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [error, setError] = useState(defaultErrorLabels);
  const [isScheduleName, setIsScheduleName] = useState(false);
  const [isFromValid, setIsFromValid] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  //const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const [id, setId] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);

  //Add Schedule
  const [scheduleName, SetScheduleName] = useState("");
  const [fromTime, SetFromTime] = useState();
  const [formatedFromTime, SetFormatedFromTime] = useState();
  const [formatedTillTime, SetFormatedTillTime] = useState();
  const [tillTime, SetTillTime] = useState();
  const [repeatOn, SetRepeatOn] = useState([]);
  const [endsOn, SetEndsOn] = useState();
  const [formatedEndsOn, SetFormatedEndsOn] = useState();
  const [endSchedule, SetEndSchedule] = useState("never");
  const [radioChecked, SetRadioChecked] = useState(false);
  const [disabledDatePicker, SetDisabledDatePicker] = useState(true);

  // Modal Close
  const handleClose = () => {
    props.data.setShow(false);
    //setScheduleShow(false);
    if (props && props.data && props.data.module) {
      if (props.data.action === "create" && props.data.module === "Checklist") {
        segmentTrack({
          title: Settings.addScheduleModal.checklistcancelAddModal,
        });
      } else if (
        props.data.action === "create" &&
        props.data.module === "Settings"
      ) {
        segmentTrack({
          title: Settings.addScheduleModal.settingscancelAddModal,
        });
      }
    }

    setError(defaultErrorLabels);
    SetDisabledDatePicker(true);
    SetScheduleName("");
    SetFromTime();
    SetFormatedFromTime();
    SetTillTime();
    SetFormatedTillTime();
    SetRepeatOn([]);
    SetEndsOn();
    SetFormatedEndsOn();
    SetEndSchedule("never");
    SetRadioChecked(false);
  };

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      name: scheduleName,
      fromTime: fromTime,
      tillTime: tillTime,
      radio: repeatOn.length,
    };
    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: scheduleError[key] };
        validationSuccess = false;
      }
    }

    // if (
    //   (endSchedule === "on" && endsOn && !validateEmpty(endsOn))
    // ) {
    //   errorInForm = { ...errorInForm, radio: scheduleError.radio };
    //   validationSuccess = false;
    //   //actionHandler(cronUTC,cron, cronStr, startcron, endcron);
    // }
    // if (role && !validateEmpty(radio)) {
    //   errorInForm = { ...errorInForm, radio: scheduleError.radio };
    //   validationSuccess = false;
    // }
    setError(errorInForm);
    return validationSuccess;
  };

  const handleAddSchedule = () => {
    if (!handleValidation()) return;
    // setIsScheduleName(validateEmpty(scheduleName));
    let startcron = "";
    let endcron = "";
    let startCronUTC = "";
    let endCronUTC = "";
    if (
      scheduleName &&
      formatedFromTime &&
      formatedTillTime &&
      repeatOn &&
      repeatOn.length &&
      fromTime &&
      tillTime
    ) {
      let ST = moment(moment(fromTime).format("HH:mm"), "HH:mm");
      let ET = moment(moment(tillTime).format("HH:mm"), "HH:mm");
      if (
        (ET.isAfter(ST) &&
          ET._d !== ST._d &&
          ST.isBefore(ET) &&
          ET._d !== ST._d) ||
        ET._i === "00:00"
      ) {
        let isoFromTime = fromTime.toISOString();
        //let isoFromTime = moment(fromTime).tz('Asia/Dubai').format();
        //let formatedISOFromTime = isoFromTime.split("T")[1].split(":")[0];
        let formatedISOFromTimeHour = isoFromTime.split("T")[1].split(":")[0];
        let formatedISOFromTimeMinute = isoFromTime.split("T")[1].split(":")[1];

        let isoTillTime = tillTime.toISOString();
        //let formatedISOTillTime = isoTillTime.split("T")[1].split(":")[0];
        let formatedISOTillTimeHour = isoTillTime.split("T")[1].split(":")[0];
        let formatedISOTillTimeMinute = isoTillTime.split("T")[1].split(":")[1];

        // if (repeatOn.length === 7) {
        //   startcron = `${formatedFromTime.split(":")[1]} ${
        //     formatedFromTime.split(":")[0]
        //   } * * *`;
        //   startCronUTC = `${formatedISOFromTimeMinute} ${formatedISOFromTimeHour} * * *`;

        //   if (formatedTillTime.split(":")[0] === "00") {
        //     endcron = `${formatedTillTime.split(":")[1]} 23 * * *`;
        //     endCronUTC = `${formatedISOTillTimeMinute} 23 * * *`;
        //   } else {
        //     endcron = `${formatedTillTime.split(":")[1]} ${
        //       formatedTillTime.split(":")[0]
        //     } * * *`;
        //     endCronUTC = `${formatedISOTillTimeMinute} ${formatedISOTillTimeHour} * * *`;
        //   }
        // } else {
        startcron = `${formatedFromTime.split(":")[1]} ${
          formatedFromTime.split(":")[0]
        } * * ${repeatOn}`;
        startCronUTC = `${formatedISOFromTimeMinute} ${formatedISOFromTimeHour} * * ${repeatOn}`;
        if (formatedTillTime === "00") {
          endcron = `${formatedTillTime.split(":")[1]} 23 * * ${repeatOn}`;
          endCronUTC = `${formatedISOTillTimeMinute} 23 * * ${repeatOn}`;
        } else {
          endcron = `${formatedTillTime.split(":")[1]} ${
            formatedTillTime.split(":")[0]
          } * * ${repeatOn}`;
          endCronUTC = `${formatedISOTillTimeMinute} ${formatedISOTillTimeHour} * * ${repeatOn}`;
        }
        // }

        if (
          (endSchedule === "never" && !endsOn) ||
          (endSchedule === "on" && endsOn)
        ) {
          //   setScheduleShow(false);
          props.data.setShow(false);
          //actionHandler(cronUTC,cron, cronStr, startcron, endcron);
          actionHandler(startcron, endcron, startCronUTC, endCronUTC);
        } else {
          showAlert("Please select end schedule date", "error");
        }
      } else {
        showAlert("Please select valid time range");
      }
    }
  };

  const actionHandler = (startcron, endcron, startCronUTC, endCronUTC) => {
    const config = {
      url: "",
      method: "",
      body: {},
    };
    let cronStr = "";
    if (startcron && endcron && startCronUTC && endCronUTC) {
      let startcronStr = cronstrue.toString(startcron);
      let startfinalcrontext = `${startcronStr.split(" ")[1]} ${
        startcronStr.split(" ")[2]
      }`;
      if (repeatOn.length === 7) {
        var lastIndex = endcron.lastIndexOf(" ");

        let str = endcron.substring(0, lastIndex);
        let finalendcron = `${str} ${repeatOn}`;
        let endcronStr = cronstrue.toString(finalendcron);
        //cronStr = `${startfinalcrontext.replace(',','')} to ${endcronStr.slice(3)}, ends ${formatedEndsOn ? `on ${formatedEndsOn}` : "never"}`;
        cronStr = `${startfinalcrontext.replace(",", "")} to ${endcronStr.slice(
          3
        )}`;
      } else {
        let endcronStr = cronstrue.toString(endcron);
        //cronStr = `${startfinalcrontext.replace(',','')} to ${endcronStr.slice(3)}, ends ${formatedEndsOn ? `on ${formatedEndsOn}` : "never"}`;
        cronStr = `${startfinalcrontext.replace(",", "")} to ${endcronStr.slice(
          3
        )}`;
      }
    }

    switch (props.data.action) {
      case "create": {
        config.url = `${API_BASE_URL}/schedule/create`;
        config.method = "POST";
        config.body = {
          schedule: scheduleName,
          //cron: cron,
          cronText: cronStr,
          startCron: startcron,
          endCron: endcron,
          startCronUTC,
          endCronUTC,
          startTime: formatedFromTime,
          endTime: formatedTillTime,
          //cronUTC,
        };
        if (formatedEndsOn) {
          config.body = JSON.stringify({
            ...config.body,
            endsOn: formatedEndsOn,
          });
        } else {
          config.body = JSON.stringify({ ...config.body, endsOn: null });
        }
        break;
      }
      case "edit": {
        config.url = `${API_BASE_URL}/schedule/update/${id}`;
        config.method = "PUT";
        config.body = {
          // schedule: scheduleName,
          // //cron: cron,
          // cronText: cronStr,
          // startCron: start,
          // endCron: end,
          //cronUTC,
        };
        if (formatedEndsOn) {
          config.body = JSON.stringify({
            ...config.body,
            endsOn: formatedEndsOn,
          });
        } else {
          config.body = JSON.stringify({ ...config.body, endsOn: null });
        }
        break;
      }
      default: {
        break;
      }
    }
    setToggledClearRows(!toggledClearRows);

    callApi(config.url, {
      method: config.method,
      body: config.body.toString(),
    })
      .then((res) => {
        if (res.status === 200) {
          props.data.successCallback();
          //apiCall(limit, page);
          showAlert(res.message);
          if (props && props.data && props.data.module) {
            if (
              props.data.action === "create" &&
              props.data.module === "Checklist"
            ) {
              segmentTrack({
                title: Settings.addScheduleModal.checklistCreateSchedule,
              });
            } else if (
              props.data.action === "create" &&
              props.data.module === "Settings"
            ) {
              segmentTrack({
                title: Settings.addScheduleModal.settingsCreateSchedule,
              });
            }
          }
        } else showAlert(res.message, "error");
        setSelectedRows("");
        handleClose();
      })
      .catch((e) => {
        showAlert(e, "error");
      });
  };

  const SelectWeekDays = (e) => {
    let arr = repeatOn;
    if (arr.includes(parseInt(e.target.value))) {
      let index = arr.indexOf(parseInt(e.target.value));
      arr.splice(index, 1);
      SetRepeatOn(arr);
    } else {
      SetRepeatOn([...repeatOn, parseInt(e.target.value)]);
    }
  };

  const handleEndScheduleDate = (date) => {
    //Tue Feb 09 2021 00:00:00 GMT+0530 (India Standard Time)
    SetEndsOn(date._d);
    SetFormatedEndsOn(moment(date._d).format("YYYY-MM-DD"));
  };

  const handleChange = (e) => {
    SetEndSchedule(e.target.value);
    if (e.target.value === "never") {
      SetEndsOn("");
      SetFormatedEndsOn("");
      SetDisabledDatePicker(true);
      SetEndsOn("");
    } else if (e.target.value === "on") {
      SetDisabledDatePicker(false);
    }
  };

  return (
    <Modal
      size="md"
      show={props.data.show}
      onHide={() => {
        handleClose();
      }}
      aria-labelledby="schedule-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="schedule-modal">
          <h4>{props.data.action === "edit" ? "Edit" : "Add"} Schedule</h4>
          <p className="mb-0">
            Use locations to represent the store or center level information.
          </p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-body">
          <div className="from-group mb-4">
            <label htmlFor="inputEmail3">Schedule name</label>
            <input
              type="text"
              className="form-control"
              // className={`form-control mb-0 ${
              //   isScheduleName ? "error-red" : ""
              // }`}
              value={scheduleName}
              disabled={props.data.action === "edit" ? true : false}
              id="inputState"
              placeholder="Enter schedule name"
              onChange={(e) => {
                SetScheduleName(e.target.value);
                setError({ ...error, name: "" });
                // setIsScheduleName(
                //   validateEmpty(e.target.value)
                // );
              }}
            />
            {error.name ? (
              <span className="error-msg">{error.name}</span>
            ) : null}
            {/* {isScheduleName && (
                              <span className="error-msg">
                                Schedule name is required
                              </span>
                            )} */}
          </div>
          <div className="form-group">
            <p>Runs</p>
            <div className="schedule-time mb-4 row">
              <div className="form-group col-md-6">
                <label htmlFor="inputEmail3" className="form-label d-block">
                  From
                </label>
                <DatePicker
                  inputProps={{ readOnly: true }}
                  selected={fromTime}
                  required
                  onChange={(time) => {
                    setError({ ...error, fromTime: "" });
                    SetFromTime(time);
                    SetFormatedFromTime(
                      //moment(time).format("HH:MM").split(":")[0])
                      moment(time).format("HH:mm")
                    );
                    // setIsFromValid(
                    //   validateEmpty(time.target.selected)
                    // );
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  className="form-control"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  readOnly={props.data.action === "edit" ? true : false}
                  //timeFormat="HH:mm"
                />
                {error.fromTime ? (
                  <span className="error-msg">{error.fromTime}</span>
                ) : null}
                {/* {isFromValid && (
                                  <span className="error-msg">
                                    Schedule name is required
                                  </span>
                                )} */}
                {/* <Datetime
                                  inputProps={
                                    props.data.action === "edit"
                                      ? { readOnly: true, disabled: true }
                                      : { readOnly: true, disabled: false }
                                  }
                                  dateFormat={false}
                                  timeConstraints={{
                                    minutes: { min: 0, max: 0, step: 0 },
                                  }}
                                  timeFormat="HH"
                                  value={fromTime}
                                  //key={'nameofpicker'+ fromTime?.getDate}
                                  //onChange={handelFromTime}
                                  onChange={(time) => {
                                    console.log(time)
                                    SetFromTime(time._d);
                                    SetFormatedFromTime(
                                      moment(time._d)
                                        .format("HH:MM")
                                        .split(":")[0]
                                    );
                                  }}
                                /> */}
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="inputEmail3" className="form-label d-block">
                  Till
                </label>
                <DatePicker
                  inputProps={{ readOnly: true }}
                  selected={tillTime}
                  onChangeRaw={() => {}}
                  onChange={(time) => {
                    setError({ ...error, tillTime: "" });
                    SetTillTime(time);
                    SetFormatedTillTime(
                      //moment(time).format("HH:MM").split(":")[0]
                      moment(time).format("HH:mm")
                    );
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  className="form-control"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  readOnly={props.data.action === "edit" ? true : false}
                  //timeFormat="HH:mm"
                />
                {error.tillTime ? (
                  <span className="error-msg">{error.tillTime}</span>
                ) : null}
                {/* <Datetime
                                  inputProps={
                                    props.data.action === "edit"
                                      ? { readOnly: true, disabled: true }
                                      : { readOnly: true, disabled: false }
                                  }
                                  dateFormat={false}
                                  timeConstraints={{
                                    minutes: { min: 0, max: 0, step: 0 },
                                  }}
                                  timeFormat="HH"
                                  value={tillTime}
                                  //key={'nameofpicker'+ tillTime?.getDate}
                                  //onChange={handelTillTime}
                                  onChange={(time) => {
                                    SetTillTime(time._d);
                                    SetFormatedTillTime(
                                      moment(time._d)
                                        .format("HH:MM")
                                        .split(":")[0]
                                    );
                                  }}
                                /> */}
              </div>
            </div>
          </div>
          <div className="week-days-selector mb-4">
            <p className="fw-500 fs-14 mb-0">Repeat on</p>
            <input
              type="checkbox"
              id="weekday-mon"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(1)
                    ? true
                    : false
                  : false
              }
              value="1"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Monday</Tooltip>}
              >
                <label htmlFor="weekday-mon">M</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-tue"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(2)
                    ? true
                    : false
                  : false
              }
              value="2"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Tuesday</Tooltip>}
              >
                <label htmlFor="weekday-tue">T</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-wed"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(3)
                    ? true
                    : false
                  : false
              }
              disabled={props.data.action === "edit" ? true : false}
              value="3"
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={
                  <Tooltip id={`tooltip-${placement}`}>Wednesday</Tooltip>
                }
              >
                <label htmlFor="weekday-wed">W</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-thu"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(4)
                    ? true
                    : false
                  : false
              }
              value="4"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={
                  <Tooltip id={`tooltip-${placement}`}>Thursday</Tooltip>
                }
              >
                <label htmlFor="weekday-thu">T</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-fri"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(5)
                    ? true
                    : false
                  : false
              }
              value="5"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Friday</Tooltip>}
              >
                <label htmlFor="weekday-fri">F</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-sat"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? repeatOn.includes(6)
                    ? true
                    : false
                  : false
              }
              value="6"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={
                  <Tooltip id={`tooltip-${placement}`}>Saturday</Tooltip>
                }
              >
                <label htmlFor="weekday-sat">S</label>
              </OverlayTrigger>
            ))}
            <input
              type="checkbox"
              id="weekday-sun"
              className="weekday"
              defaultChecked={
                repeatOn && repeatOn.length !== "0"
                  ? // ? repeatOn.includes(7)
                    repeatOn.includes(0)
                    ? true
                    : false
                  : false
              }
              // value="7"
              value="0"
              disabled={props.data.action === "edit" ? true : false}
              onClick={SelectWeekDays}
            />
            {["top"].map((placement) => (
              <OverlayTrigger
                key={placement}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Sunday</Tooltip>}
              >
                <label htmlFor="weekday-sun">S</label>
              </OverlayTrigger>
            ))}
          </div>
          {error.radio ? (
            <span className="error-msg">{error.radio}</span>
          ) : null}
          <div className="schedule-end">
            <br />
            <p>Ends</p>
            <div className="radio">
              <div className="form-group mb-0">
                <input
                  id="radio-1"
                  name="radio"
                  type="radio"
                  value="never"
                  defaultChecked
                  disabled={
                    props.data.action === "edit" && radioChecked ? true : false
                  }
                  onClick={(e) => handleChange(e)}
                />

                <label htmlFor="radio-1" className="radio-label">
                  Never
                </label>
              </div>
              <div className="form-group ml-2 mb-0 mr-2">
                <input
                  id="radio-2"
                  name="radio"
                  type="radio"
                  value="on"
                  defaultChecked={radioChecked}
                  disabled={
                    props.data.action === "edit" && !radioChecked ? true : false
                  }
                  // disabled={true}
                  onClick={(e) => handleChange(e)}
                />

                <label htmlFor="radio-2" className="radio-label">
                  On
                </label>
              </div>
              <div className="form-group">
                <Datetime
                  timeFormat={false}
                  value={endsOn}
                  inputProps={
                    props.data.action == "edit"
                      ? { readOnly: true, disabled: true }
                      : {
                          readOnly: true,
                          disabled: disabledDatePicker,
                        }
                  }
                  dateFormat="YYYY-MM-DD"
                  key={"nameofpicker" + endsOn?.getDate}
                  onChange={(date) => {
                    handleEndScheduleDate(date);

                    // if (!validateEmpty(date.target.value)) {
                    //   setError({
                    //     ...error,
                    //     radio: scheduleError.radio,
                    //   });
                    // }

                    // if (SetDisabledDatePicker(false)) {
                    //   if (validateEmpty(date.target.value)) {
                    //     setError({ ...error, radio: "" });
                    //   }
                    // }
                  }}
                  isValidDate={(current) =>
                    current.isAfter(moment().subtract(1, "day"))
                  }
                />
                {/* {error.radio ? (
                                  <span className="error-msg">
                                    {error.radio}
                                  </span>
                                ) : null} */}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn fw-500 btn-sm" onClick={handleClose}>
          Cancel
        </button>
        {props.data.action === "edit" ? (
          ""
        ) : (
          <button
            className="btn btn-primary btn-sm"
            variant="primary"
            onClick={handleAddSchedule}
            disabled={props.data.action === "edit" ? true : false}
          >
            {/* {props.data.action === "edit" ? "Update " : "Add "}Schedule */}
            Add Schedule
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddScheduleModal);
