import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Link, useHistory } from "react-router-dom";
import "./style.scss";
import { OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { showAlert } from "../../../../Services/showAlert";
import { timezoneData } from "../../../../Services/getTimezoneList";
import { API_BASE_URL, CONNECTCAMERA, LOGOUT } from "../../../../Constants";
import axios from "axios";
import { getHeaders } from "../../../../Services/getHeaders";
import { useDropzone } from "react-dropzone";
import {
  IconArrowNextRight,
  IconCross,
  IconImport,
  IconAdd,
} from "../../IconsComponent/Index";
import updateManifest from "../../../../Services/updateManifest";
import { store } from "../../../../Store";
import TimezoneSelect from "react-timezone-select";
import { connect } from "react-redux";
import RotateBlock from "../../Molecule/RotateBlock";
import { Helmet } from "react-helmet";
import CenterBlock from "../../Molecule/Block/CenterBlock";
import callApi from "../../../../Services/callApi";
import logout from "../../../../Services/logout";
import handleOnboardingTrackAPICall from "../handleOnboardingTrackAPICall";

const AddCompanyComponent = (props) => {
  const history = useHistory();
  let actions = "";
  const [action, setAction] = useState("");
  const [isCSVUploaded, setIsCSVUploaded] = useState(false);
  const [csvFile, setcsvFile] = useState("");

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [listTimezone, setListTimezone] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [branch, setBranch] = useState([]);
  const [timezone, setTimeZone] = useState([]);
  const [repeatTypeDiv, setRepeatTypeDiv] = useState([0]);

  const [files, setFiles] = useState([]);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) => (
          <li key={file.path}>
            <span className={"file-name fw-600"}>{file.path}</span> -{" "}
            <span className={"file-size small"}>{file.size}</span> bytes
          </li>
        ))
      );
    },
  });

  // let files = acceptedFiles.map((file) => (
  //   <li key={file.path}>
  //     <span className={"file-name fw-600"}>{file.path}</span> -{" "}
  //     <span className={"file-size small"}>{file.size}</span> bytes
  //   </li>
  // ));

  const handleSubmit = (e) => {
    if (
      (repeatTypeDiv.length === state.length &&
        state.length === city.length &&
        city.length === branch.length &&
        branch.length === timezone.length) ||
      files.length
    ) {
      if (files.length) {
        actions = "media";
      } else {
        actions = "input";
      }
      let config = {
        url: "",
        method: "",
        body: "",
        contentType: "",
      };

      let formData = new FormData();
      let arr = [];

      switch (actions) {
        case "input": {
          repeatTypeDiv.map((el, index) => {
            arr.push({
              region: state[index],
              city: city[index],
              location: branch[index],
              timezone: timezone[index].value,
            });
          });
          config.url = `${API_BASE_URL}/onboard/region/create`;
          config.method = "POST";
          config.body = JSON.stringify(arr);
          config.contentType = "application/json";
          break;
        }
        case "media": {
          let file = "";
          acceptedFiles.map((elfile) => {
            file = elfile;
          });
          formData.append("media", file);
          config.url = `${API_BASE_URL}/region/import`;
          config.method = "POST";
          config.body = formData;
          config.contentType = "multipart/form-data";
          break;
        }
        default: {
          break;
        }
      }

      try {
        axios({
          method: config.method,
          url: config.url,
          data: config.body,
          headers: {
            ...getHeaders(),
            "content-type": config.contentType,
          },
        })
          .then(async (res) => {
            if (res.status === 200) {
              if (store.getState().userData)
                updateManifest().then((d) => {
                  handleOnboardingTrackAPICall("add-location").then((a) => {
                    history.push(CONNECTCAMERA);
                    if (
                      props &&
                      props.userData &&
                      props.userData.user &&
                      props.userData.user.email &&
                      props.userData.user._id &&
                      props.userData.manifest &&
                      props.userData.manifest._id &&
                      props.userData.manifest.company &&
                      props.userData.manifest.company.name
                    ) {
                      window.analytics.track(
                        `${action} added successfully | Onboarding`,
                        {
                          title: `${action} added successfully | Onboarding`,
                          email: props.userData.user.email,
                          username: props.userData.user.username,
                          companyName: props.userData.manifest.company.name,
                          user_id: props.userData.user._id,
                          company_id: props.userData.manifest._id,
                        }
                      );
                    }
                  });
                  showAlert(res.data.message);
                });
            }
          })
          .catch((e) => {
            setFiles("");
            if (e.response && e.response.data && e.response.data.message) {
              showAlert(e.response.data.message, "error");
            } else {
              showAlert(e, "error");
            }
          });
      } catch (e) {
        setFiles("");
        showAlert(e, "error");
      }
    } else {
      showAlert("Please fill all details.", "error");
    }
  };

  const handleFileUpload = (event) => {
    setcsvFile(event.target.files[0]);
    setIsCSVUploaded(!isCSVUploaded);
    setAction("media");
  };

  const handleCount = (e) => {
    e.preventDefault();
    if (
      repeatTypeDiv.length === state.length &&
      state.length === city.length &&
      state.length === branch.length &&
      state.length === timezone.length
    ) {
      setRepeatTypeDiv((arr) => [...arr, parseInt(`${arr.length}`)]);
    } else {
      showAlert("Please enter all details");
    }
  };

  const handleDeleteType = (e, index) => {
    e.preventDefault();
    const repeatTypeDivArray = [...repeatTypeDiv];
    repeatTypeDivArray.splice(index, 1);
    setRepeatTypeDiv(repeatTypeDivArray);

    removeState(index);
    removeCity(index);
    removeBranch(index);
    removeTimezone(index);
  };

  const removeState = (index) => {
    const stateArray = [...state];
    stateArray.splice(index, 1);
    setState(stateArray);
  };

  const removeCity = (index) => {
    const cityArray = [...city];
    cityArray.splice(index, 1);
    setCity(cityArray);
  };

  const removeBranch = (index) => {
    const branchArray = [...branch];
    branchArray.splice(index, 1);
    setBranch(branchArray);
  };

  const removeTimezone = (index) => {
    const timezoneArray = [...timezone];
    timezoneArray.splice(index, 1);
    setTimeZone(timezoneArray);
  };

  useEffect(() => {
    let array = [];
    timezoneData().map((el) => {
      array.push({ value: el, label: el });
    });
    setListTimezone(array);
  }, []);

  return (
    <RotateBlock
      showAuthHeader={true}
      showAuthBoxFw={true}
      showAuthBox={false}
      authHeadingTitle="Where are your cameras"
      authSubTitle="Help us locate your cameras, and monitor tasks and events from anywhere!"
    >
      <Helmet>
        <title>{`Add Cameras | Wobot.ai`}</title>
        <meta name="description" content="Add your cameras" />
      </Helmet>

      <CenterBlock
        showBottomPagination={true}
        showAuthBottomLink={true}
        authBottomText="Don't know what to do?"
        authBottomLink={LOGOUT}
        authBottomLinkText="Logout"
        showAuthBottomNav={true}
        showWobotIcon={false}
      >
        <div className={"auth-top-button text-right mb-4"}>
          <button
            className={"btn btn-textIcon btn-sm btn-tertiary"}
            onClick={handleShow}
          >
            <span>
              <IconImport />
              Bulk Upload
            </span>
          </button>
        </div>
        <div className={"auth-content"}>
          <div className="form-block auth-form-block mt-5">
            {repeatTypeDiv.map((el, index) => {
              return (
                <div className={"auth-location-list row"}>
                  <div className={"col-xl col-lg-3 col-md-6"}>
                    <div className={"form-group"}>
                      <label htmlFor="state" class="form-label">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        className="form-control"
                        placeholder="e.g. New York "
                        onChange={(e) => {
                          if (state.length) {
                            state.map((el, i) => {
                              let array = [];
                              state.map((el) => {
                                array.push(el);
                              });
                              // removeTitle(index);
                              // removeKey(index);
                              array[index] = e.target.value;
                              setState(array);
                            });
                          } else {
                            //   removeTitle(index);
                            //   removeKey(index);
                            setState([e.target.value]);
                            setAction("input");
                          }
                        }}
                        // value={companyName}
                        // onChange={(e) => {
                        //   console.log(e.target.value);
                        //   setCompanyName(e.target.value);
                        // }}
                      />
                    </div>
                  </div>
                  <div className={"col-xl col-lg-3 col-md-6"}>
                    <div className={"form-group"}>
                      <label htmlFor="city" class="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        placeholder="e.g. Buffalo"
                        // value={companyName}
                        // onChange={(e) => {
                        //   console.log(e.target.value);
                        //   setCompanyName(e.target.value);
                        // }}
                        onChange={(e) => {
                          if (city.length) {
                            city.map((el, i) => {
                              let array = [];
                              city.map((el) => {
                                array.push(el);
                              });
                              // removeTitle(index);
                              // removeKey(index);
                              array[index] = e.target.value;
                              setCity(array);
                            });
                          } else {
                            //   removeTitle(index);
                            //   removeKey(index);
                            setCity([e.target.value]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={"col-xl col-lg-3 col-md-6"}>
                    <div className={"form-group"}>
                      <label htmlFor="location" class="form-label">
                        Location (Branch)
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        placeholder="e.g. Lower West Side"
                        // value={companyName}
                        onChange={(e) => {
                          if (branch.length) {
                            branch.map((el, i) => {
                              let array = [];
                              branch.map((el) => {
                                array.push(el);
                              });
                              // removeTitle(index);
                              // removeKey(index);
                              array[index] = e.target.value;
                              setBranch(array);
                            });
                          } else {
                            //   removeTitle(index);
                            //   removeKey(index);
                            setBranch([e.target.value]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={"col-xl col-lg-3 col-md-6"}>
                    <label htmlFor="timezone" class="form-label">
                      Timezone
                    </label>
                    <TimezoneSelect
                      placeholder="Select Timezone"
                      id="inputState"
                      value={""}
                      // onChange={(selectedOption)=>{
                      //   setTimeZone([{label : selectedOption.value , value : selectedOption.value}])
                      // }}
                      onChange={(selectedOption) => {
                        if (timezone.length) {
                          timezone.map((el, i) => {
                            let array = [];
                            timezone.map((el) => {
                              array.push(el);
                            });
                            // removeTitle(index);
                            // removeKey(index);
                            array[index] = selectedOption;
                            setTimeZone(array);
                            //console.log('****** yo data' , {array})
                          });
                        } else {
                          //   removeTitle(index);
                          //   removeKey(index);
                          setTimeZone([selectedOption]);
                        }
                      }}
                    />
                  </div>
                  <div className={"action-block-btn"}>
                    {index !== 0
                      ? ["top"].map((placement) => (
                          <OverlayTrigger
                            key={placement}
                            placement={placement}
                            overlay={
                              <Tooltip id={`tooltip-${placement}`}>
                                Delete
                              </Tooltip>
                            }
                          >
                            <button
                              className="btn btn-close"
                              onClick={(e) => {
                                handleDeleteType(e, index);
                              }}
                            >
                              <span>
                                <IconCross />
                              </span>
                            </button>
                          </OverlayTrigger>
                        ))
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={"auth-add-block text-left mt-4"}>
            <button
              className="btn btn-textIcon"
              onClick={(e) => {
                e.preventDefault();
                handleCount(e);
              }}
            >
              <span>
                <IconAdd />
                Add another branch
              </span>
            </button>
            <span className={"ml-2 other-text"}>
              (You can always add more later)
            </span>
          </div>
        </div>
        <div
          className={"auth-action-button justify-content-end text-right mt-4"}
        >
          <button
            className={"btn btn-primary btn-md btn-icon-block"}
            onClick={() => {
              handleSubmit();
              if (
                props &&
                props.userData &&
                props.userData.user &&
                props.userData.user.email &&
                props.userData.user._id &&
                props.userData.manifest &&
                props.userData.manifest._id &&
                props.userData.manifest.company &&
                props.userData.manifest.company.name
              ) {
                window.analytics.track(
                  `Clicked on continue of add location | Onboarding`,
                  {
                    title: `Clicked on continue of add location | Onboarding`,
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
            {" "}
            Continue <IconArrowNextRight />
          </button>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton />
          <Modal.Body>
            <div className={"box-modal"}>
              <div className={"box-modal-heading"}>
                <h3 className={"box-modal-title"}>Bulk upload</h3>
                <p className={"box-modal-subtitle"}>
                  Import your business' entire location mapping via a CSV file.{" "}
                  <br />
                  Here's a sample file with the expected file format.
                  <br />
                  <a
                    href={`/assets/files/Sample.xlsx`}
                    onClick={() => {
                      if (
                        props &&
                        props.userData &&
                        props.userData.user &&
                        props.userData.user.email &&
                        props.userData.manifest &&
                        props.userData.manifest.company &&
                        props.userData.manifest.company.name
                      ) {
                        window.analytics.track(
                          `Clicked on download sample | Onboarding`,
                          {
                            title: `Clicked on download sample | Onboarding`,
                            user: props.userData.user.email,
                            username: props.userData.user.username,
                            company: props.userData.manifest.company.name,
                          }
                        );
                      }
                    }}
                  >
                    Download sample
                  </a>
                </p>
              </div>
              <div className={"box-modal-content"}>
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} accept=".xlsx , .xls, .cdv" />
                  <img
                    className="img-fluid mx-auto d-block mb-2"
                    src={`/assets/images/upload.svg`}
                    alt="upload"
                  />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <div className={"file-list mt-3"}>
                  <ul>{files}</ul>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className={"btn btn-primary"}
              onClick={() => {
                setAction("media");
                handleClose();
                handleSubmit();
              }}
            >
              Upload now
            </button>
          </Modal.Footer>
        </Modal>
      </CenterBlock>
    </RotateBlock>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(AddCompanyComponent);
