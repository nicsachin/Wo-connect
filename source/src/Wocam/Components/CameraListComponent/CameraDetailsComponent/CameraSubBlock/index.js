import React from "react";
import "./style.scss";
import RecordingsCardComponent from "./RecordingsCardComponent";
import TaskCardComponent from "./TaskCardComponent";

// task = [] , recordings = [] , camera = {}
const SubBlock = (props) => {
  return (
    <>
      {/*render direct recording*/}
      <>
        <div className={"sub-page-title"}>
          <h5 className={"mb-0"}>Recordings</h5>
        </div>
        <div className={"row"}>
          {props?.isEmployee &&
          props?.recordings &&
          !props.recordings.length ? (
            <div className="col-md-6 mb-4">
              <div class="block-wrapper">No recordings are assigned.</div>
            </div>
          ) : (
            <RecordingsCardComponent
              recordings={props.recordings ? props.recordings : []}
              camera={props.camera}
              successCallBack={props.successCallBack}
              isEmployee={props.isEmployee}
            />
          )}
        </div>
      </>
      {/**/}
      <>
        <div className={"sub-page-title"}>
          <h5 className={"mb-0"}>Tasks </h5>
        </div>
        <div className={"row"}>
          {/*render tasks*/}
          {props.tasks.length ? (
            <TaskCardComponent tasks={props.tasks} />
          ) : (
            <div className="col-md-6 mb-4">
              <div class="block-wrapper">
                {props?.errorMsg ? props.errorMsg : ""}
              </div>
            </div>
          )}
        </div>
      </>
      {/*  */}
    </>
  );
};

export default SubBlock;
