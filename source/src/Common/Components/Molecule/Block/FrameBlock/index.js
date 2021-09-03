import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../../../Constants";
import callApi from "../../../../../Services/callApi";
import { showAlert } from "../../../../../Services/showAlert";
import ActivityLogModal from "../../../../../Ticketing/Components/ModalComponent/ActivityLogModal";
import IconInactive from "../../../IconsComponent/IconInactive";
import Tag from "../../Atoms/Tag";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./style.scss";
import IconExternalLink from "../../../IconsComponent/IconExternalLink";

const FrameBlock = (props) => {
  const onImageClick = () => {
    props.setSelectedTicketId(props?.framedata?._id ? props.framedata._id : "");
    if (props.selectedCloseTicketsNo.length) {
      props.onCheckboxSelect(props?.framedata?._id ? props.framedata._id : "");
    } else {
      props.setActivityLogModalVisibility(true);
      // props.setShowCloseTicketSection(false);
      props.setSelectedTicketData(props?.framedata ? props.framedata : "");
    }
  };

  const renderCheckbox = () => {
    return (
      <div
        className={
          props.selectedCloseTicketsNo.length
            ? "checkbox-inline checkbox checkboxVisible"
            : "checkbox-inline checkbox "
        }
      >
        <label>
          <input
            type="checkbox"
            data-ng-model="example.check"
            className="check-with-label"
            value=""
            onClick={(e) => {
              props.onCheckboxSelect(
                props?.framedata?._id ? props.framedata._id : ""
              );
            }}
            onChange={() => {}}
            checked={
              props.selectedCloseTicketsNo.includes(props.framedata._id)
                ? true
                : false
            }
          />
          <span class="box inline"></span>{" "}
        </label>
      </div>
    );
  };

  return (
    <div className={"col-xl-3 col-lg-4"}>
      <div className={"element-frame-wrapper panel-fh"}>
        <div className={"panel-fh"}>
          <div className={"element-frame-block"}>
            {/* Hover Checkbox
             */}
            {props.selectedCloseTicketsNo.length === 0
              ? renderCheckbox()
              : props?.selectedEventTicketStatus.includes(
                  props?.framedata?.eventStatus
                ) &&
                props?.selectedEventTicketStatus.includes(
                  props?.framedata?.ticketStatus
                )
              ? renderCheckbox()
              : ""}

            {/* Image & Videos */}
            {props?.framedata?.image ? (
              <img
                src={props.framedata.image}
                className={"img-fluid mx-auto d-block"}
                onClick={(e) => onImageClick()}
              />
            ) : (
              ""
            )}
            {/* Video & Image Tag */}
            {props?.framedata?.video ? (
              <div className={"element-tag"}>
                <Tag className={"tag-default"}>Video Available</Tag>
              </div>
            ) : (
              ""
            )}
            {props.selectedCloseTicketsNo.length ? (
              <div className={"external-link"}>
                <OverlayTrigger
                  placement="right"
                  overlay={<Tooltip id={`tooltip-left`}>View Image</Tooltip>}
                >
                  <span
                    onClick={() => {
                      props.setActivityLogModalVisibility(true);
                      // props.setShowCloseTicketSection(false);
                      props.setSelectedTicketData(
                        props?.framedata ? props.framedata : ""
                      );
                    }}
                  >
                    <IconExternalLink />
                  </span>
                </OverlayTrigger>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className={"element-frame-content"}>
            {/* Title & Meta-Date */}
            <div className={"frame-title-wrapper"}>
              <div class={"frame-title-block"}>
                <label className={"mb-0"}>
                  {props?.framedata?.camera?.camera
                    ? props.framedata.camera.camera
                    : ""}
                </label>
              </div>
              <span className={"fw-400 fs-12"}>
                {props?.framedata?.created_at ? props.framedata.created_at : ""}
              </span>
            </div>
            {/* Buttons & MetaData */}
            {!props.showFeedbackText ? (
              <div className={"frame-actions-block"}>
                {/* Buttons & other actions */}
                <div className={"frame-actions"}>
                  {props?.framedata?.closed ? (
                    <>
                      <label className={"fs-12 mb-1 fw-400"}>
                        <strong>Action:</strong>{" "}
                        {props?.framedata?.logs?.comment
                          ? props.framedata.logs.comment
                          : " - "}
                      </label>
                      <div>
                        <button
                          onClick={() => {
                            props.setConfirmationModalVisibility(true);
                            props.setModalDescriotion(
                              "Do you want to reopen ticket?"
                            );
                            props.setAction("To do");
                            props.setSelectedTicketId(
                              props?.framedata?._id ? props.framedata._id : ""
                            );
                          }}
                          disabled={
                            props.selectedCloseTicketsNo.length ? true : false
                          }
                          className={
                            "btn p-0 curser-p reopen-link fs-12 link red-failure-text"
                          }
                        >
                          Reopen
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Close */}
                      <button
                        className={"btn btn-primary btn-sm"}
                        disabled={
                          props.selectedCloseTicketsNo.length ? true : false
                        }
                        // onClick={props.actionOnclick}
                        onClick={() => {
                          props.setActivityLogModalVisibility(true);
                          // props.setShowCloseTicketSection(true);
                          props.setSelectedTicketId(
                            props?.framedata?._id ? props.framedata._id : ""
                          );
                          props.setSelectedTicketData(
                            props?.framedata ? props.framedata : ""
                          );
                        }}
                      >
                        <span className={"icon-sm"}>Close</span>
                      </button>

                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id={`tooltip-left`}>
                            Mark as incorrect
                          </Tooltip>
                        }
                        disabled={
                          props.selectedCloseTicketsNo.length ? true : false
                        }
                      >
                        <button
                          className="btn btn-textIcon p-2 ml-2"
                          disabled={
                            props.selectedCloseTicketsNo.length ? true : false
                          }
                          onClick={() => {
                            props.setConfirmationModalVisibility(true);
                            props.setModalDescriotion(
                              "Do you want to mark ticket as incorrect?"
                            );
                            props.setAction("Fail");
                            props.setSelectedTicketId(
                              props?.framedata?._id ? props.framedata._id : ""
                            );
                          }}
                        >
                          <span>
                            <IconInactive />
                          </span>
                        </button>
                      </OverlayTrigger>

                      {/* )} */}
                    </>
                  )}
                </div>
                {/* Status */}
                <div className={"frame-status"}>
                  {props.showFrameTagStatus && (
                    <Tag
                      className={
                        props?.framedata?.closed ? "tag-success" : "tag-orange"
                      }
                    >
                      {props?.framedata?.ticketStatus
                        ? `${props.framedata.ticketStatus}`
                        : "No events"}
                    </Tag>
                  )}
                </div>
              </div>
            ) : (
              <div className={"frame-actions-block"}>
                {/* Feedback */}
                <lable className={"fs-12 mb-1 fw-400"}>
                  <strong>Action:</strong>{" "}
                  {props?.framedata?.logs?.comment
                    ? props.framedata.logs.comment
                    : " - "}
                  <button
                    className={
                      "btn p-0 curser-p reopen-link ml-1 fs-12 link red-failure-text"
                    }
                    disabled={
                      props.selectedCloseTicketsNo.length ? true : false
                    }
                    onClick={() => {
                      props.setConfirmationModalVisibility(true);
                      props.setModalDescriotion(
                        "Do you want to mark ticket as correct?"
                      );
                      props.setAction("Pass");
                      props.setSelectedTicketId(
                        props?.framedata?._id ? props.framedata._id : ""
                      );
                      // makeCorrectInCorrect("Pass");
                    }}
                  >
                    Undo
                  </button>
                  {/* <Link to="#" className={"fs-12 link red-failure-text"}>
                Undo
              </Link> */}
                </lable>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameBlock;
