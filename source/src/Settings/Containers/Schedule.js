import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import ScheduleComponent from "../Components/ScheduleComponent";
import Helmet from "react-helmet";
const Schedule = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Schedule | Wobot.ai`}</title>
        <meta
          name="description"
          content="A list of all your monitoring schedules."
        />
      </Helmet>
      <ScheduleComponent />
    </Layout>
  );
};

export default Schedule;
