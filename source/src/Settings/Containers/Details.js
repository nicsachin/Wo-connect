import React from "react";
import Layout from "../../Common/Containers/_layouts/Home";
import SubscriptionDetails from "../Components/SubscriptionComponent/Details";
import Helmet from "react-helmet";
const Details = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Subscription | Wobot.ai`}</title>
      </Helmet>
      <SubscriptionDetails />
    </Layout>
  );
};

export default Details;
