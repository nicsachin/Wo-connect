import React from "react";
import { Link, useHistory } from "react-router-dom";
import "../style.scss";
import Helmet from "react-helmet";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL, HOME } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import {
  addUserDataToStoreAction,
  changeActiveSidebarAction,
} from "../../../../Store/actions";
import { connect } from "react-redux";
import RotateBlock from "../../Molecule/RotateBlock";
import CenterBlock from "../../Molecule/Block/CenterBlock";

const SuccessComponent = (props) => {
  const history = useHistory();

  const loginUser = async () => {
    /**
     * user login
     * */
    try {
      let loginResponse = await callApi(`${API_BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify({
          username: props.user.username,
          password: props.user.password,
        }),
      });
      if (loginResponse.status === 200) {
        props.addUserDataToStore(loginResponse.data);

        // identified user using segment
        if (
          loginResponse &&
          loginResponse.data &&
          Object.keys(loginResponse.data).length &&
          loginResponse.data.user &&
          Object.keys(loginResponse.data.user).length &&
          loginResponse.data.user.role &&
          loginResponse.data.user.role !== "Account Manager"
        ) {
          window.analytics.identify(loginResponse.data.user._id, {
            name: loginResponse.data.user.name,
            email: loginResponse.data.user.email,
            username: loginResponse.data.user.username,
            mobile: loginResponse.data.user.mobile,
          });
        }
        history.push(HOME);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  return (
    <RotateBlock showAuthBoxFw={false} showAuthBox={true}>
      <Helmet>
        <title>{`Success - Wobot.ai `}</title>
      </Helmet>
      <CenterBlock
        showWobotIcon={false}
        showAuthBottomLink={false}
        showAuthBottomNav={true}
      >
        <div className={"auth-content"}>
          <div className={"auth-form-block"}>
            <img
              src={`/assets/images/success.svg`}
              className="big-img img-fluid d-block mx-auto notify-message-img"
              alt="login"
            />
          </div>
          <h3 className={"auth-title mb-3"}>Congratulations!</h3>
          <p className={" mb-4"}>Your account password has been changed.</p>
          <Link to="/login" className="btn btn-block btn-primary btn-xl mt-5">
            Return to sign in
          </Link>
        </div>
      </CenterBlock>
    </RotateBlock>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(null, mapDispatchToProps)(SuccessComponent);
