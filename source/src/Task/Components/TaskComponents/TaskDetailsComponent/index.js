import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import IconArrowLeft from "../../../../Common/Components/IconsComponent/IconArrowLeft";
import IconFilterLining from "../../../../Common/Components/IconsComponent/IconFilterLining";
import { Tab, Nav, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "./style.scss";
import ReactPlayer from "react-player";
import { API_BASE_URL, TASK } from "../../../../Constants";
import getQueryVariable from "../../../../Services/getQueryVariable";
import { showAlert } from "../../../../Services/showAlert";
import callApi from "../../../../Services/callApi";
import moment from "moment";
import { connect } from "react-redux";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Collapse } from "react-bootstrap";

const TaskDetailsComponent = (props) => {
  const history = useHistory();
  const task_name = getQueryVariable("taskname");
  const checklist_Name = getQueryVariable("checklist");
  const location_Name = getQueryVariable("locationName");
  const city_Name = getQueryVariable("cityName");
  const region_Name = getQueryVariable("regionName");

  const locationId = getQueryVariable("locationId");
  const task = getQueryVariable("taskId");
  const schedule = getQueryVariable("schedule");
  const region_Id = getQueryVariable("regionId");
  const city_Id = getQueryVariable("cityId");
  //const date = getQueryVariable("date");
  //Data-Table
  //DataTable Table-Header
  const columns = [
    {
      name: "Camera",
      selector: "camera",
      sortable: true,
      minWidth: "215px",
    },
    {
      name: "Time",
      selector: "time",
      sortable: true,
      minWidth: "215px",
    },
    {
      name: "Tag",
      selector: "tag",
      minWidth: "215px",
      sortable: true,
    },
    {
      name: "Event Media",
      selector: "eventmedia",
      minWidth: "215px",
      sortable: true,
    },
    {
      name: "Review Status",
      selector: "reviewstatus",
      sortable: true,
      minWidth: "150px",
      cell: (row) => <WarningTimeStatusData row={row} />,
    },
    {
      name: "Assignee",
      selector: "assignee",
      minWidth: "215px",
      cell: (row) => <AssigneeData row={row} />,
    },
    {
      name: "Ticket Status",
      selector: "ticketstatus",
      minWidth: "215px",
    },
  ];

  const columns_2 = [
    {
      name: "Camera",
      selector: "camera",
      sortable: true,
      minWidth: "215px",
    },
    {
      name: "Start date & time",
      selector: "startTime",
      sortable: true,
      minWidth: "125px",
    },
    {
      name: "End date & time",
      selector: "endTime",
      minWidth: "125px",
      sortable: true,
    },
    {
      name: "Video size",
      selector: "video_size",
      minWidth: "115px",
      sortable: true,
    },
    {
      name: "Actions",
      selector: "actions",
      sortable: true,
      minWidth: "215px",
    },
  ];

  //DataTable Table-Cell

  const WarningTimeStatusData = ({ row }) => (
    <div
      data-tag="allowRowEvents"
      style={{
        overflow: "hidden",
        whiteSpace: "wrap",
        textOverflow: "ellipses",
      }}
    >
      <div className="tag-lg tag-success tag-block">{row.reviewstatus}</div>
    </div>
  );

  const AssigneeData = ({ row }) => {
    return (
      <div
        data-tag="allowRowEvents"
        style={{
          overflow: "hidden",
          whiteSpace: "wrap",
          textOverflow: "ellipses",
        }}
      >
        <ul className="mb-0">
          <li>{row.assignee}</li>
        </ul>
      </div>
    );
  };

  //Modal
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setViewModelData({ time: "", image: "", video: "" });
  };

  const handleShow = (type, url, time) => {
    setShow(true);
    switch (type) {
      case "image": {
        setViewModelData({ ...viewModelData, image: url, time: time });
        break;
      }
      case "video": {
        setViewModelData({ ...viewModelData, video: url, time: time });
        break;
      }
      default: {
        break;
      }
    }
  };

  const [limit, setLimit] = useState(5);
  const [records, setRecords] = useState([]);
  const videoPlayer = React.createRef();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);

  const [limit2, setLimit2] = useState(5);
  const [records2, setRecords2] = useState([]);
  const [query2, setQuery2] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });
  const [page2, setPage2] = useState(0);
  const [totalRecords2, setTotalRecords2] = useState(1);

  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPassed, setTotalPassed] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [region, setRegion] = useState("");
  const [regionId, setRegionId] = useState("");
  const [location, setLocation] = useState("");
  const [checklist, setChecklist] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("");
  const [ticketIs, setTicketIs] = useState(false);
  const [viewModelData, setViewModelData] = useState({
    time: "",
    image: "",
    video: "",
  });

  let yesterdayDateAndTime = moment().subtract(1, "days").startOf("day");
  let todayDateAndTime = moment().endOf("day");
  let defaultOptionValue = { label: "All", value: "" };
  const [open, setOpen] = useState(false);
  const toggleOpen = (value) => setOpen(value);
  /**
   * Lists
   * */
  const [dateFilterForSearch, setDateFilterForSearch] = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState([]);
  const [startTimeForSearch, setStartTimeForSearch] = useState(
    yesterdayDateAndTime
  );
  const [endTimeForSearch, setEndTimeForSearch] = useState(todayDateAndTime);

  const initializeFields = useCallback(() => {
    /**
     * Populate region-subregion combined list
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let dateFilterList = [...dateFilterForSearch];
      for (let el of props.userData.manifest.dateFilter) {
        if (el.range === "Today") {
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
      const sDate = moment(yesterdayDateAndTime).format("YYYY-MM-DD");
      const eDate = moment(todayDateAndTime).format("YYYY-MM-DD");

      /**
       * For first time search with yesterday date and current date filters
       * */
      setQuery({
        ...query,
        customQuery: `&from=${sDate}&to=${eDate}`,
      });
      setQuery2({
        ...query,
        customQuery: `&startTime=${sDate}&endTime=${eDate}`,
      });
    }
  });

  const apiCall = useCallback(
    (limit, page, ticketIs) => {
      //   http://164.52.208.210:4000/app/v1/events/get/1/0?sortBy&sort&location=6010f9cb2c722321166fb24b
      //   &task=602b530c15aa70da4101f20d&date=2021-02-09&isTicket=false

      //http://164.52.208.210:4000/app/v1/events/get/1/0?sortBy&sort&location=604f556d5527749a69d71703&
      //task=605081710dc7a362718087e7&schedule=605307a9d66a4713cd4f9b74&isTicket=false&from&to
      let url = "";
      if (ticketIs) {
        url = `${API_BASE_URL}/events/get/${limit}/${page}?location=${locationId}&task=${task}&schedule=${schedule}&${query.customQuery}&isTicket=true`;
      } else {
        url = `${API_BASE_URL}/events/get/${limit}/${page}?location=${locationId}&task=${task}&schedule=${schedule}&${query.customQuery}`;
      }

      if (query.query || query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }
      const EventMediaData = (image, video, time) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <ul className="list-inline mb-0">
            {image ? (
              <li
                className="list-inline-item"
                onClick={() => handleShow("image", image, time)}
              >
                <a href="javascript:void(0)">
                  <div className="tag-lg tag-default tag-block">image</div>
                </a>
              </li>
            ) : (
              ""
            )}
            {video ? (
              <li
                className="list-inline-item"
                onClick={() => handleShow("video", video, time)}
              >
                <a href="javascript:void(0)">
                  <div className="tag-lg tag-default tag-block">video</div>
                </a>
              </li>
            ) : (
              ""
            )}
          </ul>
        </div>
      );

      const ticketData = (isTicket, ticketNo) => {
        if (isTicket) {
          return (
            <div
              data-tag="allowRowEvents"
              style={{
                overflow: "hidden",
                whiteSpace: "wrap",
                textOverflow: "ellipses",
              }}
            >
              <div className="tag-lg tag-warning tag-block">
                Ticket #{ticketNo}
              </div>
            </div>
          );
        } else {
          return (
            <div
              data-tag="allowRowEvents"
              style={{
                overflow: "hidden",
                whiteSpace: "wrap",
                textOverflow: "ellipses",
              }}
            >
              <div className="">-</div>
            </div>
          );
        }
      };
      //"Ticket #3021"
      callApi(url)
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setTotalRecords(res.data.total);
            setTotalEvents(res.data.total ? res.data.total : 0);
            setTotalPassed(res.data.data.pass ? res.data.data.pass : 0);
            setTotalFailed(res.data.data.fail ? res.data.data.fail : 0);
            setCity(res.data.data.city ? res.data.data.city : city_Name);
            setCityId(res.data.data._city);
            setRegion(
              res.data.data.region ? res.data.data.region : region_Name
            );
            setRegionId(res.data.data._region);
            setLocation(
              res.data.data.location ? res.data.data.location : location_Name
            );
            setTaskName(
              res.data.data.task && res.data.data.task.model
                ? res.data.data.task.model
                : task_name
            );
            setChecklist(
              res.data.data.checklist && res.data.data.checklist.model
                ? res.data.data.checklist.model
                : checklist_Name
            );
            setTaskType(res.data.data.taskType);
            //setRecords(res.data.data.events && res.data.data.events.length) ?
            if (res.data.data.events && res.data.data.events.length) {
              setRecords(
                res.data.data.events.map((el, index) => {
                  return {
                    _id: el._id,
                    key: index + 1,
                    camera: el.camera.camera,
                    time: el.created_at,
                    tag: el.title,
                    eventmedia: EventMediaData(
                      el.image,
                      el.video,
                      el.created_at
                    ),
                    reviewstatus: "Pass",
                    assignee: el.assignee,
                    ticketstatus: ticketData(el.isTicket, el.ticketNo),
                    isTicket: el.isTicket,
                  };
                })
              );
            }
            recorderApiCall(limit2, page2);
          }
        })
        .catch((e) => {
          showAlert(e, "error");
          history.goBack();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  useEffect(() => {
    setPage(0);
  }, [limit]);

  const handleSort = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;
    setQuery({
      ...query,
      sortBy: column.selector,
      sort,
    });
  };

  useEffect(() => {
    apiCall(limit, page);
  }, [page, apiCall, limit]);

  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  const recorderApiCall = useCallback(
    (limit2, page2) => {
      //let url = `${API_BASE_URL}/recordings/get/${limit}/${page}?region=${regionId}&city=${cityId}&location=${locationId}&task=${task}&startTime=${moment(
      // let url = `${API_BASE_URL}/recordings/get/${limit2}/${page2}?region=${regionId}&city=${cityId}&location=${locationId}&task=${task}&startTime=${moment(
      //   date,
      //   "YYYY-MM-DD"
      // ).toISOString()}&endTime=${moment(
      //   moment(date, "YYYY-MM-DD").add(1, "days").startOf("day")
      // ).toISOString()}`;
      let url = `${API_BASE_URL}/recordings/get/${limit2}/${page2}?region=${region_Id}&city=${city_Id}&location=${locationId}&task=${task}&${query2.customQuery}`;
      if (query2.query || query2.sortBy) {
        url += `&sortBy=${query2.sortBy}&sort=${query2.sort}`;
      }
      const ActionData = (videourl, time) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <ul className="list-inline mb-0">
            <li className="list-inline-item">
              <button
                className="btn tag-default tag-md tag-block"
                onClick={() => {
                  handleShow("video", videourl, time);
                }}
              >
                Play video
              </button>
            </li>
            <li className="list-inline-item">
              <a href={videourl}>
                <button className="btn tag-default tag-md tag-block">
                  Download
                </button>
              </a>
            </li>
          </ul>
        </div>
      );
      callApi(url)
        .then((res) => {
          if (
            res.status === 200 &&
            res.data &&
            res.data.data &&
            res.data.data.length
          ) {
            setTotalRecords2(res.data.total);
            setRecords2(
              res.data.data.map((el, index) => {
                return {
                  _id: el._id,
                  key: index + 1,
                  camera: el.camera.camera,
                  startTime: el.startTime,
                  endTime: el.endTime,
                  video_size: el.video_size,
                  actions: ActionData(el.video_url, el.startTime),
                };
              })
            );
          }
        })
        .catch((e) => {
          showAlert(e, "error");
          history.goBack();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query2, cityId, regionId, limit2, page2]
  );

  const handleSort2 = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;
    setQuery2({
      ...query,
      sortBy: column.selector,
      sort,
    });
  };

  useEffect(() => {
    initializeFields();
  }, []);

  // useEffect(() => {
  //   recorderApiCall(limit2, page2);
  // }, [page2, recorderApiCall, limit2]);

  const handlePageChange2 = (newPage, page) => {
    setPage2(newPage - 1);
  };

  const handlePerRowsChange2 = (newPerPage, page) => {
    setLimit2(newPerPage);
  };

  const search = (startDate, endDate) => {
    let sDate = "";
    let eDate = "";
    if (startDate && endDate) {
      sDate = startDate;
      eDate = endDate;
    } else {
      sDate = moment(startTimeForSearch._d).format("YYYY-MM-DD");
      eDate = moment(endTimeForSearch).format("YYYY-MM-DD");
    }

    let searchFields = {
      from: sDate,
      to: eDate,
    };

    let customQuery = "";
    for (let key in searchFields) {
      customQuery += `&${key}=${searchFields[key] || ""}`;
    }

    setQuery({
      ...query,
      customQuery,
    });
    setQuery2({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-6 align-self-center mb-4">
            <div className="title d-flex align-items-center">
              <Link to={TASK}>
                <IconArrowLeft />
              </Link>
              <h4 className="ml-3 header-primary">Task Details</h4>
            </div>
          </div>
          <div className="col-12">
            <div className="table-filters">
              <div className="data-filter-ticketing">
                <Select
                  className="react-select"
                  value={selectedDateFilter}
                  onChange={(selectedOption) => {
                    setSelectedDateFilter(selectedOption);
                    setStartTimeForSearch(
                      moment(selectedOption.value[0]).format("YYYY-MM-DD")
                    );
                    setEndTimeForSearch(
                      moment(selectedOption.value[1]).format("YYYY-MM-DD")
                    );
                    {
                      selectedOption && selectedOption.label === "Custom"
                        ? toggleOpen(true)
                        : search(
                            moment(selectedOption.value[0]).format(
                              "YYYY-MM-DD"
                            ),
                            moment(selectedOption.value[1]).format("YYYY-MM-DD")
                          );
                      //toggleOpen(false)
                    }
                  }}
                  options={dateFilterForSearch}
                />
              </div>
              <button
                onClick={() => toggleOpen(!open)}
                aria-controls="filter-collapse-text"
                aria-expanded={open}
                className="btn btn-textIcon"
              >
                <span className="ml-2">
                  <IconFilterLining /> Filter
                </span>
              </button>
            </div>
          </div>

          <div className="col-12">
            <Collapse in={open}>
              <div className="filter-bar mt-4 mb-4">
                <div className="row">
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
                      value={startTimeForSearch}
                      onChange={(value) => {
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

                <div className="d-flex justify-content-end mt-4">
                  <button
                    className="btn btn-tertiary btn-sm mr-3"
                    //onClick={() => reset()}
                  >
                    Reset
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => search()}
                  >
                    Search
                  </button>
                </div>
              </div>
            </Collapse>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 align-self-center mb-4">
            <div className="btn-block d-flex justify-content-end align-self-center">
              {/* <button className="btn btn-primary btn-sm mr-2">Edit Task</button> */}
            </div>
          </div>
          <div className="row col-md-12">
            <div className="col-md-6">
              <div className="form-bg block-wrapper full-panel">
                <div className="title">
                  <h5 className="primary-color mb-2">{taskName}</h5>
                  <p>{checklist}</p>
                  <div className="status">
                    <div className="fw-400 tag-block tag-default tag-md">
                      To Do
                    </div>
                  </div>
                </div>
                <div className="details">
                  <ul className="label">
                    <li>Branch:</li>
                    <li>City:</li>
                    <li>Region:</li>
                  </ul>
                  <ul className="data">
                    <li>{location}</li>
                    <li>{city}</li>
                    <li>{region}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-bg block-wrapper full-panel">
                <div className="title">
                  <h5 className="primary-color">Event Details</h5>
                  <div className="status">
                    <div className="fw-400 tag-block tag-default tag-md">
                      {taskType}
                    </div>
                  </div>
                </div>
                <div className="details">
                  <ul className="label">
                    <li>Total events:</li>
                    <li>Passed:</li>
                    <li>Failed:</li>
                  </ul>
                  <ul className="data">
                    <li>{totalEvents}</li>
                    <li>{totalPassed}</li>
                    <li>{totalFailed}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <div className="switch-tab mt-4 mb-4">
                <div className="tab-one">
                  <Nav
                    variant="pills"
                    className="flex-row btn-block btn-group"
                    onSelect={(eventKey) => {
                      setRecords2([]);
                      setQuery2({
                        query: "",
                        sortBy: "",
                        sort: 1,
                        customQuery: "",
                      });
                      setTotalRecords2(1);
                      setLimit2(5);
                      setPage2(0);
                      {
                        eventKey === "second"
                          ? recorderApiCall(5, 0)
                          : apiCall(5, 0);
                      }
                    }}
                  >
                    <Nav.Link
                      className="btn btn-xs btn-tertiary"
                      eventKey="first"
                    >
                      Events Detected
                    </Nav.Link>

                    <Nav.Link
                      className="btn btn-xs btn-tertiary"
                      eventKey="second"
                    >
                      Recorded Videos
                    </Nav.Link>
                  </Nav>
                </div>
              </div>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <div class="checkbox-inline checkbox mt-2 mb-4">
                    <label>
                      <input
                        type="checkbox"
                        data-ng-model="example.check"
                        className="check-with-label"
                        value=""
                        onClick={() => {
                          setTicketIs(!ticketIs);
                          apiCall(limit, page, !ticketIs);
                        }}
                      />
                      <span class="box inline"></span> Show ticket events only
                    </label>
                  </div>
                  <div id="table-content">
                    <DataTable
                      pagination
                      paginationServer
                      paginationPerPage={limit}
                      paginationTotalRows={totalRecords}
                      paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                      // onSelectedRowsChange={(row) => {
                      //   setSelectedRows(row.selectedRows.map((el) => el._id));
                      // }}
                      paginationComponentOptions={{ rowsPerPageText: "" }}
                      sortServer
                      onChangePage={handlePageChange}
                      onChangeRowsPerPage={handlePerRowsChange}
                      key={limit}
                      columns={columns}
                      data={records}
                      dense
                      onSort={handleSort}
                    />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <div id="table-content">
                    <DataTable
                      pagination
                      paginationServer
                      paginationPerPage={limit2}
                      paginationTotalRows={totalRecords2}
                      paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                      // onSelectedRowsChange={(row) => {
                      //   setSelectedRows(row.selectedRows.map((el) => el._id));
                      // }}
                      paginationComponentOptions={{ rowsPerPageText: "" }}
                      sortServer
                      onChangePage={handlePageChange2}
                      onChangeRowsPerPage={handlePerRowsChange2}
                      key={limit2}
                      dense
                      onSort={handleSort2}
                      columns={columns_2}
                      data={records2}
                    />
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
            <Modal
              size="lg"
              show={show}
              onHide={handleClose}
              aria-labelledby="contained-modal-title-vcenter"
              centered
              className="form-popup"
            >
              <Modal.Header closeButton>
                <div className="modal-title d-block">
                  <h6 className="mb-1">City - {city}</h6>
                  <small>{viewModelData.time}</small>
                </div>
              </Modal.Header>
              <Modal.Body>
                {viewModelData.image ? (
                  <div className="modal-form">
                    <img
                      src={viewModelData.image}
                      alt="viewModelDataImage"
                    ></img>
                  </div>
                ) : (
                  <div className="modal-form">
                    <ReactPlayer
                      className="mb-3 video-popup"
                      ref={videoPlayer}
                      url={viewModelData.video}
                      loop={true}
                      controls={true}
                      width={"100%"}
                    ></ReactPlayer>
                  </div>
                )}
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(TaskDetailsComponent);
