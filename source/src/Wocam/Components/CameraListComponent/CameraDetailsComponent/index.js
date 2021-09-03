import React, { useCallback, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import {
  IconActive,
  IconCopyNew,
  IconExternalLink,
  IconInactive,
  IconMeatball,
  IconPencil,
  IconRefetch,
  IconTrash,
  IconVideoPlayback,
} from "../../../../Common/Components/IconsComponent/Index";
import "./style.scss";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL, CAMERA, PLAYBACK } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import { connect } from "react-redux";
import VideoPlayer from "../../ViewsComponent/VideoPlayer";
import GridLayout from "react-grid-layout";
import AddCameraModal from "../../ModalComponents/AddCameraModal";
import BlockComponent from "../../../../Common/Components/Molecule/Block";
import DataList from "../../../../Common/Components/Molecule/DataList";
import PageTitle from "../../../../Common/Components/Molecule/Atoms/PageTitle";
import BlockHeader from "../../../../Common/Components/Molecule/Block/BlockHeader";
import StatusTag from "../../../../Common/Components/Molecule/Atoms/StatusTag";
import SubBlock from "./CameraSubBlock";
import Dropbutton from "../../../../Common/Components/Molecule/Atoms/Dropbutton";
import ActionBlock from "../../../../Common/Components/Molecule/ActionBlock";
import ConfirmationModal from "../../ModalComponents/ConfirmationModal";
import CopyRtspPopup from "../../ModalComponents/CopyRtspPopup";
import CameraInactiveComponent from "../../Common/CameraInactiveComponent";

const CameraDetailsComponent = (props) => {
  const history = useHistory();
  const [cameraId] = useState(props.cameraId);
  const [cameraDetails, setCameraDetails] = useState({});
  const [cameraImage, setCameraImage] = useState("");
  const [resetFrameLoading, setResetFrameLoading] = useState(false);
  const [taskRunningData, setTaskRunningData] = useState([]);
  const [directRecordingRunningData, setDirectRecordingData] = useState([]);
  const [copyRtspModalVisibility, setCopyRtspModalVisibility] = useState(false);
  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);
  const [action, setAction] = useState("");

  const [show, setShow] = useState(false);
  const cameraDataList = [
    {
      dataLabel: "Location:",
      dataString: cameraDetails.location ? cameraDetails.location : "-",
    },
    {
      dataLabel: "City:",
      dataString:
        cameraDetails.city && cameraDetails.region
          ? `${cameraDetails.city} , ${cameraDetails.region}`
          : "-",
    },
    {
      dataLabel: "Timezone:",
      dataString: cameraDetails.timezone ? cameraDetails.timezone : "-",
    },
    {
      dataLabel: "Date added:",
      dataString: cameraDetails.created_at ? cameraDetails.created_at : "-",
    },
    {
      dataLabel: "Last update:",
      dataString: cameraDetails.updated_at ? cameraDetails.updated_at : "-",
    },
  ];
  const connectionDataList = [
    {
      dataLabel: "NVR:",
      dataString:
        cameraDetails.dvr && Object.keys(cameraDetails.dvr).length ? (
          <Link
            target="_blank"
            className={"open-link"}
            to={`/wocam/recorder/detail/${cameraDetails.dvr._id}`}
          >
            {cameraDetails.dvr.dvr}
            <span className={"ml-1"}>
              <IconExternalLink />
            </span>
          </Link>
        ) : (
          "-"
        ),
    },
    {
      dataLabel: "Manufacturer:",
      dataString: cameraDetails.manufacturer ? cameraDetails.manufacturer : "-",
    },
    {
      dataLabel: "Channel ID:",
      dataString:
        cameraDetails.dvr && Object.keys(cameraDetails.dvr).length
          ? cameraDetails.channelId
          : "-",
    },
    {
      dataLabel: "RTSP URL:",
      dataString: (
        <div
          onClick={() => {
            setCopyRtspModalVisibility(true);
            // showAlert("Copied to clipboard");
          }}
          className={"copy-link"}
        >
          <p className="mb-0">
            Copy
            <span className="ml-2">
              {" "}
              <IconCopyNew />
            </span>
          </p>
        </div>
      ),
    },
  ];

  /*
   * for seggregating task and direct recording
   * **/

  useEffect(() => {
    if (Object.keys(cameraDetails).length && cameraDetails?.models?.length) {
      let task = [],
        directRecording = [],
        i = 0;

      for (; i < cameraDetails.models.length; i++) {
        if (cameraDetails.models[i].isTask) {
          task.push(cameraDetails.models[i]);
        } else {
          directRecording.push(cameraDetails.models[i]);
        }
      }
      setTaskRunningData(task);
      setDirectRecordingData(directRecording);
    } else {
      setTaskRunningData([]);
      setDirectRecordingData([]);
    }
  }, [cameraDetails]);

  const getCameraDetailsAndUpdateState = useCallback(async () => {
    try {
      let cam = await callApi(`${API_BASE_URL}/camera/${cameraId}`);
      if (cam.status === 200 && cam.data) {
        setCameraDetails(cam.data);
        // setThumbnail(cam.data.thumbnail);
        if (cam.data.thumbnail) setCameraImage(cam.data.thumbnail);
        // else setCameraImage("/assets/images/video-img.png")
      } else history.goBack();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  useEffect(() => {
    try {
      getCameraDetailsAndUpdateState();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  function renderVideo() {
    if (cameraDetails.status === "Active") {
      return (
        <VideoPlayer
          data={{
            isFromCameraDetails: true,
            setCameraPlayingStatus: () => {},
            fullScreen: (index) => {
              // updateStyle(index)
            },
            revertFullScreen: () => {
              //
            },
            imageUrl: cameraImage,
            index: 0,
            location: cameraDetails.location,
            cameraName: cameraDetails.camera,
            cameraId: cameraId,
            userId:
              props &&
              props.userData &&
              props.userData.user &&
              props.userData.user._id
                ? props.userData.user._id
                : "",
          }}
        />
      );
    } else
      return (
        <CameraInactiveComponent
          location={cameraDetails.location}
          cameraName={cameraDetails.camera}
        />
      );
  }

  /**
   * Reset camera frame and change image
   * */
  const resetFrame = async () => {
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
      window.analytics.track(`Clicked on Reset Frame | Camera | WoCam`, {
        title: `Clicked on Reset Frame| Camera | WoCam`,
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
    setResetFrameLoading(true);
    let temp = cameraImage;
    // setCameraImage("/assets/images/loading.png");
    try {
      let frame = await callApi(
        `${API_BASE_URL}/frame/update/${cameraId}?width=720&height=640`,
        { method: "PUT" }
      );
      if (frame.status === 200 && frame.data && frame.data.image) {
        setCameraImage(frame.data.image);
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
          window.analytics.track("Reset Frame successfully | Camera | Wocam", {
            title: "Reset Frame successfully | Camera | Wocam",
            email: props.userData.user.email,
            username: props.userData.user.username,
            companyName: props.userData.manifest.company.name,
            user_id: props.userData.user._id,
            company_id: props.userData.manifest._id,
          });
        }
      } else setCameraImage(temp);

      setResetFrameLoading(false);
    } catch (e) {
      setResetFrameLoading(false);
      setCameraImage(temp);
      showAlert(e, "error");
    }
  };

  const handleAction = async () => {
    let config = {
      url: "",
      method: "",
      body: {
        ids: [cameraId],
      },
    };
    if (action === "Inactive") {
      config.url = `${API_BASE_URL}/camera/status/update`;
      config.method = "PUT";
      config.body = { ...config.body, status: "Inactive" };
    } else if (action === "Active") {
      config.url = `${API_BASE_URL}/camera/status/update`;
      config.method = "PUT";
      config.body = { ...config.body, status: "Active" };
    } else if (action === "Delete") {
      config.url = `${API_BASE_URL}/camera/status/update`;
      config.method = "PUT";
      config.body = { ...config.body, status: "Deleted" };
    }

    try {
      let response = await callApi(config.url, {
        method: config.method,
        body: JSON.stringify(config.body),
      });

      if (response.status === 200) {
        showAlert(response.message);
        setConfirmationModalVisibility(false);
        if (action === "Delete") {
          history.goBack();
        }
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
        getCameraDetailsAndUpdateState();
      }
    } catch (e) {
      showAlert(e, "error");

      setConfirmationModalVisibility(false);
    }
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        {/* page-header */}
        <PageTitle
          pageTitle={"Camera Details"}
          showSubTitle={true}
          subTitle={
            <p className="mb-0">
              Find all essential information such as location, technical
              details, tasks, schedules, and beyond below.
            </p>
          }
          breadcrumb={[
            { name: "Wocam" },
            { name: "Camera", link: CAMERA },
            { name: "Camera Details" },
          ]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <Link
                className={"btn btn-primary btn-text-icon"}
                to={{
                  pathname: PLAYBACK,
                  camera: {
                    _id: cameraDetails._id,
                    camera: cameraDetails.camera,
                    region: cameraDetails.region,
                    _region: cameraDetails._region,
                    subRegion: cameraDetails.city,
                    _subRegion: cameraDetails._city,
                    location: cameraDetails.location,
                    _location: cameraDetails._location,
                  },
                }}
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
                      `Clicked on playback | Camera | WoCam`,
                      {
                        title: `Clicked on playback | Camera | WoCam`,
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
                <span>
                  <IconVideoPlayback /> View Recorded Videos
                </span>
              </Link>
            </li>
            <li className={"list-inline-item"}>
              <button className={"btn btn-textIcon"} onClick={resetFrame}>
                <span>
                  <IconRefetch /> Refetch Frame
                </span>
              </button>
            </li>
            <li className={"list-inline-item"}>
              <Dropbutton dropMenuItem={<IconMeatball />}>
                <Dropdown.Item
                  onClick={() => {
                    setShow(true);
                  }}
                >
                  <span>
                    <IconPencil /> Edit
                  </span>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    let action =
                      cameraDetails.status === "Active" ? "Inactive" : "Active";
                    setAction(action);

                    setConfirmationModalVisibility(true);
                  }}
                >
                  {cameraDetails.status === "Active" ? (
                    <span>
                      <IconInactive /> Deactivate
                    </span>
                  ) : (
                    <span>
                      <IconActive /> Activate
                    </span>
                  )}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setAction("Delete");
                    setConfirmationModalVisibility(true);
                  }}
                >
                  <span>
                    <IconTrash /> Delete
                  </span>
                </Dropdown.Item>
              </Dropbutton>
            </li>
          </ActionBlock>
        </PageTitle>
        {/* Content-block */}
        <div className={"row"}>
          <div className={"col-xl-5 col-lg-6 col-md-6"}>
            <BlockComponent>
              <div className={"element-section"}>
                <BlockHeader>
                  <h5 className={"element-title-h5"}>
                    {cameraDetails.camera
                      ? cameraDetails.camera
                      : "No Camera Name"}
                  </h5>
                  <StatusTag status={cameraDetails.status} />
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {cameraDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
              <div className={"element-section"}>
                <BlockHeader>
                  <h6 className={"element-title-h6"}>Alert Settings</h6>
                </BlockHeader>
                <ul className={"data-list mb-0"}>
                  <li className={"data-title"}>
                    If camera is inaccessible for:
                    <span className={"data-highlight"}>
                      {cameraDetails.cameraOfflineAlertDuration
                        ? cameraDetails.cameraOfflineAlertDuration + " Minutes"
                        : "No offline duration is set"}
                    </span>
                  </li>
                  <li className={"data-title"}>
                    Send email to:
                    {cameraDetails && cameraDetails.emailIds
                      ? cameraDetails.emailIds.map((email, key) => {
                          return (
                            <span key={key} className={"data-highlight mr-1"}>
                              {email}
                            </span>
                          );
                        })
                      : "No emails available"}
                  </li>
                </ul>
              </div>
              <div className={"element-section mb-0"}>
                <BlockHeader>
                  <h6 className={"element-title-h6"}>Connection Settings</h6>
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {connectionDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
            </BlockComponent>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-6">
            <div className="p-relative video-wrapper-block">
              <GridLayout
                className="layout"
                grid={12}
                rowHeight={30}
                margin={[5, 5]}
                width={1200}
                isResizable={false}
                isDraggable={false}
              >
                {/* {selectedView && selectedView.cameras &&
                                Object.keys(selectedView.cameras).length ?
                                    renderCameraVideos() : <div/>
                                } */}

                <div
                  key={1}
                  data-grid={{ x: 0, y: 0, w: 8, h: 10, minW: 4, minH: 8 }}
                  // className="video-bg p-relative overflow-h"
                >
                  {renderVideo()}
                </div>
              </GridLayout>
            </div>
          </div>
        </div>
        <div className={"sub-block"}>
          <SubBlock
            tasks={taskRunningData}
            recordings={directRecordingRunningData}
            camera={cameraDetails}
            errorMsg={"No tasks are running."}
            successCallBack={() => {
              getCameraDetailsAndUpdateState();
            }}
          />
          {/* <div className={"row"}>
            <div className={"col-12"}>
              <div className={"sub-page-title"}>
                <h5 className={"mb-0"}>Tasks and Recordings </h5>
              </div>
            </div>
            <SubBlock
              tasks={taskRunningData}
              recordings={directRecordingRunningData}
              camera={cameraDetails}
              successCallBack={() => {
                getCameraDetailsAndUpdateState();
              }}
            />
          </div> */}
        </div>

        {/*Confirmation modal*/}
        <ConfirmationModal
          visibility={confirmationModalVisibility}
          setVisiblity={setConfirmationModalVisibility}
          headerText={"Confirm Action"}
          footerText={
            action == "Active" || action == "Inactive"
              ? `Do you want to ${action}?`
              : "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
          }
          onYes={handleAction}
          onNo={() => {
            setConfirmationModalVisibility(false);
            setAction("");
          }}
          onHide={() => {
            setConfirmationModalVisibility(false);
            setAction("");
          }}
        />

        {/**/}

        <AddCameraModal
          data={{
            show,
            setShow,
            cameraDetails,
            getCameraDetailsAndUpdateState,
            setCameraDetails,
            setCameraImage,
            successCallBack: () => {},
            module: "Camera | WoCam",
          }}
        />

        {/**/}

        {/*  copy rtsp modal*/}

        <CopyRtspPopup
          visibility={copyRtspModalVisibility}
          onHide={() => {
            setCopyRtspModalVisibility(false);
          }}
          cameraId={cameraDetails._id}
        />
        {/*  */}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(CameraDetailsComponent);
