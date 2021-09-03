import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  IconCopyNew,
  IconRightArrow,
} from "../../../../../Common/Components/IconsComponent/Index";
import "./style.scss";
import Tag from "../../../../../Common/Components/Molecule/Atoms/Tag";
import StatusText from "../../../../../Common/Components/Molecule/Atoms/StatusText";
import CopyRtspPopup from "../../../ModalComponents/CopyRtspPopup";
const CameraSubBlock = (props) => {
  const [cameraId, setCameraId] = useState(null);
  const [copyRtspModalVisibility, setCopyRtspModalVisibility] = useState(false);
  return (
    <div className={"element-block padding-sm-20"}>
      <CopyRtspPopup
        visibility={copyRtspModalVisibility}
        onHide={() => {
          setCopyRtspModalVisibility(false);
        }}
        cameraId={cameraId}
      />

      <div className={"element-img"}>
        <img src={props.subImgUrl} alt="img" />
      </div>
      <div className={"element-content"}>
        <StatusText status={props.status} />
        <div className={"header-block"}>
          <Link to={props.titleLink}>
            <h6 className={"title"}>{props.subBlockName}</h6>
          </Link>
          <Link to={props.titleLink}>
            <IconRightArrow />
          </Link>
        </div>

        <div className={"d-block meta-group"}>
          <p className={"fs-12 mb-0"}>
            <span>{props.subBlockCity}</span>-
            <span>{props.subBlockRegion}</span>
          </p>
        </div>
        <div className={"element-bottom"}>
          <div
            onClick={() => {
              setCameraId(props.cameraId);
              setCopyRtspModalVisibility(true);
            }}
            className={"copy-link"}
          >
            <p>
              <span className="mr-1">
                <IconCopyNew />
              </span>{" "}
              Copy RTSP URL
            </p>
          </div>
          <Tag>
            <span className={"tag-label"}>
              Running {props.runningTask} tasks
            </span>
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default CameraSubBlock;
