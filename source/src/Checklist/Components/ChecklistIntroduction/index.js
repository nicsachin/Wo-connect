import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { IconExternalLink } from "../../../Common/Components/IconsComponent/Index";
import { Modal } from "react-bootstrap";
import IconArrowBack from "../../../Common/Components/IconsComponent/IconArrowBackLeft";
import callApi from "../../../Services/callApi";
import { API_BASE_URL } from "../../../Constants";
import IntroductionProcessSidebar from "../../../Common/Containers/_layouts/IntroductionProcessSidebar";
import IntroductionComponent from "../IntroductionComponent";
import replaceHtml from "../../../Services/replaceHtml";

const ChecklistIntroductionComponent = (props) => {
  // const isNavbarVisible = useSelector((state) => state.navbar);
  // const { params } = props.match;
  const [task, setTask] = useState("");
  const [selectedTask, setSelectedTask] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [industry, setIndustry] = useState("");
  const [currentTaskIndex, setIndex] = useState(0);

  const getTask = async () => {
    const data = await callApi(
      `${API_BASE_URL}/checklist/tasks/get/${props.data.selectedChecklist}`
    );
    if (data && data.status === 200) {
      let taskData = {
        model: "Introduction",
        description: replaceHtml(data.data.checklist.description),
      };
      let arr = [taskData, ...data.data.tasks];
      setCheckList(data.data.checklist);
      setTask(arr);
      setSelectedTask(arr[0]);
      setIndustry(data.data.checklist.model);
    }
  };

  useEffect(() => {
    getTask();
  }, [props.data.selectedChecklist]);

  const moveNext = () => {
    let nextIndex = currentTaskIndex + 1;
    if (nextIndex === task.length) nextIndex = 0;
    setIndex(nextIndex);
    setSelectedTask(task[nextIndex]);
  };

  return (
    <Modal
      size="lg"
      show={props.data.showModal}
      onHide={() => props.data.setShowModal(false)}
      dialogClassName="checklist-modal"
      centered
    >
      <Modal.Header className={"border-0 mb-0"} closeButton />
      <Modal.Body className={"mb-0"}>
        <div className={"modal-checklist"}>
          <div className={"modal-sidebar"}>
            <div className={"header-block"}>
              <span className={"d-block mb-4"}>
                <Link
                  to={"#"}
                  className={"mb-5"}
                  onClick={() => {
                    props.data.setShow(true);
                    props.data.setShowModal(false);
                  }}
                >
                  <IconArrowBack /> Back to browse
                </Link>
              </span>
              <p className={"fw-500"}>{checkList.model && checkList.model}</p>
              <p> {checkList && checkList.brief}</p>
            </div>
            <IntroductionProcessSidebar
              task={task}
              checkList={checkList}
              setSelectedTask={setSelectedTask}
              setIndex={setIndex}
              showRunChecklist={true}
              currentTaskIndex={currentTaskIndex}
            />
            <div className={"bottom-quick-links"}>
              <p className={"fw-500"}>Get Support</p>
              <ul>
                <li>
                  <a
                    href={
                      "http://help.wobot.ai/adding-a-checklist-from-premade-templates"
                    }
                    target={"_blank"}
                  >
                    How to Setup Checklists <IconExternalLink />
                  </a>
                </li>
                <li>
                  <a
                    href={"http://help.wobot.ai/kb-tickets/new"}
                    target={"_blank"}
                  >
                    Contact Support <IconExternalLink />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <IntroductionComponent
            selectedChecklist={props.data.selectedChecklist}
            industry={industry}
            selectedTask={selectedTask}
            checkList={checkList}
            moveNext={moveNext}
            task={task}
            checklist={checkList}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ChecklistIntroductionComponent);
