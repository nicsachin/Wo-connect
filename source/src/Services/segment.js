import { store } from "../Store";

const segmentTrack = (attributes) => {
  const props = store.getState();
  if (
    props &&
    props.userData &&
    props.userData.user &&
    props.userData.user.email &&
    props.userData.manifest &&
    props.userData.manifest.company &&
    props.userData.manifest.company.name &&
    props.userData.user._id &&
    props.userData.manifest._id
  ) {
    let finalAttributes = {};
    let fixedAttibutes = {
      email: props.userData.user.email,
      username: props.userData.user.username,
      companyName: props.userData.manifest.company.name,
      user_id: props.userData.user._id,
      company_id: props.userData.manifest._id,
    };
    finalAttributes = { ...attributes, ...fixedAttibutes };
    if (attributes && attributes.title) {
      if (window?.analytics?.track) {
        window.analytics.track(attributes.title, finalAttributes);
      }
    }
  }
};

export { segmentTrack };
