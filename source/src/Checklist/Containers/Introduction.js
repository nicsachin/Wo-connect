import React, { useEffect, useState } from "react";
import IntroductionComponent from "../Components/IntroductionComponent";
import SidebarProcess from "../../Common/Containers/_layouts/ProcessSidebar";
import Header from "../../Common/Containers/_layouts/Header";
import { useSelector, connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toggleNavbarAction } from "../../Store/actions";
import callApi from "../../Services/callApi";
import replaceHtml from "../../Services/replaceHtml";
import { API_BASE_URL } from "../../Constants";

const Introduction = (props) => {
  const isNavbarVisible = useSelector((state) => state.navbar);
  const { params } = props.match;
  const [task, setTask] = useState("");
  const [selectedTask, setSelectedTask] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [currentTaskIndex, setIndex] = useState(0);

  const getTask = async () => {
    const data = await callApi(
      `${API_BASE_URL}/checklist/tasks/get/${params.id}`
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
    }
  };

  useEffect(() => {
    getTask();
  }, []);

  const moveNext = () => {
    let nextIndex = currentTaskIndex + 1;
    if (nextIndex === task.length) nextIndex = 0;
    setIndex(nextIndex);
    setSelectedTask(task[nextIndex]);
  };

  return (
    <div className="wrapper">
      <SidebarProcess
        task={task}
        checkList={checkList}
        setSelectedTask={setSelectedTask}
        setIndex={setIndex}
        showRunChecklist={true}
        currentTaskIndex={currentTaskIndex}
      />
      <div id="content_process" className={!isNavbarVisible ? "active" : ""}>
        <Header />
        <IntroductionComponent
          selectedTask={selectedTask}
          checkList={checkList}
          moveNext={moveNext}
          task={task}
        />
      </div>
      <div
        className={!isNavbarVisible ? "overlay" : ""}
        onClick={() => {
          props.toggleNavbarComponent();
        }}
      ></div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarComponent: () => {
      dispatch(toggleNavbarAction());
    },
  };
};

export default connect(null, mapDispatchToProps)(withRouter(Introduction));
