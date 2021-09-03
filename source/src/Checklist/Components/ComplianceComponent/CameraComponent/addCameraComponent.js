import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import { showAlert } from "../../../../Services/showAlert";

const AddCameraComponent = (props) => {
  /**
   * for add camera
   * */
  const [camera, setCamera] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [manufacturerList, setManufacturerList] = useState([]);
  const [rtsp, setRtsp] = useState("");
  const [
    dvrIsPresentInCameraDetails,
    setDvrIsPresentInCameraDetails,
  ] = useState(false);
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [location, setLocation] = useState("");
  const [subregionList, setSubregionList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [cameraOfflineAlertDuration, setCameraOfflineAlertDuration] = useState(
    ""
  );
  const [storedClipDuration, setStoredClipDuration] = useState("");
  const [cloudStorageStream, setCloudStorageStream] = useState("");
  const [email, setEmail] = useState("");

  const initializeFields = () => {
    /**
     * Populate manufacturers
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.manufacturer
    ) {
      setManufacturerList(
        props.userData.manifest.manufacturer.map((el) => {
          return { label: el, value: el };
        })
      );
    }
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let regions = [];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          regions.push({ value: el._id, label: el.area });
        }
      }
      setRegionList(regions);
    }
  };

  /**
   * Get location Details
   * */
  const getSubregionOrLocation = (parentId = null, type = null) => {
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let result = [];
      for (let el of props.userData.manifest.regions) {
        if (el.parent === parentId && el.type === type) {
          result.push({ value: el._id, label: el.area });
        }
      }
      return result;
    }
    return [];
  };

  /**
   * To add or update camera
   * */
  const addCamera = async () => {
    if (
      camera &&
      manufacturer.value &&
      rtsp &&
      region.value &&
      subRegion.value &&
      location.value &&
      email &&
      cameraOfflineAlertDuration &&
      props.deviceInfo &&
      props.deviceInfo.timeZone &&
      storedClipDuration &&
      cloudStorageStream
    ) {
      let apiBody = {
        camera,
        manufacturer: manufacturer.value,
        rtsp,
        region: region.value,
        city: subRegion.value,
        location: location.value,
        emailIds: email.split(",").map((el) => el.trim()),
        cameraOfflineAlertDuration,
        timezone: props.deviceInfo ? props.deviceInfo.timeZone : null,
        storedClipDuration,
        cloudStorageStream,
      };

      try {
        const url = `${API_BASE_URL}/setup/camera`;
        const method = "POST";

        let res = await callApi(url, {
          method,
          body: JSON.stringify(apiBody),
        });
        if (res.status === 200) {
          showAlert(res.message);
          props.closeModal();
        }
      } catch (e) {
        showAlert(e, "error");
      }
    } else {
      showAlert("All fields are required", "error");
    }
  };

  useEffect(() => {
    initializeFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   *
   */
  return (
    <Modal
      size="lg"
      show={props.show}
      onHide={() => {
        props.closeModal();
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="form-popup"
    >
      <Modal.Header closeButton>
        <div className="modal-title d-block">
          <h4 className="mb-2">Add Camera</h4>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-form">
          <form>
            <div className="details mb-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Camera name</label>
                  <input
                    type="text"
                    value={camera}
                    onChange={(event) => {
                      setCamera(event.target.value);
                    }}
                    class="form-control"
                    placeholder="Enter Recorder/DVR Name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Manufacturer name</label>
                  <Select
                    value={manufacturer}
                    onChange={(selectedOption) => {
                      setManufacturer(selectedOption);
                    }}
                    options={manufacturerList}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">RTSP URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={rtsp}
                    onChange={(event) => {
                      setRtsp(event.target.value);
                    }}
                    placeholder="http://live.wobot-camera.com"
                  />
                </div>
              </div>
            </div>
            <div className="credentials mb-4">
              <p className="fw-700">Location Details</p>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="inputEmail4">Region</label>
                  <Select
                    isDisabled={dvrIsPresentInCameraDetails}
                    value={region}
                    onChange={(selectedOption) => {
                      /**
                       * To flush out previous value
                       * */
                      setSubRegion([]);
                      setLocation([]);

                      setRegion(selectedOption);
                      setSubregionList(
                        getSubregionOrLocation(selectedOption.value, "city")
                      );
                    }}
                    options={regionList}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="inputEmail4">Subregion</label>
                  <Select
                    isDisabled={dvrIsPresentInCameraDetails}
                    value={subRegion}
                    onChange={(selectedOption) => {
                      setLocation([]);
                      setSubRegion(selectedOption);
                      setLocationList(
                        getSubregionOrLocation(selectedOption.value, "location")
                      );
                    }}
                    options={subregionList}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="inputEmail4">Location</label>
                  <Select
                    isDisabled={dvrIsPresentInCameraDetails}
                    value={location}
                    onChange={(selectedOption) => {
                      setLocation(selectedOption);
                    }}
                    options={locationList}
                  />
                </div>
              </div>
            </div>
            <div className="credentials mb-4">
              <p className="fw-700">Notifications</p>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Camera offline alert</label>
                  <input
                    value={cameraOfflineAlertDuration}
                    onChange={(event) => {
                      setCameraOfflineAlertDuration(event.target.value);
                    }}
                    type="number"
                    className="form-control"
                    placeholder="Enter Camera Offline Alert Duration"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Stored Clip Duration</label>
                  <input
                    value={storedClipDuration}
                    onChange={(event) => {
                      setStoredClipDuration(event.target.value);
                    }}
                    type="text"
                    className="form-control"
                    placeholder="Enter Stored Alert Duration"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Cloud Storage Stream</label>
                  <input
                    value={cloudStorageStream}
                    onChange={(event) => {
                      setCloudStorageStream(event.target.value);
                    }}
                    type="text"
                    className="form-control"
                    placeholder="Enter Cloud Storage Stream"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inputEmail4">Email</label>
                  <input
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                    }}
                    type="text"
                    className="form-control"
                    placeholder="Enter email"
                  />
                  <small className="fs-12 fw-200 light-color">
                    Alert will be sent to these email ids
                  </small>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-tertiary btn-sm"
          onClick={() => {
            props.closeModal();
          }}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-primary btn-sm"
          onClick={() => {
            // setShow(false);
            addCamera();
          }}
        >
          Add Camera
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCameraComponent;
