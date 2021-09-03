import React from "react";
import Tag from "../../../../../Common/Components/Molecule/Atoms/Tag";
import IconCheckbox from "../../../../../Common/Components/IconsComponent/SidebarMain/IconCheckbox";
import AvatarGroup from "../../../../../Common/Components/Molecule/AvatarsGroup";
import { IconLocation } from "../../../../../Common/Components/IconsComponent/Index";

function TaskCardComponent(props) {
  return props.tasks.map((el, index) => {
    return (
      <div className={"col-xl-4 col-lg-6"}>
        <div className={"element-block panel-fh"}>
          <div className={"element-header"}>
            <h6 className={"mb-2"}>{el.task.model || "No Task Title"}</h6>
            <Tag className={"tag-default"}>{el.task.taskType}</Tag>
          </div>
          <div className={"element-meta-list"}>
            <ul>
              <li className={"element-meta-name d-flex"}>
                <span className={"element-icon"}>
                  <IconCheckbox />
                </span>
                {el.task.checklist.model || "No Task Category"}
              </li>
              <li className={"element-meta-name d-flex"}>
                <span className={"element-icon"}>
                  <IconLocation />
                </span>
                {el?.location?.area || "-"}
              </li>
            </ul>
          </div>
          <div className={"element-bottom"}>
            <div className={"element-data-link"}>
              <div
                className={"link text-decoration-none curser-p-none"}
                title={
                  el.schedules.length
                    ? el.schedules.map((el) => el.schedule).join(",")
                    : ""
                }
              >
                {el.schedules.length}{" "}
                {el.schedules.length > 1 ? "schedules" : " schedule"} Running
              </div>
            </div>
            <AvatarGroup assignee={el.assignee} />
          </div>
        </div>
      </div>
    );
  });
}

export default TaskCardComponent;
