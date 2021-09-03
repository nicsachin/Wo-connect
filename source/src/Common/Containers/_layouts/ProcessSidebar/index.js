import React from "react";
import { connect, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  toggleNavbarAction,
  changeActiveSidebarAction,
} from "../../../../Store/actions";
import { IconArrowBackLeft } from "../../../Components/IconsComponent/Index";
import { Scrollbars } from "react-custom-scrollbars";
import "./process-sidebar.scss";
import { CHECKLIST } from "../../../../Constants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import IconArrowBack from "../../../Components/IconsComponent/IconArrowBackLeft";

const Sidebar = (props) => {
  const isNavbarVisible = useSelector((state) => state.navbar);

  return (
    <nav
      id="sidebar-process-fixed"
      className={!isNavbarVisible ? "active" : ""}
    >
      <Scrollbars autoHeight autoHeightMin="100%" autoHeightMax="100%">
        <div className="sidebar-block">
          <div id="sidebar-nav" className={!isNavbarVisible ? "active" : ""}>
            <div className="sidebar-nav-link">
              <div className="sidebar-top-block">
                <Link to={CHECKLIST} className="fs-16">
                  <IconArrowBackLeft /> <span>Back</span>
                </Link>
              </div>
              <div className="sidebar-content">
                <div className="content-block">
                  <h5>{props.checkList && props.checkList.model}</h5>
                  <p> {props.checkList && props.checkList.brief}</p>
                </div>

                <ul className="content-link">
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
                                index !== 0
                                  ? props.moveToTask(index)
                                  : console.log("");
                              }
                            }}
                          >
                            {props.runChecklist ? (
                              <OverlayTrigger
                                placement={
                                  props.task[index].isCompleted ? "right" : ""
                                }
                                overlay={
                                  <Tooltip id={`tooltip-left`}>
                                    This task is already setup. Click here to
                                    view and edit its settings
                                  </Tooltip>
                                }
                              >
                                <div
                                  className={`checkbox checkbox-inline ${
                                    index === props.currentTaskIndex
                                      ? "active"
                                      : ""
                                  }`}
                                >
                                  <label style={{ paddingLeft: 0 }}>
                                    {obj.model}
                                  </label>
                                  <label className="mb-0">
                                    {(index === 0 ||
                                      props.task[index].isCompleted) && (
                                      <input
                                        type="checkbox"
                                        data-ng-model="example.check"
                                        readOnly
                                        checked={
                                          index === 0 ||
                                          props.task[index].isCompleted
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
                              <label>
                                {index !== 0 ? obj.model : "Introduction"}
                              </label>
                            )}
                          </li>
                        )
                      );
                    })}
                </ul>
                {/*{
                                    props.task.length > 1 && props.showRunChecklist && <Link to={`${COMPLIANCE_RUN}${props.checkList.id}`}>
                                        <button className="btn btn-primary btn-md">Run Checklist</button>
                                    </Link>
                                }*/}
              </div>
            </div>
          </div>
        </div>
      </Scrollbars>
    </nav>
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

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
