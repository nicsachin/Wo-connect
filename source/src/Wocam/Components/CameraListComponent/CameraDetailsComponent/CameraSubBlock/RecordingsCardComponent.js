import React, { useState } from "react";
import {
  IconAdd,
  IconLocation,
  IconPencil,
  IconTrash,
} from "../../../../../Common/Components/IconsComponent/Index";
import Tag from "../../../../../Common/Components/Molecule/Atoms/Tag";
import { Button, OverlayTrigger } from "react-bootstrap";
import scheduleInfo from "../../../../../Common/Components/Molecule/ScheduleInfo";
import IconInfoSvg from "../../../../../Common/Components/IconsComponent/IconInfoSvg";
import AvatarGroup from "../../../../../Common/Components/Molecule/AvatarsGroup";
import DirectRecordingModal from "../../../ModalComponents/DirectRecordingModal";
import IconAddRecording from "../../../../../Common/Components/IconsComponent/Wocam/IconAddRecording";
import "./style.scss";
import IconDelete from "../../../../../Common/Components/IconsComponent/IconDelete";
import ConfirmationModal from "../../../ModalComponents/ConfirmationModal";
import { showAlert } from "../../../../../Services/showAlert";
import callApi from "../../../../../Services/callApi";
import { API_BASE_URL } from "../../../../../Constants";
function RecordingsCardComponent(props) {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [
    directRecordingModalVisibility,
    setDirectRecordingModalVisibilitiy,
  ] = useState(false);

  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);

  function deleteDirectRecording(props) {
    try {
      const idToDelete = selectedCamera.directRecording[0]._id;
      callApi(
        `${API_BASE_URL}/task/delete/${idToDelete}`,
        { method: "POST" },
        { showLoader: true, callManifest: true, loaderLabel: "" }
      ).then((res) => {
        if (res && res.status === 200) {
          props.successCallBack();
          showAlert(res.message);
          setConfirmationModalVisibility(false);
        }
      });
    } catch (e) {
      showAlert(e, "error");
    }
  }

  function renderRecordings(props) {
    return props.recordings.map((el, index) => {
      return (
        <div className={"col-xl-4 col-lg-6"}>
          <div className={"element-block panel-fh min-height-200px"}>
            <div className={"element-header d-flex justify-content-between"}>
              <div className={"element-header-title"}>
                <h6 className={"mb-2"}>Direct Recording</h6>
                <Tag className={"tag-default"}>{el.usecaseType}</Tag>
              </div>
              {props && !props.isEmployee ? (
                <div>
                  {" "}
                  <button
                    className={"btn btn-single-icon"}
                    onClick={() => {
                      setSelectedCamera({
                        ...props.camera,
                        directRecording: [el],
                      });
                      setDirectRecordingModalVisibilitiy(true);
                    }}
                  >
                    <span>
                      <IconPencil />
                    </span>
                  </button>
                  <button
                    className={"btn btn-single-icon"}
                    onClick={() => {
                      setSelectedCamera({
                        ...props.camera,
                        directRecording: [el],
                      });
                      setConfirmationModalVisibility(true);
                    }}
                  >
                    <span>
                      <IconTrash />
                    </span>
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className={"element-meta-list"}>
              <ul>
                <li className={"element-meta-name d-flex mt-4"}>
                  <span className={"element-icon"}>
                    <IconLocation />
                  </span>
                  {el?.location?.area || "-"}
                </li>
              </ul>
            </div>
            <div className={"element-bottom d-block mt-4"}>
              <div className={"element-data-link"}>
                <ul className={"mb-0"}>
                  {/*<li className={"data-title row"}>*/}
                  {el.schedules.map((schedule, index) => {
                    return (
                      <li
                        className={"list-inline-item setup-list-wrapper"}
                        key={index}
                      >
                        <label className={"mb-0 fw-400 mr-2"}>
                          {schedule.schedule}
                        </label>
                        <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="right"
                          overlay={scheduleInfo(schedule)}
                        >
                          <span>
                            <IconInfoSvg />
                          </span>
                        </OverlayTrigger>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className={"float-right"}>
                {props && props.isEmployee ? (
                  ""
                ) : (
                  <AvatarGroup assignee={el.assignee} />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  function renderAddRecording(props) {
    return (
      <div className={"col-4"}>
        <div className={"element-block panel-fh"}>
          <div className={"element-header text-center"}>
            <IconAddRecording />

            {/*<label className={"text-center"}>Direct Recording</label>*/}
            <h6 className={"mt-1"}>Direct recording</h6>
          </div>

          <div
            className={"mx-auto text-center mxw-350 setup-wrapper text-center"}
          >
            <p>
              Record videos through your camera of activities occurring at the
              location without assigning any task. Click the button below.
            </p>

            <Button
              variant="primary"
              className="btn-primary btn-sm btn btn-text-icon"
              onClick={() => {
                setSelectedCamera({
                  ...props.camera,
                  directRecording: [props.recordings],
                });
                setDirectRecordingModalVisibilitiy(true);
              }}
            >
              <span className={"icon-sm"}>
                <IconAdd />
                Setup Direct Recording
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/*direct recording modal*/}
      <DirectRecordingModal
        camera={selectedCamera}
        visibility={directRecordingModalVisibility}
        onHide={() => {
          props.successCallBack();
          setDirectRecordingModalVisibilitiy(false);
        }}
      />

      {/*  Confirmation modal*/}
      <ConfirmationModal
        visibility={confirmationModalVisibility}
        setVisiblity={setConfirmationModalVisibility}
        headerText={"Are you sure ?"}
        footerText={`Do you want to delete`}
        onYes={() => {
          deleteDirectRecording(props);
        }}
        onNo={() => {
          setConfirmationModalVisibility(false);
        }}
        onHide={() => {
          props.successCallBack();
          setConfirmationModalVisibility(false);
        }}
      />
      {props?.recordings?.length
        ? renderRecordings(props)
        : renderAddRecording(props)}
      {/* {props?.recordings ? renderRecordings(props) : renderAddRecording(props)} */}
    </>
  );
}

export default RecordingsCardComponent;
