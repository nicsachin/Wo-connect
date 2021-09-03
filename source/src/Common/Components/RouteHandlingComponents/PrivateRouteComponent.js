import {
  Redirect,
  Route,
  useHistory,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  CAMERA_DETAIL,
  CONNECTCAMERA,
  DEMO_URL,
  HOME,
  LOGIN,
} from "../../../Constants";
import { Cookies } from "react-cookie";
import getTokenFromHubSpot from "../../../Services/getTokenFromHubSpot";
import ManifestService from "../../../Services/ManifestService";
import Roles from "../../../Services/Roles";

const PrivateRouteComponent = (props) => {
  const history = useHistory();
  const { userData } = props;
  const cookie = new Cookies();
  useEffect(() => {
    //hubspot token expire after every 12 hours
    if (!userData) return "";
    if (process.env.REACT_APP_ENVIRONMENT === "app") {
      // if (ManifestService.userIsAdmin()) {
      const cookie = new Cookies();
      if (cookie && cookie.get("token")) {
        if (
          props &&
          props.userData &&
          props.userData.user &&
          props.userData.user.email
        ) {
          window.hsConversationsSettings = {
            identificationEmail: props.userData.user.email,
            identificationToken: cookie.get("token"),
          };
          if (window.HubSpotConversations) {
            window.HubSpotConversations.widget.load();
          }
        }
      } else {
        getTokenFromHubSpot();
      }
      // }
    }
  }, [cookie.get("token")]);

  useEffect(() => {
    return history.listen((location) => {
      // console.log(
      //   `You changed the page to: ${location.pathname}`,
      //   document.title
      // );
      if (window.analytics) {
        window.analytics.page(location.pathname, {
          title: document.title,
          path: location.pathname,
        });
      }
    });
  }, [history]);

  if (userData) {
    // if(Roles.authenticateRoutes(prop))
    if (Roles.authenticateRoutes(props.location.pathname))
      return <Route {...props} />;
    else return <Redirect to={HOME} />;
  } else {
    //if demo account
    if (window.location.origin === DEMO_URL) return <Redirect to={"/"} />;
    else return <Redirect to={LOGIN} />;
  }
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(PrivateRouteComponent);
