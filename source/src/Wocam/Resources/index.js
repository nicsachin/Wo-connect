export const CameraError = {
  camera: "Please enter the camera name",
  manufacturer: "Please select a manufacturer ",
  ip: "Please enter the IP address",
  port: "Please enter the port",
  username: "Please enter the username",
  password: "Please enter the password",
  channelId: "Please enter the channel ID",
  region: "Please select a city",
  branch: "Please select a location",
  rtsp: "Please enter the RTSP URL",
  invalidIp: "Please check the IP address",
  invalidRTSP: "RTSP URL is invalid",
  cameraOfflineAlertDuration: "You cannot enter a duration less than 5 minutes",
  email: "Please enter a email",
};

export const dvrError = {
  dvr: "Please enter the NVR name",
  manufacturer: "Please select a manufacturer",
  ip: "Please enter the IP address",
  port: "Please enter the port",
  username: "Please enter the username",
  password: "Please enter the password",
  channels: "Please select the channel count",
  region: "Please select a city",
  branch: "Please select a location",
  invalidIp: "Please check the IP address",

  cameraOfflineAlertDuration: "You cannot enter a duration less than 5 minutes",
  email: "Please enter a email",
};

export const cameraFetchLabel = {
  4: "It generally takes less than 30 seconds to fetch cameras from a 4 channels  NVR",
  8: "It generally takes less than 1 minute to fetch cameras from a 8 channels  NVR",
  16: "It generally takes less than 2 minutes  to fetch cameras from a 16 channels  NVR",
  32: "It generally takes less than 3 minutes  to fetch cameras from a 32 channels  NVR",
  64: "It generally takes less than 5 minutes  to fetch cameras from a 64 channels  NVR",
  defaultLabel: "",
};
export const getFetchCameraLoadingLabel = (channels) => {
  try {
    return cameraFetchLabel[parseInt(channels)];
  } catch (e) {
    console.log("ERROR_IN_REFETCHCAMERA_LOADER_LABEL", e);
    return cameraFetchLabel.defaultLabel;
  }
};
