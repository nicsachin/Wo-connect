import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import RegionComponent from "../Components/RegionComponent";
import Helmet from "react-helmet";
const Region = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Regions | Wobot.ai`}</title>
        <meta
          name="description"
          content="Add multiple regions your business is at."
        />
      </Helmet>
      <RegionComponent />
    </Layout>
  );
};

export default Region;
