import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL, RECORDER } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import RefetchCameraModalComponent from "../../ModalComponents/RefetchCameraModal";
import "./style.scss";
import {
  IconActive,
  IconInactive,
  IconMeatball,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "../../../../Common/Components/IconsComponent/Index";
import { connect } from "react-redux";
import AddDvrModal from "../../ModalComponents/AddDvrModal";
import PageTitle from "../../../../Common/Components/Molecule/Atoms/PageTitle";
import BlocksComponent from "../../../../Common/Components/Molecule/Block";
import BlockHeader from "../../../../Common/Components/Molecule/Block/BlockHeader";
import StatusTag from "../../../../Common/Components/Molecule/Atoms/StatusTag";
import DataList from "../../../../Common/Components/Molecule/DataList";
import CameraSubBlock from "./RecorderSubBlock";
import Dropbutton from "../../../../Common/Components/Molecule/Atoms/Dropbutton";
import ActionBlock from "../../../../Common/Components/Molecule/ActionBlock";
import ConfirmationModal from "../../ModalComponents/ConfirmationModal";

const RecorderDetailsComponent = (props) => {
  const history = useHistory();
  const [recorderId] = useState(props.recorderId);
  const [dvrDetails, setDvrDetails] = useState({});
  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);
  const [action, setAction] = useState("");

  //Modal
  const [show, setShow] = useState(false);

  /**
   * Refetch camera
   * */
  const [cameraStatusVisible, setCameraStatusVisible] = useState("Active");

  const [
    refetchCameraModalVisibility,
    setRefetchCameraModalVisiblity,
  ] = useState(false);

  const dvrDataList = [
    {
      dataLabel: "Location:",
      dataString: dvrDetails.location ? dvrDetails.location : "-",
    },
    {
      dataLabel: "City:",
      dataString:
        dvrDetails.city && dvrDetails.region
          ? dvrDetails.city + ", " + dvrDetails.region
          : "-",
    },
    {
      dataLabel: "Timezone:",
      dataString: dvrDetails.timezone
        ? dvrDetails.timezone
        : " No Timezone is selected",
    },
    {
      dataLabel: "Date added:",
      dataString: dvrDetails.created_at ? dvrDetails.created_at : "-",
    },
    {
      dataLabel: "Last modified:",
      dataString: dvrDetails.updated_at ? dvrDetails.updated_at : "-",
    },
  ];

  const dvrConnectionDataList = [
    {
      dataLabel: "Manufacturer:",
      dataString: dvrDetails.manufacturer
        ? dvrDetails.manufacturer
        : "No manufacturer",
    },
    {
      dataLabel: "IP address:",
      dataString:
        dvrDetails.host && dvrDetails.port
          ? dvrDetails.host + ":" + dvrDetails.port
          : "-",
    },
    {
      dataLabel: "Available cameras:",
      dataString:
        dvrDetails.connectedCamera && dvrDetails.connectedCamera.length
          ? dvrDetails.connectedCamera.length
          : "-",
    },
    {
      dataLabel: "Total channels:",
      dataString: dvrDetails.channels ? dvrDetails.channels : "-",
    },
  ];

  const getDvrDetailsAndUpdateState = useCallback(async () => {
    try {
      let dvr = await callApi(`${API_BASE_URL}/dvr/${recorderId}`);
      if (dvr.status === 200 && dvr.data) {
        setDvrDetails(dvr.data);
      } else history.goBack();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  useEffect(() => {
    try {
      getDvrDetailsAndUpdateState();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  const handleAction = async () => {
    let config = {
      url: "",
      method: "",
      body: {
        ids: [recorderId],
      },
    };
    if (action === "Inactive") {
      config.url = `${API_BASE_URL}/dvr/status/update`;
      config.method = "PUT";
      config.body = { ...config.body, status: "Inactive" };
    } else if (action === "Active") {
      config.url = `${API_BASE_URL}/dvr/status/update`;
      config.method = "PUT";
      config.body = { ...config.body, status: "Active" };
    } else if (action === "Delete") {
      config.url = `${API_BASE_URL}/dvr/status/update`;
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
          action &&
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
            `${action}d DVR successfully | DVR/NVR | WoCam`,
            {
              title: `${action}d DVR successfully | DVR/NVR | WoCam`,
              email: props.userData.user.email,
              username: props.userData.user.username,
              companyName: props.userData.manifest.company.name,
              user_id: props.userData.user._id,
              company_id: props.userData.manifest._id,
            }
          );
        }
        getDvrDetailsAndUpdateState();
      }
    } catch (e) {
      showAlert(e, "error");

      setConfirmationModalVisibility(false);
    }
  };

  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const countOfCameras = (status) => {
    if (
      dvrDetails &&
      dvrDetails.connectedCamera &&
      dvrDetails.connectedCamera.length
    ) {
      if (!status) return dvrDetails.connectedCamera.length;
      else {
        let countArr = dvrDetails.connectedCamera.filter(
          (el) => el.status === status
        );
        return countArr.length;
      }
    }
    return 0;
  };
  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"NVR Details"}
          showSubTitle={true}
          subTitle={
            <p classname="mb-0">
              Find all essential information about your NVR from head office
              location, to connection details, camera status, and beyond.{" "}
            </p>
          }
          breadcrumb={[
            { name: "Wocam" },
            { name: "NVR", link: RECORDER },
            { name: "NVR Details" },
          ]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <button
                className={"btn btn-textIcon"}
                onClick={() => {
                  setRefetchCameraModalVisiblity(true);
                }}
              >
                <span>
                  <IconRefresh /> Refetch Cameras
                </span>
              </button>
            </li>
            <li className={"list-inline-item"}>
              <button
                className={"btn btn-textIcon"}
                onClick={() => {
                  setShow(true);
                }}
              >
                <span>
                  <IconPencil /> Edit
                </span>
              </button>
            </li>
            <li className={"list-inline-item"}>
              <Dropbutton
                className={"btn btn-textIcon"}
                dropMenuItem={<IconMeatball />}
              >
                <Dropdown.Item
                  onClick={() => {
                    let action =
                      dvrDetails.status === "Active" ? "Inactive" : "Active";
                    setAction(action);

                    setConfirmationModalVisibility(true);
                  }}
                >
                  {dvrDetails.status === "Active" ? (
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
        <div className={"row"}>
          <div className={"col-xl-4 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 panel-fh "}>
                <BlockHeader>
                  <h5 className={"element-title-h5"}>
                    {dvrDetails.dvr ? dvrDetails.dvr : "No NVR Name"}
                  </h5>
                  <StatusTag status={dvrDetails.status} />
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {dvrDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
            </BlocksComponent>
          </div>
          <div className={"col-xl-4 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 "}>
                <BlockHeader>
                  <h6 className={"element-title-h6"}>Connection Details</h6>
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {dvrConnectionDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
            </BlocksComponent>
          </div>
        </div>

        <div className={"sub-block"}>
          <div className={"row"}>
            <div className={"col-12"}>
              <div className={"sub-page-title"}>
                <h5 className={"mb-0"}>
                  Active Cameras ({countOfCameras("Active")})
                </h5>
                {cameraStatusVisible === "All" ? (
                  <Link
                    className="link ml-4"
                    onClick={() => {
                      setCameraStatusVisible("Active");
                    }}
                  >
                    Show Active
                  </Link>
                ) : (
                  <Link
                    className="link ml-4"
                    onClick={() => {
                      setCameraStatusVisible("All");
                    }}
                  >
                    Show All
                  </Link>
                )}
              </div>
            </div>
            {dvrDetails.connectedCamera && dvrDetails.connectedCamera.length ? (
              dvrDetails.connectedCamera.map((channel, index) => {
                if (
                  channel.status === cameraStatusVisible ||
                  cameraStatusVisible === "All"
                ) {
                  return (
                    <div className={"col-xl-4 col-lg-6 col-md-6"}>
                      <CameraSubBlock
                        subBlockName={channel.camera ? channel.camera : ""}
                        subImgUrl={channel.thumbnail ? channel.thumbnail : ""}
                        subBlockCity={dvrDetails.city ? dvrDetails.city : ""}
                        subBlockRegion={
                          dvrDetails.region ? dvrDetails.region : ""
                        }
                        cameraId={channel.id}
                        status={channel.status}
                        clipBoardText={channel.rtsp}
                        titleLink={`/wocam/camera/detail/${channel._id}`}
                        onClickCopy={() => {
                          showAlert("Copied to clipboard");
                        }}
                        runningTask={channel.models}
                      />
                    </div>
                  );
                }
              })
            ) : (
              <div className={"col-12"}>
                <span>No Camera added</span>
              </div>
            )}
          </div>
        </div>

        {/*Confirmation modal*/}

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

        {/*Update Modal*/}
        <AddDvrModal
          data={{
            show,
            setShow,
            dvrDetails,
            setDvrDetails,
            successCallBack: () => {},
            module: "NVR | WoCam",
          }}
        />
        {/**/}

        {/*Refetch camera modal*/}
        <RefetchCameraModalComponent
          data={{
            deviceInfo: props.deviceInfo,
            visibility: refetchCameraModalVisibility,
            dvrDetails,
            setDvrDetails,
            togglePasswordVisiblity,
            passwordShown,
            setRefetchCameraModalVisiblity,
            module: "NVR | Wocom",
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(RecorderDetailsComponent);
