import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import DataTable from "react-data-table-component";
import Select from "react-select";
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
  IconPencil,
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import {
  validateEmail,
  validatePassword,
  validateEmpty,
  validateDropDown,
} from "../../../Services/validation";
import { cityError } from "../../Resources";
import { Settings } from "../../../Services/segmentEventDetails";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import { segmentTrack } from "../../../Services/segment";
import SettingConfirmModal from "../ModalComponents/SettingConfirmModal";

let defaultErrorLabels = {
  selectedRegion: "",
  name: "",
};

const SubRegionComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);

  const [limit, setLimit] = useState(10);
  const [regionShow, setRegionShow] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState();
  const [action, setAction] = useState();
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [error, setError] = useState(defaultErrorLabels);

  const [name, setName] = useState("");
  const [listRegion, setListRegion] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState();
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
    setName("");
    if (action && action === "create") {
      segmentTrack({ title: Settings.subRegion.cancelAddModal });
    } else {
      segmentTrack({ title: Settings.subRegion.cancelEditModal });
    }
    setError(defaultErrorLabels);
  };

  const openROIModal = () => {
    setRegionShow(true);
  };

  const columns = [
    {
      name: "City",
      selector: "city",
      sortable: true,
    },
    {
      name: "Region",
      selector: "region",
      sortable: true,
    },
    {
      name: "Action",
      selector: "actions",
      minWidth: "190px",
    },
  ];

  useEffect(() => {
    if (!regionShow) {
      setRegion("");
      setAction("");
      setId();
      setSelectedRegion();
      setName("");
    }
  }, [regionShow]);

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      selectedRegion,
      name,
    };

    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: cityError[key] };
        validationSuccess = false;
      }
    }
    // if (region !== "") {
    //   errorInForm = { ...errorInForm, region: cityError.region };
    //   // validationSuccess = false;
    // }

    if (name === "") {
      errorInForm = { ...errorInForm, name: cityError.name };
      validationSuccess = false;
    }

    setError(errorInForm);
    return validationSuccess;
  };

  const actionHandler = () => {
    // var errorFlag = false;
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
        // if (typeof selectedRegion !== "undefined" && name !== "") {
        config.body = JSON.stringify({
          area: name,
          type: "city",
          parent: selectedRegion.value,
        });
        // } else {
        //   errorFlag = true;
        // }
        break;
      }
      case "edit": {
        if (!handleValidation()) return;
        config.url = `${API_BASE_URL}/region/update/${id}`;
        config.method = "PUT";
        config.body = JSON.stringify({
          area: name,
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
    // if (errorFlag == false) {
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
            segmentTrack({ title: Settings.subRegion.delete });
          } else if (action === "create") {
            segmentTrack({ title: Settings.subRegion.create });
          } else if (action === "edit") {
            segmentTrack({ title: Settings.subRegion.edit });
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
    // }
  };

  const getDataForEdit = async () => {
    try {
      let regionResponse = await callApi(
        `${API_BASE_URL}/region/get/1000/0?status=Active`,
        {
          method: "GET",
        }
      );
      if (regionResponse.status === 200) {
        let arr = [];
        regionResponse.data.data.map((item) => {
          arr.push({ value: item._id, label: item.region });
          return "";
        });
        setListRegion(arr);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/city/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getActions = (id, region, city) => {
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
                      setSelectedRegion({ label: region, value: id });
                      setName(city);
                      //getDataForEdit();
                      segmentTrack({ title: Settings.subRegion.editClick });
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
                      segmentTrack({ title: Settings.subRegion.deleteClick });
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
      const subRegionData = (subRegion) => (
        <div className="title d-flex align-items-center user-panel">
          <div className="content user-info">
            <p className="mb-0 fw-500 text-primary">{subRegion}</p>
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
                  city: subRegionData(el.city),
                  region: el.region.area,
                  status: el.status,
                  type: el.type,
                  actions: getActions(el._id, el.region.area, el.city),
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
      region: "region.area",
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

  const customSort = (rows, selector, direction) => {
    return rows.sort((rowA, rowB) => {
      // use the selector function to resolve your field names by passing the sort comparitors
      // const aField = selector(rowA)
      // const bField = selector(rowB)
      //
      // let comparison = 0;
      //
      // if (aField > bField) {
      //   comparison = 1;
      // } else if (aField < bField) {
      //   comparison = -1;
      // }
      // return direction === 'desc' ? comparison * -1 : comparison;
    });
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Settings"}
          breadcrumb={[{ name: "Settings", link: EMPLOYEE }, { name: "City" }]}
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
          subTitle={<p>Add a city where your business belongs.</p>}
        />
        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <button
              className="btn btn-textIcon"
              onClick={() => {
                setAction("create");
                setRegion("");
                openROIModal();
                getDataForEdit();
                segmentTrack({ title: Settings.subRegion.addClick });
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
                <h4>{action === "edit" ? "Edit" : "Add"} City</h4>
                <p className="mb-0">Add a city where your business belongs.</p>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="region-body">
                <div className="roi-labels mb-4">
                  <div className="form-group">
                    <label htmlFor="inputEmail3" className=" col-form-label">
                      Parent region
                    </label>

                    <Select
                      value={selectedRegion}
                      options={listRegion}
                      // required
                      isDisabled={action === "edit" ? true : false}
                      id="inputState"
                      onChange={(value) => {
                        setError({ ...error, selectedRegion: "" });
                        setSelectedRegion(value);
                        setRegion(value.label);
                        // if (!validateEmpty(region)) {
                        //   setError({
                        //     ...error,
                        //     region: cityError.region,
                        //   });
                        // }
                      }}
                    />
                    {error.selectedRegion ? (
                      <span className="error-msg">{error.selectedRegion}</span>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputEmail3" className="col-form-label">
                      City name
                    </label>
                    <input
                      type="text"
                      // className={`form-control ${
                      //   isCityValid ? "error-red" : ""
                      // }`}
                      className="form-control"
                      value={name}
                      required
                      id="inputState"
                      placeholder="Enter City"
                      onChange={(e) => {
                        setName(e.target.value);
                        setError({ ...error, name: "" });
                        // if (!validateEmpty(name)) {
                        //   setError({
                        //     ...error,
                        //     name: cityError.name,
                        //   });
                        // }
                        // setIsCityValid(validateEmpty(e.target.value));
                      }}
                    />
                    {error.name ? (
                      <span className="error-msg">{error.name}</span>
                    ) : null}
                    {/* {isCityValid && (
                              <span className="error-msg">
                                Please enter a city.
                              </span>
                            )} */}
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                className="btn fw-500 btn-sm"
                variant="secondary"
                onClick={closeTo}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                variant="primary"
                // onClick={() => {
                //   region && name
                //     ? actionHandler()
                //     : showAlert(
                //         "Please fill all required details",
                //         "error"
                //       );
                // }}
                onClick={() => {
                  actionHandler();
                }}
              >
                {action === "edit" ? "Update " : "Add "}City
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
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(SubRegionComponent);
