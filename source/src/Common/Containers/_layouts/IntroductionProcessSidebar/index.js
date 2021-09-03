import React from "react";
import { connect, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  toggleNavbarAction,
  changeActiveSidebarAction,
} from "../../../../Store/actions";
import { IconArrowBackLeft } from "../../../Components/IconsComponent/Index";
import { Scrollbars } from "react-custom-scrollbars";
import "./style.scss";
import { CHECKLIST } from "../../../../Constants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import IconArrowBack from "../../../Components/IconsComponent/IconArrowBackLeft";

const IntroductionSidebar = (props) => {
  //   const isNavbarVisible = useSelector((state) => state.navbar);

  return (
    <ul className="task-select-list">
      {props.task &&
        props.task.map((obj, index) => {
          return (
            obj.model && (
              <li
                key={index}
                className={`${
                  index === props.currentTaskIndex ? "active" : ""
                }`}
                onClick={() => {
                  if (!props.runChecklist) {
                    props.setSelectedTask(obj);
                    props.setIndex(index);
                  } else {
                    index !== 0 ? props.moveToTask(index) : console.log("");
                  }
                }}
              >
                {props.runChecklist ? (
                  <OverlayTrigger
                    placement={props.task[index].isCompleted ? "right" : ""}
                    overlay={
                      <Tooltip id={`tooltip-left`}>
                        This task is already setup. Click here to view and edit
                        its settings
                      </Tooltip>
                    }
                  >
                    <div
                      className={`checkbox checkbox-inline ${
                        index === props.currentTaskIndex ? "active" : ""
                      }`}
                    >
                      <label style={{ paddingLeft: 0 }}>{obj.model}</label>
                      <label className="mb-0">
                        {(index === 0 || props.task[index].isCompleted) && (
                          <input
                            type="checkbox"
                            data-ng-model="example.check"
                            readOnly
                            checked={
                              index === 0 || props.task[index].isCompleted
                            }
                            className="check-with-label"
                            onChange={() => {}}
                          />
                        )}
                        <span className="box" />
                      </label>
                    </div>
                  </OverlayTrigger>
                ) : (
                  <label>{index !== 0 ? obj.model : "Introduction"}</label>
                )}
              </li>
            )
          );
        })}
    </ul>
  );
};
const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarComponent: () => {
      dispatch(toggleNavbarAction());
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IntroductionSidebar);
