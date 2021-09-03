import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import IconArrowLeft from "../../../Common/Components/IconsComponent/IconArrowLeft";
import { Tab, Nav } from "react-bootstrap";
import "./style.scss";
import { API_BASE_URL, COMPLIANCE_NAVBAR, TICKETING } from "../../../Constants";
import getQueryVariable from "../../../Services/getQueryVariable";
import callApi from "../../../Services/callApi";
import { showAlert } from "../../../Services/showAlert";
import ReactPlayer from "react-player";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { addUserDataToStoreAction } from "../../../Store/actions";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import BlocksComponent from "../../../Common/Components/Molecule/Block";
import BlockHeader from "../../../Common/Components/Molecule/Block/BlockHeader";
import DataList from "../../../Common/Components/Molecule/DataList";
import ConfirmModal from "../ModalComponent/ConfirmModal";

const ComplianceDetailsComponent = (props) => {
  const history = useHistory();
  const ticketId = getQueryVariable("id");
  const [ticketDetails, setTicketDetails] = useState({});
  const videoPlayer = React.createRef();
  const [statusForSearch, setStatusForSearch] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [description, setDescription] = useState("");
  const [modalVisibility, setModalVisibility] = useState(false);
  const [action, setAction] = useState();
  const [activityLog, setActivityLog] = useState([]);

  const [regionShow, setRegionShow] = useState(false);
  const closeTo = () => {
    setRegionShow(false);
  };
  const openROIModal = () => {
    setRegionShow(true);
  };

  const getTicketDetail = async () => {
    try {
      //http://164.52.208.210:4000/app/v1/event/get/602275c81be7fd4f99e53960
      let ticketResponse = await callApi(
        `${API_BASE_URL}/event/get/${ticketId}`,
        {
          method: "GET",
        }
      );
      if (
        ticketResponse &&
        ticketResponse.status === 200 &&
        ticketResponse.data
      ) {
        setSelectedStatus({
          value: ticketResponse.data.ticketStatus._id,
          label: ticketResponse.data.ticketStatus.tag,
        });
        setTicketDetails(ticketResponse.data);
      }
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  };

  const initializeFields = () => {
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let statusList = [...statusForSearch];
      for (let el of props.userData.manifest.ticketStatus) {
        statusList.push({
          value: el._id,
          label: el.tag,
        });
      }
      setStatusForSearch(statusList);
    }
  };

  /**
   * Activity log
   * */
  const activityHandler = async () => {
    try {
      let activityResponse = await callApi(
        `${API_BASE_URL}/activity/logs/${ticketId}/1000/0`,
        {
          method: "GET",
        }
      );
      if (activityResponse.status === 200) {
        setActivityLog(activityResponse.data.data);
      }
    } catch (e) {
      showAlert(e, "error");
    }
    closeTo();
  };

  /**
   * Delete Ticket and Update Status
   * */
  const actionHandler = () => {
    const config = {
      url: "",
      method: "",
      body: "",
    };
    switch (action) {
      case "delete": {
        config.url = `${API_BASE_URL}/ticket/delete`;
        config.method = "DELETE";
        config.body = JSON.stringify({
          ids: [ticketId],
        });
        break;
      }
      case "update": {
        config.url = `${API_BASE_URL}/ticket/status/update/${ticketId}`;
        config.method = "PUT";
        config.body = JSON.stringify({
          status: selectedStatus.value,
          remark: description,
        });
        break;
      }
      default: {
        break;
      }
    }

    callApi(config.url, {
      method: config.method,
      body: config.body,
    })
      .then((res) => {
        if (res.status === 200) {
          getTicketDetail();
          showAlert(res.message);
          if (
            action &&
            props &&
            props.userData &&
            props.userData.user &&
            props.userData.user.email &&
            props.userData.manifest &&
            props.userData.manifest.company &&
            props.userData.manifest.company.name
          ) {
            window.analytics.track(
              action === "update"
                ? `${action}d ticket status`
                : `${action}d ticket`,
              {
                title: `${action}d ticket`,
                user: props.userData.user.email,
                username: props.userData.user.username,
                company: props.userData.manifest.company.name,
              }
            );
          }
        } else showAlert(res.message, "error");
        setModalVisibility(false);
        setRegionShow(false);
        if (action === "delete") {
          history.push(TICKETING);
        }
        if (action === "update") {
          activityHandler();
          setDescription("");
        }
      })
      .catch((e) => {
        showAlert(e, "error");
        setModalVisibility(false);
        setRegionShow(false);
      });
  };

  useEffect(() => {
    try {
      /**
       * Get Ticket Detail
       * */
      getTicketDetail();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  useEffect(() => {
    initializeFields();
  }, []);

  const ComplianceDetailsDataList = [
    {
      dataLabel: "Checklist:",
      dataString:
        ticketDetails &&
        ticketDetails.checklist &&
        ticketDetails.checklist.model
          ? ticketDetails.checklist.model
          : "No Checklist",
    },
    {
      dataLabel: "Camera:",
      dataString:
        ticketDetails && ticketDetails.camera && ticketDetails.camera.camera
          ? ticketDetails.camera.camera
          : "No Camera",
    },
    {
      dataLabel: "Region:",
      dataString:
        ticketDetails && ticketDetails.region
          ? ticketDetails.region
          : "No Region",
    },
    {
      dataLabel: "City:",
      dataString:
        ticketDetails && ticketDetails.city ? ticketDetails.city : "No City",
    },
    {
      dataLabel: "Location:",
      dataString:
        ticketDetails && ticketDetails.location
          ? ticketDetails.location
          : "No Location",
    },
    {
      dataLabel: "Time:",
      dataString:
        ticketDetails && ticketDetails.created_at
          ? ticketDetails.created_at
          : "-",
    },
  ];

  const ComplianceAdditionalDataList = [
    {
      dataLabel: "Executives:",
      dataString:
        ticketDetails &&
        ticketDetails.executive &&
        ticketDetails.executive.length
          ? ticketDetails.executive.map((el, index) => {
              return (
                <span
                  key={index}
                  className={"fs-14 fw-400 text-primary c-pointer mb-0 mr-1"}
                >
                  {el}
                  {ticketDetails.executive.length > 1 &&
                  index !== ticketDetails.executive.length - 1
                    ? ","
                    : ""}
                </span>
              );
            })
          : "-",
    },
    {
      dataLabel: "Remark:",
      dataString:
        ticketDetails && ticketDetails.remark && ticketDetails.remark.remark
          ? ticketDetails.remark.remark
          : "No Remark",
    },
  ];
  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Compliance Details"}
          showSubTitle={false}
          breadcrumb={[
            { name: "Compliance Tracking", link: COMPLIANCE_NAVBAR },
            { name: "Compliance Details" },
          ]}
        ></PageTitle>
        <div className={"row"}>
          <div className={"col-xl-6 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 panel-fh "}>
                <BlockHeader>
                  <h5 className={"element-title-h5"}>
                    {ticketDetails && ticketDetails.title
                      ? ticketDetails.title
                      : "No Title"}
                    <p className={"mb-0 mt-1 fs-12 text-other"}>
                      {ticketDetails &&
                      ticketDetails.task &&
                      ticketDetails.task.model
                        ? ticketDetails.task.model
                        : "-"}
                    </p>
                  </h5>
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {ComplianceDetailsDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
            </BlocksComponent>
          </div>
          <div className={"col-xl-6 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 panel-fh "}>
                <BlockHeader>
                  <h6 className={"element-title-h6"}>Additional Details</h6>
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {ComplianceAdditionalDataList.map((data) => (
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
        <div className={"ticket-media-box"}>
          <div className={"row"}>
            <div className={"col-12"}>
              <div className={"sub-page-title"}>
                <h5 className={"mb-0"}>
                  Media{" "}
                  <span className={"fs-14 fw-600 text-other"}>
                    (Image &amp; Video)
                  </span>
                </h5>
              </div>
            </div>
            <div className={"col-xl-6 col-lg-6 col-md-6"}>
              <div className="img-block">
                <img
                  className="img-fluid br-4 w-100 mx-auto d-block"
                  src={
                    ticketDetails && ticketDetails.image
                      ? ticketDetails.image
                      : `No Image Found`
                  }
                  alt="img"
                />
              </div>
            </div>
            {ticketDetails &&
            ticketDetails.video &&
            ticketDetails.video !== undefined ? (
              <div className={"col-xl-6 col-lg-6 col-md-6"}>
                <div className="video-block video-bg-transparent br-4">
                  <ReactPlayer
                    className="video-popup"
                    ref={videoPlayer}
                    url={ticketDetails.video}
                    loop={true}
                    controls={true}
                    width={"100%"}
                  />
                </div>
              </div>
            ) : (
              "No video Found"
            )}
          </div>
        </div>
        <ConfirmModal
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
          }}
          onHide={() => {
            setModalVisibility(false);
            setAction("");
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComplianceDetailsComponent);
