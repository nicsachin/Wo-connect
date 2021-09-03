import React from "react";
import SuccessComponent from "../Components/ForgotPasswordComponent/SuccessComponent";

const Success = (props) => {
  return <SuccessComponent user={props?.history?.location?.state} />;
};

export default Success;
