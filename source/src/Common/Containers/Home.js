import React from "react";
import HomeComponent from "../Components/HomeComponent";
import Layout from "./_layouts/Home";
import Helmet from "react-helmet";
const Home = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Home - Wobot.ai`}</title>
      </Helmet>
      <HomeComponent />
    </Layout>
  );
};

export default Home;
