import React from "react";
import CameraDetailsComponent from "../Components/CameraListComponent/CameraDetailsComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const CameraDetails = (props) => {
  return (
    <Layout>
      <Helmet>
        <title>{`Camera Details | Wobot.ai`}</title>
        <meta
          name="description"
          content="Check details about a specific camera. "
        />
      </Helmet>

      <CameraDetailsComponent cameraId={props.match.params.cameraId} />
    </Layout>
  );
};

export default CameraDetails;
