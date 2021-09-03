import React from "react";
import TaskListComponent from "../Components/TaskComponents/TaskListComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const TaskList = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Task List | Wobot.ai`}</title>
      </Helmet>
      <TaskListComponent />
    </Layout>
  );
};

export default TaskList;
