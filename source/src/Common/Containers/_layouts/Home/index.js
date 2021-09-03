import React from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { useSelector, connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toggleNavbarAction } from "../../../../Store/actions";
import MobileMaintenanceComponent from "../../../Components/ErrorPagesComponents/MobileMaintenance";

const Home = (props) => {
  const isNavbarVisible = useSelector((state) => state.navbar);

  return (
    <>
      <div className="wrapper">
        <Sidebar />

        <div id="content" className={!isNavbarVisible ? "active" : ""}>
          <Header />
          {props.children}
        </div>
        <div
          className={!isNavbarVisible ? "overlay" : ""}
          onClick={() => {
            props.toggleNavbarComponent();
          }}
        ></div>
      </div>
    </>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarComponent: () => {
      dispatch(toggleNavbarAction());
    },
  };
};

export default connect(null, mapDispatchToProps)(withRouter(Home));
