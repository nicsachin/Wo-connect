import { API_BASE_URL } from "../../../Constants";
import callApi from "../../../Services/callApi";
import updateManifest from "../../../Services/updateManifest";
import { showAlert } from "../../../Services/showAlert";
import { store } from "../../../Store";

const handleOnboardingTrackAPICall = (path) => {
  try {
    return callApi(`${API_BASE_URL}/onboard`, {
      method: "POST",
      body: JSON.stringify({
        onboarded: path,
      }),
    }).then((res) => {
      if (res.status) {
        if (store.getState().userData)
          updateManifest().then((d) => {
            console.log("updated");
          });
      }
    });
  } catch (e) {
    showAlert(e, "error");
    return new Promise((resolve) => {
      resolve(false);
    });
  }
};

export default handleOnboardingTrackAPICall;
