import React from "react";
import Layout from "../../Common/Containers/_layouts/Home";
import MyTaskListComponent from "../Components/MyTaskListComponent";
import Helmet from "react-helmet";

const MyTaskList = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`My Tasks | Wobot.ai `}</title>
        <meta
          name="description"
          content="Find all your ongoing and scheduled tasks."
        />
      </Helmet>
      <MyTaskListComponent />
    </Layout>
  );
};

export default MyTaskList;
