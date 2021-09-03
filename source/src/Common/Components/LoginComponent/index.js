import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { SIGNUP } from "../../../Constants";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import {
  addDeviceInfoToStoreAction,
  addUserDataToStoreAction,
  changeActiveSidebarAction,
} from "../../../Store/actions";
import { IconView } from "../IconsComponent/Index";
import IconViewHide from "../IconsComponent/IconViewHide";
import { validateEmpty } from "../../../Services/validation";
import RotateBlock from "../Molecule/RotateBlock";
import CenterBlock from "../Molecule/Block/CenterBlock";
import getQueryVariable from "../../../Services/getQueryVariable";
import Service from "../../../Services/Service";
const electron = window.require('electron');
const LoginComponent = (props) => {
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);

  window.hsConversationsSettings = {
    loadImmediately: false,
  };

  /**
   * Password Show/Hide
   */
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <RotateBlock showAuthBoxFw={false} showAuthBox={true}>
      <Helmet>
        <title>{`Login | Wobot.ai`}</title>
        <meta name="description" content="Log in to your Wobot account" />
      </Helmet>
      <CenterBlock
        showWobotIcon={true}
        showAuthBottomLink={true}
        showAuthBottomNav={true}
        authBottomText="New here?"
        authBottomLink={SIGNUP}
        authBottomLinkText="Create an account"
      >
        <div className={"auth-content"}>
          <h3 className={"auth-title"}>Sign in to your account</h3>
          <form
            className={"auth-form-block"}
            action=""
            onSubmit={(event) => {



              event.preventDefault();
              Service.login({
                isDemoAccount: false,
                username,
                password,
                history: history,
              });
            }}
          >
            <div className={"form-group"}>
              <label htmlFor="inputAddress" className="form-label">
                Email/username
              </label>
              <input
                type="text"
                name="username"
                tabIndex={1}
                className={`form-control ${isEmailInvalid ? "error-red" : ""}`}
                placeholder="e.g. john@example.com"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsEmailInvalid(validateEmpty(e.target.value));
                }}
              />
            </div>
            <div className={"form-group"}>
              <div className="d-flex justify-content-between">
                <label htmlFor="inputAddress" className="form-label">
                  Password
                </label>


                <span className="small">
                  <Link to="/forgot">Forgot Password?</Link>
                </span>
              </div>
              <div className="p-relative">
                <input
                  type={passwordShown ? "text" : "password"}
                  name="password"
                  tabIndex={2}
                  className="form-control mb-0"
                  placeholder="e.g. ••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                />
                <span className="pwd" onClick={togglePasswordVisiblity}>
                  {passwordShown ? <IconView /> : <IconViewHide />}
                </span>
              </div>
            </div>
            <button
              type={"submit"}
              tabIndex={3}
              className="btn btn-block btn-primary btn-xl mt-3"
            >
              {getQueryVariable("demo") === "true"
                ? "Log In to your demo account"
                : "Log In"}
            </button>


            <button type={"btn btn-primary"}
                    className="btn btn-block btn-primary btn-xl mt-3"
                    onClick={()=>{

                      //fire events to electron
                      electron.ipcRenderer.send("shoot");

                      electron.ipcRenderer.on("response" , (res , args)=>{
                        console.log("response is"  , args)
                      })

            }}>upload file</button>
          </form>
        </div>
      </CenterBlock>
    </RotateBlock>
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
    addDeviceInfo: (data) => {
      dispatch(addDeviceInfoToStoreAction(data));
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
