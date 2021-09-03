import React from "react";
import VerifyComponent from "../Components/ForgotPasswordComponent/VerifyComponent";

const Verify = (props) => {
  return (
    <VerifyComponent
      user={
        props &&
        props.location &&
        props.location.state &&
        props.location.state.user
          ? props.location.state.user
          : null
      }
    />
  );
};

export default Verify;
