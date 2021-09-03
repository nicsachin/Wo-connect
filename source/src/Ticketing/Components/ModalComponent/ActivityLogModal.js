import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ReactPlayer from "react-player";
import IconImage from "../../../Common/Components/IconsComponent/IconImage";
import IconPlay from "../../../Common/Components/IconsComponent/IconPlay";
import { API_BASE_URL } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "./style.scss";
import IconSend from "../../../Common/Components/IconsComponent/IconSend";
import { connect } from "react-redux";
import { toggleLoaderAction } from "../../../Store/actions";
import { getHeaders } from "../../../Services/getHeaders";
import axios from "axios";

const ActivityLogModal = (props) => {
  const [showPlayVideoButton, setShowPlayVideoButton] = useState(true);
  const [remark, setRemark] = useState("");
  const [activityLog, setActivityLog] = useState("");
  const [showButton, setShowButton] = useState(true);
  const [comment, setComment] = useState("");

  const activityHandler = async () => {
    try {
      if (props?.ticketId) {
        let activityResponse = await callApi(
          `${API_BASE_URL}/activity/logs/${props.ticketId}/1000/0`,
          {
            method: "GET",
          }
        );
        if (activityResponse.status === 200) {
          setActivityLog(activityResponse.data.data);
        }
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  useEffect(() => {
    activityHandler();
  }, [props.visibility]);

  const TicketActivityLog = () => {
    return (
      <div>
        <ul className={"element-comment-list"}>
          {activityLog && activityLog.length
            ? activityLog.map((el, index) => {
                return (
                  <li className={"element-comment-item"}>
                    <p className={"comment-text"}>
                      {el && el.remark ? el.remark : ""}
                    </p>
                    <span className={"comment-meta"}>
                      {el && el.created_at ? el.created_at : ""}
                    </span>
                  </li>
                );
              })
            : "No Activity"}
        </ul>
      </div>
    );
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (comment?.trim()) {
      const formData = new FormData();
      formData.append("remark", comment);
      //     //formData.append("file", data.target.files[0]);
      props.toggleLoaderAction(true);

      try {
        axios({
          method: "POST",
          url: `${API_BASE_URL}/ticket/remark/create/${props.ticketId}`,
          data: formData,
          headers: {
            ...getHeaders(),
            "content-type": "multipart/form-data",
          },
        })
          .then((res) => {
            if (res.status === 200) {
              activityHandler();
              showAlert("Comment Added");
            } else {
              showAlert(res.message, "error");
            }
            setComment("");
          })
          .catch((e) => {
            if (e.response && e.response.data && e.response.data.message) {
              showAlert(e.response.data.message, "error");
            } else {
              showAlert(e, "error");
            }
          })
          .finally((e) =>
            setTimeout(() => {
              props.toggleLoaderAction(false);
            }, 800)
          );
      } catch (e) {
        showAlert(e.message, "error");
        props.toggleLoaderAction(false);
      }
    } else {
      showAlert("Please add a comment");
    }
  };

  return (
    <Modal
      size={"lg"}
      className="action-popup"
      show={props.visibility}
      onHide={() => {
        setRemark("");
        setShowButton(true);
        props.onHide();
      }}
    >
      <Modal.Header closeButton>
        <div>
          <h4 className={"mb-1"}>{props.headerTitle}</h4>
          <span>{props.metaDataText}</span>
        </div>
      </Modal.Header>
      <Modal.Body className="mb-0">
        <div className="modal-popup ticket-details">
          <>
            <Tabs>
              <div className={"tab-element"}>
                <TabList>
                  <Tab onClick={() => setShowButton(true)}>Details</Tab>
                  <Tab onClick={() => setShowButton(false)}>Audit Log</Tab>
                </TabList>
                <button
                  className={"btn btn-textIcon float-right btn-sm"}
                  onClick={() => setShowPlayVideoButton(!showPlayVideoButton)}
                >
                  {showButton ? (
                    props?.videoLink && props?.imageLink ? (
                      showPlayVideoButton ? (
                        <span>
                          <IconPlay />
                          View Video
                        </span>
                      ) : (
                        <span>
                          <IconImage />
                          View Image
                        </span>
                      )
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                </button>
              </div>
              <div>
                <TabPanel>
                  <>
                    <div className={"frame-wrapper"}>
                      {showPlayVideoButton ? (
                        <img
                          src={props?.imageLink ? props.imageLink : ""}
                          className={"img-fluid w-auto h-350 mx-auto d-block"}
                        />
                      ) : (
                        <ReactPlayer
                          playing
                          controls={true}
                          className={"mx-auto d-block w-auto h-350"}
                          url={props?.videoLink ? props.videoLink : ""}
                        ></ReactPlayer>
                      )}
                    </div>
                  </>
                  {/* {props?.showCloseTicketSection ? ( */}
                  {props?.eventStatus === "Pass" &&
                  props?.ticketStatus === "To do" ? (
                    <div className="frame-wrapper-comment">
                      <div className={"form-group mb-0"}>
                        <input
                          className="form-control w-100"
                          value={remark}
                          onChange={(e) => {
                            setRemark(e.target.value);
                          }}
                          placeholder="Describe the action taken"
                        />
                      </div>

                      <button
                        className="btn btn-block btn-primary"
                        disabled={remark?.trim() ? false : true}
                        onClick={() => {
                          if (remark) {
                            if (props?.ticketId)
                              props.onChangeStatus(
                                "Closed",
                                remark,
                                props.ticketId
                              );
                            setRemark("");
                          } else {
                            showAlert("Please add a comment");
                          }
                        }}
                      >
                        <span>Close Ticket</span>
                      </button>
                    </div>
                  ) : props?.eventStatus === "Fail" ? (
                    <div className="frame-wrapper-comment justify-content-center">
                      Event is currently in incorrect status
                    </div>
                  ) : props?.ticketStatus === "Closed" ? (
                    <div className="frame-wrapper-comment justify-content-center">
                      Event is currently in closed status
                    </div>
                  ) : (
                    ""
                  )}
                  {/* // ) : ( */}
                  {/* //   "" */}
                  {/* // )} */}
                </TabPanel>
                <TabPanel eventKey="Audit-Log" title="Audit Log">
                  <TicketActivityLog />
                  <form
                  // onSubmit={(event) => {
                  //   addComment(event);
                  // }}
                  >
                    <div className="d-flex justify-content chat-block">
                      <input
                        className="form-control"
                        value={comment}
                        onChange={(e) => {
                          setComment(e.target.value);
                        }}
                        placeholder="Add a comment..."
                      />
                      <button
                        className="btn btn-primary btn-round-icon ml-1"
                        onClick={(e) => {
                          addComment(e);
                        }}
                      >
                        <span>
                          <IconSend />
                        </span>
                      </button>
                    </div>
                  </form>
                </TabPanel>
              </div>
            </Tabs>
          </>
          {/* <Tabs
            defaultActiveKey="Details"
            id="uncontrolled-tab-example"
            className="mb-4"
          >
            <Tab eventKey="Details" title="Details">
              
              <TicketImageDetails />
              {props?.showCloseTicketSection ? (
                <div className="frame-wrapper">
                  <div className={"form-group mt-4"}>
                    <div className="row">
                      <div className={"col-xl-9 col-lg-9"}>
                        <input
                          className="form-control"
                          value={remark}
                          onChange={(e) => {
                            setRemark(e.target.value);
                          }}
                          placeholder="Add a comment..."
                        />
                      </div>
                      <div className={"col-xl-3 col-lg-3"}>
                        <button
                          className="btn btn-block btn-primary"
                          onClick={() => {
                            if (remark) {
                              if (props?.ticketId)
                                props.onChangeStatus(
                                  "Closed",
                                  remark,
                                  props.ticketId
                                );
                              setRemark("");
                            } else {
                              showAlert("Please add a comment");
                            }
                          }}
                        >
                          <span>Close Ticket</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </Tab>
            <Tab eventKey="Audit-Log" title="Audit Log">
              <TicketActivityLog />
            </Tab>
          </Tabs> */}
          <p className="fs-20 primary-color fw-500">{props.headerText}</p>
          <p className="mb-0 fs-14">{props.footerText}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    toggleLoaderAction: (data) => {
      dispatch(toggleLoaderAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityLogModal);

// export default ActivityLogModal;
