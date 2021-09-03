import React from "react";
import AssignUserComponent from "../Components/ComplianceComponent/AssignUserComponent";
import SidebarProcess from "../../Common/Containers/_layouts/ProcessSidebar";
import Header from "../../Common/Containers/_layouts/Header";
import { useSelector, connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toggleNavbarAction } from "../../Store/actions";

const AssignUser = (props) => {
  const isNavbarVisible = useSelector((state) => state.navbar);
  return (
    <div className="wrapper">
      <SidebarProcess />

      <div id="content_process" className={!isNavbarVisible ? "active" : ""}>
        <Header />
        <AssignUserComponent />
      </div>
      <div
        className={!isNavbarVisible ? "overlay" : ""}
        onClick={() => {
          props.toggleNavbarComponent();
        }}
      ></div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarComponent: () => {
      dispatch(toggleNavbarAction());
    },
  };
};

export default connect(null, mapDispatchToProps)(withRouter(AssignUser));
