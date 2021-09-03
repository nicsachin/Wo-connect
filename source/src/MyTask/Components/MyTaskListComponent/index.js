import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import DataTable from "react-data-table-component";
import { OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import {
  IconPencil,
  IconTrash,
  IconPlayCircle,
  IconStopControl,
} from "../../../Common/Components/IconsComponent/Index";
import "./style.scss";
import {
  API_BASE_URL,
  COMPLIANCE,
  COMPLIANCE_RUN,
  DEFAULT_API_CONFIG,
} from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import ConfirmModal from "../../ModalComponent/ConfirmModal";

const MyTaskListComponent = () => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const history = useHistory();
  const columns = [
    {
      name: "Task",
      selector: "task",
      sortable: true,
      minWidth: "200px",
      cell: (row) => <span className="fs-14 fw-400">{row.task}</span>,
    },
    {
      name: "Type",
      selector: "taskType",
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <div className="tag-block tag-lg tag-default">{row.taskType}</div>
      ),
    },
    {
      name: "Checklist",
      selector: "checklist",
      sortable: true,
      minWidth: "240px",
      cell: (row) => <span className="fs-14 fw-400">{row.checklist}</span>,
    },
    {
      name: "Location",
      selector: "location",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Users",
      selector: "users",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Schedule",
      selector: "schedule",
      sortable: true,
      minWidth: "280px",
      //format: row => `${row.schedule.slice(0, 700)}`,
    },
    {
      name: "Action",
      selector: "actions",
      minWidth: "180px",
    },
  ];

  const data = [
    {
      task: "Facemask compliance",
      type: "Artificial Intelligence",
      checklist: "Covid-19 checklist",
      location: "Sultanpur (Delhi)",
      users: "cmp001",
      schedule: "1:00 PM to 6:00 PM",
      action: "",
    },
  ];

  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const [id, setId] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  //const [action, setAction] = useState('');

  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };

    switch (action) {
      case "start": {
        config.url = `${API_BASE_URL}/task/start/${id}`;
        config.method = "POST";
        break;
      }
      case "stop": {
        config.url = `${API_BASE_URL}/task/stop/${id}`;
        config.method = "POST";
        break;
      }
      case "Delete": {
        config.url = `${API_BASE_URL}/task/delete/${id}`;
        config.method = "POST";
        break;
      }
      default: {
        break;
      }
    }
    setToggledClearRows(!toggledClearRows);

    callApi(config.url, {
      method: config.method,
      //body: config.body,
    })
      .then((res) => {
        if (res.status === 200) {
          apiCall(limit, page);
          showAlert(res.message);
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
      let url = `${API_BASE_URL}/my-checklist/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getUsers = (userNames) => {
        return (
          <ul className="user-table">
            {userNames.map((el, index) => {
              return <li key={index}>{el}</li>;
            })}
          </ul>
        );
      };

      const getSchedule = (schedulesArray) => {
        return (
          <ul className="mb-0">
            {schedulesArray.map((el) => {
              // console.log("cron text >", el.cronText);
              return (
                <li>
                  <p className="mb-0 fs-12 word-break">
                    {el.cronText.slice(0, 42)}
                  </p>
                  <p className="mb-0 fs-12 word-break">
                    {el.cronText.slice(42, 79)}
                  </p>
                  <p className="mb-0 fs-12 word-break">
                    {el.cronText.slice(79, 130)}
                  </p>
                </li>
              );
            })}
          </ul>
        );
      };

      const getActions = (id, checklist_Id, taskId, taskStatus) => {
        return (
          <div align="center">
            <ul className="filter-btn d-flex justify-content-center list-inline">
              {["top"].map((placement, index) => (
                <OverlayTrigger
                  key={index}
                  placement={placement}
                  overlay={<Tooltip id={`tooltip-${placement}`}>Edit</Tooltip>}
                >
                  <li
                    className="list-inline-item"
                    onClick={() => {
                      window.open(
                        `${COMPLIANCE_RUN}${checklist_Id}?id=${taskId}`
                      );
                    }}
                  >
                    <IconPencil />
                  </li>
                </OverlayTrigger>
              ))}

              {taskStatus && taskStatus === "Inactive"
                ? ["top"].map((placement) => (
                    <OverlayTrigger
                      key={placement}
                      placement={placement}
                      overlay={
                        <Tooltip id={`tooltip-${placement}`}>Start</Tooltip>
                      }
                    >
                      <li
                        className="list-inline-item"
                        onClick={() => {
                          setAction("start");
                          // setRegionShow(true);
                          setModalVisibility(true);
                          // setRegion(region);
                          setId([`${id}`]);
                        }}
                      >
                        <IconPlayCircle />
                      </li>
                    </OverlayTrigger>
                  ))
                : ""}

              {taskStatus && taskStatus === "Active"
                ? ["top"].map((placement) => (
                    <OverlayTrigger
                      key={placement}
                      placement={placement}
                      overlay={
                        <Tooltip id={`tooltip-${placement}`}>Stop</Tooltip>
                      }
                    >
                      <li
                        className="list-inline-item"
                        onClick={() => {
                          setAction("stop");
                          // setRegionShow(true);
                          setModalVisibility(true);
                          // setRegion(region);
                          setId([`${id}`]);
                        }}
                      >
                        <IconStopControl />
                      </li>
                    </OverlayTrigger>
                  ))
                : ""}

              {["top"].map((placement) => (
                <OverlayTrigger
                  key={placement}
                  placement={placement}
                  overlay={<Tooltip id={`tooltip-${placement}`}>Trash</Tooltip>}
                >
                  <li
                    className="list-inline-item"
                    onClick={() => {
                      setAction("Delete");
                      setModalVisibility(true);
                      // setRegionShow(true);
                      // setRegion(region);
                      setId([`${id}`]);
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

      callApi(url, {}, apiConfig)
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setTotalRecords(res.data.total);
            setRecords(
              res.data.data.map((el, index) => {
                return {
                  _id: el._id,
                  key: index + 1,
                  task: el.task.model,
                  taskType: el.task.taskType,
                  checklist: el.checklist.model,
                  location: el.location + " (" + el.region + ")",
                  users: getUsers(el.user),
                  schedule: getSchedule(el.schedules),
                  actions: getActions(
                    el._id,
                    el.checklist._id,
                    el.task._id,
                    el.status
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
    setPage(0);
  }, [limit]);

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

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Manage Tasks"}
          showSubTitle={true}
          subTitle={
            "Manage, start or stop tasks for any location and schedule."
          }
          breadcrumb={[{ name: "Task" }, { name: "Manage Task" }]}
        >
          {/* <ActionBlock showActionList={true} showActionBtn={false}>
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
          </ActionBlock> */}
        </PageTitle>

        <ConfirmModal
          visibility={modalVisibility}
          setVisiblity={setModalVisibility}
          headerText={"Confirm Action"}
          // footerText={`Do you want to ${action}?`}
          footerText={
            action == "Delete"
              ? "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
              : `Do you want to ${action}?`
          }
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
        <div className="row mt-4">
          <div className="col-lg-12">
            <div id="table-content">
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
                sortServer
                striped={false}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                // selectableRows
                clearSelectedRows={toggledClearRows}
                key={limit}
                columns={columns}
                data={records}
                // data={data}
                onSort={handleSort}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTaskListComponent;
