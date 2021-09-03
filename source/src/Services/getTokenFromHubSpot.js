import React from "react";
import { API_BASE_URL } from "../Constants";
import { store } from "../Store";
import callApi from "./callApi";
import { Cookies } from "react-cookie";

const getTokenFromHubSpot = async () => {
  const { userData } = store.getState();
  const cookie = new Cookies();
  if (
    userData &&
    userData.user &&
    userData.user.email &&
    userData.user.name &&
    userData.user._id &&
    userData.manifest &&
    userData.manifest.company &&
    userData.manifest.company.name &&
    userData.manifest.company.email &&
    userData.manifest.company.industries &&
    userData.manifest.company.industries.length &&
    userData.manifest.company.noOfLocations &&
    userData.manifest._id
  ) {
    let first_Name = "";
    let last_Name = "";
    if (userData.user.name.split(" ").length === 1) {
      first_Name = userData.user.name;
      //console.log("firstname >",userData.user.name);
    } else {
      first_Name = userData.user.name.substr(
        0,
        userData.user.name.indexOf(" ")
      );
      last_Name = userData.user.name.substr(
        userData.user.name.indexOf(" ") + 1
      );
    }
    await callApi(`${API_BASE_URL}/hubshot/get-token`, {
      method: "POST",
      body: JSON.stringify({
        email: userData.user.email,
        firstName: first_Name,
        lastName: last_Name,
        companyEmail: userData.manifest.company.email,
        companyName: userData.manifest.company.name,
        company_id: userData.manifest._id,
        user_id: userData.user._id,
        industry:
          userData.manifest.company.industries[0] &&
          userData.manifest.company.industries[0].industry
            ? userData.manifest.company.industries[0].industry
            : "",
        no_of_location: userData.manifest.company.noOfLocations,
      }),
    }).then((res) => {
      cookie.set("token", res.token, {
        maxAge: 3600 * 12, // Will expire after 12hr (value is in number of sec.)
      });
      window.hsConversationsSettings = {
        identificationEmail: userData.user.email,
        identificationToken: res.token,
      };

      if (window.HubSpotConversations) {
        window.HubSpotConversations.widget.load();
      }
    });
  }
};
export default getTokenFromHubSpot;
