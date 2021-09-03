import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { showAlert } from "../../../../Services/showAlert";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL } from "../../../../Constants";
import DrawROI from "./drawRoi";
import IconArrowNextRight from "../../../../Common/Components/IconsComponent/IconArrowNextRight";
import IconArrowBack from "../../../../Common/Components/IconsComponent/IconArrowBackLeft";

const AddROI = (props) => {
  const [roi, SetRoi] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState([]);
  const [ori_height, setOri_height] = useState("");
  const [ori_width, setOri_width] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentIndex, SetIndex] = useState(0);
  const [sNo, SetSNo] = useState(1);

  useEffect(() => {
    if (props && props.threshold.length) {
      SetSNo(2);
    } else {
      SetIndex(currentIndex + 1);
    }
  }, []);

  const getTextComponent = (el) => {
    return (
      <div className="form-group mb-4">
        <label htmlFor="inputEmail4" className="fw-400">
          {el.title}
        </label>
        <input
          type="text"
          defaultValue={el.value}
          onChange={(event) => {
            el.value = event.target.value;
          }}
          className="form-control"
        />
      </div>
    );
  };

  const getNumberComponent = (el) => {
    const min = el.valueMin;
    const max = el.valueMax;
    const placeholder = min && max ? `${min} - ${max}` : "";

    return (
      <div className="form-group mb-4">
        <label htmlFor="inputEmail4" className="fw-400">
          {el.title}
        </label>
        <input
          type="number"
          defaultValue={el.value}
          onChange={(event) => {
            el.value = event.target.value;
          }}
          min={min}
          max={max}
          placeholder={placeholder}
          className="form-control"
        />
      </div>
    );
  };

  const getColorComponent = (el) => {
    return (
      <div className="form-group mb-4">
        <label htmlFor="inputEmail4" className="fw-400">
          {el.title}
        </label>
        <input
          type="color"
          defaultValue={el.value}
          onChange={(event) => {
            el.value = event.target.value;
          }}
          className="form-control col-5"
        />
      </div>
    );
  };

  const getCheckBox = (el) => {
    return (
      <div className="form-group mb-4 checkbox-inline checkbox">
        {el.title}
        <label className="mb-0">
          <input
            type="checkbox"
            data-ng-model="example.check"
            defaultChecked={el.value}
            className="check-with-label"
            onChange={(event) => {
              el.value = event.target.checked;
            }}
          />
          <span className="box inline" />
        </label>
      </div>
    );
  };

  const saveRoi = async () => {
    if (!roi || !roi.length) return;
    const url = `${API_BASE_URL}/camera/usecase/create/${props.cameraId}`;
    const res = await callApi(url, {
      method: "PUT",
      body: JSON.stringify({
        id: null,
        issue: props.taskId,
        threshold:
          props.threshold && props.threshold.length
            ? props.threshold.map((el) => {
                let obj = {
                  key: el.key,
                  title: el.title,
                  type: el.type,
                  value: el.value,
                };
                if (el.defaultValue) obj.defaultValue = el.defaultValue;
                if (el.valueMax) obj.valueMax = el.valueMax;
                if (el.valueMin) obj.valueMin = el.valueMin;
                return obj;
              })
            : [],
        roi: roi,
      }),
    });
    if (res && res.status === 200) {
      props.setRoiShow(false);
      props.getCameraByLocations();
      showAlert("Configuration saved");
    }
  };

  const saveAndNext = async () => {
    // if (ori_width < 1 || ori_height < 1) return;
    /*  if ((props.threshold.length === 0 || currentIndex > 0) && props.label && props.label.length !== currentCoordinates.length) {
            return showAlert('Please draw ROI first');
        }*/
    console.log(
      currentCoordinates,
      ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      ori_width,
      ori_height
    );
    if (
      !currentCoordinates.length &&
      (currentIndex === 2 || currentIndex === 1)
    )
      return SetIndex(currentIndex + 1);
    let text = props.label[currentIndex - 1];
    let label = props.label[currentIndex - 1];
    let body = [];
    if (text && currentCoordinates.length) {
      let data = [];
      for (let i of currentCoordinates) {
        let x = {
          text: text,
          label: label,
          dash_cords: JSON.parse(JSON.stringify(i)),
          cords: (JSON.parse(JSON.stringify(i)) || []).map((el) => {
            el[0] = el[0] / ori_width;
            el[1] = el[1] / ori_height;
            return el;
          }),
        };
        data.push(x);
      }
      body = roi.concat(data);
      let unique = body.filter(
        (v, i, a) => a.findIndex((t) => t.text === v.text) === i
      );
      SetRoi([...unique]);
    }
    SetIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (props.label.length === roi.length && currentIndex - 1 === roi.length) {
      saveRoi();
    }
  }, [roi]);

  return (
    <Modal
      size="lg"
      className="roi-modal"
      show={props.roiShow}
      key={props.cameraId}
      onHide={() => {
        props.onClose();
        props.setRoiShow(false);
      }}
      aria-labelledby="roi-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="roi-modal">
          <h6 className="mb-0 text-blue">Configure</h6>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.threshold && props.threshold.length > 0 && (
          <div className="roi-body row">
            <div className="col-lg-6 col-md-12">
              <p className="fw-700">1. Settings</p>
              <div className="block-options ml-4">
                <p className="text-danger">
                  {errorMessage ? errorMessage : ""}
                </p>
                {currentIndex === 0 &&
                  (props.threshold || []).map((el) => {
                    if (el.type.toLowerCase() === "checkbox")
                      return getCheckBox(el);
                    if (el.type.toLowerCase() === "color")
                      return getColorComponent(el);
                    if (el.type.toLowerCase() === "text")
                      return getTextComponent(el);
                    if (el.type.toLowerCase() === "number")
                      return getNumberComponent(el);
                    return <></>;
                  })}
              </div>
            </div>
          </div>
        )}
        <div className="roi-body row">
          <div className="col-12">
            {props.label.map((el, index) => {
              return (
                <DrawROI
                  name={el}
                  key={index}
                  thumbnail={props.thumbnail}
                  sNo={sNo + index}
                  index={index + 2}
                  cameraId={props.cameraId}
                  rois={props.rois[0] && props.rois[0].roi}
                  setCurrentCoordinates={setCurrentCoordinates}
                  currentCoordinates={currentCoordinates}
                  currentIndex={currentIndex}
                  setOri_width={setOri_width}
                  setOri_height={setOri_height}
                />
              );
            })}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between align-self-center w-100">
          <OverlayTrigger
            placement="left"
            overlay={<Tooltip id={`tooltip-left`}>Back</Tooltip>}
          >
            <button
              className="btn btn-icon-block btn-tertiary btn-md"
              onClick={() => {
                if (currentIndex === 0) return props.setRoiShow(false);
                SetIndex(currentIndex - 1);
              }}
            >
              <IconArrowBack />
            </button>
          </OverlayTrigger>
          <button
            className="btn btn-icon-block btn-primary btn-md"
            onClick={() => {
              let error = false;
              if (currentIndex === 0) {
                (props.threshold || []).forEach((obj) => {
                  let val = +obj.value;
                  if (val < obj.valueMin || val > obj.valueMax) {
                    error = true;
                    setErrorMessage(
                      `Value Should be in ${obj.valueMin} - ${obj.valueMax} Range`
                    );
                  } else {
                    setErrorMessage("");
                  }
                });
              }
              if (error) return;
              saveAndNext();
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
                  `Clicked on Save & Next of roi pop up | Checklist`,
                  {
                    title: `Clicked on Save & Next of roi pop up | Checklist`,
                    email: props.userData.user.email,
                    username: props.userData.user.username,
                    companyName: props.userData.manifest.company.name,
                    user_id: props.userData.user._id,
                    company_id: props.userData.manifest._id,
                  }
                );
              }
            }}
          >
            Save & Next <IconArrowNextRight />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(AddROI);
