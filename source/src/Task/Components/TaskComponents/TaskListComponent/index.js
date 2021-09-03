import React, { useCallback, useEffect, useState, useRef } from "react";
import { DebounceInput } from "react-debounce-input";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  IconFilterLining,
  IconSearch,
  IconCalender,
} from "../../../../Common/Components/IconsComponent/Index";
import {
  API_BASE_URL,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
  TASK_DETAILS,
} from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import { colourStyles } from "../../../../Services/colourStyles";
import callApi from "../../../../Services/callApi";
import { connect } from "react-redux";
import { addUserDataToStoreAction } from "../../../../Store/actions";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import "./style.scss";
import PageTitle from "../../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../../Common/Components/Molecule/ActionBlock";

const TaskListComponent = (props) => {
  //Data-Table
  //DataTable Table-Header

  let yesterdayDateAndTime = moment().subtract(1, "days").startOf("day");
  let todayDateAndTime = moment().endOf("day");
  let defaultOptionValue = { label: "All", value: "" };

  const columns = [
    {
      name: "Task name",
      selector: "task",
      sortable: true,
      minWidth: "180px",
      grow: 5,
    },
    {
      name: "Type",
      selector: "tasktype",
      sortable: true,
      minWidth: "180px",
      grow: 5,
      cell: (row) => (
        <div className="tag-block tag-lg tag-default">{row.tasktype}</div>
      ),
    },
    {
      name: "Checklist",
      selector: "checklist",
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
      name: "Assignee",
      selector: "assignee",
      minWidth: "200px",
      maxWidth: "240px",
    },
  ];

  //  Expand Filter
  const [filterCount, setFilterCount] = useState(0);
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  //const [selectedRows, setSelectedRows] = useState();

  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
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

  /**
   *
   * For search
   * */
  const searchButton = () => {
    search();
    toggleOpen(!open);
  };

  const search = () => {
    const sDate = moment(startTimeForSearch).toISOString();
    const eDate = moment(endTimeForSearch).toISOString();

    let searchFields = {
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

  const reset = () => {
    setStartTimeForSearch(yesterdayDateAndTime);
    setEndTimeForSearch(todayDateAndTime);

    setSubregionForSearch(defaultOptionValue);
    setLocationForSearch(defaultOptionValue);

    setLocationListForSearch(defaultOptionValue);

    //setCheckListForSearch(defaultOptionValue);
    setSelectedChecklist(defaultOptionValue);

    //setTaskTypeListForSearch(defaultOptionValue);
    setSelectedTaskType(defaultOptionValue);

    //setEmployeeListForSearch(defaultOptionValue);
    setSelectedEmployee(defaultOptionValue);

    const sDate = moment(yesterdayDateAndTime).toISOString();
    const eDate = moment(todayDateAndTime).toISOString();
    setQuery({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
    setFilterCount(0);
  };

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
    }

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
    const sDate = moment(yesterdayDateAndTime).toISOString();
    const eDate = moment(todayDateAndTime).toISOString();

    /**
     * For first time search with yesterday date and current date filters
     * */
    setQuery({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
  });
  const apiCall = useCallback(
    (limit, page) => {
      //    app/v1/task/get/10/0?sortBy&sort=-1&region=5fbca04c1d7a3a157f60ec79&city=5fbca1ac1d7a3a157f60ec7b&
      //     location=6010f9cb2c722321166fb24b&checklist=5fbce71a5f707318e61816cb&taskType=Artificial%20Intelligence&assignee&from&to
      //assigned/task/get?query
      let url = `${API_BASE_URL}/task/get/${limit}/${page}?query=${query.query}&${query.customQuery}&status=`;
      if (query.query || query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      const TaskData = (
        taskname,
        tasktype,
        time,
        location,
        task,
        schedule,
        today,
        region,
        city,
        regionName,
        locationName,
        cityName,
        checklist
      ) => (
        <div
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <p className="mb-1 fw-800">
            <Link
              to={`${TASK_DETAILS}?taskname=${taskname}&&checklist=${checklist}&&locationName=${locationName}&&cityName=${cityName}&&regionName=${regionName}&&locationId=${location}&&taskId=${task}&&schedule=${schedule}&&regionId=${region}&&cityId=${city}`}
            >
              {taskname}
            </Link>
          </p>
          {/* <p className="fs-12 mb-2">{tasktype}</p> */}
          <p className="fs-12 mb-0">
            <span>
              <IconCalender />
            </span>{" "}
            {/* 4PM - 8PM, 8/12/2020 */}
            {today ? time + ", Today" : time}
          </p>
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
            {assignee && assignee.length
              ? assignee.map((el) => {
                  return <li>{el}</li>;
                })
              : "-"}
          </ul>
        </div>
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
                  location: `${el.location} (${el.region})`,
                  region: el.region.area,
                  checklist: el.checklist.model,
                  taskname: el.task.model,
                  tasktype: el.task.taskType,
                  time: el.timing,
                  assignee: AssigneeData(el.user),
                  date: el._id.date,
                  task: TaskData(
                    el.task.model,
                    el.taskType,
                    el.timing,
                    el._location,
                    el.task._id,
                    el.schedule,
                    el.today,
                    el._region,
                    el._city,
                    el.region,
                    el.location,
                    el.city,
                    el.checklist.model
                  ),
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
  }, [limit, page]);

  const handleSort = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;

    let mapper = {
      task: "task.model",
      taskType: "task.taskType",
    };

    if (column.selector in mapper) column.selector = mapper[column.selector];
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

  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  // React Select Style
  // const colourStyles = {
  //   control: (styles) => ({ ...styles, backgroundColor: "white" }),
  //   option: (styles, { isDisabled }) => {
  //     return {
  //       ...styles,
  //       backgroundColor: isDisabled ? "#EFF3FD" : isDisabled,
  //       color: isDisabled ? "#000" : isDisabled,
  //     };
  //   },
  //   input: (styles) => ({ ...styles }),
  //   placeholder: (styles) => ({ ...styles }),
  //   singleValue: (styles) => ({ ...styles }),
  // };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Scheduled Tasks"}
          showSubTitle={true}
          subTitle={
            "See which tasks are scheduled and view their details, events and more."
          }
          breadcrumb={[{ name: "Task" }, { name: "Scheduled Tasks" }]}
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
          <li className="list-inline-item">
            <button
              className="btn btn-textIcon"
              onClick={() => toggleOpen(!open)}
              aria-expanded={open}
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
                      <label htmlFor="inputEmail4">Checklist</label>
                      <Select
                        value={selectedChecklist}
                        onChange={(selectedOption) => {
                          setSelectedChecklist(selectedOption);
                        }}
                        options={CheckListForSearch}
                      />
                    </div>
                    {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                                                <label htmlFor="inputEmail4">Start Date & time</label>
                                                <Datetime 
                                                  inputProps={{readOnly: true}}
                                                  dateFormat="DD-MM-YYYY"
                                                  value={startTimeForSearch}
                                                  onChange={(value) => {
                                                    setStartTimeForSearch(
                                                      value
                                                      // new Date(value)
                                                    );
                                                  }}
                                                />
                                              </div>
                                              <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                                                <label htmlFor="inputEmail4">End Date & time</label>
                                                <Datetime 
                                                  inputProps={{readOnly: true}}
                                                  dateFormat="DD-MM-YYYY"
                                                  value={endTimeForSearch}
                                                  onChange={(value) => {
                                                    setEndTimeForSearch(value);
                                                  }}
                                                />
                                              </div> */}
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
                  <div className="row">
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
                    {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
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
                      onClick={searchButton}
                      className="btn btn-primary btn-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>
          </li>
        </ActionBlock>
        <div className="row">
          <div className="col-12 mt-4">
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
                //selectableRows
                striped={false}
                key={limit}
                data={records}
                columns={columns}
                dense
                onSort={handleSort}
              />
            </div>
          </div>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskListComponent);
