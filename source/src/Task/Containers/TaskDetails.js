import React from "react";
import TaskDetailsComponent from "../Components/TaskComponents/TaskDetailsComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const TaskDetails = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Task Details | Wobot.ai`}</title>
      </Helmet>
      <TaskDetailsComponent />
    </Layout>
  );
};

export default TaskDetails;
