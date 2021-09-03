import React from "react";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";
import ComplianceListComponent from "../Components/ComplianceListComponent";

const TicketingList = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Compliance List | Wobot.ai`}</title>
      </Helmet>
      <ComplianceListComponent />
    </Layout>
  );
};

export default TicketingList;
