import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import SubRegionComponent from "../Components/SubRegionComponent";
import Helmet from "react-helmet";
const Region = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Cities | Wobot.ai`}</title>
        <meta
          name="description"
          content="Add a city where your business belongs"
        />
      </Helmet>
      <SubRegionComponent />
    </Layout>
  );
};

export default Region;
