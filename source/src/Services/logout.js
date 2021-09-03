import { Cookies } from "react-cookie";
import { API_BASE_URL, DEMO_URL, LOGIN } from "../Constants";
import { store } from "../Store";
import { LOGOUT } from "../Store/constants";
import callApi from "./callApi";
import { showAlert } from "./showAlert";

const logout = async (event) => {
  if (event && event !== undefined) {
    event.preventDefault();
  }
  try {
    if (window.location.origin === DEMO_URL) {
      return (window.location.href = "/home");
    }

    const res = await callApi(`${API_BASE_URL}/logout`, { method: "POST" });
    // if (res?.status === 200) {
    if (res) {
      /**
       * deletes everything from store
       * */
      store.dispatch({ type: LOGOUT, value: null });
      localStorage.clear();

      const cookie = new Cookies();
      cookie.remove("token");
      window.location.href = LOGIN;
    }
  } catch (e) {
    showAlert(e, "error");
  }
};

export default logout;
