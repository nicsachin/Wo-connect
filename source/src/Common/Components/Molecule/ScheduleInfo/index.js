import moment from "moment";
import { Popover } from "react-bootstrap";
import Tag from "../Atoms/Tag";
import React from "react";

const getWeekdaysClass = (cronText, day) =>
  cronText.indexOf(day) !== -1 ? "list-inline-item active" : "list-inline-item";

const scheduleInfo = (config) => {
  let differenceInTime = parseInt(
    moment(config.endTime, "HH:mm").diff(
      moment(config.startTime, "HH:mm"),
      "minutes"
    )
  );
  return (
    <Popover id="popover-basic">
      <Popover.Content>
        <div className={"schedule-popup"}>
          <p className={"mb-1 fw-500"}>{config.label}</p>
          <ul className={"list-inline mb-0"}>
            <li className={"list-inline-item"}>
              {moment(config.startTime, ["h:mm A"]).format("hh:mm a")} -{" "}
              {moment(config.endTime, ["h:mm A"]).format("hh:mm a")}
            </li>
            <li className={"list-inline-item"}>
              <Tag className={"tag-default"}>
                {differenceInTime >= 60
                  ? Math.abs(differenceInTime / 60) + " hours"
                  : differenceInTime + " minutes"}
              </Tag>
            </li>
          </ul>
          <p className={"text-other"}>
            Ends on{" "}
            {config.endsOn && config.endsOn !== "Never"
              ? moment(config.endsOn).format("ll")
              : "Never"}
          </p>
          <ul className={"list-inline mb-0 schedule-day"}>
            <li className={getWeekdaysClass(config.cronText, "Monday")}>M</li>
            <li className={getWeekdaysClass(config.cronText, "Tuesday")}>T</li>
            <li className={getWeekdaysClass(config.cronText, "Wednesday")}>
              W
            </li>
            <li className={getWeekdaysClass(config.cronText, "Thursday")}>T</li>
            <li className={getWeekdaysClass(config.cronText, "Friday")}>F</li>
            <li className={getWeekdaysClass(config.cronText, "Saturday")}>S</li>
            <li className={getWeekdaysClass(config.cronText, "Sunday")}>S</li>
          </ul>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export default scheduleInfo;
