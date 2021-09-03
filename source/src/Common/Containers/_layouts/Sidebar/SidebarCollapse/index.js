import React, { useState } from "react";
// React router dom
import { useHistory, useLocation } from "react-router-dom";
// Redux
import { connect } from "react-redux";
// ProSidebar component import
import {
  Menu,
  MenuItem,
  ProSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SubMenu,
} from "react-pro-sidebar";
// ProSidebar style import
import "react-pro-sidebar/dist/css/styles.css";
// Store Import
import { changeActiveSidebarAction } from "../../../../../Store/actions";
// Icons Import
import { IconHelp } from "../../../../Components/IconsComponent/Index";
// Style Import
import "./style.scss";
// Constants Import
import { routes_hover } from "../../../../../Constants";
// Import Bootstrap
import { Button, Modal } from "react-bootstrap";
import Roles from "../../../../../Services/Roles";

const SidebarCollapse = (props) => {
  const history = useHistory();

  const location = useLocation();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const getActiveStatus = (link) => {
    return location.pathname === link;
  };

  const getSubMenuActiveClass = (name) => {
    return location.pathname.indexOf(name) !== -1 ? "active" : "";
  };

  function renderMenuItems() {
    return routes_hover.map((el, index) => {
      if (el.subMenu.length && Roles.authenticateTabs(el.name)) {
        return (
          <SubMenu
            className={getSubMenuActiveClass(el.name)}
            title={el.title}
            icon={el.icon}
          >
            {el.subMenu.map((item, index) => {
              if (Roles.authenticateTabs(item.name)) {
                return (
                  <MenuItem
                    onClick={() => {
                      history.push(item.link);
                    }}
                    active={getActiveStatus(item.link)}
                  >
                    <span className="mr-3 sub-icon">{item.icon}</span>
                    {item.name}
                  </MenuItem>
                );
              }
            })}
          </SubMenu>
        );
      } else {
        if (Roles.authenticateTabs(el.name))
          return (
            <MenuItem
              onClick={() => {
                history.push(el.link);
              }}
              active={getActiveStatus(el.link)}
              icon={el.icon}
            >
              {el.title}
            </MenuItem>
          );
      }
    });
  }

  return (
    <ProSidebar
      collapsed={true}
      className="sidebar-block scrollbar scroll"
      id="style-3"
    >
      <SidebarHeader className="sidebar-global">
        {/**
         *  You can add a header for the sidebar ex: logo
         */}
        <div className="header-block">
          <span>
            {/* Logo */}
            <img
              className="img-fluid mx-auto d-block sidebar-logo"
              src={`/assets/images/wobot-Icon-blue.svg`}
              alt="logo"
            />
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="sidebar-global">
        {/**
         *  You can add the content of the sidebar ex: menu, profile details, ...
         */}

        <Menu className="custom-menu" iconShape="square">
          {/* Menu List */}
          {renderMenuItems()}
        </Menu>
      </SidebarContent>
      <SidebarFooter>
        {/**
         *  You can add a footer for the sidebar ex: copyright
         */}
        <Menu>
          <MenuItem className="show-need-help" icon={<IconHelp />}>
            <span className="mr-3 sub-icon">
              <IconHelp />
            </span>
            Help
          </MenuItem>
        </Menu>
      </SidebarFooter>
      <Modal show={show} onHide={handleClose} animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className={"modal-title d-block"}>Reports & Analytics</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>You’ve found an upcoming feature! </h5>
          <p>
            This section is currently under development and will be released
            soon. You can then find the detailed reports of your tasks, tickets
            and employees.
          </p>
        </Modal.Body>
        <Modal.Footer className={"justify-content-between align-items-end"}>
          <img src={`/assets/images/modal.png`} />
          <Button
            className={"btn btn-primary px-4 btn-md"}
            onClick={handleClose}
          >
            Keep me updated
          </Button>
        </Modal.Footer>
      </Modal>
      <div class="force-overflow"></div>
    </ProSidebar>
  );
};
const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SidebarCollapse);
