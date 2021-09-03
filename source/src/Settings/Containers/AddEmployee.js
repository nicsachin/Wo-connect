import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import AddEmployeeComponent from "../Components/EmployeeComponent/AddEmployeeComponent";
import Helmet from "react-helmet";
const AddEmployee = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Add Employee | Wobot.ai`}</title>
        <meta
          name="description"
          content="Add a user you wish to collaborate with, and optimize your work-load."
        />
      </Helmet>
      <AddEmployeeComponent />
    </Layout>
  );
};

export default AddEmployee;
