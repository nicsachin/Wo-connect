import React from "react";
import AddCompanyComponent from "../Components/SignupComponent/AddCompanyComponent";

const AddCompany = (props) => {
  return (
    <AddCompanyComponent
      credentials={
        props.location && props.location.credentials
          ? props.location.credentials
          : {}
      }
    />
  );
};

export default AddCompany;
