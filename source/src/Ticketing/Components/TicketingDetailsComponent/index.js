import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import IconArrowLeft from "../../../Common/Components/IconsComponent/IconArrowLeft";
import "./style.scss";
import { API_BASE_URL, TICKETING, TICKETING_DETAILS } from "../../../Constants";
import getQueryVariable from "../../../Services/getQueryVariable";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import ReactPlayer from "react-player";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { toggleLoaderAction } from "../../../Store/actions";
import ManifestService from "../../../Services/ManifestService";
import axios from "axios";
import { getHeaders } from "../../../Services/getHeaders";
import Dropbutton from "../../../Common/Components/Molecule/Atoms/Dropbutton";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import IconTrash from "../../../Common/Components/IconsComponent/IconTrash";
import BlocksComponent from "../../../Common/Components/Molecule/Block";
import BlockHeader from "../../../Common/Components/Molecule/Block/BlockHeader";
import DataList from "../../../Common/Components/Molecule/DataList";
import Tag from "../../../Common/Components/Molecule/Atoms/Tag";
import IconSend from "../../../Common/Components/IconsComponent/IconSend";
import ConfirmModal from "../ModalComponent/ConfirmModal";
import FrameBlock from "../../../Common/Components/Molecule/Block/FrameBlock";
import DonutChart from "../../../Common/Components/Molecule/Charts/DonutChart";
import ActivityLogModal from "../ModalComponent/ActivityLogModal";
import TabsData from "./TicketingDetails";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import TicketingDetails from "./TicketingDetails";
import { ContinuousColorLegend } from "react-vis";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import TicketDetailsDefault from "../../../Common/Components/Molecule/Default/TicketsDefaultPages/TicketDetailsDefault";
import IconInactive from "../../../Common/Components/IconsComponent/IconInactive";
import { CloseTicketModalError } from "../../Resources";
import IconActive from "../../../Common/Components/IconsComponent/IconActive";

const TicketingDetailsComponent = (props) => {
  const history = useHistory();
  const taskId = getQueryVariable("task");
  const locationId = getQueryVariable("location");
  const date = getQueryVariable("date");
  let defaultErrorLabels = {
    modalDesc: "",
  };
  const [scheduleList, setScheduleList] = useState([]);
  const [selectedCloseTicketsNo, setSelectedCloseTicketsNo] = useState([]);
  const [finalObject, setFinalObject] = useState({});
  const [loadGetTicketFunction, setLoadGetTicketFunction] = useState(false);
  const [callInsertAllTicketsIds, setCallInsertAllTicketsIds] = useState(false);
  const [selectedEventTicketStatus, setSelectedEventTicketStatus] = useState(
    ""
  );

  const [description, setDescription] = useState("");
  const [modalVisibility, setModalVisibility] = useState(false);
  const [action, setAction] = useState();
  const [modaldescription, setModalDescription] = useState([""]);
  const [selectedDate, SetSelectedDate] = useState(date);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState(defaultErrorLabels);

  const [regionShow, setRegionShow] = useState(false);
  const closeTo = () => {
    setError(defaultErrorLabels);
    setRegionShow(false);
    setDescription("");
    setAction("");
  };

  const getScheduleList = async () => {
    try {
      let scheduleResponse = await callApi(
        `${API_BASE_URL}/filter/schedule?location=${locationId}&task=${taskId}&date=${date}`,
        {
          method: "GET",
        }
      );
      if (scheduleResponse && scheduleResponse.status === 200) {
        if (scheduleResponse.data.length > 1) {
          let finalText = [];
          scheduleResponse.data.map((el, index) => {
            if (index < 3) {
              finalText.push(el.cronText);
            }
          });
          setFinalObject({
            cronText: finalText.toString(),
            schedule: "All",
            _id: "All",
          });
        }
        setScheduleList(scheduleResponse.data);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  useEffect(() => {
    getScheduleList();
  }, [selectedDate]);

  /**
   * Delete Ticket and Update Status
   * */
  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };

    switch (action) {
      case "Delete": {
        config.url = `${API_BASE_URL}/ticket/delete`;
        config.method = "DELETE";
        config.body = JSON.stringify({
          ids: selectedCloseTicketsNo,
        });
        break;
      }
      case "Fail": {
        config.url = `${API_BASE_URL}/events/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          ids: selectedCloseTicketsNo,
          status: "Fail",
        });
        break;
      }
      case "Pass": {
        config.url = `${API_BASE_URL}/events/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          ids: selectedCloseTicketsNo,
          status: "Pass",
        });
        break;
      }
      case "Close": {
        if (!handleValidation()) return;
        config.url = `${API_BASE_URL}/ticket/close`;
        config.method = "PUT";
        config.body = JSON.stringify({
          ids: selectedCloseTicketsNo,
          remark: description,
        });
        break;
      }
      case "To do": {
        config.url = `${API_BASE_URL}/tickets/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          ids: selectedCloseTicketsNo,
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
          showAlert(res.message);
          setLoadGetTicketFunction(!loadGetTicketFunction);
          setSelectedCloseTicketsNo([]);
          setAction("");
          setDescription("");
          setModalVisibility(false);
          setRegionShow(false);
          setModalDescription("");
          setCallInsertAllTicketsIds(false);
        } else showAlert(res.message, "error");
      })
      .catch((e) => {
        showAlert(e, "error");
      });
  };

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };

    if (description === "") {
      errorInForm = {
        ...errorInForm,
        modalDesc: CloseTicketModalError.modalDesc,
      };
      validationSuccess = false;
    }
    setError(errorInForm);
    return validationSuccess;
  };

  const insertSelectedTickets = (e) => {
    if (selectedCloseTicketsNo.includes(e)) {
      let finalyArray = selectedCloseTicketsNo;
      finalyArray.map((el, index) => {
        if (el === e) {
          finalyArray.splice(index, 1);
        }
      });

      let array = [];
      finalyArray.map((el, index) => {
        array.push(el);
      });
      setSelectedCloseTicketsNo(array);
    } else {
      setSelectedCloseTicketsNo([...selectedCloseTicketsNo, e]);
    }
  };

  const insertAllTickets = (ids) => {
    setSelectedCloseTicketsNo(ids);
  };

  useEffect(() => {
    if (!selectedCloseTicketsNo?.length) setCallInsertAllTicketsIds(false);
  }, [selectedCloseTicketsNo]);

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        {/* page-header */}
        <PageTitle
          pageTitle={"Ticket Details"}
          showSubTitle={false}
          subTitle={false}
          breadcrumb={[
            { name: "Tickets", link: TICKETING },
            { name: "Ticket Details" },
          ]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <Datetime
                timeFormat={false}
                className={"form-invisible form-size-sm calender-icon"}
                value={selectedDate}
                dateFormat="YYYY-MM-DD"
                // key={"nameofpicker" + endsOn?.getDate}
                onChange={(date) => {
                  if (moment(date).format("YYYY-MM-DD") === "Invalid date")
                    return;
                  SetSelectedDate(moment(date).format("YYYY-MM-DD"));
                  // setLoadGetTicketFunction(!loadGetTicketFunction);
                  history.push(
                    `${TICKETING_DETAILS}?location=${locationId}&task=${taskId}&date=${moment(
                      date
                    ).format("YYYY-MM-DD")}`
                  );
                  setLimit(20);
                  // }
                }}
                isValidDate={(current) =>
                  current.isBefore(moment().subtract(0, "day"))
                }
              />
            </li>
            {selectedEventTicketStatus.includes("To do") &&
            selectedEventTicketStatus.includes("Pass") ? (
              <li className={"list-inline-item ml-3"}>
                <button
                  className={"btn btn-primary btn-sm"}
                  // disabled={selectedCloseTicketsNo?.length ? false : true}
                  onClick={() => {
                    if (selectedCloseTicketsNo?.length) {
                      setAction("Close");
                      // setModalVisibility(true);
                      setRegionShow(true);
                      setModalDescription(
                        "Do you want to close all selected tickets?"
                      );
                    } else showAlert("Please select tickets to close");
                  }}
                >
                  <span>
                    Close Selected{" "}
                    {selectedCloseTicketsNo?.length
                      ? "(" + selectedCloseTicketsNo.length + ")"
                      : ""}
                  </span>
                </button>
              </li>
            ) : (
              ""
            )}
            {selectedEventTicketStatus.includes("Closed") &&
            selectedEventTicketStatus.includes("Pass") ? (
              <li className={"list-inline-item ml-3"}>
                <button
                  className={"btn btn-primary btn-sm"}
                  // disabled={selectedCloseTicketsNo?.length ? false : true}
                  onClick={() => {
                    // if (selectedCloseTicketsNo?.length) {
                    //   setAction("Close");
                    //   // setModalVisibility(true);
                    //   setRegionShow(true);
                    //   setModalDescription(
                    //     "Do you want to close all selected tickets?"
                    //   );
                    // } else showAlert("Please select tickets to close");
                    if (selectedCloseTicketsNo?.length) {
                      setAction("To do");
                      setModalVisibility(true);
                      setModalDescription("Do you want to reopen tickets?");
                    } else showAlert("Please select tickets to reopen");
                  }}
                >
                  <span>
                    Reopen Selected{" "}
                    {selectedCloseTicketsNo?.length
                      ? "(" + selectedCloseTicketsNo.length + ")"
                      : ""}
                  </span>
                </button>
              </li>
            ) : (
              ""
            )}
            {selectedCloseTicketsNo?.length ? (
              <li className={"list-inline-item "}>
                {!callInsertAllTicketsIds ? (
                  <button
                    onClick={() => {
                      setCallInsertAllTicketsIds(true);
                    }}
                    disabled={selectedCloseTicketsNo?.length ? false : true}
                    className={"btn btn-textIcon btn-sm"}
                  >
                    Select All
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCallInsertAllTicketsIds(false);
                    }}
                    className={"btn btn-textIcon btn-sm"}
                  >
                    Deselect All
                  </button>
                )}
              </li>
            ) : (
              ""
            )}

            {selectedEventTicketStatus.includes("To do") &&
            selectedEventTicketStatus.includes("Pass") ? (
              <li className={"list-inline-item frame-actions"}>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>Mark as incorrect</Tooltip>
                  }
                >
                  <button
                    className="btn btn-textIcon p-2"
                    // disabled={selectedCloseTicketsNo?.length ? false : true}
                    onClick={() => {
                      if (selectedCloseTicketsNo?.length) {
                        setAction("Fail");
                        setModalVisibility(true);
                        setModalDescription(
                          "Do you want to mark tickets as incorrect?"
                        );
                      } else showAlert("Please select tickets to delete");
                      // props.setConfirmationModalVisibility(true);
                      // props.setModalDescriotion(
                      //   "Do you want to mark ticket as incorrect?"
                      // );
                      // props.setAction("Fail");
                      // props.setSelectedTicketId(
                      //   props?.framedata?._id ? props.framedata._id : ""
                      // );
                    }}
                  >
                    <span>
                      <IconInactive />
                    </span>
                  </button>
                </OverlayTrigger>
              </li>
            ) : (
              ""
            )}
            {selectedEventTicketStatus.includes("To do") &&
            selectedEventTicketStatus.includes("Fail") ? (
              <li className={"list-inline-item frame-actions"}>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>Mark as correct</Tooltip>
                  }
                >
                  <button
                    className="btn btn-textIcon p-2"
                    // disabled={selectedCloseTicketsNo?.length ? false : true}
                    onClick={() => {
                      if (selectedCloseTicketsNo?.length) {
                        setAction("Pass");
                        setModalVisibility(true);
                        setModalDescription(
                          "Do you want to mark tickets as correct?"
                        );
                      } else showAlert("Please select tickets to delete");
                    }}
                  >
                    <span>
                      <IconActive />
                    </span>
                  </button>
                </OverlayTrigger>
              </li>
            ) : (
              ""
            )}
            {props?.userData?.user?.role === "Account Manager" ? (
              <li className={"list-inline-item"}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id={`tooltip-top`}>Delete</Tooltip>}
                >
                  <button
                    className="btn btn-textIcon p-2 ml-2"
                    // disabled={selectedCloseTicketsNo?.length ? false : true}
                    onClick={() => {
                      if (selectedCloseTicketsNo?.length) {
                        setAction("Delete");
                        setModalVisibility(true);
                        setModalDescription("Do you want to delete?");
                      } else showAlert("Please select tickets to delete");
                    }}
                  >
                    <span>
                      <IconTrash />
                    </span>
                  </button>
                </OverlayTrigger>
              </li>
            ) : null}
          </ActionBlock>
        </PageTitle>

        <>
          <Tabs>
            <div className={"tab-element"}>
              {scheduleList && scheduleList?.length ? (
                <label className={"fw-500 fs-14 mb-3"}>Filter by:</label>
              ) : (
                ""
              )}
              <TabList>
                {scheduleList && scheduleList?.length > 1 ? (
                  <Tab onClick={() => setCallInsertAllTicketsIds(false)}>
                    All Schedules
                  </Tab>
                ) : (
                  ""
                )}
                {scheduleList && scheduleList.length
                  ? scheduleList.map((el) => {
                      return (
                        <Tab onClick={() => setCallInsertAllTicketsIds(false)}>
                          {el.schedule}
                        </Tab>
                      );
                    })
                  : ""}
              </TabList>
            </div>
            <div>
              {scheduleList && scheduleList?.length > 1 ? (
                <TabPanel>
                  <TicketingDetails
                    loadGetTicketFunction={loadGetTicketFunction}
                    tab="19"
                    scheduleDetail={finalObject}
                    locationId={locationId}
                    taskId={taskId}
                    date={selectedDate}
                    limit={limit}
                    setLimit={setLimit}
                    selectedCloseTicketsNo={selectedCloseTicketsNo}
                    setSelectedCloseTicketsNo={setSelectedCloseTicketsNo}
                    insertSelectedTickets={(e) => insertSelectedTickets(e)}
                    callInsertAllTicketsIds={callInsertAllTicketsIds}
                    insertAllTickets={(e) => insertAllTickets(e)}
                    selectedEventTicketStatus={selectedEventTicketStatus}
                    setSelectedEventTicketStatus={setSelectedEventTicketStatus}
                  />
                </TabPanel>
              ) : (
                ""
              )}
              {scheduleList && scheduleList.length ? (
                scheduleList.map((el, index) => {
                  return (
                    <TabPanel>
                      <TicketingDetails
                        loadGetTicketFunction={loadGetTicketFunction}
                        tab="1"
                        scheduleDetail={el}
                        locationId={locationId}
                        taskId={taskId}
                        date={date}
                        limit={limit}
                        setLimit={setLimit}
                        selectedCloseTicketsNo={selectedCloseTicketsNo}
                        setSelectedCloseTicketsNo={setSelectedCloseTicketsNo}
                        insertSelectedTickets={(e) => insertSelectedTickets(e)}
                        callInsertAllTicketsIds={callInsertAllTicketsIds}
                        insertAllTickets={(e) => insertAllTickets(e)}
                        selectedEventTicketStatus={selectedEventTicketStatus}
                        setSelectedEventTicketStatus={
                          setSelectedEventTicketStatus
                        }
                      />
                    </TabPanel>
                  );
                })
              ) : (
                <TicketDetailsDefault />
              )}
            </div>
          </Tabs>
        </>
        {/* Confirm Modal */}
        <ConfirmModal
          visibility={modalVisibility}
          onHide={() => {
            setModalVisibility(false);
            setAction("");
          }}
          headerText={"Confirm Action"}
          paragraphText={modaldescription}
          cancelOnclick={() => {
            setModalVisibility(false);
            setAction("");
          }}
          confirmOnclick={() => {
            actionHandler();
          }}
        />
        {/* <Modal
          className="action-popup"
          show={modalVisibility}
          onHide={() => {
            setModalVisibility(false);
            setAction("");
          }}
        >
          <Modal.Header />
          <Modal.Body>
            <div className="modal-popup mt-2">
              <p className="fs-18 fw-500">Are you sure?</p>
              <p className="mb-0 fs-14">{modaldescription}</p>
            </div>
          </Modal.Body>
          <div className="divider" />
          <Modal.Footer>
            <div className="align-right m-0">
              <button
                className="btn btn-link fw-400 fs-14 btn-sm"
                onClick={() => {
                  setModalVisibility(false);
                  setAction("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary ml-2"
                onClick={() => {
                  actionHandler();
                }}
              >
                Confirm
              </button>
            </div>
          </Modal.Footer>
        </Modal> */}

        <Modal
          size="md"
          show={regionShow}
          onHide={() => closeTo()}
          aria-labelledby="region-modal"
        >
          <Modal.Header className={"mb-0"} closeButton>
            <Modal.Title id="region-modal">
              <h4>Change Status</h4>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="region-body">
              <div className="roi-labels mb-4">
                <div className="form-group mb-4">
                  <label htmlFor="inputEmail3" className=" col-form-label">
                    Action Details
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={description}
                    placeholder="Add a comment"
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError({ ...error, modalDesc: "" });
                    }}
                  ></textarea>
                  {error.modalDesc ? (
                    <span className="error-msg">{error.modalDesc}</span>
                  ) : null}
                </div>
                {/* ) : (
                  ""
                )} */}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button
              className="btn btn-solid-outline btn-sm"
              variant="secondary"
              onClick={closeTo}
            >
              Close
            </Button> */}
            <Button
              className="btn btn-solid btn-sm"
              variant="primary"
              onClick={() => {
                actionHandler();
              }}
            >
              Close Selected
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TicketingDetailsComponent);
