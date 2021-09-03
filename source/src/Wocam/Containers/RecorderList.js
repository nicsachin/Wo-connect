import React from "react";
import RecorderListComponent from "../Components/RecorderListComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const Recorder = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`NVR | Wobot.ai`}</title>
      </Helmet>
      <RecorderListComponent />
    </Layout>
  );
};

export default Recorder;
