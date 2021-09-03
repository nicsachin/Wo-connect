import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { showAlert } from "../../../../Services/showAlert";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL } from "../../../../Constants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./style.scss";
import {
  IconQuestation,
  IconRefresh,
  IconUndo,
  IconUndoAll,
} from "../../../../Common/Components/IconsComponent/Index";

let image = new Image();
let ori_width = "";
let ori_height = "";
let count = 0;
let coordinates = [];

const DrawROI = (props) => {
  const [imageUrl, SetImageUrl] = useState(props.thumbnail);
  const [disableActionButtons, setDisableActionButtons] = useState(false);
  const [showRoi, setShowRoi] = useState(false);
  const [state_coordinates, setstatecoordinates] = useState([]);

  let canvas = useRef(null);
  const canvasRef = useRef(null);
  let contextRef = useRef(null);

  useEffect(() => {
    if (!props.thumbnail)
      getImage().then(() => {
        setShowRoi(true);
      });
    else {
      image.src = props.thumbnail;
      SetImageUrl(image);
      setShowRoi(true);
    }
  }, [props.cameraId]);

  const drawImage = async () => {
    canvas.current = canvasRef.current;
    if (canvas.current) {
      image.src = imageUrl.src;
      SetImageUrl(image);
      canvas.current.height = image.height;
      canvas.current.width = image.width;
      if (image) {
        ori_height = image.height;
        ori_width = image.width;
        props.setOri_height(ori_height);
        props.setOri_width(ori_width);
      }
      contextRef.current = canvas.current.getContext("2d");
      image.addEventListener("load", (e) => {
        if (canvas && canvas.current)
          setTimeout(() => {
            canvas.current.height = image.height;
            canvas.current.width = image.width;
            contextRef.current.drawImage(image, 0, 0);
            setDisableActionButtons(false);
            if (state_coordinates && state_coordinates.length) {
              // deleteLines();
              // drawPolygone(state_coordinates, "#7FFF00");
            } else if (coordinates && coordinates.length) {
              deleteLines();
              drawPolygone(coordinates, "#7FFF00");
            }
          }, 100);
      });
    }
  };

  useEffect(() => {
    if (
      props.rois &&
      props.rois[props.currentIndex - 1] &&
      props.rois[props.currentIndex - 1].dash_cords &&
      props.rois[props.currentIndex - 1].dash_cords.length
    ) {
      coordinates = props.rois[props.currentIndex - 1].dash_cords;
      setstatecoordinates(coordinates);
      props.setCurrentCoordinates([[...coordinates]]);
    } else {
      coordinates = [];
    }
    drawImage();
  }, [props.currentIndex, props.cameraId]);

  useEffect(() => {
    if (props.rois && props.rois.length) {
      setTimeout(() => {
        if (coordinates.length) {
          deleteLines();
          drawPolygone(coordinates, "#7FFF00");
        }
      }, 800);
    }
  }, [props.currentIndex]);

  const GetCoordinates = (e) => {
    if (!imageUrl || coordinates.length === 4) return;
    count++;
    if (count === 1) {
      coordinates = [];
    }
    if (image) {
      ori_height = image.height;
      ori_width = image.width;
      props.setOri_height(ori_height);
      props.setOri_width(ori_width);
    }
    if (e && e.nativeEvent && e.nativeEvent.offsetX && e.nativeEvent.offsetY) {
      let mouseX = e.nativeEvent.offsetX;
      let mouseY = e.nativeEvent.offsetY;
      coordinates.push([mouseX, mouseY]);
      if (contextRef) {
        deleteLines();
      }
      setstatecoordinates(coordinates);
      if (coordinates.length) props.setCurrentCoordinates([coordinates]);
      drawPolygone(coordinates, "#7FFF00");
    } else {
      showAlert("Something went wrong");
    }
  };

  const drawPolygone = (coords, strokeColor, lastpoly) => {
    // coords = state_coordinates;
    if (!coords || !coords.length) return;
    if (coords && coords.length && contextRef && contextRef.current) {
      if (lastpoly === "previospoly") {
        coordinates = [];
        coords.map((subitem, index) => {
          coordinates.push(subitem);
          return "";
        });
      }
      let polyno = 1;

      contextRef.current.font = "15px Verdana";
      contextRef.current.fillStyle = "#f00";
      contextRef.current.fillText(polyno, coords[0][0], coords[0][1]);

      contextRef.current.beginPath();

      contextRef.current.moveTo(coords[0][0], coords[0][1]);
      for (let item = 1; item <= coords.length - 1; item++) {
        contextRef.current.lineTo(coords[item][0], coords[item][1]);
      }

      contextRef.current.strokeStyle = strokeColor;
      contextRef.current.lineWidth = 2;
      contextRef.current.closePath();
      contextRef.current.stroke();
    }
  };

  const deleteLines = () => {
    if (!contextRef || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, ori_width, ori_height);
    contextRef.current.drawImage(image, 0, 0);
  };

  const getImage = async () => {
    image.src = imageUrl;
    if (props.cameraId) {
      count = 0;
      // SetImageUrl("");
      setDisableActionButtons(true);
      try {
        let res = await callApi(
          `${API_BASE_URL}/frame/update/${props.cameraId}?width=720&height=640`,
          { method: "PUT" }
        );
        if (res.data && res.data.image) {
          image.src = res.data.image;
          SetImageUrl(image);
          setDisableActionButtons(false);
        } else {
          showAlert(`Please click on "Refresh Image"`);
        }
      } catch (e) {
        showAlert(`Please click on Refresh camera frame icon"`);
      }
    }
  };

  const deleteCoordinate = () => {
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
      window.analytics.track(`Clicked on Reset last | Checklist`, {
        title: `Clicked on Reset last | Checklist`,
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
    let arr = coordinates;
    arr.pop();
    deleteLines();
    drawPolygone(arr, "#7FFF00");
  };

  const deletePolygon = () => {
    coordinates = [];
    deleteLines();
    setstatecoordinates([]);
    // drawPolygone(coordinates, "#fff");
  };

  return (
    <div className="block-option" key={props.key}>
      <p>
        {props.sNo}. Select detection area for{" "}
        <span className="fw-500">{props.name}</span>
        {props.currentIndex === props.index - 1 &&
          ["top"].map((placement, index) => (
            <OverlayTrigger
              key={index}
              placement={placement}
              overlay={
                <Tooltip id={`tooltip-${placement}`}>
                  Draw the region of interest for detection by clicking anywhere
                  on the image. Each click draws a vertex on the image.
                </Tooltip>
              }
            >
              <span className="ml-2">
                <IconQuestation />
              </span>
            </OverlayTrigger>
          ))}
      </p>
      {/*{props.rois && (
        <div className="col-lg-12">
          <ul className="list-inline location-block">
            {
              <li key={props.cameraId} className="list-inline-item">
                <div className="selected-block">
                  <span
                    onClick={() => {
                      drawPolygone(props.rois.dash_cords, "#7FFF00");
                    }}
                  >
                    {" "}
                    {props.rois.label}{" "}
                  </span>
                </div>
              </li>
            }
          </ul>
        </div>
      )}*/}
      {showRoi && props.currentIndex === props.index - 1 && (
        <div className="container-block row">
          <div className="canvas-block col-xl-11 col-lg-10">
            {imageUrl ? (
              <div className="canvas-view">
                <canvas
                  id="myImgId"
                  ref={canvasRef}
                  onMouseDown={(e) => GetCoordinates(e)}
                />
              </div>
            ) : (
              <p className="text-black mb-0 text-center py-5">Loading...</p>
            )}
          </div>
          <div className="control-block col-xl-1 col-lg-2">
            <ul>
              {["left"].map((placement, index) => (
                <OverlayTrigger
                  key={index}
                  placement={placement}
                  overlay={
                    <Tooltip id={`tooltip-${placement}`}>Reset last</Tooltip>
                  }
                >
                  <li>
                    <button
                      className="btn gray-light-btn btn-single-icon"
                      onClick={deleteCoordinate}
                      disabled={disableActionButtons}
                    >
                      <IconUndo />
                    </button>
                  </li>
                </OverlayTrigger>
              ))}

              {["left"].map((placement, index) => (
                <OverlayTrigger
                  key={index}
                  placement={placement}
                  overlay={
                    <Tooltip id={`tooltip-${placement}`}>Reset all</Tooltip>
                  }
                >
                  <li>
                    <button
                      className="btn gray-light-btn btn-single-icon"
                      onClick={() => {
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
                          window.analytics.track(
                            `Clicked on Reset all | Checklist`,
                            {
                              title: `Clicked on Reset all | Checklist`,
                              email: props.userData.user.email,
                              username: props.userData.user.username,
                              companyName: props.userData.manifest.company.name,
                              user_id: props.userData.user._id,
                              company_id: props.userData.manifest._id,
                            }
                          );
                        }
                        deletePolygon();
                      }}
                      disabled={disableActionButtons}
                    >
                      <IconUndoAll />
                    </button>
                  </li>
                </OverlayTrigger>
              ))}

              {["left"].map((placement, index) => (
                <OverlayTrigger
                  key={index}
                  placement={placement}
                  overlay={
                    <Tooltip id={`tooltip-${placement}`}>
                      Refresh Camera frame
                    </Tooltip>
                  }
                >
                  <li>
                    <button
                      className="btn gray-light-btn btn-single-icon"
                      onClick={() => {
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
                          window.analytics.track(
                            `Clicked on Refresh Camera frame | Checklist`,
                            {
                              title: `Clicked on Refresh Camera frame | Checklist`,
                              email: props.userData.user.email,
                              username: props.userData.user.username,
                              companyName: props.userData.manifest.company.name,
                              user_id: props.userData.user._id,
                              company_id: props.userData.manifest._id,
                            }
                          );
                        }
                        getImage();
                      }}
                    >
                      <IconRefresh />
                    </button>
                  </li>
                </OverlayTrigger>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(DrawROI);
