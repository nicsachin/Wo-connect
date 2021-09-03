import React from "react";
import { connect, useSelector } from "react-redux";
import {
  changeActiveSidebarAction,
  toggleNavbarAction,
} from "../../../../Store/actions";
import SidebarCollapse from "./SidebarCollapse";

import "./aside-style.scss";

const Sidebar = (props) => {
  const isNavbarVisible = useSelector((state) => state.navbar);

  return (
    <nav id="sidebar-fixed" className={!isNavbarVisible ? "active" : ""}>
      {/* <Scrollbars style={{ width: "100%", height: "100%" }}> */}

      {/* Collapse ON*/}
      <SidebarCollapse />

      {/* </Scrollbars> */}
    </nav>
  );
};
const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarComponent: () => {
      dispatch(toggleNavbarAction());
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
