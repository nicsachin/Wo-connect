import React, { useCallback, useEffect, useState, useRef } from "react";
import { DebounceInput } from "react-debounce-input";
import Select from "react-select";
import { Collapse, OverlayTrigger, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  API_BASE_URL,
  CAMERA,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
} from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import {
  IconActive,
  IconAdd,
  IconCopy,
  IconFilterLining,
  IconInactive,
  IconSearch,
  IconTrash,
  IconView,
} from "../../../Common/Components/IconsComponent/Index";
import { CopyToClipboard } from "react-copy-to-clipboard";
import AddCameraModal from "../ModalComponents/AddCameraModal";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import Tag from "../../../Common/Components/Molecule/Atoms/Tag";
import StatusText from "../../../Common/Components/Molecule/Atoms/StatusText";
import { colourStyles } from "../../../Services/colourStyles";
import ConfirmationModal from "../ModalComponents/ConfirmationModal";
import { IconSettings } from "../../../Common/Components/IconsComponent/SidebarMain/Index";
import DirectRecordingModal from "../ModalComponents/DirectRecordingModal";
import IconDirectRecording from "../../../Common/Components/IconsComponent/Wocam/IconDirectRecording";
import CameraDefault from "../../../Common/Components/Molecule/Default/CameraDefault";
// import PlaybackDefault from "../../../Common/Components/Molecule/Default/PlaybackDefault";

let defaultOptionValue = { label: "All", value: "" };
const columns = [
  {
    name: "Camera name",
    selector: "camera",
    sortable: true,
    minWidth: "180px",
    grow: 5,
  },
  {
    name: "NVR",
    selector: "dvr",
    sortable: true,
    minWidth: "150px",
    grow: 3,
  },
  {
    name: "Task",
    selector: "task",
    sortable: true,
    minWidth: "120px",
    grow: 1,
  },
  {
    name: "Location",
    selector: "location",
    sortable: true,
    minWidth: "120px",
    grow: 1,
  },

  {
    name: "Added",
    selector: "created_at",
    minWidth: "180px",
    grow: 5,
    sortable: true,
  },
  {
    name: "Status",
    selector: "status",
    minWidth: "100px",
    sortable: true,
  },
  {
    name: "Action",
    selector: "actions",
    minWidth: "200px",
    maxWidth: "240px",
  },
];
const CameraListComponent = (props) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = (value) => setOpen(value);
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  const [filterCount, setFilterCount] = useState(0);

  const history = useHistory();
  /**
   * Data table
   * */
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [totalRecords, setTotalRecords] = useState([]);
  const [action, setAction] = useState();
  const [records, setRecords] = useState([]);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);

  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);

  //Modal
  const [show, setShow] = useState(false);

  /**
   * For searching
   * */
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [locationListForSearch, setLocationListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [dvrListForSearch, setDvrListForSearch] = useState([
    defaultOptionValue,
  ]);

  const [subRegionForSearch, setSubregionForSearch] = useState(
    defaultOptionValue
  );
  const [locationForSearch, setLocationForSearch] = useState(
    defaultOptionValue
  );
  const [statusForSearch, setStatusForSearch] = useState(defaultOptionValue);
  const [dvrForSearch, setDvrForSearch] = useState(defaultOptionValue);

  const [selectedCamera, setSelectedCamera] = useState(null);
  /**
   * for direct recording
   * */

  const [
    directRecordingModalVisibility,
    setDirectRecordingModalVisibility,
  ] = useState(false);
  /**
   * Handles actions like status change and delete
   * */
  const actionHandler = async () => {
    let config = {
      url: "",
      method: "",
      body: {
        ids: selectedRows,
      },
    };

    switch (action) {
      case "Delete": {
        config.url = `${API_BASE_URL}/camera/status/update`;
        config.method = "PUT";
        config.body = { ...config.body, status: "Deleted" };
        break;
      }
      case "Active": {
        config.url = `${API_BASE_URL}/camera/status/update`;
        config.method = "PUT";
        config.body = { ...config.body, status: "Active" };
        break;
      }
      case "Inactive": {
        config.url = `${API_BASE_URL}/camera/status/update`;
        config.method = "PUT";
        config.body = { ...config.body, status: "Inactive" };
        break;
      }
      default: {
        showAlert("Invalid Action", "error");
        setConfirmationModalVisibility(false);
        return;
      }
    }
    setToggledClearRows(!toggledClearRows);

    try {
      let response = await callApi(config.url, {
        method: config.method,
        body: JSON.stringify(config.body),
      });

      if (response.status === 200) {
        // window.location.reload();
        apiCall(limit, page);
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
          let statusString = "";
          if (action && action === "Delete") {
            statusString = "Deleted";
          } else if (action && action === "Inactive") {
            statusString = "Inactived";
          } else if (action && action === "Active") {
            statusString = "Activated";
          }
          window.analytics.track(
            `${statusString} camera successfully | Camera | WoCam`,
            {
              title: `${statusString} camera successfully | Camera | WoCam`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            }
          );
        }

        showAlert(response.message);

        setConfirmationModalVisibility(false);
      }
    } catch (e) {
      showAlert(e, "error");
      setConfirmationModalVisibility(false);
    }
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

  /**
   *
   * For search
   * */

  const searchButton = () => {
    search();
    toggleOpen(!open);
  };

  const search = () => {
    let searchFields = {
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
      status: statusForSearch.value,
      dvr: dvrForSearch.value,
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
      query: "",
      sortBy: "",
      sort: 1,
      customQuery,
    });
  };

  /**
   * To reset filters
   * */
  const reset = () => {
    setSubregionForSearch(defaultOptionValue);
    setLocationForSearch(defaultOptionValue);
    setStatusForSearch(defaultOptionValue);
    setDvrForSearch(defaultOptionValue);
    setLocationListForSearch([defaultOptionValue]);
    setQuery({
      query: "",
      sortBy: "",
      sort: 1,
      customQuery: "",
    });
    setFilterCount(0);
  };

  const initializeFields = () => {
    /**
     * Populate regions and region-subregion combined list
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      // let regions = [];
      let regionsAndSubregions = [...regionAndSubregionCombinedList];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          // regions.push({value: el._id, label: el.area});
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
      regionsAndSubregions.shift();
    }
    /**
     * Populate dvrs
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.dvrs
    ) {
      let dvrsCollection = [...dvrListForSearch];
      for (let dvr of props.userData.manifest.dvrs) {
        dvrsCollection.push({ value: dvr._id, label: dvr.dvr });
      }
      setDvrListForSearch(dvrsCollection);
    }
  };
  // TABLE ROW DATA
  const getCameraName = (camera, id) => {
    return (
      <p
        className="mb-0 fw-500 text-primary c-pointer hover-content white-space"
        onClick={() => {
          history.push(`/wocam/camera/detail/${id}`);
        }}
      >
        {camera}
      </p>
    );
  };

  const getDvrName = (dvr) => {
    return <p className="mb-0 fw-400 text-primary white-space">{dvr}</p>;
  };

  const getRtspData = (rtsp) => {
    return (
      <CopyToClipboard text={rtsp || ""}>
        <div
          onClick={() => {
            showAlert("Copied to clipboard");
          }}
          className={"tag-block tag-lg tag-default rtsp-cursor"}
        >
          <IconCopy /> <small className="ml-1">Copy RTSP URL</small>
        </div>
      </CopyToClipboard>
    );
  };

  const getTaskCount = (camera) => {
    if (camera) {
      return (
        <Tag className={`${camera.runningTask ? "tag-default" : "tag-orange"}`}>
          {camera.runningTask ? `${camera.runningTask} Running` : "No task"}
        </Tag>
      );
    }
  };

  const getLocationName = (city, region) => {
    return (
      <ul
        className="white-space mb-0"
        data-tag="allowRowEvents"
        style={{
          overflow: "hidden",
          whiteSpace: "wrap",
          textOverflow: "ellipses",
        }}
      >
        <li className={"mb-1 text-primary"}>{city}</li>
        <li className={"text-other fs-12"}>{region}</li>
      </ul>
    );
  };
  const apiCall = useCallback(
    (limit, page) => {
      let url = `${API_BASE_URL}/camera/get/${limit}/${page}?query=${query.query}&${query.customQuery}`;
      if (query.sort && query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      const getActions = (camera) => {
        return (
          <ul className="filter-btn d-flex justify-content-center list-inline">
            {["top"].map((placement, index) => (
              <OverlayTrigger
                key={index}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Details</Tooltip>}
              >
                <li
                  className="list-inline-item"
                  onClick={() => {
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
                        "Clicked on view camera details | Camera | WoCam",
                        {
                          title:
                            "Clicked on view camera details | Camera | WoCam",
                          email: props.userData.user.email,
                          username: props.userData.user.username,
                          companyName: props.userData.manifest.company.name,
                          user_id: props.userData.user._id,
                          company_id: props.userData.manifest._id,
                        }
                      );
                    }
                  }}
                >
                  <Link
                    to={`/wocam/camera/detail/${camera._id}`}
                    target={"_blank"}
                  >
                    <IconView />
                  </Link>
                </li>
              </OverlayTrigger>
            ))}

            {["top"].map((placement, index) => (
              <OverlayTrigger
                key={index}
                placement={placement}
                overlay={
                  <Tooltip id={`tooltip-${placement}`}>
                    Configure direct recording
                  </Tooltip>
                }
              >
                <li
                  className="list-inline-item"
                  onClick={() => {
                    setSelectedCamera(camera);
                    setDirectRecordingModalVisibility(true);
                  }}
                >
                  <IconDirectRecording />
                </li>
              </OverlayTrigger>
            ))}
            {camera.status === "Inactive"
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
                        setSelectedRows([`${camera._id}`]);
                        setAction("Active");
                        setConfirmationModalVisibility(true);
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
                      <Tooltip id={`tooltip-${placement}`}>Deactivate</Tooltip>
                    }
                  >
                    <li
                      className="list-inline-item"
                      onClick={() => {
                        setSelectedRows([`${camera._id}`]);
                        setAction("Inactive");
                        setConfirmationModalVisibility(true);
                      }}
                    >
                      <IconInactive />
                    </li>
                  </OverlayTrigger>
                ))}

            {["top"].map((placement, index) => (
              <OverlayTrigger
                key={index}
                placement={placement}
                overlay={<Tooltip id={`tooltip-${placement}`}>Delete</Tooltip>}
              >
                <li
                  className="list-inline-item"
                  onClick={() => {
                    setSelectedRows([`${camera._id}`]);
                    setAction("Delete");
                    setConfirmationModalVisibility(true);
                  }}
                >
                  <IconTrash />
                </li>
              </OverlayTrigger>
            ))}
          </ul>
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
                  created_at: el.created_at,
                  task: getTaskCount(el),
                  key: index + 1,
                  id: el.serial,
                  camera: getCameraName(el.camera, el._id),
                  dvr: getDvrName(el.dvr),
                  city: el.city + " (" + el.region + ")",
                  region: el.region,
                  location: getLocationName(el.location, el.region),
                  status: <StatusText status={el.status} />,
                  rtsp: getRtspData(el.rtsp),
                  actions: getActions(el),
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
  }, [limit, query]);

  useEffect(() => {
    apiCall(limit, page);
  }, [page, apiCall, limit]);

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
  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  useEffect(() => {
    initializeFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Camera List"}
          showSubTitle={false}
          breadcrumb={[{ name: "Wocam" }, { name: "Camera", link: CAMERA }]}
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
            <button
              className="btn btn-textIcon"
              onClick={() => {


                setShow(true);
                if (
                  props &&
                  props.userData &&
                  props.userData.user &&
                  props.userData.user.email &&
                  props.userData.manifest &&
                  props.userData.manifest.company &&
                  props.userData.manifest.company.name
                ) {
                  //setEmail(props.userData.user.email);
                  window.analytics.track("Open add Camera pop up", {
                    title: "Camera pop up open",
                    user: props.userData.user.email,
                    username: props.userData.user.username,
                    company: props.userData.manifest.company.name,
                  });
                }
              }}
            >
              <span>
                <IconAdd /> Add a Camera
              </span>
            </button>
          </li>

          <li className={"list-inline-item"}>
            <button
              className={"btn btn-textIcon"}
              onClick={() => {
                if (selectedRows.length) {
                  setAction("Inactive");
                  setConfirmationModalVisibility(true);
                } else
                  showAlert(
                    "Please select atleast 1 field to perform this action",
                    "warning"
                  );
              }}
            >
              <span>
                <IconInactive /> Deactivate
              </span>
            </button>

            <button
              className={"btn btn-textIcon"}
              onClick={() => {
                if (selectedRows.length) {
                  setAction("Active");
                  setConfirmationModalVisibility(true);
                } else
                  showAlert(
                    "Please select atleast 1 field to perform this action",
                    "warning"
                  );
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
                if (selectedRows.length) {
                  setAction("Delete");
                  setConfirmationModalVisibility(true);
                } else
                  showAlert(
                    "Please select atleast 1 field to perform this action",
                    "warning"
                  );
              }}
            >
              <span>
                <IconTrash /> Delete
              </span>
            </button>
          </li>
          <li className="list-inline-item">
            <button
              className={
                open || filterCount !== 0
                  ? "btn btn-textIcon  active"
                  : "btn btn-textIcon "
              }
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
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">NVR</label>
                      <Select
                        value={dvrForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setDvrForSearch(selectedOption);
                        }}
                        options={dvrListForSearch}
                      />
                    </div>
                    <div className="col-lg-6 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="inputEmail4">Status</label>
                      <Select
                        value={statusForSearch}
                        onChange={(selectedRow) => {
                          setStatusForSearch(selectedRow);
                        }}
                        options={[
                          { ...defaultOptionValue },
                          { value: "Active", label: "Active" },
                          {
                            value: "Inactive",
                            label: "Inactive",
                          },
                        ]}
                      />
                    </div>
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

        {records && records.length ? (
          <>
            <div className={"panel-body mt-60"}>
              <div id="table-content" className={"camera-table"}>
                <DataTable
                  onRowClicked={(el) => {
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
                        "Clicked on view camera details | Camera | WoCam",
                        {
                          title:
                            "Clicked on view camera details | Camera | WoCam",
                          email: props.userData.user.email,
                          username: props.userData.user.username,
                          companyName: props.userData.manifest.company.name,
                          user_id: props.userData.user._id,
                          company_id: props.userData.manifest._id,
                        }
                      );
                    }
                    window.open(`/wocam/camera/detail/${el._id}`);
                  }}
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
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  selectableRows
                  striped={false}
                  sortFunction={(rows, selector, direction) => {
                    return rows.sort((rowA, rowB) => {});
                  }}
                  clearSelectedRows={toggledClearRows}
                  key={limit}
                  columns={columns}
                  data={records}
                  //data={data}
                  onSort={handleSort}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <CameraDefault setShow={setShow} />
            {/* <PlaybackDefault setShow={setShow} /> */}
          </>
        )}

        <ConfirmationModal
          visibility={confirmationModalVisibility}
          setVisiblity={setConfirmationModalVisibility}
          headerText={"Confirm Action"}
          // footerText={`Do you want to ${action}?`}
          footerText={
            action == "Active" || action == "Inactive"
              ? `Do you want to ${action}?`
              : "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
          }
          onYes={actionHandler}
          onNo={() => {
            setConfirmationModalVisibility(false);
            setAction("");
          }}
          onHide={() => {
            setConfirmationModalVisibility(false);
            setAction("");
          }}
        />
        <AddCameraModal
          data={{
            show,
            setShow,
            successCallback: () => {
              reset();
            },
            module: "camera | WoCam",
          }}
        />

        {/*  direct recording*/}
        <DirectRecordingModal
          camera={selectedCamera}
          visibility={directRecordingModalVisibility}
          onHide={() => {
            apiCall(limit, page);
            setDirectRecordingModalVisibility(false);
          }}
        />
        {/*  */}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(CameraListComponent);
