import { store } from "../Store";

export const getHeaders = () => {
  const props = store.getState();

  return {
    "Content-Type": `application/json`,
    tz: `${
      props && props.deviceInfo && props.deviceInfo.timeZone
        ? props.deviceInfo.timeZone
        : ""
    }`,
    "device-id": `${
      props && props.deviceInfo && props.deviceInfo.deviceId
        ? props.deviceInfo.deviceId
        : ""
    }`,
    "device-type": `${
      props && props.deviceInfo && props.deviceInfo.deviceType
        ? props.deviceInfo.deviceType
        : ""
    }`,
    device: `${
      props && props.deviceInfo && props.deviceInfo.name
        ? props.deviceInfo.name
        : ""
    }`,
    token: `${
      props && props.userData && props.userData.token
        ? props.userData.token
        : ""
    }`,
  };
};
