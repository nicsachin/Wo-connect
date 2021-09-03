import React from "react";
import { Link } from "react-router-dom";
import IconCheckbox from "../../../../../Common/Components/IconsComponent/SidebarMain/IconCheckbox";
import Tag from "../../../../../Common/Components/Molecule/Atoms/Tag";
import "./style.scss";
const SubBlock = (props) => {
  return (
    <>
      {props.task.map((el, index) => {
        return (
          <div className={"col-xl-4 col-lg-6 col-md-6"}>
            <div className={"element-block"}>
              <div className={"element-header"}>
                <h6 className={"mb-2"}>
                  {el.task && el.task.model
                    ? el.task.model
                    : "" || "No Task Title"}
                </h6>
                <Tag className={"tag-default"}>{el.task.taskType}</Tag>
              </div>
              <div className={"element-meta-list"}>
                <ul>
                  <li className={"element-meta-name d-flex"}>
                    <span className={"element-icon"}>
                      <IconCheckbox />
                    </span>
                    {el.task && el.task.checklist && el.task.checklist.model
                      ? el.task.checklist.model
                      : "No Task Category"}
                  </li>
                </ul>
              </div>
              <div className={"element-bottom"}>
                <div className={"element-data-link"}>
                  <Link to="#" className={"link"}>
                    {/* {el.schedules.length} schedules Running */}
                  </Link>
                </div>
                {/* <AvatarGroup assignee={el.assignee} /> */}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SubBlock;
