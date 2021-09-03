import React from "react";
//import IssuesComponent from "../Components/IssuesComponent";
import Layout from "../../Common/Containers/_layouts/Home";
import TatComponent from "../Components/TatComponent";
import Helmet from "react-helmet";
const Tat = () => {
  return (
    <Layout>
      <Helmet>
        <title>{`Wobot | TAT`}</title>
      </Helmet>
      <TatComponent />
    </Layout>
  );
};

export default Tat;
