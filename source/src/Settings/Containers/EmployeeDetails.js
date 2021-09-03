import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import EmployeeDetailsComponent from "../Components/EmployeeComponent/EmployeeDetailsComponent";
import Helmet from "react-helmet";

const EmployeeDetails = (props) => {
  return (
    <Layout>
      <Helmet>
        <title>{`Employee Details | Wobot.ai`}</title>
        <meta
          name="description"
          content="Information related to this particular employee."
        />
      </Helmet>

      <EmployeeDetailsComponent employeeId={props.match.params.employeeId} />
    </Layout>
  );
};

export default EmployeeDetails;
