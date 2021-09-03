import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import "./style.scss";
import { API_BASE_URL, TICKETING } from "../../../Constants";
import getQueryVariable from "../../../Services/getQueryVariable";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import ReactPlayer from "react-player";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { toggleLoaderAction } from "../../../Store/actions";
import ManifestService from "../../../Services/ManifestService";
import axios from "axios";

import InfiniteScroll from "react-infinite-scroll-component";
import BlocksComponent from "../../../Common/Components/Molecule/Block";
import BlockHeader from "../../../Common/Components/Molecule/Block/BlockHeader";
import DataList from "../../../Common/Components/Molecule/DataList";
import Tag from "../../../Common/Components/Molecule/Atoms/Tag";
import FrameBlock from "../../../Common/Components/Molecule/Block/FrameBlock";
import DonutChart from "../../../Common/Components/Molecule/Charts/DonutChart";
import ActivityLogModal from "../ModalComponent/ActivityLogModal";
import TicketDetailsDefault from "../../../Common/Components/Molecule/Default/TicketsDefaultPages/TicketDetailsDefault";
import ConfirmModal from "../ModalComponent/ConfirmModal";

const TabsData = (props) => {
  const history = useHistory();
  const ticketId = getQueryVariable("id");
  const [ticketDetails, setTicketDetails] = useState({});
  const [ticketFrameDetails, setTickeFrameDetails] = useState([]);
  const [action, setAction] = useState();
  const [totalSelectedTickets, setTotalSelectedTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);
  const [modaldescription, setModalDescriotion] = useState("");

  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicketData, setSelectedTicketData] = useState("");
  const [activityLogModalVisibility, setActivityLogModalVisibility] = useState(
    false
  );
  // const [showCloseTicketSection, setShowCloseTicketSection] = useState(false);

  const getTicketDetail = async (limitPlus) => {
    try {
      if (
        props &&
        props.scheduleDetail &&
        props.scheduleDetail._id &&
        props.taskId &&
        props.locationId &&
        props.date
      ) {
        let url = `${API_BASE_URL}/tickets/group/list/${
          limitPlus ? limitPlus : props.limit
        }/${page}?location=${props.locationId}&task=${props.taskId}&date=${
          props.date
        }`;
        if (props.scheduleDetail._id !== "All") {
          url += `&schedule=${props.scheduleDetail._id}`;
        }
        let ticketResponse = await callApi(
          // `${API_BASE_URL}/event/get/${ticketId}`,
          url,
          {
            method: "GET",
          }
        );
        if (
          ticketResponse &&
          ticketResponse.status &&
          ticketResponse.status === 200
        ) {
          // console.log("ticket res >", ticketResponse);
          // let finalArray = ticketFrameDetails;
          // // let previousData = ticketResponse.data?.data?.length ? ticketResponse.data.data : [];
          // ticketResponse.data.data.map((el) => {
          //   finalArray.push(el);
          // })
          // setTickeFrameDetails(finalArray);
          setTickeFrameDetails(
            ticketResponse.data?.data?.length ? ticketResponse.data.data : []
          );
          setTicketDetails(ticketResponse.data);
          if (limitPlus) props.setLimit(limitPlus);
          // setPage(pageArg);
          if (
            ticketResponse.data?.data?.length &&
            props.callInsertAllTicketsIds
          ) {
            insertAllTicketsIds(ticketResponse.data.data);
          }
        }
      }
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  };

  const updateTicketStatus = (status, remark) => {
    // event.preventDefault();
    const config = {
      url: "",
      method: "",
      body: "",
    };
    let statusId = "";
    if (
      props?.userData?.manifest?.ticketStatus?.length &&
      (status === "To do" || status === "Closed")
    ) {
      props.userData.manifest.ticketStatus.map((el) => {
        if (el.tag === status) {
          statusId = el._id;
        }
      });
    }
    if (selectedTicketId) {
      switch (status) {
        case "Fail": {
          config.url = `${API_BASE_URL}/event/status/update/${selectedTicketId}`;
          config.method = "PUT";
          config.body = JSON.stringify({
            status: status,
          });
          break;
        }
        case "Pass": {
          config.url = `${API_BASE_URL}/event/status/update/${selectedTicketId}`;
          config.method = "PUT";
          config.body = JSON.stringify({
            status: status,
          });
          break;
        }
        case "To do": {
          config.url = `${API_BASE_URL}/ticket/status/update/${selectedTicketId}`;
          config.method = "PUT";
          config.body = JSON.stringify({
            status: statusId,
            remark: remark,
          });
          break;
        }
        case "Closed": {
          config.url = `${API_BASE_URL}/ticket/status/update/${selectedTicketId}`;
          config.method = "PUT";
          config.body = JSON.stringify({
            status: statusId,
            remark: remark,
          });
          break;
        }
        default: {
          break;
        }
      }

      callApi(config.url, {
        method: config.method,
        body: config.body,
      })
        .then((res) => {
          if (res.status === 200) {
            getTicketDetail();
            // showAlert(res.message);
            // if (
            //   action &&
            //   props &&
            //   props.userData &&
            //   props.userData.user &&
            //   props.userData.user.email &&
            //   props.userData.manifest &&
            //   props.userData.manifest.company &&
            //   props.userData.manifest.company.name &&
            //   props.userData.user._id &&
            //   props.userData.manifest._id
            // ) {
            // let title =
            //   action === "update"
            //     ? `Ticket status is ${
            //         selectedStatus && selectedStatus.label
            //           ? selectedStatus.label
            //           : ""
            //       } | Ticketing`
            //     : `${action}d ticket | Ticketing`;
            // window.analytics.track(title, {
            //   title: title,
            //   email: props.userData.user.email,
            //   username: props.userData.user.username,
            //   companyName: props.userData.manifest.company.name,
            //   user_id: props.userData.user._id,
            //   company_id: props.userData.manifest._id,
            //   ticket_id: ticketId,
            // });
            // }
            showAlert(res.message);
          } else showAlert(res.message, "error");
          setConfirmationModalVisibility(false);
          setActivityLogModalVisibility(false);
        })
        .catch((e) => {
          showAlert(e, "error");
          setConfirmationModalVisibility(false);
          setActivityLogModalVisibility(false);
        });
    }
  };

  useEffect(() => {
    try {
      getTicketDetail();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, [
    props?.scheduleDetail ? props.scheduleDetail : "",
    props.loadGetTicketFunction,
  ]);

  const TicketDetailsDataList = [
    {
      dataLabel: "Task:",
      dataString: ticketDetails?.info?.task?.model
        ? ticketDetails.info.task.model
        : "-",
    },
    {
      dataLabel: "Checklist:",
      dataString: ticketDetails?.info?.checklist?.model
        ? ticketDetails.info.checklist.model
        : "-",
    },
    {
      dataLabel: "Location:",
      dataString: ticketDetails?.info?.location?.area
        ? ticketDetails.info.location.area
        : "-",
    },
    {
      dataLabel: "City:",
      dataString: ticketDetails?.info?.city?.area
        ? ticketDetails.info.city.area
        : "-",
    },
    {
      dataLabel: "Schedule:",
      dataString: props?.scheduleDetail?.cronText?.length
        ? props.scheduleDetail.cronText.split(",").map((el) => {
            return (
              <>
                <span>{el}</span>
                <br />
              </>
            );
          })
        : //  props.scheduleDetail.cronText
          "-",
    },
  ];

  const TicketAddDetailsDataList = [
    {
      dataLabel: "Task Type:",
      dataString: ticketDetails?.info?.taskType ? (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <Tag className="tag-default tag-lg">
            {ticketDetails.info.taskType}
          </Tag>
        </div>
      ) : (
        "-"
      ),
    },
    {
      dataLabel: "Assigned to:",
      dataString: ticketDetails?.info?.assignee?.length
        ? ticketDetails.info.assignee.map((el, index) => {
            return (
              <span
                key={index}
                className={"fs-14 fw-400 text-primary c-pointer mb-0 mr-1"}
              >
                {el.name}
                {ticketDetails.info.assignee.length > 1 &&
                index !== ticketDetails.info.assignee.length - 1
                  ? ","
                  : ""}
              </span>
            );
          })
        : "-",
    },
    {
      dataLabel: "Date :",
      dataString: ticketDetails?.info?.formattedDate
        ? ticketDetails.info.formattedDate
        : "-",
    },
  ];

  // Chart DataList
  // const dataList = [
  //   { angle: ticketDetails?.total ? ticketDetails.total : 0, color: "#EBF0FD" },
  //   {
  //     angle: ticketDetails?.totalClosed ? ticketDetails.totalClosed : 0,
  //     color: "#3766E8",
  //   },
  // ];

  const dataList = [
    {
      angle: ticketDetails?.totalClosed ? ticketDetails.totalClosed : 0,
      color: "#3766E8",
    },
    {
      angle: ticketDetails?.total
        ? ticketDetails.total - ticketDetails?.totalClosed
        : 0,
      color: "#EBF0FD",
    },
  ];

  useEffect(() => {
    setTotalSelectedTickets(props.selectedCloseTicketsNo);
  }, []);

  const insertAllTicketsIds = (ticketFrameDetail) => {
    let array = [];
    ticketFrameDetail?.length &&
      ticketFrameDetail.map((el) => {
        if (
          props?.selectedEventTicketStatus.includes(el?.eventStatus) &&
          props?.selectedEventTicketStatus.includes(el?.ticketStatus)
        )
          array.push(el._id);
      });
    props.insertAllTickets(array);
  };

  useEffect(() => {
    if (props.callInsertAllTicketsIds) insertAllTicketsIds(ticketFrameDetails);
    else props.insertAllTickets([]);
  }, [props.callInsertAllTicketsIds]);

  //Set Ticket and Event status of 1st selected ticket
  useEffect(() => {
    if (props.selectedCloseTicketsNo?.length === 1) {
      ticketFrameDetails?.length &&
        ticketFrameDetails.map((el) => {
          if (el._id === props.selectedCloseTicketsNo[0]) {
            props.setSelectedEventTicketStatus([
              el?.eventStatus,
              el?.ticketStatus,
            ]);
          }
        });
    }
    if (props.selectedCloseTicketsNo?.length === 0) {
      props.setSelectedEventTicketStatus([]);
    }
  }, [props.selectedCloseTicketsNo]);

  return (
    <>
      <div className={"row"}>
        <div className={"col-xl-4 col-lg-6 col-md-6"}>
          <BlocksComponent>
            <div className={"element-section mb-0 panel-fh "}>
              <BlockHeader>
                <h5 className={"element-title-h5"}>
                  {ticketDetails?.info?.title
                    ? ticketDetails.info.title
                    : "No ticket title"}
                </h5>
              </BlockHeader>
              <tbody className={"data-table-list"}>
                {TicketDetailsDataList.map((data) => (
                  <DataList
                    dataLabel={data.dataLabel}
                    dataString={data.dataString}
                  />
                ))}
              </tbody>
            </div>
          </BlocksComponent>
        </div>
        <div className={"col-xl-4 col-lg-6 col-md-6"}>
          <BlocksComponent>
            <div className={"element-section mb-0 panel-fh "}>
              <BlockHeader>
                <h6 className={"element-title-h6"}>Additional Details</h6>
              </BlockHeader>
              <tbody className={"data-table-list"}>
                {TicketAddDetailsDataList.map((data) => (
                  <DataList
                    dataLabel={data.dataLabel}
                    dataString={data.dataString}
                  />
                ))}
              </tbody>
            </div>
          </BlocksComponent>
        </div>
        <div className={"col-xl-4 col-lg-6 col-md-6"}>
          <BlocksComponent>
            <div className={"element-section mb-0 panel-fh "}>
              <BlockHeader>
                <h6 className={"element-title-h6"}>Event Status</h6>
              </BlockHeader>
              <div className={"element-block-wrapper"}>
                <div className={"chart-block mr-3"}>
                  <DonutChart
                    showCenterLabel={
                      dataList?.length && dataList[0]?.angle
                        ? dataList[0].angle
                        : "0"
                    }
                    msgInMiddle="Closed"
                    fetchDataList={dataList}
                  />
                </div>
                <div className={"chart-meta-data"}>
                  <p className={"fs-16 fw-500 mb-1 text-primary"}>
                    {" "}
                    Total {ticketDetails?.total
                      ? ticketDetails.total
                      : "0"}{" "}
                    events detected.
                  </p>
                  <p className={"fs-14 mb-0 text-primary"}>
                    Stay at the top of industry best practices, by closing all
                    events on time.
                  </p>
                </div>
              </div>
              {/*     
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
                </ul> */}
              {/* <form
                  onSubmit={(event) => {
                    addComment(event);
                  }}
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
                      // onClick={addComment}
                    >
                      <span>
                        <IconSend />
                      </span>
                    </button>
                  </div>
                </form> */}
            </div>
          </BlocksComponent>
        </div>
      </div>

      {ticketDetails?.data?.length ? (
        <div>
          <InfiniteScroll
            dataLength={ticketDetails?.limit ? ticketDetails.limit : 0}
            next={() => getTicketDetail(props.limit + 20)}
            hasMore={
              ticketDetails?.hasNextPage ? ticketDetails.hasNextPage : false
            }
            loader={<div className="loader">Loading ...</div>}
            endMessage={
              <div className={"text-center mt-5"}>
                <h3 className={"mb-2 text-other"}>
                  <strong>Yay!</strong>
                </h3>
                <span className={"fs-14 text-other"}>You have seen it all</span>
              </div>
            }
            // initialScrollY={500}
            useWindow={false}
            style={{ overflow: "hidden" }}
            // scrollableTarget="scrollableDiv"
          >
            <div className={"grid-block"}>
              <div className={"row"}>
                {ticketFrameDetails.map((el) => {
                  return (
                    <FrameBlock
                      framedata={el}
                      manifest={
                        props?.userData?.manifest ? props.userData.manifest : ""
                      }
                      frameTitle={"Main Office Camera"}
                      frameMeta={"May 23, 10:56 PM"}
                      selectedCloseTicketsNo={props.selectedCloseTicketsNo}
                      totalSelectedTickets={totalSelectedTickets}
                      onCheckboxSelect={props.insertSelectedTickets}
                      showCloseBtn={true}
                      actionOnclick={() => setConfirmationModalVisibility(true)}
                      showActionText={false}
                      showFrameTagStatus={true}
                      showFeedbackText={
                        el?.eventStatus === "Fail" ? true : false
                      }
                      setConfirmationModalVisibility={
                        setConfirmationModalVisibility
                      }
                      setModalDescriotion={setModalDescriotion}
                      updateTicketStatusFunction={updateTicketStatus}
                      setAction={setAction}
                      setSelectedTicketId={setSelectedTicketId}
                      setActivityLogModalVisibility={
                        setActivityLogModalVisibility
                      }
                      selectedEventTicketStatus={
                        props.selectedEventTicketStatus
                      }
                      setSelectedEventTicketStatus={
                        props.setSelectedEventTicketStatus
                      }
                      // setShowCloseTicketSection={setShowCloseTicketSection}
                      setSelectedTicketData={setSelectedTicketData}
                      checked={
                        props.selectedCloseTicketsNo.includes(el._id)
                          ? true
                          : false
                      }
                    />
                  );
                })}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      ) : (
        <TicketDetailsDefault />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        visibility={confirmationModalVisibility}
        onHide={() => {
          setConfirmationModalVisibility(false);
          setModalDescriotion("");
        }}
        headerText={"Confirm Action"}
        paragraphText={modaldescription}
        cancelOnclick={() => {
          setConfirmationModalVisibility(false);
          // setAction("");
        }}
        confirmOnclick={() => {
          if (action && action === "To do") updateTicketStatus("To do");
          else if (action && action === "Pass") updateTicketStatus("Pass");
          else if (action && action === "Fail") updateTicketStatus("Fail");
        }}
      />
      {/* <Modal
        className="action-popup"
        show={confirmationModalVisibility}
        onHide={() => {
          setConfirmationModalVisibility(false);
          setModalDescriotion("");
        }}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="modal-popup">
            <p className="fs-20 primary-color fw-500">Are you sure?</p>
            <p className="mb-0 fs-14">{modaldescription}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="align-right">
            <button
              variant="primary"
              className="btn-primary btn-xs btn mr-2"
              onClick={() => {
                if (action && action === "To do") updateTicketStatus("To do");
                else if (action && action === "Pass")
                  updateTicketStatus("Pass");
                else if (action && action === "Fail")
                  updateTicketStatus("Fail");
              }}
            >
              Yes
            </button>
            <button
              className="btn-tertiary btn-xs btn"
              onClick={() => {
                setConfirmationModalVisibility(false);
                // setAction("");
              }}
            >
              No
            </button>
          </div>
        </Modal.Footer>
      </Modal> */}

      <ActivityLogModal
        visibility={activityLogModalVisibility}
        setVisiblity={setActivityLogModalVisibility}
        headerTitle={selectedTicketData?.title ? selectedTicketData.title : ""}
        metaDataText={
          selectedTicketData?.camera?.camera
            ? selectedTicketData.camera.camera
            : "" + " • " + selectedTicketData?.created_at
            ? selectedTicketData.created_at
            : ""
        }
        onHide={() => {
          setActivityLogModalVisibility(false);
          // setAction("");
        }}
        imageLink={selectedTicketData?.image ? selectedTicketData.image : ""}
        videoLink={selectedTicketData?.video ? selectedTicketData.video : ""}
        onChangeStatus={updateTicketStatus}
        // showCloseTicketSection={showCloseTicketSection}
        ticketId={selectedTicketData?._id ? selectedTicketData._id : ""}
        ticketStatus={
          selectedTicketData?.ticketStatus
            ? selectedTicketData.ticketStatus
            : ""
        }
        eventStatus={
          selectedTicketData?.eventStatus ? selectedTicketData.eventStatus : ""
        }
        // setSelectedTicketId={setSelectedTicketId(selectedTicketData._id)}
        // setTicketRemark={setRemark}
        // setTicketAction= {setAction}
        // showOnChnage={(e) => {
        //   setComment(e.target.value);
        // }}
        // showValue={comment}
        // showCommentText={
        //   activityLog && activityLog.remark ? activityLog.remark : ""
        // }
        // showCommentMeta={
        //   activityLog && activityLog.created_at ? activityLog.created_at : ""
        // }
      />
    </>
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

export default connect(mapStateToProps, mapDispatchToProps)(TabsData);
