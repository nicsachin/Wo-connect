import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import Select from "react-select";
import { connect } from "react-redux";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import DataTable from "react-data-table-component";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { Settings } from "../../../Services/segmentEventDetails";
import { colourStyles } from "../../../Services/colourStyles";
import {
  API_BASE_URL,
  DEFAULT_API_CONFIG,
  ADDEMPLOYEE,
  EMPLOYEE,
  DEBOUNCE_INPUT_TIME,
} from "../../../Constants";
import {
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
  Collapse,
} from "react-bootstrap";
// Importing Icons
import {
  IconPencil,
  IconTrash,
  IconSearch,
  IconActive,
  IconInactive,
  IconAddCircle,
  IconFilterLining,
} from "../../../Common/Components/IconsComponent/Index";
import StatusText from "../../../Common/Components/Molecule/Atoms/StatusText";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import { segmentTrack } from "../../../Services/segment";
import "./style.scss";
import AddEmployeeComponent from "./AddEmployeeComponent";
import SettingConfirmModal from "../ModalComponents/SettingConfirmModal";

const EmployeeComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const toggleOpen = (value) => setOpen(value);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [filterCount, setFilterCount] = useState(0);
  const [employeeId, setEmployeeId] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
      minWidth: "150px",
      cell: (row) => <span>{row.name}</span>,
    },
    {
      name: "Username",
      selector: "username",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Contact",
      selector: "email",
      sortable: true,
      minWidth: "220px",
    },
    {
      name: "Role",
      selector: "role",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Last Active",
      selector: "updated_at",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
    },
    {
      name: "Action",
      selector: "actions",
      minWidth: "180px",
    },
  ];

  let yesterdayDateAndTime = moment().subtract(1, "days").startOf("day");
  let todayDateAndTime = moment().endOf("day");
  let defaultOptionValue = { label: "All", value: "" };

  /**
   * Lists
   * */
  const [statusForSearch, setStatusForSearch] = useState([defaultOptionValue]);
  const [selectedStatus, setSelectedStatus] = useState([defaultOptionValue]);
  const [roleForSearch, setRoleForSearch] = useState([defaultOptionValue]);
  const [selectedRole, setSelectedRole] = useState([defaultOptionValue]);
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
  const [taskListForSearch, setTaskListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [selectedTask, setSelectedTask] = useState([defaultOptionValue]);
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

      const statusList = [
        { value: "", label: "All" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ];
      setStatusForSearch(statusList);

      const roleList = [
        { value: "", label: "All" },
        { value: "Owner", label: "Owner" },
        { value: "Admin", label: "Admin" },
        { value: "Supervisor", label: "Supervisor" },
        { value: "Executive", label: "Executive" },
      ];
      setRoleForSearch(roleList);
    }

    const getTask = async () => {
      try {
        // /models/get
        // let taskResponse = await callApi(`${API_BASE_URL}/task/get/1000/0`, {
        let taskResponse = await callApi(`${API_BASE_URL}/models/get`, {
          method: "GET",
        });
        if (taskResponse.status === 200) {
          let taskList = [...taskListForSearch];
          for (let el of taskResponse.data) {
            taskList.push({
              value: el._id,
              label: el.model,
            });
          }
          setTaskListForSearch(taskList);
        }
      } catch (e) {
        showAlert(e, "error");
      }
    };
    getTask();
  });

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

    // http://164.52.208.210:4000/app/v1/team/get/10/0?
    // type=Executive
    // &task=6034cf148d73ce457ef87cd7&checklist=5fbce71a5f707318e61816cb
    // &region=5fbca04c1d7a3a157f60ec79&city=5fbca1ac1d7a3a157f60ec7b
    // &location=6010f9cb2c722321166fb24b&status=Active&from=2020-11-30&to=2021-02-25
    let searchFields = {
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
      checklist: selectedChecklist.value,
      task: selectedTask.value,
      role: selectedRole.value,
      status: selectedStatus.value,
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

    setSelectedChecklist(defaultOptionValue);

    setSelectedTask(defaultOptionValue);
    setSelectedRole(defaultOptionValue);
    setSelectedStatus(defaultOptionValue);

    setQuery({
      ...query,
      customQuery: "",
    });
    setFilterCount(0);
  };

  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };

    switch (action) {
      case "delete": {
        config.url = `${API_BASE_URL}/user/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: "Deleted",
          ids: selectedRows,
        });
        break;
      }
      case "Active": {
        config.url = `${API_BASE_URL}/user/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: action,
          ids: selectedRows,
        });
        break;
      }
      case "Inactive": {
        config.url = `${API_BASE_URL}/user/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: action,
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
          if (action && action === "delete") {
            segmentTrack({ title: Settings.EmployeeList.delete });
          } else if (action && action === "Active") {
            segmentTrack({ title: Settings.EmployeeList.active });
          } else if (action && action === "Inactive") {
            segmentTrack({ title: Settings.EmployeeList.inactive });
          }
        } else showAlert(res.message, "error");
        setModalVisibility(false);
        setSelectedRows("");
      })
      .catch((e) => {
        showAlert(e, "error");
        setModalVisibility(false);
      });
  };

  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/team/get/${limit}/${page}?query=${query.query}&${query.customQuery}`;
      if (query.query || query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      const getActions = (id, employeeStatus) => {
        return (
          <div align="center">
            <ul className="filter-btn d-flex justify-content-center list-inline">
              {["top"].map((placement) => (
                <OverlayTrigger
                  key={placement}
                  placement={placement}
                  overlay={<Tooltip id={`tooltip-${placement}`}>Edit</Tooltip>}
                >
                  <li
                    className="list-inline-item"
                    onClick={() => {
                      // history.push(`${ADDEMPLOYEE}?employee=${id}`);
                      setEmployeeId(id);
                      setAction("edit");
                      setShow(true);
                      segmentTrack({ title: Settings.EmployeeList.editClick });
                    }}
                  >
                    <IconPencil />
                  </li>
                </OverlayTrigger>
              ))}
              {employeeStatus === "Inactive"
                ? ["top"].map((placement) => (
                    <OverlayTrigger
                      key={placement}
                      placement={placement}
                      overlay={
                        <Tooltip id={`tooltip-${placement}`}>Activate</Tooltip>
                      }
                    >
                      <li
                        className="list-inline-item"
                        onClick={() => {
                          setSelectedRows([`${id}`]);
                          setAction("Active");
                          setModalVisibility(true);
                        }}
                      >
                        <IconActive />
                      </li>
                    </OverlayTrigger>
                  ))
                : ["top"].map((placement) => (
                    <OverlayTrigger
                      key={placement}
                      placement={placement}
                      overlay={
                        <Tooltip id={`tooltip-${placement}`}>
                          Deactivate
                        </Tooltip>
                      }
                    >
                      <li
                        className="list-inline-item"
                        onClick={() => {
                          setSelectedRows([`${id}`]);
                          setAction("Inactive");
                          setModalVisibility(true);
                        }}
                      >
                        <IconInactive />
                      </li>
                    </OverlayTrigger>
                  ))}
              {["top"].map((placement) => (
                <OverlayTrigger
                  key={placement}
                  placement={placement}
                  overlay={
                    <Tooltip id={`tooltip-${placement}`}>Delete</Tooltip>
                  }
                >
                  <li
                    className="list-inline-item"
                    onClick={() => {
                      setSelectedRows([`${id}`]);
                      setAction("delete");
                      setModalVisibility(true);
                    }}
                  >
                    <IconTrash />
                  </li>
                </OverlayTrigger>
              ))}
            </ul>
          </div>
        );
      };

      const roleData = (role) => (
        <ul className="mb-0">
          <li className="fw-400 fs-14 tag-block tag-md">{role}</li>
        </ul>
      );

      const userNameData = (userId) => (
        <ul className="mb-0">
          <li className="fw-400 fs-14 tag-block primary-color tag-md">
            {userId}
          </li>
        </ul>
      );

      const contactData = (emailId, mobileNo) => (
        <ul
          className="table-list mb-0"
          data-tag="allowRowEvents"
          style={{
            overflow: "hidden",
            whiteSpace: "wrap",
            textOverflow: "ellipses",
          }}
        >
          <li className="fw-500 text-primary">{emailId}</li>
          <li className="mb-0 text-other fs-12 fw-400">{mobileNo}</li>
        </ul>
      );

      const nameData = (image, nm, id) => (
        <div className="title d-flex align-items-center user-panel">
          <div className="content user-info">
            <p
              className="mb-0 fw-500"
              onClick={() => {
                window.open(`/settings/employee/detail/${id}`);
              }}
            >
              {nm}
            </p>
          </div>
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
                  role: roleData(el.company.role),
                  status: <StatusText status={el.status} />,
                  name: nameData(el.displayImage, el.name, el._id),
                  username: userNameData(el.username),
                  email: contactData(el.email, el.mobile),
                  updated_at: el.updated_at,
                  actions: getActions(el._id, el.status),
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
    [query, show]
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

  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Settings"}
          breadcrumb={[{ name: "Settings" }, { name: "Users", link: EMPLOYEE }]}
          showSubTitle={false}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <div className="search-filter w-100">
                <DebounceInput
                  className="search form-control"
                  placeholder="Search"
                  debounceTimeout={DEBOUNCE_INPUT_TIME}
                  onChange={(e) => {
                    const currValue = e.target.value;
                    setApiConfig({
                      showLoader: false,
                      callManifest: false,
                      loaderLabel: "",
                    });
                    setQuery({ ...query, query: currValue });
                  }}
                  value={query.query}
                />
                <IconSearch />
              </div>
            </li>
          </ActionBlock>
        </PageTitle>
        <HeaderLinks
          showSubTitle={true}
          subTitle={
            <p>
              User related description comes here. This can be a bit longer as
              well.
            </p>
          }
        />

        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <button
              // to={ADDEMPLOYEE}
              className="btn btn-textIcon mr-2 fw-500"
              onClick={() => {
                setAction("create");
                setShow(true);
                segmentTrack({ title: Settings.EmployeeList.addClick });
              }}
            >
              <IconAddCircle /> Add New
            </button>
          </li>
          <li className={"list-inline-item"}>
            <button
              className={"btn btn-textIcon"}
              onClick={() => {
                if (selectedRows && selectedRows.length) {
                  setAction("Active");
                  setModalVisibility(true);
                } else {
                  showAlert("Please select rows to Activate", "warning");
                }
              }}
            >
              <span>
                <IconActive /> Activate
              </span>
            </button>
          </li>
          <li className={"list-inline-item"}>
            <button
              className={"btn btn-textIcon"}
              onClick={() => {
                if (selectedRows && selectedRows.length) {
                  setAction("Inactive");
                  setModalVisibility(true);
                } else {
                  showAlert("Please select rows to Deactivate", "warning");
                }
              }}
            >
              <span>
                <IconInactive /> Deactivate
              </span>
            </button>
          </li>

          <li className={"list-inline-item"}>
            <button
              className={"btn btn-textIcon"}
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

          <li className={"list-inline-item"}>
            <button
              className={
                open || filterCount !== 0
                  ? "btn btn-textIcon  active"
                  : "btn btn-textIcon "
              }
              aria-controls="filter-collapse-text"
              onClick={() => toggleOpen(!open)}
              aria-expanded={open}
            >
              <span>
                <IconFilterLining /> Filter
              </span>
            </button>
            <div className="filter-box-wrapper">
              <Collapse in={open} className={"filter-box-width max-width-650"}>
                <div className="filter-bar mt-4 mb-4">
                  <div className="filter-title">
                    <p className={"fw-600"}>Advance filters</p>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">From</label>
                      <Datetime
                        inputProps={{ readOnly: true }}
                        isValidDate={(data) => {
                          return !moment(data).isAfter(todayDateAndTime);
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
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">To</label>
                      <Datetime
                        inputProps={{ readOnly: true }}
                        isValidDate={(data) => {
                          return !moment(data).isAfter(todayDateAndTime);
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
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">CheckList</label>
                      <Select
                        value={selectedChecklist}
                        onChange={(selectedOption) => {
                          setSelectedChecklist(selectedOption);
                        }}
                        options={CheckListForSearch}
                      />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Task</label>
                      <Select
                        value={selectedTask}
                        onChange={(selectedOption) => {
                          setSelectedTask(selectedOption);
                        }}
                        options={taskListForSearch}
                      />
                    </div>
                    <div
                      id="filter-collapse-text"
                      className="col-lg-4 col-md-4 col-sm-6 mb-3"
                    >
                      <label htmlFor="inputEmail4">Status</label>
                      <Select
                        value={selectedStatus}
                        onChange={(selectedOption) => {
                          setSelectedStatus(selectedOption);
                        }}
                        options={statusForSearch}
                      />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Role</label>
                      <Select
                        value={selectedRole}
                        onChange={(selectedOption) => {
                          setSelectedRole(selectedOption);
                        }}
                        options={roleForSearch}
                      />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
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
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Location</label>
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
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-tertiary btn-sm mr-3"
                      onClick={() => reset()}
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
          </li>
        </ActionBlock>

        <div className={"panel-body mt-60"}>
          <div id="table-content" className={"camera-table"}>
            <DataTable
              onRowClicked={(el) => {
                window.open(`/settings/employee/detail/${el._id}`);
              }}
              pagination
              paginationServer
              paginationPerPage={limit}
              paginationTotalRows={totalRecords}
              paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
              onSelectedRowsChange={(row) => {
                setSelectedRows(row.selectedRows.map((el) => el._id));
              }}
              paginationComponentOptions={{ rowsPerPageText: "" }}
              sortServer
              striped={false}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              selectableRows
              key={limit}
              columns={columns}
              data={records}
              onSort={handleSort}
            />
          </div>
          <SettingConfirmModal
            visibility={modalVisibility}
            setVisiblity={setModalVisibility}
            headerText={"Confirm Action"}
            footerText={
              action == "Active" || action == "Inactive"
                ? `Do you want to ${action}?`
                : "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
            }
            // footerText={`Do you want to ${action}?`}
            onYes={actionHandler}
            onNo={() => {
              setModalVisibility(false);
              setAction("");
              setSelectedRows("");
            }}
            onHide={() => {
              setModalVisibility(false);
              setAction("");
              setSelectedRows("");
            }}
          />
          <AddEmployeeComponent
            data={{
              show,
              setShow,
              action,
              setAction,
              employeeId,
              successCallback: () => {
                apiCall(limit, page);
              },
              module: "Settings",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(EmployeeComponent);
