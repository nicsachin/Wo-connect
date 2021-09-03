import React from "react";
import HomeComponent from "../Components/HomeComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import Helmet from "react-helmet";

const Home = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Checklist | Wobot.ai`}</title>
        <meta
          name="description"
          content="Add relevant checklists related to your business."
        />
      </Helmet>
      <HomeComponent />
    </Layout>
  );
};

export default Home;
