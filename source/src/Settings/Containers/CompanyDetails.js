import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import CompanyDetailsComponent from "../Components/CompanyDetailsComponent";
import Helmet from "react-helmet";

const CompanyDetails = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Company Details | Wobot.ai`}</title>
        <meta
          name="description"
          content="Find all details related to your company here."
        />
      </Helmet>

      <CompanyDetailsComponent />
    </Layout>
  );
};

export default CompanyDetails;
