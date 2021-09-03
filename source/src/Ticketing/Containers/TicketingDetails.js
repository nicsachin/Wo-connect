import React from "react";
import TicketingDetailsComponent from "../Components/TicketingDetailsComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const TicketingDetails = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Ticketing Details | Wobot.ai`}</title>
        <meta
          name="description"
          content="All essential information regarding your ticket."
        />
      </Helmet>
      <TicketingDetailsComponent />
    </Layout>
  );
};

export default TicketingDetails;
