import React, { useCallback, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { deviceDetect, osName } from "react-device-detect";
import { showAlert } from "./Services/showAlert";
import { connect } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Main.scss";

// Route import
import {
  ADD_CAMERA,
  ADD_SCHEDULE,
  ADDCOMPANY,
  ADDEMPLOYEE,
  ADDLOCATION,
  ADDTEAM,
  API_BASE_URL,
  ASSIGN_USER,
  CAMERA,
  CAMERA_DETAIL,
  CHANGEPASSWORD,
  CHECKLIST,
  CHECKLIST_DETAIL,
  COMPANY_DETAILS,
  COMPLIANCE,
  COMPLIANCE_DETAILS,
  COMPLIANCE_NAVBAR,
  CONFIGURATION,
  CONNECTCAMERA,
  EMPLOYEE,
  EMPLOYEE_DETAIL,
  EMPLOYEE_PROFILE,
  FORGET,
  HOME,
  LOCATION,
  LOGIN,
  LOGOUT,
  MY_TASK,
  PAGE500,
  PLAYBACK,
  RECORDER,
  RECORDER_DETAIL,
  REGION,
  SCHEDULE,
  SETUPPASSWORD,
  SIGNUP,
  SUBREGION,
  SUBSCRIPTION_DETAILS,
  SUCCESS,
  TASK,
  TASK_DETAILS,
  TAT,
  TICKETING,
  TICKETING_DETAILS,
  VERIFY,
  VIEW,
} from "./Constants";

// Import Redux Actions
import {
  addDeviceInfoToStoreAction,
  addUserDataToStoreAction,
  changeActiveSidebarAction,
  toggleLoaderAction,
} from "./Store/actions";

// Import Access
import {
  LoginRoutesComponent,
  PrivateRouteComponent,
} from "./Common/Components/RouteHandlingComponents";

// Login & Forget
import Login from "./Common/Containers/Login";
import Singup from "./Common/Containers/Signup";
import AddCompany from "./Common/Containers/AddCompany";
import Forget from "./Common/Containers/Forget";
import changePassword from "./Common/Containers/ChangePassword";
import Success from "./Common/Containers/Success";
import Verify from "./Common/Containers/Verify";
import AddTeam from "./Common/Containers/AddTeam";

// Settings
import Employee from "./Settings/Containers/Employee";
import AddEmployee from "./Settings/Containers/AddEmployee";
import EmployeeDetails from "./Settings/Containers/EmployeeDetails";
import Region from "./Settings/Containers/Region";
import SubRegion from "./Settings/Containers/SubRegion";
import Tat from "./Settings/Containers/Tat";
import Location from "./Settings/Containers/Location";
import Schedule from "./Settings/Containers/Schedule";
import CompanyDetails from "./Settings/Containers/CompanyDetails";
import EmployeeProfile from "./Settings/Containers/EmployeeProfile";
import Details from "./Settings/Containers/Details";

// WoCam
import Views from "./Wocam/Containers/Views";
import Recorder from "./Wocam/Containers/RecorderList";
import RecorderDetails from "./Wocam/Containers/RecorderDetails";
import Playback from "./Wocam/Containers/Playback";
import Camera from "./Wocam/Containers/CameraList";
import CameraDetails from "./Wocam/Containers/CameraDetails";

// Task
import TaskList from "./Task/Containers/TaskList";
import MyTaskList from "./MyTask/Containers/MyTaskList";
import TaskDetails from "./Task/Containers/TaskDetails";

// Ticketing
import TicketingList from "./Ticketing/Containers/TicketingList";
import TicketingDetails from "./Ticketing/Containers/TicketingDetails";

//Checklist
import List from "./Checklist/Containers/List";
import Introduction from "./Checklist/Containers/Introduction";
import Compliance from "./Checklist/Containers/Compliance";
import Config from "./Checklist/Containers/Config";
import AddCamera from "./Checklist/Containers/AddCamera";
import AddShedule from "./Checklist/Containers/AddShedule";
import AssignUser from "./Checklist/Containers/AssignUser";
import Home from "./Common/Containers/Home";
import AddLocation from "./Common/Containers/AddLocation";
import ConnectCamera from "./Common/Containers/ConnectCamera";
import SetupPassword from "./Common/Containers/SetupPassword";
import LoaderComponent from "./Common/Components/LoaderComponent";
import ComplianceList from "./Compliance/Containers/ComplianceList";
import ComplianceDetails from "./Compliance/Containers/ComplianceDetails";
import page404 from "./Common/Containers/page404";
import page500 from "./Common/Containers/page500";
import checkOnboardingRoute from "./Common/Components/SignupComponent/checkOnboardingRoute";
import Base from "./Common/Components/Base";
import LogoutComponent from "./Common/Containers/logout";
import { store } from "./Store";
import { TOGGLE_LOADER } from "./Store/constants";

//for device id
import { v4 as uuid } from "uuid";
const App = (props) => {
  toast.configure();
  const location = useLocation();

  const createDeviceInfo = () => {
    return new Promise((resolve, reject) => {
      try {
        const deviceInfo = {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceType: osName,
          deviceId: uuid(),
          name: `${deviceDetect().model ? deviceDetect().model : osName}`,
        };
        resolve(deviceInfo);
      } catch (e) {
        reject(e);
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!props.deviceInfo) {
      try {
        let deviceInfo = await createDeviceInfo();
        props.addDeviceInfo(deviceInfo);
      } catch (e) {
        showAlert(e);
      }
    }
  }, [props.deviceInfo]);

  useEffect(() => {
    if (
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.onboarded
    ) {
      checkOnboardingRoute(window.location.pathname, props);
    }
  }, [location]);

  useEffect(() => {
    props.toggleLoader({
      label: "",
      value: false,
    });
    console.log('path' , window.location.href)
  }, []);

  return (
    <Router>
      <LoaderComponent />
      {/* <Helmet>
        <script
          type="text/javascript"
          id="hs-script-loader"
          async
          defer
          src={
            ManifestService.userIsAdmin()
              ? "//js.hs-scripts.com/7377177.js"
              : ""
          }
        ></script>
      </Helmet> */}
      <section className="wobot-dashboard">
        <Switch>
          {/*Login and signup*/}
          <LoginRoutesComponent exact path={SIGNUP} component={Singup} />
          <LoginRoutesComponent exact path="/" component={Base} />
          <LoginRoutesComponent exact path={LOGIN} component={Login} />

          <LoginRoutesComponent
            exact
            path={ADDCOMPANY}
            component={AddCompany}
          />
          <PrivateRouteComponent exact path={ADDTEAM} component={AddTeam} />

          <PrivateRouteComponent
            exact
            path={ADDLOCATION}
            component={AddLocation}
          />
          <PrivateRouteComponent
            exact
            path={CONNECTCAMERA}
            component={ConnectCamera}
          />

          <LoginRoutesComponent exact path={FORGET} component={Forget} />
          <LoginRoutesComponent exact path={VERIFY} component={Verify} />
          <LoginRoutesComponent
            exact
            path={CHANGEPASSWORD}
            component={changePassword}
          />
          <Route exact path={SETUPPASSWORD} component={SetupPassword} />
          <LoginRoutesComponent exact path={SUCCESS} component={Success} />

          <PrivateRouteComponent exact path={VIEW} component={Views} />
          <PrivateRouteComponent exact path={EMPLOYEE} component={Employee} />
          <PrivateRouteComponent
            exact
            path={ADDEMPLOYEE}
            component={AddEmployee}
          />
          <PrivateRouteComponent
            exact
            path={EMPLOYEE_DETAIL}
            component={EmployeeDetails}
          />
          <PrivateRouteComponent exact path={REGION} component={Region} />
          <PrivateRouteComponent exact path={SUBREGION} component={SubRegion} />
          <PrivateRouteComponent exact path={LOCATION} component={Location} />
          <PrivateRouteComponent exact path={TAT} component={Tat} />
          <PrivateRouteComponent exact path={SCHEDULE} component={Schedule} />
          <PrivateRouteComponent exact path={PLAYBACK} component={Playback} />
          <PrivateRouteComponent exact path={RECORDER} component={Recorder} />
          <PrivateRouteComponent
            exact
            path={SUBSCRIPTION_DETAILS}
            component={Details}
          />
          <PrivateRouteComponent
            exact
            path={COMPANY_DETAILS}
            component={CompanyDetails}
          />
          <PrivateRouteComponent
            exact
            path={EMPLOYEE_PROFILE}
            component={EmployeeProfile}
          />

          <PrivateRouteComponent exact path={CAMERA} component={Camera} />
          <PrivateRouteComponent
            exact
            path={CAMERA_DETAIL}
            component={CameraDetails}
          />
          <PrivateRouteComponent
            exact
            path={RECORDER_DETAIL}
            component={RecorderDetails}
          />

          <PrivateRouteComponent exact path={TASK} component={TaskList} />
          <PrivateRouteComponent exact path={MY_TASK} component={MyTaskList} />
          <PrivateRouteComponent
            exact
            path={TASK_DETAILS}
            component={TaskDetails}
          />

          <PrivateRouteComponent
            exact
            path={TICKETING}
            component={TicketingList}
          />
          <PrivateRouteComponent
            exact
            path={TICKETING_DETAILS}
            component={TicketingDetails}
          />

          {/*compliance*/}
          <PrivateRouteComponent
            exact
            path={COMPLIANCE_NAVBAR}
            component={ComplianceList}
          />
          <PrivateRouteComponent
            exact
            path={COMPLIANCE_DETAILS}
            component={ComplianceDetails}
          />

          <PrivateRouteComponent exact path={CHECKLIST} component={List} />
          <PrivateRouteComponent
            exact
            path={CHECKLIST_DETAIL}
            component={Introduction}
          />

          <PrivateRouteComponent
            exact
            path={COMPLIANCE}
            component={Compliance}
          />

          <PrivateRouteComponent
            exact
            path={CONFIGURATION}
            component={Config}
          />
          <PrivateRouteComponent
            exact
            path={ADD_CAMERA}
            component={AddCamera}
          />
          <PrivateRouteComponent
            exact
            path={ADD_SCHEDULE}
            component={AddShedule}
          />
          <PrivateRouteComponent
            exact
            path={ASSIGN_USER}
            component={AssignUser}
          />
          <PrivateRouteComponent
            exact
            path={LOGOUT}
            component={LogoutComponent}
          />
          <PrivateRouteComponent exact path={HOME} component={Home} />
          <Route path={PAGE500} component={page500} />
          <Route path="*" component={page404} />
        </Switch>
      </section>
    </Router>
  );
};
const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    toggleLoader: (data) => {
      dispatch(toggleLoaderAction(data));
    },
    addDeviceInfo: (data) => {
      dispatch(addDeviceInfoToStoreAction(data));
    },
    addUserDataToStore: (data) => {
      dispatch(addUserDataToStoreAction(data));
    },
    changeActiveSidebar: (data) => {
      dispatch(changeActiveSidebarAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
