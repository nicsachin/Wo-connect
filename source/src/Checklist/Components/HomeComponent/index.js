import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { Link } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import "./style.scss";
import {
  API_BASE_URL,
  CHECKLIST,
  COMPLIANCE,
  COMPLIANCE_RUN,
  DEBOUNCE_INPUT_TIME,
} from "../../../Constants";
import { useSelector } from "react-redux";
import callApi from "../../../Services/callApi";
import DataTable from "react-data-table-component";
import {
  IconAdd,
  IconAddCircle,
  IconArrowNextRight,
  IconExternalLink,
  IconSearch,
} from "../../../Common/Components/IconsComponent/Index";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import Block from "../../../Common/Components/Molecule/Block";
import IconArrowBack from "../../../Common/Components/IconsComponent/IconArrowBackLeft";
import ChecklistIntroduction from "../ChecklistIntroduction";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
const HomeComponent = (props) => {
  const [industry, setIndustry] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState({});
  const [checklist, setChecklist] = useState([]);
  const userInfo = useSelector((state) => state);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setSearchedValue("");
    setChecklist([]);
  };
  const handleShow = () => setShow(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [searchedValue, setSearchedValue] = useState("");
  // const handleCloseModal = () => setShowModal(false);
  // const handleShowModal = () => setShowModal(true);

  useEffect(() => {
    if (props.show) {
      setShow(true);
    }
  }, [props.show]);

  // useEffect(() => {
  //   getIndustry();
  // }, []);

  const getIndustry = async () => {
    const result = await callApi(`${API_BASE_URL}/industry/get`);
    if (result && result.data && result.data.length) {
      let ind = [];
      for (let el of result.data) {
        ind.push({
          value: el._id,
          label: el.industry,
        });
      }
      setIndustry(ind);
      if (ind && ind.length) {
        getCheckListByIndustry(ind[0]);
      }
    }
  };

  const getCheckListByIndustry = async (ind, searchVal) => {
    const defaultIndustryId = ind;
    if (defaultIndustryId && defaultIndustryId.value) {
      setSelectedIndustry({ ...defaultIndustryId });
      let url = `${API_BASE_URL}/checklist/get/${
        defaultIndustryId && defaultIndustryId.value
      }`;
      if (searchVal !== "") {
        url += `/?query=${searchedValue.trim()}`;
      }
      const result = await callApi(url);
      if (result && result.data && result.data.checklists) {
        setChecklist([...result.data.checklists]);
      }
    }
  };

  const getCheckListBySearch = async (val) => {
    setSearchedValue(val);
    if (val || val.trim() !== "") {
      const companyId = userInfo.userData.manifest._id;
      const result = await callApi(
        `${API_BASE_URL}/checklist/get/${companyId}/?query=${val.trim()}`,
        {},
        {
          showLoader: false,
          callManifest: true,
          loaderLabel: "",
        }
      );
      if (result && result.data && result.data.checklists) {
        setChecklist([...result.data.checklists]);
      }
    } else {
      setSearchedValue("");
      getCheckListByIndustry(selectedIndustry, val);
    }
  };

  useEffect(() => {
    if (show || showModal || !userInfo.userData.manifest) return;
    if (!userInfo.userData.manifest.isConfigured) {
      setShowModal(true);
    }
  }, []);

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Checklists"}
          showSubTitle={false}
          breadcrumb={[
            { name: "Task" },
            { name: "Checklists", link: CHECKLIST },
          ]}
        />
        {!props.data.length ? (
          <div className={"middle-box"}>
            <Block>
              <div className={"middle-img"}>
                <img
                  width="30"
                  height="30"
                  className="img-fluid mx-auto d-block"
                  src={`/assets/images/checklist-404.svg`}
                  alt="logo"
                />
                <p className={"text-other"}>
                  Your checklists will appear here. Checklists are a collection
                  of different tasks and activities grouped together by
                  templates.
                </p>

                <p className={"text-other"}>
                  You can browse and add a new checklist by clicking the 'Add
                  Checklist' button below.
                </p>
              </div>
              {/* <Link to={""} className={"btn btn-link"}>
                Add Cameras Instead
              </Link> */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  getIndustry();
                  handleShow();
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
                      `Clicked on add checklist | Checklist`,
                      {
                        title: `Clicked on add checklist | Checklist`,
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
                Add Checklist
              </button>
            </Block>
          </div>
        ) : (
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <button
                className="btn btn-textIcon"
                onClick={() => {
                  getIndustry();
                  handleShow();
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
                      `Clicked on add checklist | Checklist`,
                      {
                        title: `Clicked on add checklist | Checklist`,
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
                <span>
                  <IconAdd /> Add Checklist
                </span>
              </button>
            </li>
          </ActionBlock>
        )}

        <div className={"panel-body mt-60"}>
          <div id="table-content" className={"checklist-table"}>
            {props.data && props.data.length ? (
              <DataTable
                selectableRows={false}
                pagination
                paginationPerPage={10}
                columns={props.columns}
                data={props.data}
                striped={false}
                dense
                paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                paginationComponentOptions={{ rowsPerPageText: "" }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        dialogClassName="checklist-modal"
        centered
      >
        <Modal.Header className={"border-0 mb-0"} closeButton />
        <Modal.Body className={"mb-0"}>
          <div className={"modal-checklist"}>
            <div className={"modal-sidebar"}>
              <div className={"header-block"}>
                <h6 className={"fw-600"}>Checklist Template</h6>
                <div className={"search-filter w-100 float-none"}>
                  <DebounceInput
                    className={"search form-control"}
                    placeholder="Search"
                    debounceTimeout={DEBOUNCE_INPUT_TIME}
                    onChange={(e) => {
                      getCheckListBySearch(e.target.value);
                    }}
                  />
                  <IconSearch />
                </div>
              </div>
              <div className={"checklist-select-list"}>
                <p className={"fw-500"}>Browse by category</p>
                <ul className={"checklist-list-items"}>
                  {selectedIndustry &&
                    (industry || []).map((el, index) => {
                      return (
                        <li
                          className={
                            selectedIndustry.value === el.value &&
                            searchedValue === ""
                              ? "active"
                              : ""
                          }
                          id={el.value}
                          key={el.index}
                          onClick={() => {
                            if (searchedValue === "") {
                              setSelectedIndustry(el);
                              getCheckListByIndustry(el, searchedValue);
                            }
                          }}
                        >
                          {el.label}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
            <div className={"modal-container-box"}>
              <div className={"checklist-title"}>
                {/* <h4>{selectedIndustry && selectedIndustry.label}</h4> */}
                <h4>{searchedValue}</h4>
              </div>
              <div className={"checklist-select-box row"}>
                {(checklist || []).map((el) => {
                  return (
                    <div className={"col-lg-4"}>
                      <div className="option-block panel-fh">
                        <div className="main-block panel-fh" key={el.id}>
                          {/* Add Intorduction Link or onclick */}
                          <div className="img-thumb">
                            <img
                              className="img-fluid"
                              onClick={() => {
                                setSelectedChecklist(el._id);
                                setShowModal(true);
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
                                    `Selected a checklist | Checklist`,
                                    {
                                      title: `Selected a checklist | Checklist`,
                                      email: props.userData.user.email,
                                      username: props.userData.user.username,
                                      companyName:
                                        props.userData.manifest.company.name,
                                      user_id: props.userData.user._id,
                                      company_id: props.userData.manifest._id,
                                      checklist_model: el.model,
                                    }
                                  );
                                }
                              }}
                              src={
                                el.icon
                                  ? el.icon
                                  : `/assets/images/checklist-placeholder.png`
                              }
                              alt="img"
                            />
                          </div>
                          <div className="main-content">
                            {/* Add Intorduction Link or onclick */}
                            <h6
                              className="title mb-10"
                              onClick={() => {
                                setSelectedChecklist(el._id);
                                setShowModal(true);
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
                                    `Selected a checklist | Checklist`,
                                    {
                                      title: `Selected a checklist | Checklist`,
                                      email: props.userData.user.email,
                                      username: props.userData.user.username,
                                      companyName:
                                        props.userData.manifest.company.name,
                                      user_id: props.userData.user._id,
                                      company_id: props.userData.manifest._id,
                                      checklist_model: el.model,
                                    }
                                  );
                                }
                              }}
                            >
                              {el.model}
                            </h6>
                            <p>{el.brief}</p>
                            <div
                              className={
                                "d-flex justify-content-between align-items-center bottom-btn-group"
                              }
                            >
                              <p
                                className={
                                  "primary-text fw-500 text-underline mb-0"
                                }
                              >
                                Contains{" "}
                                {el.task && el.task.length !== 0
                                  ? el.task.length
                                  : 0}{" "}
                                tasks
                              </p>
                              <button
                                className={"btn btn-round-icon"}
                                onClick={() => {
                                  setSelectedChecklist(el._id);
                                  setShowModal(true);
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
                                      `Selected a checklist | Checklist`,
                                      {
                                        title: `Selected a checklist | Checklist`,
                                        email: props.userData.user.email,
                                        username: props.userData.user.username,
                                        companyName:
                                          props.userData.manifest.company.name,
                                        user_id: props.userData.user._id,
                                        company_id: props.userData.manifest._id,
                                        checklist_model: el.model,
                                      }
                                    );
                                  }
                                }}
                              >
                                <span>
                                  <IconArrowNextRight />
                                </span>
                              </button>
                            </div>
                            {/* <div
                              className={
                                "d-flex justify-content-between bottom-btn-group"
                              }
                            >
                              <Link
                                className={"w-100 btn btn-tertiary btn-xs mr-1"}
                                onClick={() => {
                                  setSelectedChecklist(el._id);
                                  setShowModal(true);
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
                                      `Selected a checklist | Checklist`,
                                      {
                                        title: `Selected a checklist | Checklist`,
                                        email: props.userData.user.email,
                                        username: props.userData.user.username,
                                        companyName:
                                          props.userData.manifest.company.name,
                                        user_id: props.userData.user._id,
                                        company_id: props.userData.manifest._id,
                                        checklist_model: el.model,
                                      }
                                    );
                                  }
                                }}
                              >
                                Preview
                              </Link>
                              <Link
                                to={`${COMPLIANCE_RUN}${el._id}`}
                                className={"w-100 btn btn-primary btn-xs ml-1"}
                              >
                                Set Up
                              </Link>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {checklist && checklist.length
                  ? " "
                  : "There is no task to display"}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/* Checklist Introduction */}
      {selectedChecklist ? (
        <ChecklistIntroduction
          data={{ showModal, setShowModal, selectedChecklist, show, setShow }}
        />
      ) : (
        ""
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(HomeComponent);
