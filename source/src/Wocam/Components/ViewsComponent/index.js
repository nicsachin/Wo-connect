import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  IconAdd,
  IconPencil,
  IconPlay,
  IconStopControl,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./style.scss";
import { connect } from "react-redux";
import { API_BASE_URL, VIEW } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import { cameraLayout } from "./helper";
import VideoPlayer from "./VideoPlayer";
import moment from "moment";

import Clock from "react-live-clock";
import { segmentTrack } from "../../../Services/segment";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";

import Service from "../../utils/Service";
import ConfirmationModal from "../ModalComponents/ConfirmationModal";
import CameraInactiveComponent from "../Common/CameraInactiveComponent";
import LiveDefault from "../../../Common/Components/Molecule/Default/LiveDefault";
import AddViewModal from "../ModalComponents/AddViewModal";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ViewsComponent = (props) => {
  const [show, setShow] = useState(false);

  const [
    activeCamerasInSelectedView,
    setActiveCamerasInSelectedView,
  ] = useState(0);

  /**
   *
   * Data table
   * */

  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);

  /**
   * View Related data
   * */
  const [viewOptions, setViewOptions] = useState([]);
  const [selectedView, setSelectedView] = useState({});

  /**
   * Start live view
   *
   */
  const [startLiveView, setStartLiveView] = useState(null);

  const [gridLayout, setGridLayout] = useState(cameraLayout);
  const [cameraPlayingStatus, setCameraPlayingStatus] = useState(0);
  const [selectedViewChanged, setSelectedViewChanged] = useState(0);
  const [editMode, setEditMode] = useState(false);
  /**
   * filter out active cameras from view
   * */
  useEffect(() => {
    if (selectedView && selectedView?.cameras?.length) {
      setActiveCamerasInSelectedView(
        selectedView.cameras.filter((el) => el.status === "Active").length
      );
    }
  }, [selectedView]);

  const populateViews = async () => {
    setSelectedView({});
    setStartLiveView(null);
    /**
     * Populate view related details
     * */
    try {
      if (
        props &&
        props.userData &&
        props.userData.user &&
        props.userData.user.email &&
        props.userData.manifest._id
      ) {
        let viewList = await callApi(
          `${API_BASE_URL}/livestream/view/get?email=${props.userData.user.email}&company=${props.userData.manifest._id}`
        );
        let viewNamesOptions = [];
        if (viewList && viewList.data && viewList.data.length) {
          setSelectedView({
            label: viewList.data[0].name,
            value: viewList.data[0]._id,
            cameras: viewList.data[0].cameras,
            default: viewList.data[0].default,
          });
          for (let view of viewList.data) {
            viewNamesOptions.push({
              label: view.name,
              value: view._id,
              cameras: view.cameras,
              default: view.default,
            });
            if (view.default)
              setSelectedView({
                label: view.name,
                value: view._id,
                cameras: view.cameras,
                default: view.default,
              });
          }
        } else {
          segmentTrack({ title: "No live View added | Live | WoCam" });
        }
        setCameraPlayingStatus(0);
        setViewOptions(viewNamesOptions);
      } else showAlert("No email id provided", "error");
    } catch (e) {
      showAlert(e, "error");
    }
    resetView();
  };

  useEffect(() => {
    populateViews();
  }, []);

  const deleteView = async () => {
    try {
      const payload = {
        ids: [selectedView.value],
      };
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
        window.analytics.track("Clicked on delete view | Live | WoCam", {
          title: "Clicked on delete view | Live | WoCam",
          email: props.userData.user.email,
          username: props.userData.user.username,
          companyName: props.userData.manifest.company.name,
          user_id: props.userData.user._id,
          company_id: props.userData.manifest._id,
        });
      }
      let deleteResponse = await callApi(
        `${API_BASE_URL}/livestream/view/delete`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      if (deleteResponse.status === 200) {
        showAlert(deleteResponse.message);
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
          window.analytics.track("Deleted view successfully | Live | WoCam", {
            title: "Deleted view successfully | Live | WoCam",
            email: props.userData.user.email,
            username: props.userData.user.username,
            companyName: props.userData.manifest.company.name,
            user_id: props.userData.user._id,
            company_id: props.userData.manifest._id,
          });
        }
        populateViews();
      }
      setConfirmationModalVisibility(false);
    } catch (e) {
      showAlert(e, "error");
      setConfirmationModalVisibility(false);
    }
  };

  const resetView = () => {
    setGridLayout(cameraLayout);
  };

  const renderCameraVideos = () => {
    return Object.keys(selectedView.cameras).map((view, index) => {
      const location = selectedView.cameras[view].location;
      const cameraName = selectedView.cameras[view].camera;
      const cameraId = selectedView.cameras[view]._id;
      selectedView.cameras[view].playing = false;

      const userId =
        props &&
        props.userData &&
        props.userData.user &&
        props.userData.user._id
          ? props.userData.user._id
          : "";

      return (
        <div
          key={cameraId}
          data-grid={gridLayout[index]}
          className="video-bg p-relative overflow-h"
        >
          {selectedView.cameras[view].status === "Active" ? (
            <VideoPlayer
              data={{
                cameraPlayingStatus,
                setCameraPlayingStatus,

                revertFullScreen: () => {},
                index,
                location,
                cameraName,
                cameraId,
                userId,
                startLiveView,
              }}
            />
          ) : (
            <CameraInactiveComponent
              location={location}
              cameraName={cameraName}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        {viewOptions && viewOptions.length ? (
          <>
            <PageTitle
              pageTitle={"Live View"}
              titleMeta={
                <span>
                  {moment().format("DD-MM-YYYY")} |{" "}
                  <Clock format={"h:mm:ss A"} ticking={true} />
                </span>
              }
              showSubTitle={true}
              subTitle={
                <p className="mb-0">
                  Click on any camera, and view events live.{" "}
                </p>
              }
              breadcrumb={[{ name: "WoCam" }, { name: "Live", link: VIEW }]}
            >
              <ActionBlock showActionBtn={false} showActionList={true}>
                <li className="list-inline-item">
                  {!!Object.keys(selectedView).length ? (
                    startLiveView ||
                    (selectedView &&
                      selectedView.cameras &&
                      activeCamerasInSelectedView !== 0 &&
                      activeCamerasInSelectedView === cameraPlayingStatus) ? (
                      <button
                        onClick={() => {
                          setStartLiveView(false);
                          setCameraPlayingStatus(0);
                          if (
                            props &&
                            props.userData &&
                            props.userData.user &&
                            props.userData.user.email &&
                            props.userData.manifest &&
                            props.userData.manifest.company &&
                            props.userData.manifest.company.name
                          ) {
                            window.analytics.track(
                              "Clicked on stop live view",
                              {
                                title: "Clicked on stop live view",
                                user: props.userData.user.email,
                                username: props.userData.user.username,
                                company: props.userData.manifest.company.name,
                              }
                            );
                          }
                        }}
                        className="btn btn-primary btn-sm btn-icon"
                      >
                        <IconStopControl /> Stop Live View
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setStartLiveView(true);
                          if (
                            props &&
                            props.userData &&
                            props.userData.user &&
                            props.userData.user.email &&
                            props.userData.manifest &&
                            props.userData.manifest.company &&
                            props.userData.manifest.company.name
                          ) {
                            window.analytics.track(
                              "Clicked on start live view",
                              {
                                title: "Clicked on start live view",
                                user: props.userData.user.email,
                                username: props.userData.user.username,
                                company: props.userData.manifest.company.name,
                              }
                            );
                          }
                        }}
                        className="btn btn-primary btn-sm btn-icon"
                      >
                        <IconPlay /> Start Live View
                      </button>
                    )
                  ) : null}
                </li>
                <li className={"list-inline-item"}>
                  <button
                    className={"btn btn-textIcon"}
                    disabled={!Object.keys(selectedView).length}
                    onClick={() => {
                      setEditMode(true);
                      setShow(true);
                    }}
                  >
                    <span>
                      <IconPencil /> Edit
                    </span>
                  </button>
                </li>
                <li className={"list-inline-item"}>
                  <button
                    className={"btn btn-textIcon"}
                    disabled={!Object.keys(selectedView).length}
                    onClick={() => {
                      if (Service.isLastView(viewOptions))
                        showAlert(
                          "You cannot delete your last view.",
                          "warning"
                        );
                      else setConfirmationModalVisibility(true);
                    }}
                  >
                    <span>
                      <IconTrash /> Delete
                    </span>
                  </button>
                </li>
              </ActionBlock>
            </PageTitle>
            <ActionBlock showActionBtn={false} showActionList={true}>
              <li className={"list-inline-item"}>
                <div className="form-group input-block mb-0">
                  <label>Select View</label>
                  <Select
                    value={selectedView}
                    onChange={(selectedOption) => {
                      if (
                        selectedView &&
                        selectedView.value !== selectedOption.value
                      ) {
                        resetView();
                        const obj = { ...selectedOption };
                        setSelectedViewChanged(selectedViewChanged + 1);
                        setCameraPlayingStatus(0);
                        setSelectedView({ ...obj });
                        setStartLiveView(null);
                      }
                    }}
                    options={viewOptions}
                  />
                </div>
              </li>
              <li className={"list-inline-item"}>
                <button
                  onClick={() => {
                    setShow(true);
                  }}
                  className="btn btn-textIcon"
                >
                  <span>
                    <IconAdd />
                    Add New
                  </span>
                </button>
              </li>
            </ActionBlock>
            {/* Video-Grid */}
            <div className="video-grid-layout mt-60" key={selectedViewChanged}>
              <ResponsiveGridLayout
                key={startLiveView}
                className="layout"
                layouts={gridLayout}
                rowHeight={20}
                onLayoutChange={(layout, layouts) => {
                  setGridLayout(layouts);
                }}
                margin={[5, 5]}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 12, xs: 8, xxs: 4 }}
              >
                {selectedView &&
                selectedView.cameras &&
                Object.keys(selectedView.cameras).length ? (
                  renderCameraVideos()
                ) : (
                  <div />
                )}
              </ResponsiveGridLayout>
            </div>
          </>
        ) : (
          <>
            <LiveDefault show={show} setShow={setShow} />
          </>
        )}
        {/*Confirmation Modal*/}
        <ConfirmationModal
          visibility={confirmationModalVisibility}
          setVisiblity={setConfirmationModalVisibility}
          headerText={"Confirm Action"}
          footerText={
            "Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward."
          }
          onYes={deleteView}
          onNo={() => {
            setConfirmationModalVisibility(false);
          }}
          onHide={() => {
            setConfirmationModalVisibility(false);
          }}
        />

        {/**/}

        {/* Create View Modal */}
        <AddViewModal
          editMode={editMode}
          setEditMode={setEditMode}
          selectedView={selectedView}
          show={show}
          setShow={setShow}
          populateViews={populateViews}
          viewList={viewOptions}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(ViewsComponent);
