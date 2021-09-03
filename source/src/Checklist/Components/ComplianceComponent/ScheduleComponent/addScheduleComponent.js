import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { connect } from "react-redux";
import React, { useState } from "react";
import moment from "moment";
import { showAlert } from "../../../../Services/showAlert";
import cronstrue from "cronstrue";
import { API_BASE_URL } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import Datetime from "react-datetime";
import DatePicker from "react-datepicker";

const AddScheduleComponent = (props) => {
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

  // Modal Popup
  const [scheduleShow, setScheduleShow] = useState(false);

  // Modal Close
  const handleClose = () => setScheduleShow(false);

  const actionHandler = async (
    startcron,
    endcron,
    startCronUTC,
    endCronUTC
  ) => {
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

    const config = {
      url: `${API_BASE_URL}/schedule/create`,
      method: "POST",
      body: {
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
      },
    };
    if (formatedEndsOn) {
      config.body = JSON.stringify({
        ...config.body,
        endsOn: formatedEndsOn,
      });
    } else {
      config.body = JSON.stringify({ ...config.body, endsOn: null });
    }
    try {
      const res = await callApi(config.url, {
        method: config.method,
        body: config.body.toString(),
      });
      if (res) {
        if (res.status === 200) {
          showAlert(res.message);
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
            window.analytics.track(`Step 3 | Added new schedule | Checklist`, {
              title: `Step 3 | Added new schedule | Checklist`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            });
          }
        } else showAlert(res.message, "error");
      }
    } catch (e) {
      return showAlert(e, "error");
    }
    props.handleClose(true);
    props.getSchedule();
  };

  const handleAddSchedule = () => {
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

        if (repeatOn.length === 7) {
          startcron = `${formatedFromTime.split(":")[1]} ${
            formatedFromTime.split(":")[0]
          } * * *`;
          startCronUTC = `${formatedISOFromTimeMinute} ${formatedISOFromTimeHour} * * *`;

          if (formatedTillTime.split(":")[0] === "00") {
            endcron = `${formatedTillTime.split(":")[1]} 23 * * *`;
            endCronUTC = `${formatedISOTillTimeMinute} 23 * * *`;
          } else {
            endcron = `${formatedTillTime.split(":")[1]} ${
              formatedTillTime.split(":")[0]
            } * * *`;
            endCronUTC = `${formatedISOTillTimeMinute} ${formatedISOTillTimeHour} * * *`;
          }
        } else {
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
        }

        if (
          (endSchedule === "never" && !endsOn) ||
          (endSchedule === "on" && endsOn)
        ) {
          setScheduleShow(false);
          //actionHandler(cronUTC,cron, cronStr, startcron, endcron);
          actionHandler(startcron, endcron, startCronUTC, endCronUTC);
        } else {
          showAlert("Please select end schedule date");
        }
      } else {
        showAlert("Please select valid time range");
      }
    } else {
      showAlert("Please select required fields");
    }
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
      show={props.scheduleShow}
      onHide={() => {
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
            `Step 3 | Closed add schedule pop up | Checklist`,
            {
              title: `Step 3 | Closed add schedule pop up | Checklist`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            }
          );
        }
        props.setScheduleShow(false);
      }}
      aria-labelledby="schedule-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="schedule-modal">
          <h4>Add Schedule</h4>
          <p>
            Reoccurring schedules help you easily manage your working hours and
            slots.
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
              value={scheduleName}
              id="inputState"
              placeholder="Enter schedule name"
              onChange={(e) => {
                SetScheduleName(e.target.value);
              }}
            />
          </div>
          <div className="form-group">
            <p className="fw-500">Runs</p>
            <div className="schedule-time mb-4 row">
              <div className="form-group col-md-6">
                <label htmlFor="inputEmail3" className="form-label d-block">
                  From
                </label>
                <DatePicker
                  inputProps={{ readOnly: true }}
                  selected={fromTime}
                  onChange={(time) => {
                    SetFromTime(time);
                    SetFormatedFromTime(moment(time).format("HH:mm"));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  className="form-control"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  //timeFormat="HH:mm"
                />
                {/* <Datetime
                                  inputProps={
                                    action === "edit"
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
                  onChange={(time) => {
                    SetTillTime(time);
                    SetFormatedTillTime(moment(time).format("HH:mm"));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  className="form-control"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  //timeFormat="HH:mm"
                />
                {/* <Datetime
                                  inputProps={
                                    action === "edit"
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
            <p>On days</p>
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
                  ? repeatOn.includes(7)
                    ? true
                    : false
                  : false
              }
              value="7"
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
          <div className="schedule-end">
            <p>Ends</p>
            <div className="radio">
              <div className="form-group mb-0">
                <input
                  id="radio-1"
                  name="radio"
                  type="radio"
                  value="never"
                  defaultChecked
                  disabled={radioChecked}
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
                  disabled={radioChecked}
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
                  inputProps={{ disabled: disabledDatePicker }}
                  dateFormat="YYYY-MM-DD"
                  key={"nameofpicker" + endsOn?.getDate}
                  onChange={(date) => handleEndScheduleDate(date)}
                  isValidDate={(current) =>
                    current.isAfter(moment().subtract(1, "day"))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-solid-outline btn-sm"
          variant="secondary"
          onClick={() => {
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
                `Step 3 | Closed add schedule pop up | Checklist`,
                {
                  title: `Step 3 | Closed add schedule pop up | Checklist`,
                  email: props.userData.user.email,
                  username: props.userData.user.username,
                  companyName: props.userData.manifest.company.name,
                  user_id: props.userData.user._id,
                  company_id: props.userData.manifest._id,
                }
              );
            }
            props.handleClose();
          }}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-solid btn-sm"
          variant="primary"
          onClick={() => {
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
                `Step 3 | Clicked on Add Schedule | Checklist`,
                {
                  title: `Step 3 | Clicked on Add Schedule | Checklist`,
                  email: props.userData.user.email,
                  username: props.userData.user.username,
                  companyName: props.userData.manifest.company.name,
                  user_id: props.userData.user._id,
                  company_id: props.userData.manifest._id,
                }
              );
            }
            handleAddSchedule();
          }}
        >
          Add Schedule
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(AddScheduleComponent);
