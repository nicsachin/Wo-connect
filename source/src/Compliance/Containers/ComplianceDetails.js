import React from "react";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";
import ComplianceDetailsComponent from "../Components/ComplianceDetailsComponent";

const TicketingDetails = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Compliance Details | Wobot.ai`}</title>
      </Helmet>
      <ComplianceDetailsComponent />
    </Layout>
  );
};

export default TicketingDetails;
