import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { EMPLOYEE, API_BASE_URL } from "../../../../Constants";
import { showAlert } from "../../../../Services/showAlert";
import callApi from "../../../../Services/callApi";
import IconArrowLeft from "../../../../Common/Components/IconsComponent/IconArrowLeft";
import getQueryVariable from "../../../../Services/getQueryVariable";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import {
  validateEmail,
  validatePassword,
  validateEmpty,
  validateMobile,
  validateDropDown,
} from "../../../../Services/validation";
import { addEmpError } from "../../../Resources";
import { segmentTrack } from "../../../../Services/segment";
import { Settings } from "../../../../Services/segmentEventDetails";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

let defaultErrorLabels = {
  name: "",
  email: "",
  role: "",
  mobile: "",
  selectedSupervisor: "",
};

const AddEmployeeComponent = (props) => {
  const history = useHistory();
  // const [employee] = useState(getQueryVariable("employee"));
  const [employee] = useState(props.data.employeeId);
  const [action, setAction] = useState("");
  const [error, setError] = useState(defaultErrorLabels);

  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isRoleValid, setIsRoleValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [roleListForSearch, setRoleListForSearch] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [supervisorListForSearch, setSupervisorListForSearch] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    const roleList = [
      { value: "Admin", label: "Admin" },
      { value: "Supervisor", label: "Supervisor" },
      { value: "Executive", label: "Executive" },
    ];
    setRoleListForSearch(roleList);

    if (
      props.data.employeeId &&
      props.data.action &&
      props.data.action === "edit"
    ) {
      // setAction("edit");
      const getEmployeeData = async () => {
        try {
          let res = await callApi(
            `${API_BASE_URL}/user/get/${props.data.employeeId}`,
            {
              method: "GET",
            }
          );
          if (res.status === 200) {
            setName(res.data.name);
            // setIsAdmin(res.data.admin);
            setEmail(res.data.email);
            setPhone(res.data.mobile);
            setSelectedRole({ value: res.data.role, label: res.data.role });
            setRole(res.data.role);
            if (res.data.supervisor) {
              setSelectedSupervisor({
                label: res.data.supervisor[0],
                value: res.data._supervisor[0],
              });
            } else {
              setSelectedSupervisor("");
            }

            setDesignation(res.data.designation);
            getSupervisorList(res.data.role);
          }
        } catch (e) {
          showAlert(e, "error");
        }
      };
      getEmployeeData();
    }
  }, [props.data.show]);

  /**
   * Get Supervisor Details
   * */
  const getSupervisorList = async (targetValue) => {
    if (targetValue === "Executive") {
      try {
        let getEmployeeResponse = await callApi(
          `${API_BASE_URL}/filter/team?status=Active&&role=Supervisor`
        );
        console.log(getEmployeeResponse);
        if (getEmployeeResponse.status === 200) {
          let result = [];
          for (let el of getEmployeeResponse.data.data) {
            result.push({ value: el._id, label: el.name });
          }
          setSupervisorListForSearch(result);
          return "";
        }
        showAlert(getEmployeeResponse.message);
      } catch (e) {
        showAlert(e, "error");
      }
      return [];
    } else {
      setSupervisorListForSearch([]);
      setSelectedSupervisor({ value: null, label: null });
      return [];
    }
  };
  const handleClose = () => {
    // setEmployeeShow(false);
    if (props.data.action && props.data.action === "create") {
      segmentTrack({ title: Settings.EmployeeList.cancelAddModal });
    } else {
      segmentTrack({ title: Settings.EmployeeList.cancelEditModal });
    }
    props.data.setAction("");
    setError(defaultErrorLabels);
    setSelectedRole("");
    setName("");
    // setIsAdmin(false);
    setEmail("");
    setPhone("");
    setRole("");
    props.data.setShow(false);
  };
  const handleValidation = () => {
    let validationSuccess = true;
    let errorInForm = { ...error };
    let obj = {
      name: name,
      email: email,
      role: selectedRole,
      selectedSupervisor,
      // mobile: phone,
    };
    for (let key in obj) {
      if (obj[key]) {
        errorInForm = { ...errorInForm, [key]: "" };
      } else {
        errorInForm = { ...errorInForm, [key]: addEmpError[key] };
        validationSuccess = false;
      }
    }
    if (email && validateEmail(email)) {
      errorInForm = { ...errorInForm, email: addEmpError.invalidEmail };
      validationSuccess = false;
    }
    if (phone && validateMobile(phone)) {
      errorInForm = { ...errorInForm, mobile: addEmpError.mobile };
      validationSuccess = false;
    }

    // if (role && !validateEmpty(role)) {
    //   errorInForm = { ...errorInForm, role: addEmpError.role };
    //   validationSuccess = false;
    // }
    setError(errorInForm);
    return validationSuccess;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // handleValidation();
    // setIsEmailValid(validateEmpty(email));
    // setIsNameValid(validateEmpty(name));
    //if (name && email && phone && selectedRole && designation) {
    // if (name && email && selectedRole) {
    if (handleValidation()) {
      if (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        if (!validateEmpty(phone)) {
          if (
            (selectedRole.value === "Executive" &&
              selectedSupervisor &&
              selectedSupervisor.value !== null) ||
            ((selectedRole.value === "Supervisor" || "Admin") &&
              selectedSupervisor &&
              selectedSupervisor.value === null)
          ) {
            let config = {
              url: "",
              method: "",
              body: "",
            };
            switch (props.data.action) {
              case "create": {
                config.url = `${API_BASE_URL}/team/member/create`;
                config.method = "POST";
                config.body = JSON.stringify({
                  name,
                  email,
                  mobile: phone,
                  //designation,
                  // admin: isAdmin,
                  supervisor: selectedSupervisor.value,
                  role: selectedRole.label,
                });
                break;
              }
              case "edit": {
                config.url = `${API_BASE_URL}/team/update/${props.data.employeeId}`;
                config.method = "PUT";
                config.body = JSON.stringify({
                  name,
                  email,
                  mobile: phone,
                  role: selectedRole.label,
                  //designation,
                  // admin: isAdmin,
                  supervisor: selectedSupervisor.value,
                });
                break;
              }
              default: {
                break;
              }
            }
            try {
              let res = await callApi(config.url, {
                method: config.method,
                body: config.body,
              });
              if (res.status === 200) {
                if (props.data.action && props.data.action === "create") {
                  // history.push(EMPLOYEE);
                  segmentTrack({
                    title: Settings.EmployeeList.createdEmployee,
                  });
                } else if (props.data.action && props.data.action === "edit") {
                  history.push(
                    `/settings/employee/detail/${props.data.employeeId}`
                  );
                  segmentTrack({ title: Settings.EmployeeList.editedEmployee });
                }
              }
              handleClose();
              showAlert(res.message);
            } catch (e) {
              showAlert(e, "error");
            }
          } else {
            setError({
              ...error,
              selectedSupervisor: "Please select a supervisor",
            });
            // showAlert("Please select supervisor");
          }
          // } else {
          //   showAlert("Please enter valid phone number");
          // }
        } else {
          showAlert("Please enter valid mobile");
        }
      } else {
        showAlert("Please enter valid email");
      }
    } else {
      return 0;
    }
  };
  // const handleOnChange = (e) => {
  //   if (e.target.value === "Yes") {
  //     setIsAdmin(true);
  //   } else {
  //     setIsAdmin(false);
  //   }
  // };

  return (
    <Modal
      size="lg"
      show={props.data.show}
      onHide={() => {
        handleClose();
      }}
      aria-labelledby="employee-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="employee-modal">
          <h4>{props.data.action === "edit" ? "Edit" : "Add"} User</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-body">
          <div className="form-group row">
            <div className="col-md-6">
              <label htmlFor="Recorder_name" className="form-label">
                Employee Name
              </label>
              <input
                type="text"
                className="form-control"
                maxLength="50"
                value={name}
                id="Recorder_name"
                placeholder="e.g. John Doe"
                onChange={(e) => {
                  setError({ ...error, name: "" });
                  setName(e.target.value);
                  // setIsNameValid(validateEmpty(e.target.value));
                }}
              />
              {error.name ? (
                <span className="error-msg">{error.name}</span>
              ) : null}
              {/* {isNameValid && (
                          <span className="error-msg">
                            Please enter a username.
                          </span>
                        )} */}
            </div>
            <div className="col-md-6">
              <label htmlFor="Recorder_name" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                id="Recorder_name"
                placeholder="e.g. admin@wobot.ai"
                onChange={(e) => {
                  setEmail(e.target.value);
                  // setIsEmailValid(validateEmpty(e.target.value));
                  // setIsEmailValid(validateEmail(e.target.value));
                  if (validateEmail(e.target.value)) {
                    setError({
                      ...error,
                      email: addEmpError.invalidEmail,
                    });
                  } else {
                    setError({ ...error, email: "" });
                  }
                }}
              />
              {/* {isEmailValid && (
                          <span className="error-msg">
                            Please enter a valid email/username.
                          </span>
                        )} */}
              {error.email ? (
                <span className="error-msg">{error.email}</span>
              ) : null}
            </div>
          </div>
          <div className="form-group row mt-60">
            <div className="col-md-6">
              <label htmlFor="Recorder_name" className="form-label">
                Phone Number
              </label>
              <PhoneInput
                value={phone}
                defaultCountry="IN"
                className="form-control"
                placeholder="Enter phone number"
                onChange={(num) => {
                  setPhone(num);
                  if (
                    //num != "+91" && num != undefined &&
                    validateMobile(num)
                  ) {
                    // if (!validateEmpty(num) && validateMobile(num)) {
                    setError({
                      ...error,
                      mobile: addEmpError.mobile,
                    });
                  } else {
                    setError({ ...error, mobile: "" });
                  }
                }}
              />
              {error.mobile ? (
                <span className="error-msg">{error.mobile}</span>
              ) : null}
            </div>
            <div className="col-md-6">
              <label htmlFor="Role_name" className="form-label">
                Role
              </label>
              <Select
                value={selectedRole}
                onChange={(selectedOption) => {
                  setError({ ...error, role: "" });
                  setSelectedRole(selectedOption);
                  getSupervisorList(selectedOption.value);
                  // setIsRoleValid(
                  //   validateEmpty(selectedOption.value)
                  // );
                }}
                options={roleListForSearch}
              />
              {error.role ? (
                <span className="error-msg">{error.role}</span>
              ) : null}
              {/* {isRoleValid && (
                          <span className="error-msg">Please select one.</span>
                        )} */}
            </div>
          </div>

          <div className="form-group row mt-60">
            {/* {isRoleValid && (
                          <span className="error-msg">Please select one.</span>
                        )} */}
            {/* {selectedRole.value && error.role === "Executive" ? (
                        <span className="error-msg">{error.role}</span>
                      ) : null} */}
            {/* <div className="col-md-6">
              <div>
                <div className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id="customRadioInline1"
                    value="Yes"
                    name="admin"
                    checked={isAdmin ? true : false}
                    // onChange={(e) => handleOnChange(e)}
                    className="custom-control-input"
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customRadioInline1"
                  >
                    Admin{" "}
                  </label>
                </div>
                <div className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id="customRadioInline2"
                    value="No"
                    name="admin"
                    checked={isAdmin ? false : true}
                    // onChange={(e) => handleOnChange(e)}
                    className="custom-control-input"
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customRadioInline2"
                  >
                    User
                  </label>
                </div>
              </div>
            </div> */}
            {selectedRole && selectedRole.value === "Executive" ? (
              <div className="col-md-6">
                <label htmlFor="Recorder_name" className="form-label">
                  Supervisor
                </label>
                <Select
                  value={selectedSupervisor}
                  onChange={(selectedOption) => {
                    setSelectedSupervisor(selectedOption);
                    if (validateEmpty(selectedSupervisor)) {
                      setError({
                        ...error,
                        selectedSupervisor: addEmpError.selectedSupervisor,
                      });
                    } else {
                      setError({ ...error, selectedSupervisor: "" });
                    }
                    // setIsRoleValid(
                    //   validateEmpty(selectedOption.value)
                    // );
                  }}
                  options={supervisorListForSearch}
                />
                {error.selectedSupervisor ? (
                  <span className="error-msg">{error.selectedSupervisor}</span>
                ) : null}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn fw-500 btn-sm" onClick={handleClose}>
          Cancel
        </button>
        <button
          type={"submit"}
          onClick={handleSubmit}
          className="btn btn-sm btn-primary"
        >
          {props.data.action === "edit" ? "Update User" : "Add User"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(AddEmployeeComponent);
