import React, { useEffect } from "react";
import Card from "./CardComponent";
import { connect } from "react-redux";
import updateManifest from "../../../Services/updateManifest";
import { store } from "../../../Store";
import { TOGGLE_LOADER } from "../../../Store/constants";
import callApi from "../../../Services/callApi";
import { API_BASE_URL } from "../../../Constants";
import { useCookies, Cookies } from "react-cookie";
import Roles from "../../../Services/Roles";

const HomeComponent = (props) => {
  const [cookies, setCookie] = useCookies("token");
  useEffect(() => {
    if (store.getState().userData) updateManifest();
    store.dispatch({
      type: TOGGLE_LOADER,
      value: false,
    });
  }, []);

  const data = [
    {
      title: "Company",
      icon: "IconEmployee",
      details: "Basic company settings",
      caption: "Manage the company details and settings.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.employees
          ? props.userData.manifest.employees + " employees"
          : "0 employee",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.employees &&
        props.userData.manifest.employees !== 0
          ? "Manage"
          : "Setup",
      customClass: "icon-bg-lightblue",
      customBottomClass: "btn-blue-color",
      link: "/settings/employee",
      customHoverClass: "border-blue",
    },
    {
      title: "Live View",
      icon: "IconLive",
      details: "view live stream",
      caption: "Monitor your cameras with ease.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.views
          ? props.userData.manifest.views + " views"
          : "0 views",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.views &&
        props.userData.manifest.views !== 0
          ? "Manage"
          : "Setup",
      customClass: "icon-bg-lightorange",
      customBottomClass: "btn-orange-color",
      link: "/wocam/live",
      customHoverClass: "border-orange",
    },
    {
      title: "Tasks",
      icon: "IconTask",
      details: "Manage checklists & tasks",
      caption: "Setup and run tasks on your cameras according to your needs.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.tasks
          ? props.userData.manifest.tasks + " running"
          : "0 running",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.tasks &&
        props.userData.manifest.tasks !== 0
          ? "Manage"
          : "Setup",
      customClass: "icon-bg-lightpink",
      customBottomClass: "btn-pink-color",
      link: "/task/checklist",
      customHoverClass: "border-pink",
    },
    {
      title: "Ticketing",
      icon: "IconTicketing",
      details: "View the ticket alerts",
      caption: "List of violation and tickets raised in your system.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.ticketRaised
          ? props.userData.manifest.ticketRaised + " raised"
          : "0 raised",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.ticketRaised &&
        props.userData.manifest.ticketRaised !== 0
          ? "Manage"
          : "Setup",
      customClass: "icon-bg-lightgreen",
      customBottomClass: "btn-green-color",
      link: "/ticketing",
      customHoverClass: "border-green",
    },
    {
      title: "WoCam",
      icon: "IconCamera",
      details: "View and manage cameras",
      caption: "Access and manage NVRs, Cameras and more.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.camera
          ? props.userData.manifest.camera + " cameras"
          : "0 cameras",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.camera &&
        props.userData.manifest.camera !== 0
          ? "Manage"
          : "Setup",
      customClass: "icon-bg-lightpurple",
      customBottomClass: "btn-purple-color",
      link: "/wocam/camera",
      customHoverClass: "border-purple",
    },
    {
      title: "Task Tagging",
      icon: "IconTask",
      details: "Monitor videos & raise alerts.",
      caption: "View the saved videos and tag the events for tasks.",
      counter:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.taskTagged
          ? props.userData.manifest.taskTagged + " tagged"
          : "0 tagged",
      action:
        props &&
        props.userData &&
        props.userData.manifest &&
        props.userData.manifest.reports &&
        props.userData.manifest.reports !== 0
          ? "Manage"
          : "Tag",
      customClass: "icon-bg-lightyellow",
      customBottomClass: "btn-yellow-color",
      link: "/wocam/playback",
      customHoverClass: "border-yellow",
    },
  ];

  const getValidCardsForRole = () => {
    return data.filter((el) => Roles.authenticateCards(el.title));
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <div className="row mb-4">
          <div className="col-lg-6 col-md-6 col-sm-6 align-self-center">
            <div className="title">
              <h4>
                Welcome{" "}
                {props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.name
                  ? props.userData.user.name
                  : "user"}
                ,
              </h4>
              <p className="mxw-300">
                This is your home. Quickly jump to the sections from here or use
                the sidebar
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {/* Card-Block */}
          {getValidCardsForRole().map((el) => (
            <Card obj={el} />
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};
export default connect(mapStateToProps, null)(HomeComponent);
