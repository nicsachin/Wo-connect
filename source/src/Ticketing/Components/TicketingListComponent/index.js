import React, { useCallback, useEffect, useState, useRef } from "react";
import { DebounceInput } from "react-debounce-input";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Button, Collapse, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  API_BASE_URL,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
  TICKETING_DETAILS,
} from "../../../Constants";
import "./style.scss";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { colourStyles } from "../../../Services/colourStyles";
import { connect } from "react-redux";
import {
  addUserDataToStoreAction,
  toggleLoaderAction,
} from "../../../Store/actions";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import {
  IconAllTask,
  IconArrowNextRight,
  IconCloseTicket,
  IconExternalLink,
  IconFilterLining,
  IconOpenTicket,
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import { segmentTrack } from "../../../Services/segment";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import Tag from "../../../Common/Components/Molecule/Atoms/Tag";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import ConfirmModal from "../ModalComponent/ConfirmModal";
import TicketDefaultList from "../../../Common/Components/Molecule/Default/TicketsDefaultPages/TicketDefaultList";

const TicketingListComponent = (props) => {
  //Data-Table
  //DataTable Table-Header

  const columns = [
    {
      name: "Ticket name",
      selector: "title",
      sortable: true,
      minWidth: "180px",
      grow: 5,
    },
    {
      name: "Task",
      selector: "task",
      sortable: true,
      minWidth: "200px",
      grow: 5,
    },
    {
      name: "Location",
      selector: "location",
      minWidth: "150px",
      grow: 3,
      sortable: true,
    },
    {
      name: "Status",
      selector: "totalClosed",
      sortable: true,
      minWidth: "180px",
      maxWidth: "200px",
      // cell: (row) => <StatusData row={row} />,
    },
    {
      name: "Created at",
      selector: "created_at",
      minWidth: "180px",
      maxWidth: "200px",
      sortable: true,
    },
    {
      name: "Assignee",
      selector: "assignee",
      minWidth: "200px",
      maxWidth: "240px",
    },
  ];

  //DataTable Table-Cell
  const StatusData = ({ row }) => (
    <div
      data-tag="allowRowEvents"
      style={{
        overflow: "hidden",
        whiteSpace: "wrap",
        textOverflow: "ellipses",
      }}
    >
      <Tag
        className={
          row.ticketStatus
            ? row.ticketStatus === "To do"
              ? "tag-orange"
              : row.ticketStatus === "closed"
              ? ""
              : "tag-success"
            : ""
        }
      >
        {row.ticketStatus ? `${row.ticketStatus}` : "No events"}
      </Tag>
    </div>
  );

  function getInitialDateFilter() {
    if (props?.userData?.manifest?.dateFilter) {
      let result = props.userData.manifest.dateFilter.find(
        (el) => el.range === "Last 15 Days"
      );
      return `&from=${moment(result.date[0]).toISOString()}&to=${moment(
        result.date[1]
      ).toISOString()}`;
    }
  }

  let yesterdayDateAndTime = "";
  let todayDateAndTime = "";
  let defaultOptionValue = { label: "All", value: "" };

  const [open, setOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [overlayActive, isOverlayActive] = useState(false);
  const toggleOpen = (value) => setOpen(value);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [action, setAction] = useState();
  /**
   * ["all",  "open" , "closed"]
   * for selected status for ticket
   * */
  const [selectedTicketStatus, setSelectedTicketStatus] = useState("all");

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: getInitialDateFilter(),
  });

  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  const [stats, setstats] = useState({ all: 0, open: 0, closed: 0 });

  const [show, setShow] = useState(false);
  /**
   * Lists
   * */
  const [dateFilterForSearch, setDateFilterForSearch] = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState([]);
  const [statusForSearch, setStatusForSearch] = useState([defaultOptionValue]);
  const [selectedStatus, setSelectedStatus] = useState([defaultOptionValue]);
  const [CheckListForSearch, setCheckListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [selectedChecklist, setSelectedChecklist] = useState([
    defaultOptionValue,
  ]);
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [locationListForSearch, setLocationListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [taskTypeListForSearch, setTaskTypeListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [selectedTaskType, setSelectedTaskType] = useState([
    defaultOptionValue,
  ]);
  const [employeeListForSearch, setEmployeeListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState([
    defaultOptionValue,
  ]);
  const [subRegionForSearch, setSubregionForSearch] = useState(
    defaultOptionValue
  );
  const [locationForSearch, setLocationForSearch] = useState(
    defaultOptionValue
  );
  const [startTimeForSearch, setStartTimeForSearch] = useState(
    yesterdayDateAndTime
  );
  const [endTimeForSearch, setEndTimeForSearch] = useState(todayDateAndTime);
  const [cameraList, setCameraList] = useState([]);
  const [cameraForSearch, setCameraForSearch] = useState({});
  /**
   * for task list
   *
   * */

  const [taskList, setTaskList] = useState([defaultOptionValue]);
  const [selectedTask, setSelectedTask] = useState(defaultOptionValue);
  /**
   * Get location Details
   * */
  const getSubregionOrLocation = (parentId = null, type = null) => {
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let result = [];
      for (let el of props.userData.manifest.regions) {
        if (el.parent === parentId && el.type === type) {
          result.push({ value: el._id, label: el.area });
        }
      }
      return result;
    }
    return [];
  };
  // const ToggleSwitch = () => {
  //   overlayActive ? isOverlayActive(false) : isOverlayActive(true);
  // };

  // const filterBtnClick = () => {
  //   ToggleSwitch();
  //   toggleOpen(!open);
  // };

  const initializeFields = useCallback(() => {
    /**
     * Populate region-subregion combined list
     * */
    const getEmployee = async () => {
      try {
        let employeeResponse = await callApi(
          `${API_BASE_URL}/filter/team`,
          {
            method: "GET",
          },
          {},
          { showLoader: false, callManifest: true, loaderLabel: "" }
        );
        if (employeeResponse.status === 200) {
          let employeeList = [...employeeListForSearch];
          for (let el of employeeResponse.data.data) {
            employeeList.push({
              value: el._id,
              label: el.name,
            });
          }
          setEmployeeListForSearch(employeeList);
        }
      } catch (e) {
        showAlert(e, "error");
      }
    };
    getEmployee();
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let regionsAndSubregions = [...regionAndSubregionCombinedList];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          /**
           * For combined list
           * */
          regionsAndSubregions.push({
            value: el._id,
            label: el.area,
            isDisabled: true,
          });
          let subregionList = getSubregionOrLocation(el._id, "city");
          for (let subregion of subregionList) {
            regionsAndSubregions.push({
              value: subregion.value,
              label: subregion.label,
              parent: el._id,
            });
          }
        }
      }
      setRegionAndSubregionCombinedList(regionsAndSubregions);

      let checklistList = [...CheckListForSearch];
      for (let el of props.userData.manifest.checklist) {
        checklistList.push({
          value: el._id,
          label: el.model,
        });
      }
      setCheckListForSearch(checklistList);

      let taskTypeList = [...taskTypeListForSearch];
      for (let el of props.userData.manifest.taskType) {
        taskTypeList.push({
          value: el,
          label: el,
        });
      }
      setTaskTypeListForSearch(taskTypeList);

      let statusList = [...statusForSearch];
      for (let el of props.userData.manifest.ticketStatus) {
        statusList.push({
          value: el._id,
          label: el.tag,
        });
      }
      setStatusForSearch(statusList);

      //check here once
      let dateFilterList = [...dateFilterForSearch];
      for (let el of props.userData.manifest.dateFilter) {
        if (el.range === "Last 15 Days") {
          yesterdayDateAndTime = moment(el.date[0], "YYYY-MM-DD");
          todayDateAndTime = moment(el.date[1], "YYYY-MM-DD");
          setStartTimeForSearch(yesterdayDateAndTime);
          setEndTimeForSearch(todayDateAndTime);
          setSelectedDateFilter({ label: el.range, value: el.data });
        }
        dateFilterList.push({
          value: el.date,
          label: el.range,
        });
      }
      setDateFilterForSearch(dateFilterList);

      /**
       * For first time search with yesterday date and current date filters
       * */
      // setQuery({
      //   ...query,
      //   customQuery: `&from=${sDate}&to=${eDate}`,
      // });
    }

    /**
     * For getting task list
     * */

    callApi(
      `${API_BASE_URL}/models/get`,
      {},
      { showLoader: false, callManifest: true, loaderLabel: "" }
    )
      .then((model) => {
        if (model.status === 200 && model?.data.length) {
          setTaskList([
            defaultOptionValue,
            ...model.data.map((el) => {
              return {
                label: el.model,
                value: el._id,
              };
            }),
          ]);
        } else console.log("something went wrong!!!");
      })
      .catch((e) => console.log("error", e));
  });

  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };
    switch (action) {
      case "delete": {
        config.url = `${API_BASE_URL}/ticket/delete`;
        config.method = "DELETE";
        config.body = JSON.stringify({
          ids: selectedRows,
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
          apiCall(limit, page);
          showAlert(res.message);
          segmentTrack({
            title: `${action} ticket | Ticketing`,
            ticket_id: selectedRows,
          });
        } else showAlert(res.message, "error");
        setModalVisibility(false);
      })
      .catch((e) => {
        showAlert(e, "error");
        setModalVisibility(false);
      });
  };
  const searchButton = () => {
    search();
    toggleOpen(!open);
  };
  const reset = () => {
    for (let el of props.userData.manifest.dateFilter) {
      if (el.range === "Today") {
        yesterdayDateAndTime = moment(el.date[0], "YYYY-MM-DD");
        todayDateAndTime = moment(el.date[1], "YYYY-MM-DD");
        setStartTimeForSearch(yesterdayDateAndTime);
        setEndTimeForSearch(todayDateAndTime);
        setSelectedDateFilter({ label: el.range, value: el.data });
      }
    }
    setStartTimeForSearch(yesterdayDateAndTime);
    setEndTimeForSearch(todayDateAndTime);

    setSelectedStatus(defaultOptionValue);

    setSubregionForSearch(defaultOptionValue);
    setLocationForSearch(defaultOptionValue);

    setLocationListForSearch(defaultOptionValue);

    setSelectedChecklist(defaultOptionValue);

    setSelectedTaskType(defaultOptionValue);

    setSelectedEmployee(defaultOptionValue);

    setSelectedTask(defaultOptionValue);

    setSelectedTicketStatus("all");
    const sDate = moment(yesterdayDateAndTime).toISOString();
    const eDate = moment(todayDateAndTime).toISOString();
    setQuery({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
    setFilterCount(0);
  };

  const search = (startDate, endDate, ticketCardStatus) => {
    let sDate = "";
    let eDate = "";
    if (startDate && endDate) {
      sDate = moment(startDate).toISOString();
      eDate = moment(endDate).toISOString();
    } else {
      sDate = moment(startTimeForSearch).toISOString();
      eDate = moment(endTimeForSearch).toISOString();
    }
    let ticketSelectedCardStatus = "";
    if (ticketCardStatus) {
      ticketSelectedCardStatus = getTicketStatusFromLabel(ticketCardStatus);
    } else {
      ticketSelectedCardStatus = getTicketStatusFromLabel();
    }

    let searchFields = {
      // ticketStatus: selectedStatus.value || ticketSelectedCardStatus,
      ticketStatus: ticketSelectedCardStatus,
      camera: cameraForSearch.value || "",
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
      checklist: selectedChecklist.value,
      taskType: selectedTaskType.value,
      assignee: selectedEmployee.value,
      from: sDate,
      to: eDate,
      task: selectedTask.value,
    };
    let count = 0;
    for (let item in searchFields) {
      if (
        !searchFields[item] ||
        searchFields[item]?.trim() == "" ||
        item == "to" ||
        item == "from"
      )
        continue;
      count++;
    }

    setFilterCount(count);

    let customQuery = "";
    for (let key in searchFields) {
      customQuery += `&${key}=${searchFields[key] || ""}`;
    }

    setQuery({
      ...query,
      customQuery,
    });
  };

  const apiCall = useCallback(
    (limit, page) => {
      // let url = `${API_BASE_URL}/tickets/get/${limit}/${page}?query=${query.query}&${query.customQuery}`;
      let url = `${API_BASE_URL}/tickets/group/${limit}/${page}?query=${query.query}&${query.customQuery}`;
      if (query.query || query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      const TaskData = (task, checklist) => (
        <ul
          className="white-space"
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <li className={"mb-1 text-primary"}>{task}</li>
          <li className={"text-other fs-12"}>Checklist: {checklist}</li>
        </ul>
      );

      const TicketData = (title, id, task, location, date) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
          onClick={() => {
            segmentTrack({
              title: "Ticket Details opened | Ticketing",
              ticket_id: id,
            });
          }}
        >
          <Link
            //to={`${TICKETING_DETAILS}?schedule=60759f20d4000de63746af76&location=6065d393d99422e703ae9a4d&task=6076d912f5a1de1b5e8ab10c&date=2021-06-09`}
            to={`${TICKETING_DETAILS}?location=${location}&task=${task}&date=${date}`}
            target={"_blank"}
            className="fw-500 mb-0 white-space c-pointer text-primary hover-content"
          >
            {title}{" "}
            <span className={"hover-icon"}>
              <IconExternalLink />
            </span>
          </Link>
        </div>
      );

      const StatusData = (status, total) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <Tag
            className={
              total ? "tag-success" : "tag-orange"
              // row.ticketStatus
              //   ? row.ticketStatus === "To do"
              //     ? "tag-orange"
              //     : row.ticketStatus === "closed"
              //     ? ""
              //     : "tag-success"
              //   : ""
            }
          >
            {status ? status : "No events"}
          </Tag>
        </div>
      );

      const AssigneeData = (assignee) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <ul className="mb-0">
            {assignee.map((el, index) => {
              return (
                <li className={"fs-14 fw-500 text-primary"} key={el._id}>
                  {el.name}
                </li>
              );
            })}
          </ul>
        </div>
      );

      const TaskLocation = (location, region) => (
        <ul
          className="white-space mb-0"
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <li className={"mb-1 text-primary"}>{location}</li>
          <li className={"text-other fs-12"}>{region}</li>
        </ul>
      );

      callApi(url, {}, apiConfig)
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            // console.log("200 >",res.data.data);
            setTotalRecords(res.data.total);
            let result = { ...stats };
            for (let i = 0; i < res.data.stats.length; i++) {
              if (res.data.stats[i].tag === "All")
                result = { ...result, all: res.data.stats[i].stats };
              else if (res.data.stats[i].tag === "To do")
                result = {
                  ...result,
                  open: res.data.stats[i].stats,
                };
              else if (res.data.stats[i].tag === "Closed")
                result = {
                  ...result,
                  closed: res.data.stats[i].stats,
                };
            }
            if (result && result.all === 0) {
              segmentTrack({ title: "No Ticket raised | Ticketing" });
            }
            setstats(result);

            setRecords(
              res.data.data.map((el, index) => {
                return {
                  // _id: el._id,
                  _id: index,
                  key: index + 1,
                  location: TaskLocation(el.location, el.region),
                  // `${el.location} (${el.region})`,
                  created_at: el.created_at,
                  assignee: AssigneeData(el.executive),
                  taskname: el.task.model,
                  // tasktype: el.taskType,
                  // time: `${el.first} - ${el.last}, ${el.date}`,
                  // ticketStatus: el.ticketStatus,
                  totalClosed:
                    selectedTicketStatus === "all"
                      ? StatusData(
                          el.totalClosed + "/" + el.total + " closed",
                          el.total - el.totalClosed === 0 ? true : false
                        )
                      : selectedTicketStatus === "closed"
                      ? StatusData(el.totalClosed + " closed", true)
                      : StatusData(el.total - el.totalClosed + " open", false),
                  // timestatus: "Overdue",
                  task: TaskData(el.task.model, el.checklist.model),
                  // title: TicketData(el.title, el._id),
                  title: TicketData(
                    el.title,
                    el._id,
                    el._id.task,
                    el._id.location,
                    el._id.created_at
                  ),
                };
              })
            );
          }
          // props.toggleLoader({ label: "", value: false });
        })
        .catch((e) => {
          showAlert(e, "error");
        });

      setApiConfig(DEFAULT_API_CONFIG);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  useEffect(() => {
    if (locationForSearch && locationForSearch.value) {
      callApi(
        `${API_BASE_URL}/filter/camera?location=${locationForSearch.value}`,
        {},
        { showLoader: false, callManifest: true, loaderLabel: "" }
      )
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setCameraList([
              {
                label: "All",
                value: "",
              },
              ...res.data.data.map((el) => {
                return {
                  label: el.camera,
                  value: el._id,
                };
              }),
            ]);
          }
        })
        .catch((e) => {
          showAlert(e, "error");
        });
    } else {
      setCameraList([
        {
          label: "All",
          value: "",
        },
      ]);
      setCameraForSearch({
        label: "All",
        value: "",
      });
    }
  }, [locationForSearch]);

  useEffect(() => {
    initializeFields();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [limit]);

  const handleSort = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;
    setApiConfig({
      showLoader: false,
      callManifest: false,
      loaderLabel: "",
    });
    setQuery({
      ...query,
      sortBy: column.selector,
      sort,
    });
  };

  useEffect(() => {
    apiCall(limit, page);
  }, [page, apiCall, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage) => {
    setLimit(newPerPage);
  };

  // React Select Style
  //   const colourStyles = {
  //     control: (styles) => ({ ...styles, backgroundColor: "white" }),
  //     option: (styles, { isDisabled }) => {
  //       return {
  //         ...styles,
  //         backgroundColor: isDisabled ? "#EFF3FD" : isDisabled,
  //         color: isDisabled ? "#000" : isDisabled,
  //       };
  //     },
  //     input: (styles) => ({ ...styles }),
  //     placeholder: (styles) => ({ ...styles }),
  //     singleValue: (styles) => ({ ...styles }),
  //   };

  const handleCardClick = (clickedStatus) => {
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.ticketStatus
    ) {
      props.userData.manifest.ticketStatus.map((el) => {
        if (el.tag === clickedStatus) {
          //`&all=true&ticketStatus=${el._id}`
          setQuery({
            ...query,
            customQuery: `from=${moment(
              startTimeForSearch
            ).toISOString()}&to=${moment(
              endTimeForSearch
            ).toISOString()}&ticketStatus=${el._id}`,
          });
        }
      });
    }
  };

  const getTicketStatusFromLabel = (status) => {
    // ["all",  "open" , "closed"]

    let finalStatus = "";
    if (status) {
      finalStatus = status;
    } else {
      if (!selectedTicketStatus) return "";
      finalStatus = selectedTicketStatus;
    }
    let actualLabel = "";
    switch (finalStatus) {
      case "open":
        actualLabel = "To do";
        break;
      case "closed":
        actualLabel = "Closed";
        break;
    }

    if (actualLabel.length) {
      for (let ticket of props.userData.manifest.ticketStatus) {
        if (ticket.tag === actualLabel) return ticket._id;
      }
    }

    return "";
  };

  return (
    // <div className={overlayActive ? "overlay" : "wobot-panel-main"}>
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Tickets"}
          showSubTitle={false}
          breadcrumb={[{ name: "Tickets" }]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <div className="search-filter w-100">
                <DebounceInput
                  className="search form-control"
                  placeholder="Search"
                  debounceTimeout={DEBOUNCE_INPUT_TIME}
                  value={query.query}
                  onChange={(e) => {
                    const currValue = e.target.value;
                    setApiConfig({
                      showLoader: false,
                      callManifest: true,
                      loaderLabel: "",
                    });
                    setQuery({ ...query, query: currValue });
                  }}
                />
                <IconSearch />
              </div>
            </li>
          </ActionBlock>
        </PageTitle>
        <div className={"switch-block mb-4"}>
          <div
            className={
              selectedTicketStatus === "all"
                ? "switch-card border-blue curser-p blue-card-active"
                : "switch-card border-blue curser-p"
            }
            onClick={() => {
              // setQuery({
              //   ...query,
              //   //customQuery: `&all=true`,
              //   customQuery: `from=${moment(
              //     startTimeForSearch
              //   ).toISOString()}&to=${moment(endTimeForSearch).toISOString()}`,
              // });
              search(startTimeForSearch, endTimeForSearch, "all");
              setSelectedTicketStatus("all");
              segmentTrack({ title: "All tickets card clicked | Ticketing" });
            }}
          >
            <div className="card-title">
              <div className="icon-block icon-bg-primary">
                <IconAllTask />
              </div>
              <div className="content-block">
                <h3 className="mb-1">{stats.all}</h3>
                <div className="bottom-block">
                  <p className="mb-0 fw-400">All tickets</p>
                  <button className="btn p-0">
                    <IconArrowNextRight />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              selectedTicketStatus === "open"
                ? "switch-card border-orange curser-p orange-card-active"
                : "switch-card border-orange curser-p"
            }
            onClick={() => {
              // handleCardClick("To do");
              search(startTimeForSearch, endTimeForSearch, "open");
              setSelectedTicketStatus("open");
              segmentTrack({ title: "Open tickets card clicked | Ticketing" });
            }}
          >
            <div className="card-title">
              <div className="icon-block icon-bg-orange">
                <IconOpenTicket />
              </div>
              <div className="content-block">
                <h3 className="mb-1">{stats.open}</h3>
                <div className="bottom-block">
                  <p className="mb-0 fw-400">Open Tickets</p>
                  <button className="btn p-0">
                    <IconArrowNextRight />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              selectedTicketStatus === "closed"
                ? "switch-card border-green curser-p green-card-active"
                : "switch-card border-green curser-p"
            }
            onClick={() => {
              // handleCardClick("Closed");
              search(startTimeForSearch, endTimeForSearch, "closed");
              setSelectedTicketStatus("closed");
              segmentTrack({
                title: "Closed tickets card clicked | Ticketing",
              });
            }}
          >
            <div className="card-title">
              <div className="icon-block icon-bg-green">
                <IconCloseTicket />
              </div>
              <div className="content-block">
                <h3 className="mb-1">{stats.closed}</h3>
                <div className="bottom-block">
                  <p className="mb-0 fw-400">Closed Tickets</p>
                  <button className="btn p-0">
                    <IconArrowNextRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <div className="data-filter-ticketing">
              <Select
                className="react-select"
                value={selectedDateFilter}
                onChange={(selectedOption) => {
                  setSelectedDateFilter(selectedOption);
                  setStartTimeForSearch(
                    moment(selectedOption.value[0], "YYYY-MM-DD")
                  );
                  setEndTimeForSearch(
                    moment(selectedOption.value[1], "YYYY-MM-DD")
                  );
                  {
                    selectedOption && selectedOption.label === "Custom"
                      ? toggleOpen(true)
                      : search(
                          moment(selectedOption.value[0], "YYYY-MM-DD"),
                          moment(selectedOption.value[1], "YYYY-MM-DD")
                        );
                  }
                }}
                options={dateFilterForSearch}
              />
            </div>
          </li>

          {/* <li className={"list-inline-item"}>
            <button
              className={"btn btn-textIcon"}
              onClick={() => {
                if (selectedRows && selectedRows.length) {
                  setAction("delete");
                  setModalVisibility(true);
                } else {
                  showAlert("Please select rows to delete");
                }
              }}
            >
              <span>
                <IconTrash /> Delete
              </span>
            </button>
          </li> */}

          <li className="list-inline-item">
            <button
              className={
                open || filterCount !== 0
                  ? "btn btn-textIcon  active"
                  : "btn btn-textIcon "
              }
              onClick={() => toggleOpen(!open)}
            >
              <span>
                <IconFilterLining /> Filter ({filterCount})
              </span>
            </button>
            <div className="filter-box-wrapper">
              <Collapse in={open} className={"filter-box-width max-width-650"}>
                <div className="filter-bar mt-2 mb-4">
                  <div className="filter-title">
                    <p className={"fw-600"}>Advance filters</p>
                  </div>
                  <div className="row">
                    {/* <div className="col-lg col-md-4 col-sm-6 mb-3">
                <label htmlFor="inputEmail4">Status</label>
                <Select
                  value={selectedStatus}
                  onChange={(selectedOption) => {
                    setSelectedStatus(selectedOption);
                  }}
                  options={statusForSearch}
                />
              </div> */}
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Task</label>
                      <Select
                        value={selectedTask}
                        onChange={(selectedOption) => {
                          setSelectedTask(selectedOption);
                        }}
                        options={taskList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Employee</label>
                      <Select
                        value={selectedEmployee}
                        onChange={(selectedOption) => {
                          setSelectedEmployee(selectedOption);
                        }}
                        options={employeeListForSearch}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">From</label>
                      <Datetime
                        inputProps={{
                          readOnly: true,
                          disabled:
                            selectedDateFilter &&
                            selectedDateFilter.label !== "Custom"
                              ? true
                              : false,
                        }}
                        timeFormat={false}
                        dateFormat="DD-MM-YYYY"
                        isValidDate={(data) => {
                          return !moment(data).isAfter(moment().endOf("day"));
                        }}
                        value={startTimeForSearch}
                        onChange={(value) => {
                          // console.log("from date>",startTimeForSearch);
                          // console.log("date" ,value.isBefore(endTimeForSearch));
                          value && endTimeForSearch
                            ? value.isBefore(endTimeForSearch)
                              ? setStartTimeForSearch(
                                  value
                                  // new Date(value)
                                )
                              : showAlert(
                                  "Please select valid date range",
                                  "warning"
                                )
                            : setStartTimeForSearch(value);
                        }}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">To</label>
                      <Datetime
                        inputProps={{
                          readOnly: true,
                          disabled:
                            selectedDateFilter &&
                            selectedDateFilter.label !== "Custom"
                              ? true
                              : false,
                        }}
                        timeFormat={false}
                        dateFormat="DD-MM-YYYY"
                        isValidDate={(data) => {
                          return !moment(data).isAfter(moment().endOf("day"));
                        }}
                        value={endTimeForSearch}
                        onChange={(value) => {
                          value && startTimeForSearch
                            ? value.isAfter(startTimeForSearch)
                              ? setEndTimeForSearch(value)
                              : showAlert(
                                  "Please select valid date range",
                                  "warning"
                                )
                            : setEndTimeForSearch(value);
                        }}
                      />
                    </div>
                  </div>
                  <div id="filter-collapse-text" className="row">
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Region & City</label>
                      <Select
                        styles={colourStyles}
                        value={subRegionForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setLocationForSearch(defaultOptionValue);
                          setLocationListForSearch([
                            defaultOptionValue,
                            ...getSubregionOrLocation(
                              selectedOption.value,
                              "location"
                            ),
                          ]);
                          setSubregionForSearch(selectedOption);
                        }}
                        options={regionAndSubregionCombinedList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Branch</label>
                      <Select
                        value={locationForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setLocationForSearch(selectedOption);
                        }}
                        options={locationListForSearch}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="location" className="form-label">
                        Camera
                      </label>
                      <Select
                        value={cameraForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setCameraForSearch(selectedOption);
                          // setLocationForSearch(selectedOption);
                        }}
                        options={cameraList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Task type</label>
                      <Select
                        value={selectedTaskType}
                        onChange={(selectedOption) => {
                          setSelectedTaskType(selectedOption);
                        }}
                        options={taskTypeListForSearch}
                      />
                    </div>
                  </div>
                  <div className="row"></div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-textIcon btn-sm mr-2"
                      onClick={() => reset()}
                    >
                      Clear all
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={searchButton}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>
          </li>
        </ActionBlock>
        {records && records.length ? (
          <>
            <div className={"panel-body mt-60"}>
              <div id="table-content" className={"camera-table"}>
                <DataTable
                  pagination
                  paginationServer
                  paginationPerPage={limit}
                  paginationTotalRows={totalRecords}
                  paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                  onSelectedRowsChange={(row) => {
                    setSelectedRows(row.selectedRows.map((el) => el._id));
                  }}
                  paginationComponentOptions={{ rowsPerPageText: "" }}
                  //sortServer
                  striped={false}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  selectableRows
                  key={limit}
                  data={records}
                  columns={columns}
                  dense
                  onSort={handleSort}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <TicketDefaultList setShow={setShow} />
          </>
        )}

        <ConfirmModal
          visibility={modalVisibility}
          setVisiblity={setModalVisibility}
          headerText={"Delete Ticket?"}
          // footerText={`Do you want to ${action}?`}
          footerText={`The ticket will be erased from the dashboard once you delete it. Are you sure you want to proceed?`}
          onYes={actionHandler}
          onNo={() => {
            setModalVisibility(false);
            setAction("");
          }}
          onHide={() => {
            setModalVisibility(false);
            setAction("");
          }}
          confirmButtonText={"Proceed"}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
    toggleLoader: (data) => {
      dispatch(toggleLoaderAction(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TicketingListComponent);
