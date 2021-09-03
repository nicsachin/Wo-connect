import React, { useCallback, useEffect, useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import Select from "react-select";
import { colourStyles } from "../../../Services/colourStyles";
import { DebounceInput } from "react-debounce-input";
import { API_BASE_URL, DEBOUNCE_INPUT_TIME } from "../../../Constants";
import {
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import DataTable from "react-data-table-component";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { getSubregionOrLocation } from "../../../Services/wocam";
import { columns } from "../ViewsComponent/columns";
import { connect } from "react-redux";
import StatusText from "../../../Common/Components/Molecule/Atoms/StatusText";

let defaultOptionValue = { label: "All", value: "" };
function AddViewModal(props) {
  //states
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });
  const [totalRecords, setTotalRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [locationListForSearch, setLocationListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [subRegionForSearch, setSubregionForSearch] = useState(
    defaultOptionValue
  );
  const [locationForSearch, setLocationForSearch] = useState(
    defaultOptionValue
  );
  const [viewName, setViewName] = useState("");
  const [defaultView, setDefaultView] = useState(false);
  const [viewId, setViewId] = useState("");

  const isSelected = (id) => {
    let checked = selectedCameras.filter((obj) => {
      return obj._id === id;
    });
    return checked.length > 0;
  };

  const onSelectedRowsChange = (row, checked) => {
    if (selectedCameras.length >= 12 && checked) {
      showAlert("You can only add 12 cameras in a view");
      return;
    }

    // setDisableSelectRow(false);
    if (checked)
      setSelectedCameras((selectedCameras) => {
        return selectedCameras.concat(row);
      });
    else {
      setSelectedCameras((selectedCameras) => {
        return selectedCameras.filter((el) => el._id !== row._id);
      });
    }
  };

  const getCheckboxElement = (row) => {
    return (
      <div>
        <input
          type={"checkbox"}
          checked={isSelected(row._id)}
          onClick={(event) => onSelectedRowsChange(row, event.target.checked)}
        />
      </div>
    );
  };

  const reset = () => {
    // setOpen(false);
    setSubregionForSearch(defaultOptionValue);
    setLocationForSearch(defaultOptionValue);
    setLocationListForSearch([defaultOptionValue]);
    setQuery({
      query: "",
      sortBy: "",
      sort: 1,
      customQuery: "",
    });
  };

  /**
   * Api call
   * */
  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/camera/get/${limit}/${page}?query=${query.query}&${query.customQuery}`;
      if (query.sort && query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      callApi(
        url,
        {},
        { showLoader: false, callManifest: false, loaderLabel: "" }
      )
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setTotalRecords(res.data.total);
            setRecords(
              res.data.data.map((el, index) => {
                return {
                  checkbox:
                    el.status === "Active" ? getCheckboxElement(el) : null,
                  _id: el._id,
                  key: index + 1,
                  id: el.serial,
                  camera: el.camera,
                  city: el.city + " (" + el.region + ")",
                  dvr: el.dvr,
                  region: el.region,
                  location: el.location,
                  _location: el._location,
                  status: <StatusText status={el.status} />,
                  isSelected: selectedCameras.length
                    ? selectedCameras.filter((item) => item._id === el._id)
                        .length > 0
                    : false,
                  // isSelected: isSelected(el._id)
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
    [query, selectedCameras]
  );

  useEffect(() => {
    setPage(0);
  }, [limit]);

  useEffect(() => {
    apiCall(limit, page);
  }, [page, apiCall, limit]);

  const handleSort = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;
    setQuery({
      ...query,
      sortBy: column.selector,
      sort,
    });
  };
  const searchCameras = () => {
    // if (!open) setOpen(true);

    let searchFields = {
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
    };

    let customQuery = "";
    for (let key in searchFields) {
      customQuery += `&${key}=${searchFields[key] || ""}`;
    }
    setQuery({
      query: "",
      sortBy: "",
      sort: 1,
      customQuery,
    });
  };
  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  const createView = async () => {
    let apiData = {
      editMode: false,
      name: viewName,
      default: defaultView,
      // email: "",
      cameras: [],
      // company: "",
      // _id: viewId ? viewId : null,
    };
    for (let el of selectedCameras) {
      apiData.cameras.push(el._id);
    }

    const url = !!viewId
      ? `livestream/view/update/${viewId}`
      : `livestream/view/create`;
    const method = !!viewId ? "PUT" : "POST";
    try {
      let viewResponse = await callApi(`${API_BASE_URL}/${url}`, {
        method: method,
        body: JSON.stringify(apiData),
      });
      if (
        viewResponse.status === 200 &&
        viewResponse.data &&
        viewResponse.data.status
      ) {
        if (
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
          window.analytics.track(
            `${viewId ? "Updated" : "Created"} view | Live | WoCam`,
            {
              title: `${viewId ? "Updated" : "Created"} view | Live | WoCam`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            }
          );
        }
        closeModal();
        props.populateViews();
        showAlert(viewResponse.message);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  const closeModal = () => {
    props.setEditMode(false);
    props.setShow(false);
    setSelectedCameras([]);
    setViewId("");
    setViewName("");
    setDefaultView(false);
    setRecords([]);
    if (
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
      window.analytics.track(
        `Closed ${viewId ? "edit" : "create"} view pop up | Live | WoCam`,
        {
          title: `Closed ${
            viewId ? "edit" : "create"
          } view pop up | Live | WoCam`,
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
  };

  //view list is empty so select default view checkbox
  useEffect(() => {
    if (props.show && props.viewList.length === 0) setDefaultView(true);
  }, [props.show]);

  function initializeFields() {
    /**
     * Populate regions and region-subregion combined list
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
    }
  }

  useEffect(() => {
    initializeFields();
  }, []);

  //get view details
  const editView = (selectedView) => {
    let camerasArray = [];
    for (let camera in selectedView.cameras) {
      camerasArray.push({
        ...selectedView.cameras[camera],
        camera: selectedView.cameras[camera].camera,
      });
    }
    setSelectedCameras(camerasArray);
    setViewName(selectedView.label);
    setViewId(selectedView.value);
    setDefaultView(selectedView.default);
    // setShow(true);

    if (
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
      window.analytics.track(
        "Click on Edit view | Open Edit view pop up | Live | WoCam",
        {
          title: "Click on Edit view | Open Edit view pop up | Live | WoCam",
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        }
      );
    }
  };

  //for handling edit view
  useEffect(() => {
    if (props.editMode) editView(props.selectedView);
  }, [props.editMode]);

  return (
    <div>
      <Modal
        size="lg"
        show={props.show}
        onHide={() => {
          closeModal();
        }}
        dialogClassName="modal-90w"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="form-popup"
      >
        <Modal.Header className="mb-0" closeButton>
          <div className="modal-title d-block">
            <h4 className="mb-2">{viewId ? "Edit view" : "Create new view"}</h4>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-lg-8">
              <div className="filter-bar box-shadow-none mt-4 mb-4">
                <div className="row">
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
                        // setLocationList([]);
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
                  <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                    <div className="d-flex justify-content-end mt-4">
                      <button
                        onClick={reset}
                        className="btn btn-tertiary btn-sm mr-3"
                      >
                        Reset
                      </button>
                      <button
                        onClick={searchCameras}
                        className="btn btn-primary btn-sm"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row flex-row-reverse">
                <div className="col-md-4 mb-4">
                  <div className="search-filter w-100">
                    <DebounceInput
                      className="search form-control"
                      placeholder="Search"
                      debounceTimeout={DEBOUNCE_INPUT_TIME}
                      value={query.query}
                      onChange={(e) => {
                        const currValue = e.target.value;

                        setQuery({ ...query, query: currValue });
                      }}
                    />
                    <IconSearch />
                  </div>
                </div>
              </div>
              <div id="table-content">
                <DataTable
                  pagination
                  paginationServer
                  paginationPerPage={limit}
                  selectableRowsNoSelectAll={true}
                  paginationTotalRows={totalRecords}
                  paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                  onSelectedRowsChange={(rows) => {
                    onSelectedRowsChange(rows);
                  }}
                  paginationComponentOptions={{ rowsPerPageText: "" }}
                  sortServer
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  key={limit}
                  columns={columns()}
                  data={records}
                  onSort={handleSort}
                />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="selected-table-block mt-4">
                <form>
                  <label htmlFor="inputEmail4">View name</label>
                  <input
                    type="text"
                    value={viewName}
                    onChange={(event) => {
                      setViewName(event.target.value);
                    }}
                    className="form-control"
                    placeholder="e.g. Store front entrance view"
                  />
                  <div className="checkbox-inline checkbox mt-3">
                    <label className="form-check-label fw-400">
                      <input
                        type="checkbox"
                        className="form-check-input check-with-label"
                        data-ng-model="example.check"
                        checked={defaultView}
                        onChange={(event) => {
                          setDefaultView(event.target.checked);
                        }}
                      />
                      <span className="box inline"></span>
                      Set as default view
                    </label>
                  </div>
                </form>
                <div className="selected-options">
                  <p>{selectedCameras.length} cameras selected:</p>
                  {selectedCameras ? (
                    selectedCameras.map((camera, index) => {
                      return (
                        <div key={index} className="selected-block">
                          <span>
                            {camera.camera} ({camera.location})
                          </span>
                          {["top"].map((placement, index) => (
                            <OverlayTrigger
                              key={index}
                              placement={placement}
                              overlay={
                                <Tooltip id={`tooltip-${placement}`}>
                                  Delete
                                </Tooltip>
                              }
                            >
                              <span
                                onClick={() => {
                                  // setSelectedRow(selectedRow.filter(el => el!== camera._id));
                                  setSelectedCameras(
                                    selectedCameras.filter(
                                      (el) => el._id !== camera._id
                                    )
                                  );
                                  setRecords([...records]);
                                  // removeSelectedElements(camera._id , records);
                                }}
                                className="action"
                              >
                                <IconTrash />
                              </span>
                            </OverlayTrigger>
                          ))}
                        </div>
                      );
                    })
                  ) : (
                    <div />
                  )}
                </div>
                <div className="bottom-block mt-5">
                  <button
                    className="btn btn-block btn-primary btn-sm"
                    onClick={createView}
                    disabled={!selectedCameras.length || !viewName.length}
                  >
                    {!!viewId ? "Update view" : "Create view"}
                    {/*Create View*/}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddViewModal);
