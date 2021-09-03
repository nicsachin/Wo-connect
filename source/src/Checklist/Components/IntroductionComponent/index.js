import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import renderHTML from "react-render-html";
import {
  API_BASE_URL,
  CHECKLIST_TAB,
  COMPLIANCE_RUN,
} from "../../../Constants";
import replaceHtml from "../../../Services/replaceHtml";
import { Tab, Tabs } from "react-bootstrap";
import { showAlert } from "../../../Services/showAlert";
import callApi from "../../../Services/callApi";
import TaskDescriptionZeroState from "../../../Common/Components/IconsComponent/TaskDescriptionZeroState";
import "./style.scss";

const IntroductionComponent = (props) => {
  const [details, setDetails] = useState([]);

  function getHtmlFromTab(tabName, superSet) {
    return superSet.map((el, index) => {
      if (el.tabName === tabName) {
        return (
          <div key={index} className={el.key + `detail-list`}>
            <div className={"detail-list-title"}>
              <h5>{el.heading}</h5>
            </div>
            {renderHTML(replaceHtml(el.description))}{" "}
          </div>
        );
      }
    });
  }

  function renderChecklistInfo(checklist, task) {
    if (Object.keys(task).length) {
      //for checklist introduction
      if (task.model === "Introduction")
        return renderHTML(replaceHtml(task.description));
      else {
        try {
          if (details.length) {
            let tabsInBackend = details.map((el) => el.tabName);
            return (
              <Tabs
                defaultActiveKey="Overview"
                id="uncontrolled-tab-example"
                className="mb-4 checklist-tab"
              >
                {CHECKLIST_TAB.map((el) => {
                  if (tabsInBackend.indexOf(el) !== -1)
                    return (
                      <Tab eventKey={el} title={el} className={"navlinks-desc"}>
                        {getHtmlFromTab(el, details)}
                      </Tab>
                    );
                })}
              </Tabs>
            );
          } else {
            //  no description in task
            return (
              <div className={"task-description-zero-state"}>
                <div className={"w-100"}>
                  <TaskDescriptionZeroState />
                  <h6 className={"heading-primary mt-4"}>
                    Details and best practices are coming here soon.
                  </h6>
                </div>
              </div>
            );
          }
        } catch (e) {
          showAlert(e, "error");
          return null;
        }
      }
    }
  }

  useEffect(() => {
    if (
      props.selectedTask &&
      props.selectedTask._id &&
      props.selectedChecklist
    ) {
      callApi(
        `${API_BASE_URL}/onboard/task/${props.selectedChecklist}/${props.selectedTask._id}`,
        {},
        { callManifest: false, showLoader: false }
      )
        .then((res) => {
          if (res.status === 200 && res?.data?.details) {
            setDetails(res.data.details);
          } else {
            setDetails([]);
          }
        })
        .catch((e) => {
          showAlert(e, "error");
        });
    }
  }, [props.selectedTask]);

  return (
    <div className={"modal-box-container"}>
      <div className={"header-fixed"}>
        <div className={"header-wrapper"}>
          <div className={"header-title  max-w-85"}>
            <h4 className={"mb-2 heading-primary"}>
              {props.selectedTask && props.selectedTask.model}
            </h4>
            <p className={"mb-0 primary-color"}>
              {props.industry && props.industry}
            </p>
          </div>
          <Link to={`${COMPLIANCE_RUN}${props.selectedChecklist}`}>
            <button className={"btn btn-primary btn-sm"}>Use Checklist</button>
          </Link>
        </div>
      </div>
      <div className={"container-details"}>
        <div className="mxw-750 checklist-img mt-3">
          {renderChecklistInfo(props.selectedChecklist, props.selectedTask)}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(IntroductionComponent);
