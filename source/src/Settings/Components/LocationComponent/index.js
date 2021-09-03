import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { DebounceInput } from "react-debounce-input";
import CreatableSelect from "react-select/creatable";
import DataTable from "react-data-table-component";
import Select from "react-select";
import callApi from "../../../Services/callApi";
import { timezoneData } from "../../../Services/getTimezoneList";
import { showAlert } from "../../../Services/showAlert";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  API_BASE_URL,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
  EMPLOYEE,
} from "../../../Constants";
// Importing Icons
import {
  IconAddCircle,
  IconPencil,
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import { Link, useHistory } from "react-router-dom";
import {
  validateEmail,
  validatePassword,
  validateEmpty,
  validateDropDown,
} from "../../../Services/validation";
import { branchError } from "../../Resources";

import TimezoneSelect from "react-timezone-select";
import { segmentTrack } from "../../../Services/segment";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import { Settings } from "../../../Services/segmentEventDetails";
import HeaderLinks from "../../../Common/Components/Molecule/Atoms/HeaderLinks";
import SettingConfirmModal from "../ModalComponents/SettingConfirmModal";

let defaultErrorLabels = {
  selectedRegion: "",
  selectedLocation: "",
  selectedTimezone: "",
  name: "",
};
const LocationComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const [limit, setLimit] = useState(10);
  const [regionShow, setRegionShow] = useState(false);
  // const [isBranchValid, setIsBranchValid] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedRows, setSelectedRows] = useState("");
  const [action, setAction] = useState("");
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [error, setError] = useState(defaultErrorLabels);

  const [name, setName] = useState("");
  const [listSubRegion, setListSubRegion] = useState([]);
  const [listRegion, setListRegion] = useState([]);
  // const [listTimezone, setListTimezone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [id, setId] = useState("");

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
      segmentTrack({ title: Settings.location.cancelAddModal });
    } else if (action && action === "edit") {
      segmentTrack({ title: Settings.location.cancelAddModal });
    }
    setError(defaultErrorLabels);
  };

  useEffect(() => {
    if (!regionShow) {
      setAction("");
      setId();
      setSelectedLocation();
      setSelectedRegion();
      setName("");
      setSelectedTimezone("");
    }
  }, [regionShow]);

  const openROIModal = () => {
    setRegionShow(true);
  };

  const columns = [
    {
      name: "Location",
      selector: "location",
      sortable: true,
    },
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
      name: "Timezone",
      selector: "timezone",
      sortable: true,
    },
    {
      name: "Action",
      selector: "actions",
      minWidth: "190px",
    },
  ];

  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      selectedRegion,
      selectedLocation,
      selectedTimezone,
      name,
    };

    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: branchError[key] };
        validationSuccess = false;
      }
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
        // config.url = `${API_BASE_URL}/region/create`;
        config.url = `${API_BASE_URL}/location/create`;
        config.method = "POST";
        // if (typeof selectedLocation !== "undefined" && name !== "") {
        // config.body = JSON.stringify({
        //   area: name,
        //   type: "location",
        //   parent: selectedLocation.value,
        //   timezone: selectedTimezone.value,
        // });
        config.body = JSON.stringify({
          region: selectedRegion.value,
          city: selectedLocation.value,
          area: name,
          timezone: selectedTimezone.value,
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
          timezone: selectedTimezone.value,
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
          if (action && action === "delete") {
            segmentTrack({ title: Settings.location.delete });
          } else if (action && action === "create") {
            segmentTrack({ title: Settings.location.create });
          } else if (action && action === "edit") {
            segmentTrack({ title: Settings.location.edit });
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

  const initializeFields = () => {
    /**
     * Populate region-subregion combined list
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let regionsList = [...listRegion];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          /**
           * For combined list
           * */
          regionsList.push({
            value: el._id,
            label: el.area,
          });
        }
      }
      setListRegion(regionsList);
    }
  };

  useEffect(() => {
    initializeFields();
  }, []);

  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/location/get/${limit}/${page}`;
      if (query.query || query.sortBy) {
        url += `?query=${query.query}&&sortBy=${query.sortBy}&&sort=${query.sort}`;
      }

      const getActions = (id, region, city, location, tz) => {
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
                      setId([`${id}`]);
                      setSelectedRegion({ label: region, value: id });
                      setSelectedLocation({ label: city, value: id });
                      setSelectedTimezone({ value: tz });
                      setName(location);
                      segmentTrack({ title: Settings.location.editClick });
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
                      segmentTrack({ title: Settings.location.deleteClick });
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

      const locationData = (location) => (
        <div className="title d-flex align-items-center user-panel">
          <div className="content user-info">
            <p className="mb-0 fw-500 text-primary">{location}</p>
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
                  city: el.city.area,
                  region: el.region.area,
                  status: el.status,
                  location: locationData(el.location),
                  timezone: el.timezone,
                  type: el.type,
                  actions: getActions(
                    el._id,
                    el.region.area,
                    el.city.area,
                    el.location,
                    el.timezone
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
    // city.area
    let mapper = {
      city: "city.area",
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

  // useEffect(() => {
  //   let array = [];
  //   timezoneData().map((el) => {
  //     array.push({ value: el, label: el });
  //   });
  //   setListTimezone(array);
  // }, []);

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Settings"}
          showSubTitle={false}
          breadcrumb={[
            { name: "Settings", link: EMPLOYEE },
            { name: "Location" },
          ]}
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
              Use branches to represent the store or center level information.
            </p>
          }
        />
        <ActionBlock showActionList={true} showActionBtn={false}>
          <li className={"list-inline-item"}>
            <button
              className="btn btn-textIcon"
              onClick={() => {
                setAction("create");
                openROIModal();
                segmentTrack({ title: Settings.location.addClick });
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
                <h4>{action === "edit" ? "Edit" : "Add"} Location</h4>
                <p className="mb-0">
                  Use locations to represent the store or center level
                  information.
                </p>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="region-body">
                <div className="roi-labels mb-4">
                  <div className="form-group">
                    <label htmlFor="input_subregion" className="col-form-label">
                      Region
                    </label>
                    <CreatableSelect
                      isClearable
                      onChange={(selectedOption) => {
                        setError({ ...error, selectedRegion: "" });
                        setSelectedRegion(selectedOption);
                        if (selectedOption && selectedOption.value) {
                          setListSubRegion([
                            ...getSubregionOrLocation(
                              selectedOption.value,
                              "city"
                            ),
                          ]);
                        }
                      }}
                      isDisabled={action === "edit" ? true : false}
                      value={selectedRegion}
                      options={listRegion}
                    />
                    {error.selectedRegion ? (
                      <span className="error-msg">{error.selectedRegion}</span>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label htmlFor="input_subregion" className="col-form-label">
                      City
                    </label>
                    <CreatableSelect
                      isClearable
                      onChange={(value) => {
                        setError({ ...error, selectedLocation: "" });
                        setSelectedLocation(value);
                      }}
                      isDisabled={action === "edit" ? true : false}
                      value={selectedLocation}
                      options={listSubRegion}
                    />
                    {error.selectedLocation ? (
                      <span className="error-msg">
                        {error.selectedLocation}
                      </span>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label htmlFor="input_location" className="col-form-label">
                      Location
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      // className={`form-control ${
                      //   isBranchValid ? "error-red" : ""
                      // }`}
                      value={name}
                      required
                      id="inputState"
                      placeholder="Enter Branch"
                      onChange={(e) => {
                        setError({ ...error, name: "" });
                        setName(e.target.value);
                        if (name && !validateEmpty(name)) {
                          setError({
                            ...error,
                            email: branchError.name,
                          });
                        }
                        // setIsBranchValid(validateEmpty(e.target.value));
                      }}
                    />
                    {error.name ? (
                      <span className="error-msg">{error.name}</span>
                    ) : null}
                    {/* {isBranchValid && (
                              <span className="error-msg">
                                Please enter a branch.
                              </span>
                            )} */}
                  </div>
                  <div className="form-group">
                    <label htmlFor="input_timezone" className="col-form-label">
                      Timezone
                    </label>

                    <TimezoneSelect
                      placeholder="Select Timezone"
                      id="inputState"
                      value={selectedTimezone}
                      onChange={(selectedOption) => {
                        setError({ ...error, selectedTimezone: "" });
                        setSelectedTimezone({
                          label: selectedOption.label,
                          value: selectedOption.value,
                        });
                      }}
                    />
                    {error.selectedTimezone ? (
                      <span className="error-msg">
                        {error.selectedTimezone}
                      </span>
                    ) : null}

                    {/*<Select*/}
                    {/*  value={selectedTimezone}*/}
                    {/*  options={listTimezone}*/}
                    {/*  id="inputState"*/}
                    {/*  onChange={(value) => {*/}
                    {/*    setSelectedTimezone(value);*/}
                    {/*    //setSubRegion(value.label);*/}
                    {/*  }}*/}
                    {/*/>*/}
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
                //   subRegion && name
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
                {action === "edit" ? "Update " : "Add "}Location
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

export default connect(mapStateToProps, null)(LocationComponent);
