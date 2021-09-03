import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import DataTable from "react-data-table-component";
import "./style.scss";
import { useSelector } from "react-redux";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL, CAMERA, LOCATION } from "../../../../Constants";
import AddROI from "./addROI";
import { showAlert } from "../../../../Services/showAlert";
import {
  IconArrowNextRight,
  IconHelp,
  IconTrash,
} from "../../../../Common/Components/IconsComponent/Index";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import renderHTML from "react-render-html";
import AddCameraModal from "../../../../Wocam/Components/ModalComponents/AddCameraModal";
import ContactSupport from "../../../Containers/ContactSupport";
import replaceHtml from "../../../../Services/replaceHtml";

const createOption = (label, value, city, r) => ({
  label,
  value,
  city,
  region: r,
});

const CameraComponent = (props) => {
  const { manifest } = useSelector((state) => state.userData);
  const [thumbnail, setThumbnail] = useState("");
  const [deletelocation, setDeletelocation] = useState("");
  const [cameraList, setCameraList] = useState([]);
  const [cameraListTotal, setCameraListTotal] = useState(0);
  const [locationIds, setLocationIds] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState([]);
  const [cameraId, setCameraId] = useState("");
  const [roiShow, setRoiShow] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [label, SetLabel] = useState([]);
  const [threshold, SetThreshold] = useState([]);
  const [rois, SetRois] = useState([]);
  const [showDescription, setShowDescription] = useState(false);

  //for add camera
  const [show, setShow] = useState(false);

  const selectRoi = async (row) => {
    setCameraId(row.id);
    setThumbnail(row.thumbnail);
    const { data } = await callApi(
      `${API_BASE_URL}/setup/roi/${props.taskId}?camera=${row.id}`
    );
    if (data && data.threshold) {
      if (data.label && data.label.length && data.threshold) {
        SetRois(data.models);
        SetLabel(data.label.toString().split(","));
        if (
          data.models[0] &&
          data.models[0].threshold &&
          data.models[0].threshold.length
        )
          SetThreshold(data.models[0].threshold);
        else SetThreshold(data.threshold);
        setRoiShow(true);
      } else {
        showAlert("No label found");
      }
    }
  };

  const onClose = async () => {
    getCameraByLocations();
  };

  const isSelected = (row) => {
    if (
      !props.selectedCamera.length ||
      props.selectedTask.taskType.toLowerCase() !== "artificial intelligence"
    )
      return row.isSelected;
    const isChecked = (props.selectedCamera || []).filter(
      (obj) => obj._id === row._id
    );
    return !!(isChecked && isChecked[0] && isChecked[0].models > 0);
  };

  //DataTable Table-Header
  const columns = [
    {
      name: "Camera name",
      selector: "camera",
      sortable: true,
      minWidth: "215px",
    },
    {
      name: "Region & City",
      selector: "region",
      sortable: true,
      cell: (row) => (
        <>
          {" "}
          {row.city} ({row.region})
        </>
      ),
    },
    {
      name: "Location",
      selector: "location",
      sortable: true,
    },
    {
      name: "DVR",
      selector: "dvr",
    },
    {
      name: "Configuration",
      selector: "roi",
      minWidth: "215px",
      cell: (row) => <ROIData row={row} />,
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      cell: (row) => <StatusData row={row} />,
    },
  ];

  //DataTable Table-Cell
  const ROIData = ({ row }) =>
    props.selectedTask.taskType.toLowerCase() === "artificial intelligence" ? (
      <div
        data-tag="allowRowEvents"
        style={{
          overflow: "hidden",
          whiteSpace: "wrap",
          textOverflow: "ellipses",
        }}
      >
        <Link to="#" onClick={() => onSelectedRowsChange(row)}>
          {" "}
          {row.models > 0 ? "Edit Configuration" : "Configure Camera"}
        </Link>
      </div>
    ) : (
      <div>N/A</div>
    );

  const StatusData = ({ row }) => (
    <div
      data-tag="allowRowEvents"
      style={{
        overflow: "hidden",
        whiteSpace: "wrap",
        textOverflow: "ellipses",
      }}
    >
      <p className="mb-0 d-flex align-items-center">
        <span className="status-block active-status" /> Active
      </p>
    </div>
  );

  const getLocations = () => {
    let options = [];
    ((manifest && manifest.regions) || []).forEach((el) => {
      if (el.type === "location") {
        let city = manifest.regions.filter((o) => el.parent === o._id)[0];
        let r = manifest.regions.filter((o) => city.parent === o._id)[0];
        options.push(createOption(el.area, el.id, city, r));
      }
    });
    return options;
  };

  const removeLocations = async () => {
    const oldLocation = (props.prevLocations || []).filter(
      (obj) => obj.value === deletelocation
    );
    if (oldLocation.length)
      try {
        await callApi(`${API_BASE_URL}/onboard/task/delete`, {
          method: "DELETE",
          body: JSON.stringify({
            task: props.taskId,
            location: deletelocation,
          }),
        });
      } catch (e) {
        console.log(e);
      }
    const filter = props.selectedLocations.filter((obj) => {
      return obj.value !== deletelocation;
    });
    props.setSelectedLocations([...filter]);
    setModalVisibility(false);
  };

  const getCameraByLocations = async () => {
    if (!props.selectedLocations.length || !props.taskId) return;
    let ids = [];
    props.selectedLocations.forEach((el) => ids.push(el.value));
    setLocationIds([...ids]);
    props.setLocationIds(ids);

    const { data } = await callApi(
      `${API_BASE_URL}/camera/get/100/0?sortBy=_id&sort=-1&status=Active&location=${ids.toString()}&task=${
        props.taskId
      }`
    );
    if (data.data) {
      props.selectedCamera.forEach((obj) => {
        data.data.forEach((o) => {
          if (obj._id === o._id) obj.models = o.models;
        });
      });
      setCameraList([...data.data]);
      setCameraListTotal(data.total);
    }
  };

  useEffect(() => {
    if (props.selectedLocations && props.selectedLocations.length) {
      getCameraByLocations();
    } else {
      setCameraList([]);
    }
  }, [props.selectedLocations]);

  const onSelectedRowsChange = (el) => {
    if (!el.selectedRows) {
      selectRoi(el);
    }
    if (el.selectedRows) {
      setSelectedCamera(el.selectedRows);
      el.selectedCamera = el.selectedRows;
      props.setSelectedCamera(el.selectedRows);
      if (
        props.selectedTask.taskType.toLowerCase() === "artificial intelligence"
      ) {
        // let model = false
        // let err = ''
        for (let obj of el.selectedRows) {
          if (obj.models === 0) {
            selectRoi(obj);
            break;
            // err = `${obj.camera} must have at least one roi, Please configure camera first`;
            // model = true;
          }
        }
        // if (model) {
        //     if (cameraList && cameraList.length) setCameraList([...cameraList]);
        //     showAlert(err, 'error')
        // }
      }
    }
  };

  const getInfo = (val) => {
    if ((val || "").toLowerCase() === "human intelligence") {
      return "Task involves human-viewing of the videos for the detection";
    } else if ((val || "").toLowerCase() === "artificial intelligence") {
      return `Task involves Wobot's AI models doing the detection automatically`;
    } else if ((val || "").toLowerCase() === "manual") {
      return "";
    }
  };

  return (
    <div className="wobot-panel-main">
      <Modal
        show={showDescription}
        onHide={() => setShowDescription(false)}
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="modal-title d-block">
              {props.selectedTask && (props.selectedTask.model || "")}
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.selectedTask &&
            props.selectedTask.description &&
            renderHTML(replaceHtml(props.selectedTask.description))}
        </Modal.Body>
        <Modal.Footer className="justify-content-between align-items-end">
          <Button
            className="btn btn-primary px-4 btn-md"
            onClick={() => setShowDescription(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/*Add camera modal*/}

      <AddCameraModal
        data={{
          show,
          setShow,
          successCallback: () => {
            getCameraByLocations();
          },
          module: "camera | WoCam",
        }}
      />
      {/**/}
      <div className="main-body-wrapper">
        <Modal
          className="action-popup"
          show={modalVisibility}
          onHide={() => {
            setModalVisibility(false);
          }}
        >
          <Modal.Header />
          <Modal.Body>
            <div className="modal-popup">
              <p className="fs-20 primary-color fw-500">Are you sure?</p>
              <p className="mb-0 fs-14">Do you want to delete ?</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="align-right">
              <button
                variant="primary"
                className="btn btn-primary btn-xs btn mr-2"
                onClick={removeLocations}
              >
                Yes
              </button>
              <button
                variant="secondary"
                className="btn-tertiary btn-xs btn"
                onClick={() => {
                  setModalVisibility(false);
                }}
              >
                No
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-6 align-self-center mb-4">
            <div className="title">
              <OverlayTrigger
                key={"1"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>View task details</Tooltip>
                }
              >
                <h3 className="fs-22 mb-3 header-primary">
                  {(props.selectedTask && props.selectedTask.model) || ""}
                  <span
                    className="ml-2 curser-btn"
                    onClick={() => setShowDescription(true)}
                  >
                    <IconHelp />
                  </span>
                </h3>
              </OverlayTrigger>
              {props.selectedTask &&
                props.selectedTask.taskType &&
                ["right"].map((placement, index) => (
                  <OverlayTrigger
                    key={index}
                    placement={placement}
                    overlay={
                      <Tooltip id={`tooltip-${placement}`}>
                        {" "}
                        {getInfo(props.selectedTask.taskType)}
                      </Tooltip>
                    }
                  >
                    <div className="tag-block tag-lg tag-default">
                      {props.selectedTask.taskType}
                    </div>
                  </OverlayTrigger>
                ))}
            </div>
          </div>
          <div className="col-12">
            <div className="steps-block">
              <ul className="list-inline progressbar">
                <OverlayTrigger
                  key={"2"}
                  placement={"top"}
                  overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                >
                  <li
                    className={`list-inline-item ${
                      props.isCompleted ? "isCompleted active" : "active"
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() => props.setCurrentIndex(0)}
                    >
                      configure
                    </span>
                  </li>
                </OverlayTrigger>

                <OverlayTrigger
                  key={"3"}
                  placement={"top"}
                  overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                >
                  <li
                    className={`list-inline-item ${
                      props.isCompleted ? "isCompleted active" : "active"
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() => props.setCurrentIndex(1)}
                    >
                      Select Camera
                    </span>
                  </li>
                </OverlayTrigger>
                <OverlayTrigger
                  key={"4"}
                  placement={"top"}
                  overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                >
                  <li
                    className={`list-inline-item ${
                      props.isCompleted ? "active isCompleted" : ""
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() =>
                        props.isCompleted && props.setCurrentIndex(2)
                      }
                    >
                      Add Schedule
                    </span>
                  </li>
                </OverlayTrigger>
                <OverlayTrigger
                  key={"5"}
                  placement={"top"}
                  overlay={<Tooltip id={`tooltip-top`}>Edit step</Tooltip>}
                >
                  <li
                    className={`list-inline-item ${
                      props.isCompleted ? "active isCompleted" : ""
                    }`}
                  >
                    <span
                      className="curser-btn"
                      onClick={() =>
                        props.isCompleted && props.setCurrentIndex(3)
                      }
                    >
                      Assign User
                    </span>
                  </li>
                </OverlayTrigger>
              </ul>
            </div>
            {props.selectedTask &&
              (props.selectedTask.taskType || "").toLowerCase() ===
                "artificial intelligence" && (
                <div className="mxw-850 info-content">
                  <p>
                    Select the locations and the cameras you want to run this
                    task on. The ‘Region of Interest’ needs to be configured for
                    each selected camera for monitoring.
                  </p>
                </div>
              )}
            <div className="select-block mt-4 row">
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <label htmlFor="inputEmail4" className="fw-600">
                  Select Locations
                </label>
                <Select
                  options={getLocations()}
                  onChange={(value) => {
                    const obj = props.selectedLocations.filter((obj) => {
                      return obj.value === value.value;
                    });
                    if (obj && obj.length) return;
                    props.setSelectedLocations(
                      props.selectedLocations.concat([value])
                    );
                  }}
                  placeholder="Location"
                  value={props.selectedLocations}
                />
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 align-self-center">
                <p className="m-0">
                  <Link
                    to={LOCATION}
                    className="link"
                    target="_blank"
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
                          `Clicked on add new location | Checklist`,
                          {
                            title: `Clicked on add new location | Checklist`,
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
                    Add new location?
                  </Link>
                </p>
              </div>
              <div className="col-lg-12">
                <ul className="list-inline location-block">
                  {(props.selectedLocations || []).map((el, index) => {
                    return (
                      <OverlayTrigger
                        key={index}
                        placement={"right"}
                        overlay={
                          <Tooltip id={`tooltip-right`}>
                            Remove location from task
                          </Tooltip>
                        }
                      >
                        <li key={index} className="list-inline-item curser-btn">
                          <div
                            className="selected-block"
                            onClick={() => {
                              setDeletelocation(el.value);
                              setModalVisibility(true);
                            }}
                          >
                            <span>
                              {el.label} ({el.city && el.city.area})
                            </span>
                            <span className="action">
                              <IconTrash />
                            </span>
                          </div>
                        </li>
                      </OverlayTrigger>
                    );
                  })}
                </ul>
              </div>
            </div>
            {!props.selectedLocations.length && (
              <p>
                Please select atleast 1 location to view the cameras.
                <br />
              </p>
            )}
            {props.selectedTask &&
              props.selectedLocations.length > 0 &&
              (props.selectedTask.taskType || "").toLowerCase() !==
                "manual" && (
                <p>
                  Don't see the required cameras here?{" "}
                  <a
                    href={"#"}
                    className="link"
                    onClick={() => {
                      setShow(true);
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
                          `Clicked on go to add camera | Checklist`,
                          {
                            title: `Clicked on go to add camera | Checklist`,
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
                    Go to Add Camera
                  </a>
                </p>
              )}
            {props.selectedTask &&
              props.selectedLocations.length > 0 &&
              (props.selectedTask.taskType || "").toLowerCase() ===
                "artificial intelligence" && (
                <p>
                  <b>Note:</b> ROI is required for {props.selectedTask.model}{" "}
                  region.
                </p>
              )}
          </div>
          <div className="col-12">
            <div id="table-content" key={cameraList}>
              <DataTable
                columns={columns}
                data={cameraList}
                total={cameraListTotal}
                selectableRowSelected={(row) => {
                  return isSelected(row);
                }}
                onSelectedRowsChange={onSelectedRowsChange}
                selectableRows
                pagination
                paginationPerPage={10}
                striped={false}
                dense
                paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                paginationComponentOptions={{ rowsPerPageText: "" }}
              />
            </div>
            <div className="mt-5">
              <ContactSupport
                checklistId={props.checklistId}
                taskId={props.selectedTask._id}
                title={"Step 2 | Contact Support | Checklist Set Up"}
              />
            </div>
            <div className="block-group mt-5">
              <Link
                to="#"
                className="btn btn-icon-block btn-primary btn-md"
                onClick={() => {
                  if (!selectedCamera.length)
                    return showAlert(
                      "Please select at least one camera",
                      "error"
                    );
                  if (
                    props.selectedTask.taskType.toLowerCase() ===
                    "artificial intelligence"
                  ) {
                    let model = false;
                    let err = "";
                    // console.log("obj >", selectedCamera);
                    for (let obj of selectedCamera) {
                      if (obj.models === 0) {
                        err = `${obj.camera} must have at least one roi`;
                        model = true;
                        break;
                      }
                    }
                    if (model) return showAlert(err, "error");
                  }
                  props.setCurrentIndex();
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
                      `Step 2 | Select camera step completed | Checklist`,
                      {
                        title: `Select camera step completed | Checklist`,
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
                Next <IconArrowNextRight />{" "}
              </Link>
              <Link to="#" onClick={props.saveAndGoToNext} className="link">
                Skip task{" "}
              </Link>
            </div>
          </div>
          {roiShow && (
            <AddROI
              roiShow={roiShow}
              setRoiShow={setRoiShow}
              cameraId={cameraId}
              threshold={threshold}
              label={label}
              rois={rois}
              getCameraByLocations={getCameraByLocations}
              thumbnail={thumbnail}
              taskId={props.taskId}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(CameraComponent);
