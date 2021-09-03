import React, { useEffect } from "react";
import { DEMO_URL, LOGIN } from "../../../Constants";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Service from "../../../Services/Service";

function Base(props) {
  const history = useHistory();
  useEffect(() => {
    if (props.deviceInfo) {
      if (
        window.location.origin === DEMO_URL &&
        (props.userData === null || Object.keys(props.userData).length === 0)
      ) {
        Service.login({ isDemoAccount: true, history });
      } else history.push(LOGIN);
    }
  }, [props.deviceInfo]);

  return <div></div>;
}

const mapStateToProps = (state) => {
  return state;
};
export default connect(mapStateToProps, null)(Base);
