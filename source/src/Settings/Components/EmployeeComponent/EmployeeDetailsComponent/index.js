import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  IconArrowRight,
  IconArrowLeft,
  IconTrash,
  IconPassword,
  IconPencil,
  IconLock,
} from "../../../../Common/Components/IconsComponent/Index";
import callApi from "../../../../Services/callApi";
import { ADDEMPLOYEE, API_BASE_URL, EMPLOYEE } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { connect } from "react-redux";
import "./style.scss";
import {
  validateEmail,
  validatePassword,
  validateEmpty,
  validateDropDown,
} from "../../../../Services/validation";
import { segmentTrack } from "../../../../Services/segment";
import { Settings } from "../../../../Services/segmentEventDetails";
import ActionBlock from "../../../../Common/Components/Molecule/ActionBlock";
import PageTitle from "../../../../Common/Components/Molecule/Atoms/PageTitle";
import BlocksComponent from "../../../../Common/Components/Molecule/Block";
import BlockHeader from "../../../../Common/Components/Molecule/Block/BlockHeader";
import StatusTag from "../../../../Common/Components/Molecule/Atoms/StatusTag";
import DataList from "../../../../Common/Components/Molecule/DataList";
import Avatar from "react-avatar";
import AddEmployeeComponent from "../AddEmployeeComponent";
// import EmployeeSubBlock from "./EmployeeSubBlock";
import SubBlock from "../../../../Wocam/Components/CameraListComponent/CameraDetailsComponent/CameraSubBlock";
import SettingConfirmModal from "../../ModalComponents/SettingConfirmModal";

const EmployeeDetailsComponent = (props) => {
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [action, setAction] = useState(false);
  const [employeeId] = useState(props.employeeId);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [
    confirmationModalVisibility,
    setConfirmationModalVisibility,
  ] = useState(false);

  const [taskRunningData, setTaskRunningData] = useState([]);
  const [directRecordingRunningData, setDirectRecordingData] = useState([]);
  //Modal
  const [updatePasswordShow, setUpdatePasswordShow] = useState(false);
  const closeTo = () => {
    setUpdatePasswordShow(false);
    segmentTrack({ title: Settings.EmployeeDetail.cancelUpdatePassword });
  };

  const employeeDetailsList = [
    {
      dataLabel: "Mobile:",
      dataString: employeeDetails.mobile ? employeeDetails.mobile : "-",
    },
    {
      dataLabel: "Permission Level:",
      dataString: employeeDetails.admin ? "Admin" : "User",
    },
    {
      dataLabel: "Role:",
      dataString: employeeDetails.role ? employeeDetails.role : "-",
    },
    {
      dataLabel: "Supervisor:",
      dataString:
        employeeDetails &&
        employeeDetails.supervisor &&
        employeeDetails.supervisor.length
          ? employeeDetails.supervisor.map((el, index) => {
              return (
                <li className="fw-400 tag-block primary-color " key={index}>
                  <span>{el}</span>
                </li>
              );
            })
          : "-",
    },
  ];

  useEffect(() => {
    if (Object.keys(employeeDetails).length && employeeDetails?.task?.length) {
      let task = [],
        directRecording = [],
        i = 0;

      for (; i < employeeDetails.task.length; i++) {
        if (employeeDetails.task[i].isTask) {
          task.push(employeeDetails.task[i]);
        } else {
          directRecording.push(employeeDetails.task[i]);
        }
      }
      setTaskRunningData(task);
      setDirectRecordingData(directRecording);
    }
  }, [employeeDetails]);

  const additionalDataList = [
    // {
    //   dataLabel: "Designation:",
    //   dataString: employeeDetails.designation
    //     ? employeeDetails.designation
    //     : "-",
    // },
    {
      dataLabel: "Joined:",
      dataString: employeeDetails.created_at ? employeeDetails.created_at : "-",
    },

    {
      dataLabel: "Last Active:",
      dataString: employeeDetails.updated_at ? employeeDetails.updated_at : "-",
    },
  ];

  const getEmployeeDetails = useCallback(async () => {
    try {
      let employeeDetailResponse = await callApi(
        `${API_BASE_URL}/user/get/${employeeId}`
      );
      if (
        employeeDetailResponse.status === 200 &&
        employeeDetailResponse.data
      ) {
        setEmployeeDetails(employeeDetailResponse.data);
      } else history.goBack();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, []);

  useEffect(() => {
    try {
      /**
       * Get Employee Detail
       * */
      getEmployeeDetails();
    } catch (e) {
      showAlert(e, "error");
      history.goBack();
    }
  }, [show]);

  const handleUpdatePassword = async () => {
    if (updatedPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
      try {
        let updatePasswordResponse = await callApi(
          `${API_BASE_URL}/user/password/update`,
          {
            method: "PUT",
            body: JSON.stringify({
              user: employeeId,
              password: updatedPassword,
            }),
          }
        );
        if (updatePasswordResponse.status === 200) {
          setUpdatePasswordShow(false);
          segmentTrack({ title: Settings.EmployeeDetail.updatedPassword });
        }
        showAlert(updatePasswordResponse.message);
      } catch (e) {
        showAlert(e, "error");
      }
    } else {
      setIsPasswordValid(false);
      // showAlert(
      //   "password must contain at least 8 characters, including upper,lowercase and numbers.",
      //   "warning"
      // );
    }
  };

  const handleDeleteUser = async () => {
    try {
      let userDeleteResponse = await callApi(
        `${API_BASE_URL}/user/status/update`,
        {
          method: "PUT",
          body: JSON.stringify({
            ids: [employeeId],
            status: "Deleted",
          }),
        }
      );
      if (userDeleteResponse.status === 200) {
        setConfirmationModalVisibility(false);
        history.push(EMPLOYEE);
      }
      showAlert(userDeleteResponse.message);
    } catch (e) {
      showAlert(e, "error");
    }
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"User Profile"}
          showSubTitle={false}
          breadcrumb={[
            { name: "Settings", link: EMPLOYEE },
            { name: "Employee Details" },
          ]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              {/* <Link
                className="btn btn-textIcon"
                to={
                  employeeDetails && employeeDetails._id
                    ? `${ADDEMPLOYEE}?employee=${employeeDetails._id}`
                    : `${EMPLOYEE}`
                }
              > */}
              <button
                className="btn btn-textIcon"
                onClick={() => {
                  setShow(true);
                  setAction("edit");
                }}
              >
                <span>
                  <IconPencil /> Edit
                </span>
              </button>
              {/* </Link> */}
            </li>

            <li className={"list-inline-item"}>
              <button
                className="btn btn-textIcon"
                onClick={() => {
                  setUpdatedPassword("");
                  setIsPasswordValid(true);
                  setUpdatePasswordShow(true);
                  segmentTrack({
                    title: Settings.EmployeeDetail.updatePasswordButton,
                  });
                }}
              >
                <span>
                  <IconLock /> Update Password
                </span>
              </button>
            </li>
            <li className={"list-inline-item"}>
              <button
                className={"btn btn-textIcon"}
                onClick={() => {
                  setConfirmationModalVisibility(true);
                }}
              >
                <span>
                  <IconTrash /> Delete
                </span>
              </button>
            </li>
          </ActionBlock>
        </PageTitle>
        <AddEmployeeComponent
          data={{
            show,
            setShow,
            action,
            setAction,
            employeeId,
            successCallback: () => {
              getEmployeeDetails();
            },
            module: "Settings",
          }}
        />
        <div className="row">
          {/*First Block*/}
          <div className={"col-xl-4 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 panel-fh"}>
                <div className={"element-content-wrapper"}>
                  <div className={"d-flex align-self-center"}>
                    <div className={"element-img-block mr-3"}>
                      <Avatar
                        className="img-fluid mx-auto d-block"
                        name={employeeDetails.name}
                        size="40"
                        round={true}
                        src={employeeDetails.displayImage}
                      />
                    </div>
                    <div className={"element-content-block"}>
                      <h6 className={"text-primary mb-1"}>
                        {employeeDetails.name ? employeeDetails.name : "-"}
                      </h6>
                      <p className={"mb-0 fw-500"}>
                        {employeeDetails.username
                          ? employeeDetails.username
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <StatusTag
                    status={
                      employeeDetails.status ? employeeDetails.status : "-"
                    }
                  />
                </div>
                <tbody className={"data-table-list"}>
                  {employeeDetailsList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
              </div>
            </BlocksComponent>
          </div>

          {/*Second Block*/}
          <div className={"col-xl-4 col-lg-6 col-md-6"}>
            <BlocksComponent>
              <div className={"element-section mb-0 "}>
                <BlockHeader>
                  <h6 className={"element-title-h6"}>Additional Details</h6>
                </BlockHeader>
                <tbody className={"data-table-list"}>
                  {additionalDataList.map((data) => (
                    <DataList
                      dataLabel={data.dataLabel}
                      dataString={data.dataString}
                    />
                  ))}
                </tbody>
                <BlockHeader>
                  <h5 className="element-title-h6">Supervisor of Executives</h5>
                </BlockHeader>
                <ul className="mb-0 list-inline">
                  {employeeDetails.supervised &&
                  employeeDetails.supervised.length
                    ? employeeDetails.supervised.map((el, index) => {
                        return (
                          <li className="list-inline-item">
                            <div
                              className="fw-400 tag-block tag-md"
                              key={index}
                            >
                              {el}
                            </div>
                          </li>
                        );
                      })
                    : "-"}
                </ul>
              </div>
            </BlocksComponent>
          </div>

          {/*update password modal*/}
          <div className="form-group">
            <Modal
              size="md"
              show={updatePasswordShow}
              onHide={closeTo}
              aria-labelledby="region-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title id="region-modal">
                  <h4>Edit Password</h4>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="region-body">
                  <div className="roi-labels mb-4">
                    <div className="form-group">
                      <label htmlFor="inputEmail3" className=" col-form-label">
                        Password
                      </label>
                      <input
                        type="text"
                        className={`form-control mb-0 ${
                          isPasswordValid ? " " : "error-red"
                        }`}
                        value={updatedPassword}
                        id="inputState"
                        placeholder="Enter Password"
                        onChange={(e) => {
                          setUpdatedPassword(e.target.value);
                          setIsPasswordValid(
                            validatePassword(e.target.value) === null
                              ? false
                              : true
                          );
                        }}
                      />
                      {isPasswordValid ? null : (
                        <span className="error-msg">
                          Password must contain at least 8 characters, including
                          upper,lowercase and numbers.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  className="btn btn-solid-outline btn-sm"
                  variant="secondary"
                  onClick={closeTo}
                >
                  Close
                </Button>
                <Button
                  className="btn btn-solid btn-sm"
                  variant="primary"
                  onClick={() => {
                    updatedPassword
                      ? handleUpdatePassword()
                      : showAlert("Please enter password");
                  }}
                >
                  Update
                </Button>
              </Modal.Footer>
            </Modal>
          </div>

          {/*Confirmation modal*/}

          <SettingConfirmModal
            visibility={confirmationModalVisibility}
            setVisiblity={setConfirmationModalVisibility}
            headerText={"Confirm Action"}
            footerText={`Are you willing to move ahead with the selected course of action? Click on the button below to proceed forward.`}
            onYes={handleDeleteUser}
            onNo={() => {
              setConfirmationModalVisibility(false);
            }}
            onHide={() => {
              setConfirmationModalVisibility(false);
            }}
          />
        </div>
        <div className={"sub-block"}>
          {/* {employeeDetails?.task?.length ? ( */}
          <SubBlock
            tasks={taskRunningData}
            recordings={directRecordingRunningData}
            isEmployee={true}
            errorMsg={"No tasks are assigned."}
            // module="employee"
            // camera={employeeDetails}
            // successCallBack={() => {
            //   getCameraDetailsAndUpdateState();
            // }}
          />
          {/* ) : (
            <div className="col-md-6 mb-4">
              <div class="block-wrapper">
                No tasks & recordings are assigned.
              </div>
            </div>
          )} */}
          {/* <div className={"row"}>
            <div className={"col-12"}>
              <div className={"sub-page-title"}>
                <h5 className={"mb-0"}>
                  Task Assigned{" "}
                  <span>
                    ({employeeDetails?.task ? employeeDetails.task.length : 0})
                  </span>
                </h5>
              </div>
            </div> */}
          {/* {employeeDetails?.task?.length ? (
              <EmployeeSubBlock task={employeeDetails.task} />
            ) : (
              <div className="col-md-6 mb-4">
                <div class="block-wrapper">
                  No tasks are running on this camera.
                </div>
              </div>
            )} */}
          {/* {employeeDetails?.task?.length ? (
              <SubBlock
                tasks={taskRunningData}
                recordings={directRecordingRunningData}
                module="employee"
                // camera={employeeDetails}
                // successCallBack={() => {
                //   getCameraDetailsAndUpdateState();
                // }}
              />
            ) : (
              <div className="col-md-6 mb-4">
                <div class="block-wrapper">
                  No tasks & recordings are assigned.
                </div>
              </div>
            )} */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(EmployeeDetailsComponent);
