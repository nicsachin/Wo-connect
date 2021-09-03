import { Redirect, Route } from "react-router-dom";
import React from "react";
import { connect } from "react-redux";
import {CAMERA} from "../../../Constants";

const LoginRoutesComponent = (props) => {
  const { userData } = props;

  if (userData && !!Object.keys(userData).length)
    return <Redirect to={CAMERA} />;
  else return <Route {...props} />;
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(LoginRoutesComponent);
