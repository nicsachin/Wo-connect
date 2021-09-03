import React from "react";
import PlaybackComponent from "../Components/PlaybackComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const Playback = (props) => {
  return (
    <Layout>
      <Helmet>
        <title>{`Playback | Wobot.ai`}</title>
        <meta
          name="description"
          content="View all your recorded camera videos."
        />
      </Helmet>
      <PlaybackComponent
        selectedCamera={
          props.location && props.location.camera ? props.location.camera : null
        }
      />
    </Layout>
  );
};

export default Playback;
