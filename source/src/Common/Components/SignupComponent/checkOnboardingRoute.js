const checkOnboardingRoute = (path, props) => {
  if (path === "/add-location") {
    if (props.userData.manifest.onboarded.includes("add-location")) {
      window.location.href = "/connect-camera";
    }
  }
  if (path === "/connect-camera") {
    if (props.userData.manifest.onboarded.includes("add-location")) {
      if (props.userData.manifest.onboarded.includes("connect-camera")) {
        window.location.href = "/add-team";
      }
    } else {
      window.location.href = "/add-location";
    }
  }
  if (path === "/add-team") {
    if (props.userData.manifest.onboarded.includes("add-location")) {
      if (props.userData.manifest.onboarded.includes("connect-camera")) {
        if (props.userData.manifest.onboarded.includes("add-team")) {
          window.location.href = "/home";
        }
      } else {
        window.location.href = "/connect-camera";
      }
    } else {
      window.location.href = "/add-location";
    }
  }
  if (path === "/home") {
    if (props.userData.manifest.onboarded.includes("add-location")) {
      if (props.userData.manifest.onboarded.includes("connect-camera")) {
        if (props.userData.manifest.onboarded.includes("add-team")) {
        } else {
          window.location.href = "/add-team";
        }
      } else {
        window.location.href = "/connect-camera";
      }
    } else {
      window.location.href = "/add-location";
    }
  }
};

export default checkOnboardingRoute;
