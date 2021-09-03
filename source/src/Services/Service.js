import callApi from "./callApi";
import {API_BASE_URL, CAMERA, HOME} from "../Constants";
import { store } from "../Store";
import { addUserDataToStoreAction } from "../Store/actions";
import { Cookies } from "react-cookie";
import getTokenFromHubSpot from "./getTokenFromHubSpot";
import { showAlert } from "./showAlert";

let demoAccountCredentials = {
  username: "demo@wobot.ai",
  password: "Demo@123",
};
// let demoAccountCredentials = {
//   username: "sachin.sharma@wobot.ai",
//   password: "Helloworld@123",
// };

class Service {
  static isOnline() {
    return navigator.onLine;
  }

  // config = {isDemoAccount : bool , username : "" , password : "" , history : func  }
  static async login(config) {
    const { userData } = store.getState();
    try {
      // creating payload for login
      let apiPayload = {
        username: config.isDemoAccount
          ? demoAccountCredentials.username
          : config.username,
        password: config.isDemoAccount
          ? demoAccountCredentials.password
          : config.password,
      };

      let loginResponse = await callApi(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          body: JSON.stringify(apiPayload),
        },
        { showLoader: true, callManifest: false, loaderLabel: "" }
      );
      if (loginResponse.status === 200) {
        store.dispatch(addUserDataToStoreAction(loginResponse.data));

        if (process.env.REACT_APP_ENVIRONMENT === "app") {
          // if (ManifestService.userIsAdmin()) {
          const cookie = new Cookies();
          if (cookie && cookie.get("token")) {
            if (userData && userData.user && userData.user.email) {
              window.hsConversationsSettings = {
                identificationEmail: userData.user.email,
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
        // identified user using segment
        if (
          loginResponse?.data?.user &&
          Object.keys(loginResponse.data).length &&
          loginResponse.data.user.email &&
          loginResponse.data.user._id &&
          loginResponse.data.user.role &&
          loginResponse.data.user.role !== "Account Manager" &&
          Object.keys(loginResponse.data.user).length &&
          loginResponse.data.manifest?.company &&
          loginResponse.data.manifest.company.name &&
          loginResponse.data.manifest.created_at &&
          loginResponse.data.manifest._id
        ) {
          window.analytics.identify(loginResponse.data.user._id, {
            name: loginResponse.data.user.name,
            email: loginResponse.data.user.email,
            username: loginResponse.data.user.username,
            mobile: loginResponse.data.user.mobile,
            role: loginResponse.data.user.role,
            company: {
              id: loginResponse.data.manifest._id,
              name: loginResponse.data.manifest.company.name,
              email: loginResponse.data.manifest.company.email,
              isDemo: loginResponse.data.manifest.company.demo,
              test: loginResponse.data.manifest.company.test,
              mobile: loginResponse.data.user.mobile,
              signed_up_at: loginResponse.data.manifest.created_at,
            },
          });
        }
        config.history.push(CAMERA);
      }
      if (!config.isDemoAccount) showAlert(loginResponse.message);
    } catch (e) {
      showAlert(e, "error");
    }
  }
}

export default Service;
