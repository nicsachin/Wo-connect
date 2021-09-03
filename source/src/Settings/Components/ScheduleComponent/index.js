import React, { useState, useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import DataTable from "react-data-table-component";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  API_BASE_URL,
  EMPLOYEE,
  DEFAULT_API_CONFIG,
  DEBOUNCE_INPUT_TIME,
} from "../../../Constants";
// Importing Icons
import {
  IconAddCircle,
  IconTrash,
  IconPencil,
  IconSearch,
  IconCross,
} from "../../../Common/Components/IconsComponent/Index";
import AddScheduleModal from "../ModalComponents/AddScheduleModal";
import { segmentTrack } from "../../../Services/segment";
import StatusText from "../../../Common/Components/Molecule/Atoms/StatusText";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import { Settings } from "../../../Services/segmentEventDetails";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import SettingConfirmModal from "../ModalComponents/SettingConfirmModal";

const ScheduleComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);

  // Modal Popup
  const [show, setShow] = useState(false);

  const columns = [
    {
      name: "Schedule Name",
      selector: "scheduleName",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Schedule",
      selector: "schedule",
      sortable: true,
      wrap: true,
      minWidth: "250px",
      format: (row) => `${row.schedule.slice(0, 700)}`,
    },
    {
      name: "Ends",
      selector: "endsOn",
      sortable: true,
    },
    {
      name: "Action",
      selector: "actions",
      minWidth: "150px",
    },
  ];

  //const actionHandler = (cronUTC, cron, cronStr, start, end) => {
  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: {},
    };

    switch (action) {
      case "delete": {
        config.url = `${API_BASE_URL}/schedule/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: "Deleted",
          ids: selectedRows,
        });
        break;
      }
      default: {
        break;
      }
    }
    setToggledClearRows(!toggledClearRows);

    callApi(config.url, {
      method: config.method,
      body: config.body.toString(),
    })
      .then((res) => {
        if (res.status === 200) {
          apiCall(limit, page);
          showAlert(res.message);
          if (action === "delete") {
            segmentTrack({ title: Settings.schedule.delete });
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
      let url = `${API_BASE_URL}/schedule/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getActions = (startT, id, name, endsOn, daysOfWeek, from, till) => {
        return (
          <div align="center">
            <ul className="filter-btn d-flex justify-content-center list-inline">
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
                      segmentTrack({ title: Settings.schedule.deleteClick });
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
      const scheduleNameData = (scheduleName) => (
        <div className="title d-flex align-items-center user-panel">
          <div className="content user-info">
            <p className="mb-0 fw-500 text-primary">{scheduleName}</p>
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
                  id: el.serial,
                  scheduleName: scheduleNameData(el.schedule),
                  schedule: el.cronText,
                  endTime: el.endTime,
                  startTime: el.startTime,
                  status: el.status,
                  endsOn: el.endsOn,
                  daysOfWeek: el.daysOfWeek,
                  from: el.from,
                  till: el.till,
                  actions: getActions(
                    el.startTime,
                    el._id,
                    el.schedule,
                    el.endsOn,
                    el.daysOfWeek,
                    el.from,
                    el.till
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
      scheduleName: "schedule",
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
          pageTitle={"Settings"}
          breadcrumb={[
            { name: "Settings", link: EMPLOYEE },
            { name: "Schedule" },
          ]}
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
              Recurring schedules help you easily manage your working hours and
              slots.
            </p>
          }
        />
        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <button
              className="btn btn-textIcon"
              onClick={() => {
                setAction("create");
                setShow(true);
                segmentTrack({ title: Settings.schedule.addClick });
              }}
            >
              <span>
                <IconAddCircle /> Add New
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
        </ActionBlock>

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
              sortServer
              striped={false}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              selectableRows
              clearSelectedRows={toggledClearRows}
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
              action == "delete"
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
          <AddScheduleModal
            data={{
              show,
              setShow,
              action,
              setAction,
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

export default connect(mapStateToProps, null)(ScheduleComponent);
