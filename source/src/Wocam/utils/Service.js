import callApi from "../../Services/callApi";
import { API_BASE_URL } from "../../Constants";
import { store } from "../../Store";
import { showAlert } from "../../Services/showAlert";

class Service {
  static isLastView(viewList) {
    return viewList.length === 1;
  }

  /**
   * @payload
   * camerasData = [camerasIDs]
   *
   *
   * */
  static async checkAndCreateLiveView(camerasData) {
    const { userData } = store.getState();

    if (userData?.user) {
      let viewList = await callApi(
        `${API_BASE_URL}/livestream/view/get?email=${userData.user.email}&company=${userData.manifest._id}`
      );
      if (!viewList.data.length) {
        let apiData = {
          editMode: false,
          name: "SAMPLE_VIEW",
          default: true,
          cameras: camerasData,
        };
        await callApi(`${API_BASE_URL}/livestream/view/create`, {
          method: "POST",
          body: JSON.stringify(apiData),
        });
      }
    }
  }

  static getEmailFromManifest() {
    const { userData } = store.getState();
    if (userData?.user?.email) return userData.user.email;
    else return "";
  }

  static copyToClipboard(text, successMessage = "Copied to clipboard") {
    let input = document.createElement("textarea");
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showAlert(successMessage);
  }

  //check if camera offline alert is less than 0 or in decimal
  static validateCameraOfflineAlert(num) {
    return num > 0 && num % 1 === 0;
  }

  //trim user inputs
  static trimPayload(obj) {
    try {
      let payload = {};
      for (let key in obj) {
        if (typeof obj[key] === "string") payload[key] = obj[key].trim();
        else payload[key] = obj[key];
      }
      return payload;
    } catch (e) {
      console.log("error occured while preparing payload", e);
    }
  }
}

export default Service;
