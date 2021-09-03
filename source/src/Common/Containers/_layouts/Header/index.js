import React from "react";
import { Dropdown } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { toggleNavbarAction } from "../../../../Store/actions";
import {
  IconLogout,
  IconProfile,
} from "../../../Components/IconsComponent/Index";
import "./style.scss";
import {
  LOGIN,
  EMPLOYEE_PROFILE,
  DEMO_URL,
  LOGOUT,
} from "../../../../Constants";
import logout from "../../../../Services/logout";
export const HeaderComponent = (props) => {
  const history = useHistory();

  return (
    <header className="navbar header justify-content-end">
      {/* <div
        id="sidebarCollapse"
        className="aside-toggler toggler pl-0"
        onClick={() => {
          props.toggleNavbarComponent();
        }}
      >
        <span className="toggler-bar"></span>
        <span className="toggler-bar"></span>
        <span className="toggler-bar"></span>
      </div> */}

      <Dropdown>
        <Dropdown.Toggle
          variant="default bxsw-none p-0 btn-sm"
          id="dropdown-basic"
        >
          <div className="opensans-font text-right userdropdown">
            <p type="text" className="fs-11 fw-400 mb-0 lh15">
              Welcome
              <span className="username fs-12 fw-500 d-block">
                {" "}
                {props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.name
                  ? props.userData.user.name
                  : "user"}
              </span>
            </p>
          </div>
          <div className="ml-2 mr-1 user-thumb">
            <img
              width="30"
              height="30"
              className="img-fluid mx-auto d-block"
              src={
                props?.userData?.user?.displayImage ||
                `/assets/images/user_thumb.svg`
              }
              alt="logo"
            />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => {
              history.push(EMPLOYEE_PROFILE);
            }}
          >
            <IconProfile /> <span>Profile</span>
          </Dropdown.Item>
          {window.location.origin !== DEMO_URL ? (
            <Dropdown.Item
              onClick={() => {
                history.push(LOGOUT);
              }}
            >
              <IconLogout /> <span>Logout</span>
            </Dropdown.Item>
          ) : null}
        </Dropdown.Menu>
      </Dropdown>
    </header>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderComponent);
