import React from "react";
import ViewsComponent from "../Components/ViewsComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const Views = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Live View | Wobot.ai`}</title>
        <meta name="description" content="Monitor tasks in real-time." />
      </Helmet>
      <ViewsComponent />
    </Layout>
  );
};

export default Views;
