import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import EmployeeComponent from "../Components/EmployeeComponent";
import Helmet from "react-helmet";

const Employee = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Employee List | Wobot.ai`}</title>
        <meta
          name="description"
          content="Add a user you wish to collaborate with, and optimize your work-load."
        />
      </Helmet>

      <EmployeeComponent />
    </Layout>
  );
};

export default Employee;
