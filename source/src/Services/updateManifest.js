import { API_BASE_URL } from "../Constants";
import { getHeaders } from "./getHeaders";
import { store } from "../Store";
import { ADDUSERDATA } from "../Store/constants";
import { showAlert } from "./showAlert";

const logic = () => {
  return fetch(`${API_BASE_URL}/manifest`, { headers: getHeaders() })
    .then((res) => res.json())
    .then((res) => {
      if (res.data) {
        store.dispatch({
          type: ADDUSERDATA,
          value: res.data,
        });
      }
    })
    .catch((e) => {
      showAlert(e, "error");
    });
};
export default logic;
