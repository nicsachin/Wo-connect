import logout from "./logout";
import { getHeaders } from "./getHeaders";
import { store } from "../Store";
import updateManifest from "./updateManifest";
import { TOGGLE_LOADER } from "../Store/constants";
import { Redirect, useHistory } from "react-router-dom";
import { showAlert } from "./showAlert";
import { LOGOUT, PAGE404, PAGE500 } from "../Constants";

const handleLoader = (state, label = "") => {
  store.dispatch({
    type: TOGGLE_LOADER,
    value: {
      label: label,
      value: state,
    },
  });
};

/**
 * url : http://164.52.208.210:4000/app/v1
 * data : {body : {name : "sachin" , passowrd: "123"}}
 * config : {
 *     callManifest : true ,
 *     showLoader : true ,
 *      loaderLabel : "loading from ....."
 * }
 * */

const defaultConfig = { showLoader: true, callManifest: true, loaderLabel: "" };
const callApi = (url, data, config = defaultConfig) => {
  //show loader
  handleLoader(config.showLoader, config.loaderLabel);

  //call manifest
  if (config.callManifest && store.getState().userData) updateManifest();

  return new Promise((resolve, reject) => {
    fetch(url, { headers: getHeaders(), ...data })
      .then((res) => res.json())
      .then((res) => {
        if (config.showLoader) handleLoader(false, config.loaderLabel);
        if (res.status === 200) resolve(res);
        else if (res.status === 401) {
          // logout();
          window.location.href = LOGOUT;
          reject(res.message);
        } else if (res.status === 403) {
          showAlert(res.message, "error");
        } else if (
          res.status === 500 &&
          data.method &&
          (data.method === "POST" ||
            data.method === "DELETE" ||
            data.method === "PUT")
        ) {
          showAlert(res.message, "error");
        } else if (res.status === 404) {
          window.location.href = PAGE404;
        } else if (res.status === 500 && data.method && data.method === "GET") {
          window.location.href = PAGE500;
        } else {
          // reject(`ERROR_OCCURRED : ${res.message}`);
          showAlert(res.message, "error");
        }
      })
      .catch((e) => {
        if (config.showLoader) handleLoader(false, config.loaderLabel);
        reject(`ERROR OCCURRED : ${e}`);
      });
  });
};

export default callApi;
