import React from "react";
import { IconCameraInactive } from "../../../../Common/Components/IconsComponent/Index";
import "./style.css";

//props  = {location : "sultanpur" , cameraName : "office-dvr-cam1"}

function CameraInactiveComponent(props) {
  function getLabel(props) {
    if (props.location && props.cameraName)
      return `${props.location}-${props.cameraName}`;
    else return "-";
  }

  return (
    <div className={"text-center camera-inactive-container"}>
      <IconCameraInactive />
      <p>Camera inactive</p>

      <div className="video-meta">
        <p className="mb-0 fs-12 white-color">{getLabel(props)}</p>
      </div>
    </div>
  );
}

export default CameraInactiveComponent;
