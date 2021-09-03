import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { API_BASE_URL } from "../../../Constants";
import callApi from "../../../Services/callApi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { showAlert } from "../../../Services/showAlert";
import moment from "moment";
import { saveAs } from "file-saver";
import "./video-style.scss";
import {
  IconCamera,
  IconFullScreen,
  IconFullScreenExit,
  IconMute,
  IconPlay,
  IconStopControl,
  IconUnmute,
  IconView,
  IconZoomIn,
  IconZoomOut,
} from "../../../Common/Components/IconsComponent/Index";
import { Link } from "react-router-dom";
import { captureVideoFrame, LoadingVideoLabel } from "./helper";

const TIME_TO_START_VIDEO = 10000;
const TIME_BETWEEN_RECOVERY = 5000;

//stop live view
async function stopLiveViewApiCall(apiData) {
  return callApi(
    `${API_BASE_URL}/live/view/stop`,
    {
      method: "POST",
      body: JSON.stringify(apiData),
    },
    {
      callManifest: false,
      showLoader: false,
      loaderLabel: "",
    }
  );
}

const VideoPlayer = (props) => {
  const player = useRef();
  const videoWrapper = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLabel, setVideoLabel] = useState("");
  const [zoomedIn, setZooomIn] = useState(false);
  const [mute, setMute] = useState(false);
  const [recoveryAttempt, setRecoveryAttempt] = useState(1);

  useEffect(() => {
    window.addEventListener("beforeunload", function (event) {
      let apiData = {
        id: props.data.cameraId,
        userId: props.data.userId,
      };
      stopLiveViewApiCall(apiData);
    });
  }, []);

  useEffect(() => {
    if (
      props.data.startLiveView !== undefined &&
      props.data.startLiveView !== null
    ) {
      if (props.data.startLiveView) {
        stopLiveVideo();
        startLiveVideo();
      } else {
        setVideoLabel("Live Stream stopped");
        stopLiveVideo();
      }
    }

    return () => {
      unmountComponent();
    };
  }, [props.data.startLiveView]);

  const startLiveVideo = async () => {
    try {
      let apiData = {
        id: props.data.cameraId,
        userId: props.data.userId,
      };
      let videoResponse = await callApi(
        `${API_BASE_URL}/live/view/start`,
        {
          method: "POST",
          body: JSON.stringify(apiData),
        },
        {
          callManifest: false,
          showLoader: false,
          loaderLabel: "",
        }
      );
      if (
        videoResponse.status === 200 &&
        videoResponse.data &&
        videoResponse.data.hls
      ) {
        setVideoLabel("Loading live view");
        props.data.setCameraPlayingStatus(props.data.cameraPlayingStatus + 1);
        // props.data.addPlayingCameraStatus();
        setTimeout(() => {
          // setPlaying(true);
          setVideoUrl(videoResponse.data.hls);
          setPlaying(true);
          setVideoLabel("");
        }, TIME_TO_START_VIDEO);
      } else {
        setPlaying(false);
      }
    } catch (e) {
      setPlaying(false);
      setVideoLabel("Camera is offline");
      showAlert(e, "error");
    }
  };

  const unmountComponent = async () => {
    let apiData = {
      id: props.data.cameraId,
      userId: props.data.userId,
    };

    await stopLiveViewApiCall(apiData);
  };
  const stopLiveVideo = async () => {
    try {
      if (props.data.cameraPlayingStatus > 0)
        props.data.setCameraPlayingStatus(props.data.cameraPlayingStatus - 1);

      if (!videoUrl) return;
      setPlaying(false);
      setVideoUrl("");

      let apiData = {
        id: props.data.cameraId,
        userId: props.data.userId,
      };
      let videoResponse = await stopLiveViewApiCall(apiData);

      if (videoResponse.status === 200) {
        setVideoLabel("Live Stream stopped");
        // setPlaying(false);
        // setVideoUrl("");
      }
    } catch (e) {
      setVideoLabel("Camera is offline");
      showAlert(e, "error");
    }
  };

  const getWidth = () => {
    if (zoomedIn) {
      return "125%";
    } else {
      return "100%";
    }
  };
  const getHeight = () => {
    if (zoomedIn) {
      return "125%";
    } else {
      return "100%";
    }
  };

  const captureScreenshot = async () => {
    const vid = await captureVideoFrame(
      player.current.getInternalPlayer(),
      "jpeg"
    );
    const date = moment().format("DD-MM-YYYY hh:mm a");
    if (vid.blob && vid.blob.size)
      saveAs(
        vid.blob,
        `${props.data.location}-${props.data.cameraName}-${date}`
      );
  };

  const onError = (e, data, hlsInstance, hlsGlobal) => {
    if (videoLabel !== "Loading live view") setVideoLabel("Loading live view");

    if (data !== undefined) {
      switch (data.type) {
        case "networkError":
          if (recoveryAttempt < 4) {
            if (
              data.details === "manifestLoadError" ||
              data.details === "manifestLoadTimeout" ||
              data.details === "manifestParsingError"
            ) {
              console.log(`errors less than 4 ${recoveryAttempt}`);
              setRecoveryAttempt((recoveryAttempt) => recoveryAttempt + 1);
              setTimeout(() => {
                // setVideoLabel("");
                setRecoveryAttempt(recoveryAttempt + 1);
                hlsInstance.loadSource(data.url);
              }, TIME_BETWEEN_RECOVERY);
            } else {
              hlsInstance.startLoad();
            }
          } else {
            unmountComponent();
            setPlaying(false);
            setVideoUrl(null);
            setVideoLabel("Camera is offline");
            setRecoveryAttempt(1);
          }
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (videoWrapper.current != null) {
      const refEl = videoWrapper.current;
      refEl.onfullscreenchange = () => {
        /**
         * Check if there is a full screen element
         * */
        let fullscreenElement = document.fullscreenElement;
        if (fullscreenElement === null && fullScreen) {
          setFullScreen(false);
        }
      };
    }
  });
  const onPlay = () => {
    setVideoLabel("");
    setRecoveryAttempt(1);
  };

  const getTitle = (title) => {
    return fullScreen ? title : "";
  };

  /**
   * title = title of tooltip
   * onClick = onClick handler
   * icon = IconComponents
   * */
  const Controls = (props) => {
    return (
      <OverlayTrigger
        key={1}
        placement={"top"}
        overlay={<Tooltip id={`tooltip-top`}>{props.title}</Tooltip>}
      >
        <li
          title={getTitle(props.title)}
          onClick={props.onClick}
          className={props.className}
        >
          {props.icon}
        </li>
      </OverlayTrigger>
    );
  };

  useEffect(() => {
    console.log("full screen", fullScreen, document.fullscreenElement);
  }, [fullScreen]);

  const renderControls = () => {
    return (
      <div className="control-block">
        <div className="video-control-block">
          <ul className="list-inline mb-0">
            {/*stop*/}
            <Controls
              title={"Stop"}
              onClick={() => {
                if (!videoUrl) return;
                stopLiveVideo();
              }}
              className={playing ? "list-inline-item" : " icon-disabled"}
              icon={<IconStopControl />}
            />

            {/* screenshot*/}
            <Controls
              title={"Screenshot"}
              onClick={() => {
                if (!playing) return;
                captureScreenshot();
              }}
              className={playing ? "list-inline-item" : " icon-disabled"}
              icon={<IconCamera />}
            />

            {/*zoom*/}
            {zoomedIn && playing ? (
              <Controls
                title={
                  fullScreen
                    ? "Zooming is currently not supported in full screen view"
                    : "Zoom out"
                }
                onClick={() => {
                  if (!playing) return;
                  setZooomIn(false);
                }}
                className={
                  playing && !fullScreen ? "list-inline-item" : " icon-disabled"
                }
                icon={<IconZoomOut />}
              />
            ) : (
              <Controls
                title={
                  fullScreen
                    ? "Zooming is currently not supported in full screen view"
                    : "Zoom in"
                }
                onClick={() => {
                  if (!playing) return;
                  setZooomIn(true);
                }}
                className={
                  playing && !fullScreen ? "list-inline-item" : " icon-disabled"
                }
                icon={<IconZoomIn />}
              />
            )}

            {/*mute*/}
            {mute && playing ? (
              <Controls
                title={"Unmute"}
                onClick={() => {
                  setMute(false);
                }}
                className={playing ? "list-inline-item" : " icon-disabled"}
                icon={<IconMute />}
              />
            ) : (
              <Controls
                title={"Mute"}
                onClick={() => {
                  setMute(true);
                }}
                className={playing ? "list-inline-item" : " icon-disabled"}
                icon={<IconUnmute />}
              />
            )}

            {/*full screen*/}
            {fullScreen ? (
              <Controls
                title={"Exit"}
                onClick={() => {
                  if (videoWrapper.current && document.fullscreenElement) {
                    document.exitFullscreen();
                  } else props.data.revertFullScreen();
                  setFullScreen(false);
                }}
                className="list-inline-item"
                icon={<IconFullScreenExit />}
              />
            ) : (
              <Controls
                title={"Fullscreen"}
                onClick={() => {
                  if (videoLabel === "Camera is offline") return;
                  if (videoWrapper.current) {
                    videoWrapper.current.requestFullscreen();
                  } else props.data.fullScreen(props.data.index);
                  setFullScreen(true);
                }}
                className={
                  videoLabel === "Camera is offline"
                    ? " icon-disabled"
                    : "list-inline-item"
                }
                icon={<IconFullScreen />}
              />
            )}

            {/*don't show it on camera details page*/}
            {/*camera details*/}
            {window.location.pathname.indexOf("wocam/camera/detail/") === -1 ? (
              <Controls
                title={"Details"}
                onClick={() => {}}
                className="list-inline-item"
                icon={
                  <Link
                    to={`/wocam/camera/detail/${props.data.cameraId}`}
                    target={"_blank"}
                  >
                    <IconView />
                  </Link>
                }
              />
            ) : null}
          </ul>
        </div>
      </div>
    );
  };

  function renderVideoLabel() {
    // {

    if (playing) {
      if (videoLabel === "Loading live view") return <LoadingVideoLabel />;
      else return null;
    } else {
      if (
        !!videoLabel &&
        videoLabel !== "Live Stream stopped" &&
        videoLabel !== "Camera is offline"
      ) {
        if (videoLabel === "Loading live view") return <LoadingVideoLabel />;
        else return videoLabel;
      } else {
        return (
          <div className="video-overlay">
            <div>
              <div
                onClick={() => {
                  startLiveVideo();
                }}
              >
                <IconPlay />
              </div>
              <p className="text-white mb-0 mt-4">{videoLabel}</p>
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div
      className="video-block full-screen"
      id="full-screen"
      ref={videoWrapper}
      style={
        props.data.imageUrl
          ? { background: `url("${props.data.imageUrl}")` }
          : null
      }
    >
      <ReactPlayer
        id={props.data.cameraId}
        width={getWidth()}
        height={getHeight()}
        ref={player}
        onProgress={onPlay}
        loop={true}
        // key={playing}
        // url={"https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"}
        url={videoUrl}
        playing={playing}
        muted={mute}
        config={{
          file: {
            attributes: {
              crossorigin: "anonymous",
            },
          },
        }}
        onError={onError}
      />
      <div className="center-block">
        <div className="mb-0 fs-14 white-color play">{renderVideoLabel()}</div>
      </div>

      <div className="video-meta">
        <p className="mb-0 fs-12 white-color">
          {props.data.location}-{props.data.cameraName}
        </p>
      </div>
      {/*Controls*/}
      {renderControls()}
    </div>
  );
};

export default VideoPlayer;
