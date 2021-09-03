import React, { useEffect } from "react";
import { Cookies } from "react-cookie";
import { API_BASE_URL, LOGIN } from "../../Constants";
import callApi from "../../Services/callApi";
import { showAlert } from "../../Services/showAlert";
import { logoutAction, toggleNavbarAction } from "../../Store/actions";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

const LogoutComponent = (props) => {
  const history = useHistory();

  const logout = async () => {
    await callApi(
      `${API_BASE_URL}/logout`,
      { method: "POST" },
      {
        callManifest: false,
        showLoader: true,
        loaderLabel: "Logging you out",
      }
    )
      .then((res) => {
        if (res.status === 200) {
          props.logout();
          const cookie = new Cookies();
          cookie.remove("token");
          history.push(LOGIN);
        }
      })
      .catch((e) => {
        console.log("ERROR_IN_LOGOUT : ", e);
        props.logout();
        history.push(LOGIN);
      });
  };

  useEffect(() => {
    if (props.userData && !!Object.keys(props.userData).length) logout();
    else history.push(LOGIN);
  }, []);

  return <></>;
};

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(logoutAction());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LogoutComponent);
