import React, { useCallback, useEffect, useState, useRef } from "react";
import { DebounceInput } from "react-debounce-input";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Button, Collapse, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  API_BASE_URL,
  COMPLIANCE_DETAILS,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
  TICKETING_DETAILS,
} from "../../../Constants";
import "./style.scss";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { connect } from "react-redux";
import { addUserDataToStoreAction } from "../../../Store/actions";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import {
  IconExternalLink,
  IconFilterLining,
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import ManifestService from "../../../Services/ManifestService";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import { colourStyles } from "../../../Services/colourStyles";
import ConfirmModal from "../ModalComponent/ConfirmModal";

const ComplianceListComponent = (props) => {
  //Data-Table
  //DataTable Table-Header
  const columns = [
    {
      name: "Event name",
      selector: "title",
      sortable: true,
      minWidth: "180px",
      grow: 5,
      cell: (row) => <span>{row.title}</span>,
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

  let yesterdayDateAndTime = "";
  let todayDateAndTime = "";
  let defaultOptionValue = { label: "All", value: "" };

  const [filterCount, setFilterCount] = useState(0);
  const [open, setOpen] = useState(false);
  const toggleOpen = (value) => setOpen(value);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [action, setAction] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
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

  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
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

  const initializeFields = useCallback(() => {
    /**
     * Populate region-subregion combined list
     * */
    const getEmployee = async () => {
      try {
        let employeeResponse = await callApi(`${API_BASE_URL}/filter/team`, {
          method: "GET",
        });
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
      const sDate = moment(yesterdayDateAndTime).toISOString();
      const eDate = moment(todayDateAndTime).toISOString();

      /**
       * For first time search with yesterday date and current date filters
       * */
      setQuery({
        ...query,
        customQuery: `&from=${sDate}&to=${eDate}`,
      });
    }
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
          if (
            action &&
            props &&
            props.userData &&
            props.userData.user &&
            props.userData.user.email &&
            props.userData.manifest &&
            props.userData.manifest.company &&
            props.userData.manifest.company.name &&
            props.userData.user._id &&
            props.userData.manifest._id
          ) {
            window.analytics.track(`${action}d compliance event `, {
              title: `${action}d compliance event`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            });
          }
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

    const sDate = moment(yesterdayDateAndTime).toISOString();
    const eDate = moment(todayDateAndTime).toISOString();
    setQuery({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
    setFilterCount(0);
  };

  const search = (startDate, endDate) => {
    let sDate = "";
    let eDate = "";
    if (startDate && endDate) {
      sDate = moment(startDate).toISOString();
      eDate = moment(endDate).toISOString();
    } else {
      sDate = moment(startTimeForSearch).toISOString();
      eDate = moment(endTimeForSearch).toISOString();
    }

    let searchFields = {
      ticketStatus: selectedStatus.value,
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
      checklist: selectedChecklist.value,
      taskType: selectedTaskType.value,
      assignee: selectedEmployee.value,
      from: sDate,
      to: eDate,
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
      let url = `${API_BASE_URL}/tickets/get/${limit}/${page}?query=${query.query}&${query.customQuery}&isTicket=false`;
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

      const TicketData = (title, id) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
          onClick={() => {
            if (
              props &&
              props.userData &&
              props.userData.user &&
              props.userData.user.email &&
              props.userData.user._id &&
              props.userData.manifest &&
              props.userData.manifest.company &&
              props.userData.manifest.company.name &&
              props.userData.user._id &&
              props.userData.manifest._id
            ) {
              //setEmail(props.userData.user.email);
              window.analytics.track("Compliance event details opened", {
                title: "Compliance event details opened",
                email: props.userData.user.email,
                username: props.userData.user.username,
                companyName: props.userData.manifest.company.name,
                user_id: props.userData.user._id,
                company_id: props.userData.manifest._id,
              });
            }
          }}
        >
          <a
            href={`${COMPLIANCE_DETAILS}?id=${id}`}
            target={"_blank"}
            className="fw-500 mb-0 white-space c-pointer text-other hover-content"
          >
            {title}{" "}
            <span className={"hover-icon"}>
              <IconExternalLink />
            </span>
          </a>
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
            {assignee.map((el) => {
              return <li className={"fs-14 fw-500 text-primary"}>{el}</li>;
            })}
          </ul>
        </div>
      );

      const TaskLocation = (location, region) => (
        <ul
          className="white-space"
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
            setTotalRecords(res.data.total);
            setRecords(
              res.data.data.map((el, index) => {
                return {
                  _id: el._id,
                  key: index + 1,
                  location: TaskLocation(el.location, el.region),
                  created_at: el.created_at,
                  assignee: AssigneeData(el.assignee),
                  taskname: el.task.model,
                  tasktype: el.taskType,
                  time: `${el.first} - ${el.last}, ${el.date}`,
                  ticketStatus: el.ticketStatus,
                  timestatus: "Overdue",
                  task: TaskData(el.task.model, el.checklist.model),
                  title: TicketData(el.title, el._id),
                };
              })
            );
          }
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
  const colourStyles = {
    control: (styles) => ({ ...styles, backgroundColor: "white" }),
    option: (styles, { isDisabled }) => {
      return {
        ...styles,
        backgroundColor: isDisabled ? "#EFF3FD" : isDisabled,
        color: isDisabled ? "#000" : isDisabled,
      };
    },
    input: (styles) => ({ ...styles }),
    placeholder: (styles) => ({ ...styles }),
    singleValue: (styles) => ({ ...styles }),
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Compliance Tracking"}
          showSubTitle={true}
          subTitle={
            "The Compliance Status is by default set for the last 15 days. Track your compliance by setting the filter as per your preference."
          }
          breadcrumb={[{ name: "Ticket" }, { name: "Compliance Tracking" }]}
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
                      callManifest: false,
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
          {ManifestService.userIsAdmin() ? (
            <li className={"list-inline-item"}>
              <button
                className="btn btn-textIcon"
                onClick={() => {
                  if (selectedRows && selectedRows.length) {
                    setAction("delete");
                    setModalVisibility(true);
                  } else {
                    showAlert("Please select rows to delete", "warning");
                  }
                }}
              >
                <span>
                  <IconTrash /> Delete
                </span>
              </button>
            </li>
          ) : null}
          <li className={"list-inline-item"}>
            <button
              onClick={() => toggleOpen(!open)}
              className={
                open || filterCount !== 0
                  ? "btn btn-textIcon  active"
                  : "btn btn-textIcon "
              }
            >
              <span>
                <IconFilterLining /> Filter ({filterCount})
              </span>
            </button>
            <div className="filter-box-wrapper">
              <Collapse in={open} className={"filter-box-width"}>
                <div className="filter-bar mt-4 mb-4">
                  <div className="filter-title">
                    <p className={"fw-600"}>Advance filters</p>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Employee</label>
                      <Select
                        value={selectedEmployee}
                        onChange={(selectedOption) => {
                          setSelectedEmployee(selectedOption);
                        }}
                        options={employeeListForSearch}
                      />
                    </div>
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
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
                        //inputProps={}
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
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
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
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
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
                  </div>

                  <div id="filter-collapse-text" className="row">
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
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
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Task type</label>
                      <Select
                        value={selectedTaskType}
                        onChange={(selectedOption) => {
                          setSelectedTaskType(selectedOption);
                        }}
                        options={taskTypeListForSearch}
                      />
                    </div>
                    {/* <div className="col-lg col-md-4 col-sm-6 mb-3">
                    <label htmlFor="inputEmail4">Employee</label>
                    <Select
                      value={selectedEmployee}
                      onChange={(selectedOption) => {
                        setSelectedEmployee(selectedOption);
                      }}
                      options={employeeListForSearch}
                    />
                  </div> */}
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-textIcon btn-sm mr-2"
                      onClick={() => reset()}
                    >
                      Clear all
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => searchButton()}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>
          </li>
        </ActionBlock>

        <div className={"panel-body mt-60"}>
          <div id="table-content" className={"compliance-table"}>
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

        <ConfirmModal
          visibility={modalVisibility}
          setVisiblity={setModalVisibility}
          headerText={"Confirm Action"}
          footerText={
            action == "delete"
              ? "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
              : `Do you want to ${action}?`
          }
          onYes={actionHandler}
          onNo={() => {
            setModalVisibility(false);
            setAction("");
          }}
          onHide={() => {
            setModalVisibility(false);
            setAction("");
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
            <div className="modal-popup">
              <p className="fs-20 primary-color fw-500">Are you sure?</p>
              <p className="mb-0 fs-14">Do you want to {action}?</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="align-right">
              <Button
                variant="primary"
                className="btn btn-primary btn-xs btn mr-2"
                onClick={actionHandler}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                className="btn-tertiary btn-xs btn"
                onClick={() => {
                  setModalVisibility(false);
                  setAction("");
                }}
              >
                No
              </Button>
            </div>
          </Modal.Footer>
        </Modal> */}
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComplianceListComponent);
