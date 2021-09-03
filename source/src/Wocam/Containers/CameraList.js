import React from "react";
import CameraListComponent from "../Components/CameraListComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const Camera = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Camera List | Wobot.ai`}</title>
        <meta name="description" content="List of all your cameras." />
      </Helmet>
      <CameraListComponent />
    </Layout>
  );
};

export default Camera;
