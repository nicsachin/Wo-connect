import React, { useCallback, useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { API_BASE_URL, EMPLOYEE } from "../../../../Constants";
import { Link, useHistory } from "react-router-dom";
import "./style.scss";
import BlockComponent from "../../../../Common/Components/Molecule/Block";
import PageTitle from "../../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../../Common/Components/Molecule/ActionBlock";
import BlockHeader from "../../../../Common/Components/Molecule/Block/BlockHeader";
import HeaderLinks from "../../../../Common/Components/Molecule/Atoms/HeaderLinks";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";
const Details = (props) => {
  const [subscriptionDetails, setSubscriptionDetails] = useState("");

  const getSubscriptionDetail = async () => {
    try {
      let response = await callApi(`${API_BASE_URL}/running/plan/get`, {
        method: "GET",
      });
      if (response.status === 200) {
        setSubscriptionDetails(response.data);
      }
    } catch (e) {
      showAlert(e, "error");
    }
  };

  useEffect(() => {
    getSubscriptionDetail();
  }, []);

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Settings"}
          showSubTitle={false}
          showHeaderLink={true}
          headerLink={<HeaderLinks />}
          breadcrumb={[
            { name: "Settings", link: EMPLOYEE },
            { name: "Subscription Details" },
          ]}
        ></PageTitle>
        <HeaderLinks
          showSubTitle={true}
          subTitle={
            <p>
              Get all information regarding your on-going subscription plan. You
              can view total number of added cameras and checklists.
            </p>
          }
        />
        <div className={"row"}>
          <div className={"col-xl-7 col-lg-7 col-md-7 plans-block"}>
            <BlockComponent>
              {subscriptionDetails && subscriptionDetails.plans
                ? subscriptionDetails.plans.map((el) =>
                    el.used !== null ? (
                      <div className={"element-section mb-6"}>
                        <BlockHeader>
                          <div>
                            <h6 className={"element-title-h6 mb-2"}>
                              {el.particular ? el.particular : ""}
                            </h6>
                            <p className={"text-primary mb-0"}>
                              {el.description ? el.description : ""}
                            </p>
                          </div>
                        </BlockHeader>
                        <div className={"progress-bar"}>
                          <ProgressBar
                            max={el.limit ? el.limit : 0}
                            min={0}
                            now={el.used ? el.used : 0}
                          />
                        </div>
                        <div className={"d-flex justify-content-end mt-2"}>
                          {/* <span className={"text-other fs-12 fw-500"}>
                            Used: {el.used ? el.used : 0}
                          </span> */}
                          <span className={"text-other fs-12 fw-500"}>
                            Included:{" "}
                            {el.limit && el.used
                              ? el.limit === -1
                                ? el.used + "/Unlimited"
                                : el.used + "/" + el.limit
                              : 0 / 0}
                          </span>
                        </div>
                      </div>
                    ) : (
                      ""
                    )
                  )
                : ""}
            </BlockComponent>
          </div>
          <div className={"col-xl-5 col-lg-5 col-md-5 plans-block"}>
            <BlockComponent>
              <div className={"element-section mb-0"}>
                <BlockHeader>
                  <h6 className={"element-title-h6 fw-700 mb-0"}>
                    Current Plan
                    <p className={"fs-16 fw-500 primary-color mb-0"}>
                      {subscriptionDetails?.planName}
                    </p>
                    {/* <p className={"fs-16 primary-color mb-0"}>{subscriptionDetails && subscriptionDetails.planName ? subscriptionDetails.planName : ""}</p> */}
                  </h6>
                </BlockHeader>
                <div className={"plan-meta-list"}>
                  <p className={"fs-14 fw-400 mb-2 text-other"}>
                    Included in your plan
                  </p>
                  <ul>
                    {subscriptionDetails && subscriptionDetails.plans
                      ? subscriptionDetails.plans.map((el) => (
                          <li className={"list-data-group"}>
                            <p className={"mb-1 fw-500"}>
                              {/* {el.limit ? el.limit : 0}{" "} */}
                              {el.limit
                                ? el.limit === -1
                                  ? "Unlimited"
                                  : el.limit
                                : 0}{" "}
                              {el.particular ? el.particular : ""}
                            </p>
                            <span className={"fs-14 fw-400 text-other"}>
                              {el.brief ? el.brief : ""}
                            </span>
                          </li>
                        ))
                      : ""}
                  </ul>
                </div>
              </div>
            </BlockComponent>
            <BlockComponent>
              <div className={"element-section d-flex mb-0"}>
                <div className={"img-wrap"}>
                  <img
                    className="img-fluid mx-auto d-block"
                    src={`/assets/images/img-sub-01.svg`}
                    alt="img"
                  />
                </div>
                <div className={"content-wrap ml-5"}>
                  <p className={"fw-500"}>Need more from Wobot ?</p>
                  <p className={"fw-400 text-other"}>
                    For the next 14-days, try our business-plan for free.
                  </p>
                  <a href="mailto:support@wobot.ai">
                    <button className={"btn btn-primary btn-sm"}>
                      Contact Sales
                    </button>
                  </a>
                </div>
              </div>
            </BlockComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
