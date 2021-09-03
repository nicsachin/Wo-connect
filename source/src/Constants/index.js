/**
 * Common Routes For External-Dashboard
 * */
// Sidebar Icons Import
import {
  IconCalender,
  IconCamera,
  IconCheckbox,
  IconDVR,
  IconEmployee,
  IconGlobe,
  IconLive,
  IconLocation,
  IconMap,
  IconMytask,
  IconPlayback,
  IconScheduleTask,
  IconSettings,
  IconTask,
  IconTicketing,
} from "../Common/Components/IconsComponent/SidebarMain/Index";
import { IconHome } from "../Common/Components/IconsComponent/Index";
import IconCompliance from "../Common/Components/IconsComponent/SidebarMain/IconCompliance";

/**
 * Common Routes For External-Dashboard
 * */

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const API_BASE_URL_PUBLIC = process.env.REACT_APP_API_BASE_URL_PUBLIC;
export const DEFAULT_API_CONFIG = {
  showLoader: true,
  callManifest: true,
  loaderLabel: "",
};
// in milliseconds
export const DEBOUNCE_INPUT_TIME = 500;

/**
 * Routes For External-Dashboard
 * */

export const LOGIN = "/login";

export const SIGNUP = "/signup";

export const FORGET = "/forgot";

export const VERIFY = "/verify";

export const CHANGEPASSWORD = "/change-password";
export const SETUPPASSWORD = "/setup-password";
export const SUCCESS = "/success";

export const ADDCOMPANY = "/add-company";

export const ADDTEAM = "/add-team";

export const ADDLOCATION = "/add-location";

export const CONNECTCAMERA = "/connect-camera";

export const VIEW = "/wocam/live";
export const CREATE_VIEW = "/wocam/live/create";
export const PLAYBACK = "/wocam/playback";
export const RECORDER = "/wocam/recorder";
export const CAMERA = "/wocam/camera";
export const CAMERA_DETAIL = "/wocam/camera/detail/:cameraId";
export const RECORDER_DETAIL = "/wocam/recorder/detail/:recorderId";

export const REGION = "/settings/region";
export const EMPLOYEE_PROFILE = "/profile-details";
export const COMPANY_DETAILS = "/settings/company-details";
export const SUBREGION = "/settings/subregion";
export const LOCATION = "/settings/location";
export const TAT = "/settings/tat";
export const SCHEDULE = "/settings/schedule";
export const EMPLOYEE = "/settings/employee";
export const ADDEMPLOYEE = "/settings/employee/add";
export const EMPLOYEE_DETAIL = "/settings/employee/detail/:employeeId";
export const SUBSCRIPTION_DETAILS = "/settings/subscription";

// export const TASK = "/task/list";
// export const TASK_DETAILS = "/task/list/detail";
export const TASK = "/task/schedule-task";
export const TASK_DETAILS = "/task/schedule-task/detail";

export const CHECKLIST = "/task/checklist";
export const CHECKLIST_DETAIL = "/task/checklist/:id";
export const CHECKLIST_INTRODUCTION = "/task/checklist/introduction";
export const MY_TASK = "/task/my-tasks-list";

export const TICKETING = "/ticketing";
export const TICKETING_DETAILS = "/ticketing/detail";

export const COMPLIANCE_NAVBAR = "/compliance";

export const COMPLIANCE_DETAILS = "/compliance/detail";

export const COMPLIANCE_RUN = "/task/checklist/run/";
export const COMPLIANCE = "/task/checklist/run/:checklistId";
export const CONFIGURATION = "/task/checklist/compliance/configuration";
export const ADD_CAMERA = "/task/checklist/compliance/add-camera";
export const ADD_SCHEDULE = "/task/checklist/compliance/add-schedule";
export const ASSIGN_USER = "/task/checklist/compliance/assign-user";

export const HOME = "/home";
export const LOGOUT = "/logout";
export const PAGE404 = "/404";
export const PAGE500 = "/500";

// dashboard demo link
export const DEMO_URL = "https://demo.wobot.ai";

//checklist info titles
export const CHECKLIST_TITLES = {
  overview: "Overview",
  process: "Process",
  dos: "Do's And Don'ts",
  technicalDetails: "Technical Details",
  expectedResults: "Expected Results",
  additionalInfo: "Additional info",
};
export const CHECKLIST_TAB = [
  "Overview",
  "Process",
  "Do's And Don'ts",
  "Technical Details",
  "Expected Results",
  "Additional info",
];

/**
 * Routes For Sidebar Collapse
 * */

const routes_hover = [
  // Home
  // {
  //   icon: <IconHome />,
  //   title: "Home",
  //   name: "home",
  //   link: "/home",
  //   subMenu: [],
  // },
  // WoCam
  {
    icon: <IconCamera />,
    title: "WoCam",
    name: "wocam",
    subMenu: [
      // {
      //   name: "Live View",
      //   icon: <IconLive />,
      //   link: "/wocam/live",
      // },
      // {
      //   name: "Playback",
      //   icon: <IconPlayback />,
      //   link: "/wocam/playback",
      // },
      {
        name: "NVR",
        icon: <IconDVR />,
        link: "/wocam/recorder",
      },
      {
        name: "Camera",
        icon: <IconCamera />,
        link: "/wocam/camera",
      },
    ],
  }
];


export { routes_hover};
