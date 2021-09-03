import React, { useState, useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { DebounceInput } from "react-debounce-input";
import DataTable from "react-data-table-component";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { API_BASE_URL } from "../../../Constants";
// Importing Icons
import {
  IconAddCircle,
  IconTrash,
  IconPencil,
} from "../../../Common/Components/IconsComponent/Index";
import IconSearch from "../../../Common/Components/IconsComponent/IconSearch";
import { segmentTrack } from "../../../Services/segment";
import { Settings } from "../../../Services/segmentEventDetails";

const TatComponent = (props) => {
  const [limit, setLimit] = useState(10);
  const [tatShow, setTatShow] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const [time, setTime] = useState();
  const [id, setId] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  const closeTo = () => {
    setTatShow(false);
    if (action && action === "create") {
      segmentTrack({ title: Settings.tat.cancelAddModal });
    } else if (action && action === "edit") {
      segmentTrack({ title: Settings.tat.cancelEditModal });
    }
  };

  const openROIModal = () => {
    setTatShow(true);
  };

  const columns = [
    {
      name: "TAT",
      selector: "time",
      sortable: true,
    },
    {
      name: "Action",
      selector: "actions",
    },
  ];

  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };

    switch (action) {
      case "create": {
        config.url = `${API_BASE_URL}/tat/create`;
        config.method = "POST";
        config.body = JSON.stringify({
          tat: time,
        });
        break;
      }
      case "edit": {
        config.url = `${API_BASE_URL}/tat/update/${id}`;
        config.method = "PUT";
        config.body = JSON.stringify({
          tat: time,
        });
        break;
      }
      case "delete": {
        config.url = `${API_BASE_URL}/tat/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: "Deleted",
          ids: selectedRows,
        });
        break;
      }
      case "Active": {
        config.url = `${API_BASE_URL}/tat/status/update`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: action,
          ids: selectedRows,
        });
        break;
      }
      case "Inactive": {
        config.url = `${API_BASE_URL}/tat/status/update`;
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
    setToggledClearRows(!toggledClearRows);

    callApi(config.url, {
      method: config.method,
      body: config.body,
    })
      .then((res) => {
        if (res.status === 200) {
          apiCall(limit, page);
          showAlert(res.message);
          setTime("");
          if (action) {
            if (action === "delete") {
              segmentTrack({ title: Settings.tat.delete });
            } else if (action === "create") {
              segmentTrack({ title: Settings.tat.create });
            } else if (action === "edit") {
              segmentTrack({ title: Settings.tat.edit });
            } else if (action === "Active") {
              segmentTrack({ title: Settings.tat.active });
            } else if (action === "Inactive") {
              segmentTrack({ title: Settings.tat.inactive });
            }
          }
        } else showAlert(res.message, "error");
        setModalVisibility(false);
        setTatShow(false);
        setSelectedRows("");
      })
      .catch((e) => {
        showAlert(e, "error");
        setModalVisibility(false);
        setTatShow(false);
      });
  };

  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/tat/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getActions = (id, status, time) => {
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
                      setAction("edit");
                      setTatShow(true);
                      setTime(time);
                      setId([`${id}`]);
                      segmentTrack({ title: Settings.tat.editClick });
                    }}
                  >
                    <IconPencil />
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
                      segmentTrack({ title: Settings.tat.deleteClick });
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

      callApi(url)
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setTotalRecords(res.data.total);
            setRecords(
              res.data.data.map((el, index) => {
                return {
                  _id: el._id,
                  key: index + 1,
                  id: el.serial,
                  time: el.time + " min",
                  status: el.status,
                  type: el.type,
                  actions: getActions(el._id, el.status, el.time),
                };
              })
            );
          }
        })
        .catch((e) => {
          showAlert(e, "error");
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

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-6">
            <div className="title d-flex align-items-baseline">
              <h4 className="mr-2">Turn around time</h4>
              <p className="mb-0 fw-500">Settings</p>
            </div>
            <p className="mb-0">
              TAT is the time duration after which a ticket becomes overdue and
              gets escalated to the designated Escalator.
            </p>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6">
            <div className="search-filter">
              <DebounceInput
                className="search form-control"
                placeholder="Search"
                debounceTimeout={200}
                onChange={(e) => {
                  const currValue = e.target.value;
                  setQuery({ ...query, query: currValue });
                }}
              />
              <IconSearch />
            </div>
          </div>
          <div className="col-md-12 mt-4">
            <div className="panel-body">
              <div id="table-content">
                <div className="table-filters">
                  <div className="grouped-filter">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setAction("create");
                        setTime("");
                        openROIModal();
                        segmentTrack({ title: Settings.tat.addClick });
                      }}
                      className="add-roi btn btn-primary btn-sm btn-icon"
                    >
                      <IconAddCircle /> Add TAT
                    </Button>
                    {totalRecords && totalRecords !== 0 ? (
                      <ul className="filter-btn list-inline">
                        {["top"].map((placement) => (
                          <OverlayTrigger
                            key={placement}
                            placement={placement}
                            overlay={
                              <Tooltip id={`tooltip-${placement}`}>
                                Delete
                              </Tooltip>
                            }
                          >
                            <li
                              className="list-inline-item"
                              onClick={() => {
                                if (selectedRows && selectedRows.length) {
                                  setAction("delete");
                                  setModalVisibility(true);
                                } else {
                                  showAlert(
                                    "Please select rows to delete",
                                    "warning"
                                  );
                                }
                              }}
                            >
                              <IconTrash />
                            </li>
                          </OverlayTrigger>
                        ))}
                      </ul>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <Modal
                    size="md"
                    show={tatShow}
                    onHide={() => closeTo()}
                    aria-labelledby="region-modal"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="region-modal">
                        <h4>
                          {action === "edit" ? "Edit" : "Add"} Turn Around Time
                          (TAT)
                        </h4>
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="region-body">
                        <div className="roi-labels mb-4">
                          <div className="form-group">
                            <label
                              htmlFor="inputEmail3"
                              className="col-form-label"
                            >
                              Turn around time (in minutes)
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={time}
                              id="inputState"
                              placeholder="e.g. 30"
                              onChange={(e) => {
                                setTime(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <button
                        className="btn btn-tertiary btn-sm"
                        onClick={closeTo}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        variant="primary"
                        onClick={() => {
                          time
                            ? actionHandler()
                            : showAlert("Please enter TAT");
                        }}
                      >
                        {action === "edit" ? "Update TAT" : "Add TAT"}
                      </button>
                    </Modal.Footer>
                  </Modal>
                </div>
                <Modal
                  className="action-popup"
                  show={modalVisibility}
                  onHide={() => {
                    setModalVisibility(false);
                    setSelectedRows("");
                    setAction("");
                  }}
                >
                  <Modal.Header />
                  <Modal.Body>
                    <div className="modal-popup">
                      <p className="fs-20 primary-color fw-500">
                        Are you sure?
                      </p>
                      <p className="mb-0 fs-14">Do you want to {action}?</p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="align-right">
                      <button
                        variant="primary"
                        className="btn-primary btn-xs btn mr-2"
                        onClick={actionHandler}
                      >
                        Yes
                      </button>
                      <button
                        className="btn-tertiary btn-xs btn"
                        onClick={() => {
                          setModalVisibility(false);
                          setSelectedRows("");
                          setAction("");
                        }}
                      >
                        No
                      </button>
                    </div>
                  </Modal.Footer>
                </Modal>
                <DataTable
                  pagination
                  paginationServer
                  paginationPerPage={limit}
                  paginationTotalRows={totalRecords}
                  paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                  onSelectedRowsChange={(row) => {
                    setSelectedRows(row.selectedRows.map((el) => el._id));
                  }}
                  striped={false}
                  paginationComponentOptions={{ rowsPerPageText: "" }}
                  sortServer
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

export default connect(mapStateToProps, null)(TatComponent);
