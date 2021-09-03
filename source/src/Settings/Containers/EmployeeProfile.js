import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import EmployeeProfileComponent from "../Components/EmployeeProfileComponent";
import Helmet from "react-helmet";

const EmployeeProfile = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Employee Profile | Wobot.ai`}</title>
      </Helmet>

      <EmployeeProfileComponent />
    </Layout>
  );
};

export default EmployeeProfile;
