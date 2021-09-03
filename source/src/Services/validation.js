import { isPossiblePhoneNumber } from "react-phone-number-input";

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !re.test(email);
};

const validateMobile = (mobile) => {
  const mob = isPossiblePhoneNumber(mobile);
  // const mob = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  // return !mob.test(mobile);
  return !mob;
};

const validatePassword = (password) => {
  return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/);
};

const validateIPaddress = (inputText) => {
  const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipformat.test(inputText);
};

const validateEmpty = (value) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
};

const validateDropDown = (option) => {
  return !(option && option.length);
};

const validateRTSPUrl = (str_url) => {
  const url = /(rtsp):\/\/(?:([^\s@\/]+)@)?([^\s\/:]+)(?::([0-9]+))?(?:\/(.*))?/;

  return url.test(str_url);
};
export {
  validateRTSPUrl,
  validateEmail,
  validateIPaddress,
  validatePassword,
  validateEmpty,
  validateDropDown,
  validateMobile,
};
