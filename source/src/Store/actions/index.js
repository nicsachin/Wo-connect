import {
  TOGGLE_NAVBAR,
  ADDDEVICEINFO,
  ADDUSERDATA,
  UPDATE_DETAILS,
  CHANGE_ACTIVE_SIDEBAR,
  TOGGLE_LOADER,
  LOGOUT,
} from "../constants";

export const toggleNavbarAction = () => {
  return {
    type: TOGGLE_NAVBAR,
    value: null,
  };
};

export const toggleLoaderAction = (data) => {
  return {
    type: TOGGLE_LOADER,
    value: data,
  };
};

export const addUserDataToStoreAction = (data) => {
  return {
    type: ADDUSERDATA,
    value: data,
  };
};
export const addDeviceInfoToStoreAction = (data) => {
  return {
    type: ADDDEVICEINFO,
    value: data,
  };
};
export const updateCameraDetailsAction = (contact, index) => {
  return {
    type: UPDATE_DETAILS,
    contact,
    index,
  };
};
export const changeActiveSidebarAction = (data) => {
  return {
    type: CHANGE_ACTIVE_SIDEBAR,
    value: data,
  };
};

export const logoutAction = (data) => {
  return {
    type: LOGOUT,
    value: data,
  };
};
