import {
  TOGGLE_NAVBAR,
  ADDDEVICEINFO,
  ADDUSERDATA,
  UPDATE_DETAILS,
  CHANGE_ACTIVE_SIDEBAR,
  TOGGLE_LOADER,
  LOGOUT,
} from "../constants";

const initialState = {
  navbar: true,
  userData: null,
  deviceInfo: null,
  loader: { label: "", value: "false" },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LOADER: {
      return { ...state, loader: action.value };
    }
    case TOGGLE_NAVBAR:
      return { ...state, navbar: !state.navbar };
    case UPDATE_DETAILS:
      return {
        ...state,
        list: state.list.map((contact, index) =>
          index === action.index ? { ...action.contact } : contact
        ),
      };
    case ADDUSERDATA:
      return { ...state, userData: action.value };

    case ADDDEVICEINFO:
      return { ...state, deviceInfo: action.value };

    case CHANGE_ACTIVE_SIDEBAR:
      return { ...state, activeNavBar: action.value };
    case LOGOUT:
      return { ...initialState, deviceInfo: state.deviceInfo };

    default:
      return state;
  }
};

export default reducer;
