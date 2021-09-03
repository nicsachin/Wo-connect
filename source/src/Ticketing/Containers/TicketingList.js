import React from "react";
import TicketingListComponent from "../Components/TicketingListComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const TicketingList = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Tickets | Wobot.ai`}</title>
        <meta
          name="description"
          content="View all your raised and closed tickets."
        />
      </Helmet>
      <TicketingListComponent />
    </Layout>
  );
};

export default TicketingList;
