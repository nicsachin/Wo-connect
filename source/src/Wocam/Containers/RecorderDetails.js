import React from "react";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";
import RecorderDetailsComponent from "../Components/RecorderListComponent/RecorderDetailsComponent";

const RecorderDetails = (props) => {
  return (
    <Layout>
      <Helmet>
        <title>{`NVR Details | Wobot.ai`}</title>
        <meta
          name="description"
          content="View Information related to your NVR."
        />
      </Helmet>

      <RecorderDetailsComponent recorderId={props.match.params.recorderId} />
    </Layout>
  );
};

export default RecorderDetails;
