import React from "react";
import ListComponent from "../Components/ListComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const List = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Checklist | Wobot.ai`}</title>
      </Helmet>
      <ListComponent />
    </Layout>
  );
};

export default List;
