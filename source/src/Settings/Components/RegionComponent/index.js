import React, { useState, useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import DataTable from "react-data-table-component";
//import Header from "../HeaderComponent";
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
} from "../../../Common/Components/IconsComponent/Index";
import {
  validateEmail,
  validatePassword,
  validateEmpty,
  validateDropDown,
} from "../../../Services/validation";
import { regionError } from "../../Resources";
import { segmentTrack } from "../../../Services/segment";
import { Settings } from "../../../Services/segmentEventDetails";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import SettingConfirmModal from "../ModalComponents/SettingConfirmModal";

let defaultErrorLabels = {
  region: "",
};

const RegionComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState(defaultErrorLabels);
  const [regionShow, setRegionShow] = useState(false);
  // const [isRegionValid, setIsRegionValid] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const [region, setRegion] = useState("");
  const [id, setId] = useState();

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
  });

  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  const closeTo = () => {
    setRegionShow(false);
    if (action && action === "create") {
      segmentTrack({ title: Settings.region.cancelAddModal });
    } else {
      segmentTrack({ title: Settings.region.cancelEditModal });
    }
    setError(defaultErrorLabels);
  };

  const openROIModal = () => {
    setRegionShow(true);
  };

  const columns = [
    {
      name: "Region",
      selector: "region",
      sortable: true,
    },
    // {
    //   name: "Created at",
    //   selector: "added",
    //   sortable: true,
    // },
    {
      name: "Action",
      selector: "actions",
    },
  ];

  const actionHandler = () => {
    // if (region == "") {
    //   console.log("abcd");
    // }
    // setIsRegionValid(validateEmpty(region));
    const config = {
      url: "",
      method: "",
      body: "",
    };

    switch (action) {
      case "create": {
        if (!handleValidation()) return;
        config.url = `${API_BASE_URL}/region/create`;
        config.method = "POST";
        config.body = JSON.stringify({
          area: region,
          type: "region",
          parent: null,
        });
        break;
      }
      case "edit": {
        if (!handleValidation()) return;
        config.url = `${API_BASE_URL}/region/update/${id}`;
        config.method = "PUT";
        config.body = JSON.stringify({
          area: region,
        });
        break;
      }
      case "delete": {
        config.url = `${API_BASE_URL}/region/status/update`;
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
      body: config.body,
    })
      .then((res) => {
        if (res.status === 200) {
          apiCall(limit, page);
          showAlert(res.message);
          setRegion("");
          if (action === "delete") {
            segmentTrack({ title: Settings.region.delete });
          } else if (action === "create") {
            segmentTrack({ title: Settings.region.create });
          } else if (action === "edit") {
            segmentTrack({ title: Settings.region.edit });
          }
        } else showAlert(res.message, "error");
        setModalVisibility(false);
        setRegionShow(false);
        setSelectedRows("");
      })
      .catch((e) => {
        showAlert(e, "error");
        setModalVisibility(false);
        setRegionShow(false);
      });
  };

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      region,
    };

    if (region === "") {
      errorInForm = { ...errorInForm, region: regionError.region };
      validationSuccess = false;
    }
    setError(errorInForm);
    return validationSuccess;
  };

  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/region/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getActions = (id, region) => {
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
                      setRegionShow(true);
                      setRegion(region);
                      setId([`${id}`]);
                      segmentTrack({ title: Settings.region.editClick });
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
                      segmentTrack({ title: Settings.region.deleteClick });
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
      const regionData = (region) => (
        <div className="title d-flex align-items-center user-panel">
          <div className="content user-info">
            <p className="mb-0 fw-500 text-primary">{region}</p>
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
                  region: regionData(el.region),
                  status: el.status,
                  type: el.type,
                  actions: getActions(el._id, el.region),
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
            { name: "Regions" },
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
              Regions are top level areas for your system. Ideally, regions
              shouldn’t exceed 8.
            </p>
          }
        />
        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <button
              className="btn btn-textIcon"
              onClick={() => {
                setAction("create");
                setRegion("");
                openROIModal();
                segmentTrack({ title: Settings.region.addClick });
                //showAlert("'abc/bhbj' timezone is not valid for Kurla,\n'Asd' timezone is not valid for West kurla\n", "warning");
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
        <div className="form-group">
          <Modal
            size="md"
            show={regionShow}
            onHide={() => closeTo()}
            aria-labelledby="region-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title id="region-modal">
                <h4>{action === "edit" ? "Edit" : "Add"} Region</h4>
                <p>
                  Regions are top level areas for your system. Ideally, regions
                  shouldn’t exceed 8.
                </p>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="region-body">
                <div className="roi-labels mb-4">
                  <div className="form-group">
                    <label htmlFor="inputEmail3" className=" col-form-label">
                      Region name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={region}
                      id="inputState"
                      placeholder="Enter region"
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setError({ ...error, region: "" });
                        // if (validateEmpty(e.target.value)) {
                        //   setError({
                        //     ...error,
                        //     region: regionError.region,
                        //   });
                        // }
                      }}
                    />
                    {error.region ? (
                      <span className="error-msg">{error.region}</span>
                    ) : null}
                    {/* {isRegionValid && (
                              <span className="error-msg">
                                Please enter a region.
                              </span>
                            )} */}
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className="fw-500 btn btn-sm" onClick={closeTo}>
                Cancel
              </button>
              <button
                type={"submit"}
                className="btn btn-primary btn-sm"
                variant="primary"
                onClick={() => {
                  actionHandler();
                }}
              >
                {action === "edit" ? "Update " : "Add "}Region
              </button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className={"panel-body mt-60"}>
          <div id="table-content" className={"camera-table"}>
            <DataTable
              pagination
              paginationServer
              paginationPerPage={limit}
              //paginationComponentOptions={{ noRowsPerPage: true }}
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

          {/* <SettingConfirmModal
            data={{
              modalVisibility,
              action,
              setModalVisibility,
              setAction,
              setSelectedRows,
              actionHandler,
            }}
          /> */}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(RegionComponent);
