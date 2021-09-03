import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import LocationComponent from "../Components/LocationComponent";
import Helmet from "react-helmet";

const Location = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Location | Wobot.ai`}</title>
        <meta
          name="description"
          content="A list of all your business locations."
        />
      </Helmet>
      <LocationComponent />
    </Layout>
  );
};

export default Location;
