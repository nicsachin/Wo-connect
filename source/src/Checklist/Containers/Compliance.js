import React, { useEffect, useState } from "react";
import SidebarProcess from "../../Common/Containers/_layouts/ProcessSidebar";
import Header from "../../Common/Containers/_layouts/Header";
import { useSelector, connect } from "react-redux";
import { useHistory, withRouter } from "react-router-dom";
import { toggleNavbarAction } from "../../Store/actions";
import callApi from "../../Services/callApi";
import { API_BASE_URL, CHECKLIST } from "../../Constants";
import ConfigComponent from "../Components/ComplianceComponent/ConfigComponent";
import CameraComponent from "../Components/ComplianceComponent/CameraComponent";
import ScheduleComponent from "../Components/ComplianceComponent/ScheduleComponent";
import AssignUserComponent from "../Components/ComplianceComponent/AssignUserComponent";

const Compliance = (props) => {
  const history = useHistory();

  const isNavbarVisible = useSelector((state) => state.navbar);
  const { checklistId } = props.match.params;
  const [task, setTask] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState([]);
  const [locationIds, setLocationIds] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [prevLocations, setPrevLocations] = useState([]);
  const [runChecklist, setRunChecklist] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskId, setTaskId] = useState("");
  const { manifest } = useSelector((state) => state.userData);
  const [previousJSON, setPreviousJSON] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    setLocations(getLocations());
    let ids = [];
    selectedLocations.forEach((el) => ids.push(el.value));
    setLocationIds([...ids]);
  }, [selectedLocations]);

  const getLocations = () => {
    let options = [];
    if (!manifest || !manifest.regions) return options;
    for (let el of manifest.regions) {
      if (locationIds.indexOf(el.id) > -1) {
        let city = manifest.regions.filter((o) => el.parent === o._id)[0];
        let r = manifest.regions.filter((o) => city.parent === o._id)[0];
        let schedule = previousJSON.filter((o) => o.location.id === el._id);
        let ids = schedule.length
          ? (schedule[0] || []).schedules.map((id) => {
              return { _id: id };
            })
          : [];
        let obj = {
          city: city,
          region: r,
          schedule: ids,
          ...el,
        };
        options.push(obj);
      }
    }
    return options;
  };

  const getTaskByChecklistId = async () => {
    const { data } = await callApi(
      `${API_BASE_URL}/checklist/tasks/get/${checklistId}`
    );
    let taskData = {
      // model: "Introduction",
      // description: data.checklist.description
    };
    let arr = [taskData, ...data.tasks];
    setTask(arr);
    setCheckList(data.checklist);
    setSelectedTask(arr[currentTaskIndex + 1]);
    setIsCompleted(
      (arr[currentTaskIndex + 1] && arr[currentTaskIndex + 1].isCompleted) ||
        false
    );
    setCurrentTaskIndex(currentTaskIndex + 1);
  };

  useEffect(() => {
    getTaskByChecklistId();
  }, [checklistId]);

  const moveNext = (index) => {
    if (index >= 0) setCurrentIndex(index);
    else setCurrentIndex(currentIndex + 1);
  };

  const saveAndGoToNext = () => {
    if (currentTaskIndex >= task.length - 1) history.push(CHECKLIST);
    setCurrentIndex(0);
    setSelectedTask(task[currentTaskIndex + 1]);
    let isCompleted =
      (task[currentTaskIndex + 1] && task[currentTaskIndex + 1].isCompleted) ||
      false;
    setIsCompleted(isCompleted);
    setCurrentTaskIndex(currentTaskIndex + 1);
  };

  const moveToTask = (index) => {
    setCurrentIndex(0);
    setSelectedTask(task[index]);
    let isCompleted = (task[index] && task[index].isCompleted) || false;
    setIsCompleted(isCompleted);
    setCurrentTaskIndex(index);
  };

  const getComponent = (index) => {
    switch (index) {
      case 0:
        return (
          <ConfigComponent
            setCurrentIndex={moveNext}
            checklistId={checklistId}
            setTaskId={setTaskId}
            selectedTask={selectedTask}
            saveAndGoToNext={saveAndGoToNext}
            setIsCompleted={setIsCompleted}
            setSelectedLocations={setSelectedLocations}
            isCompleted={isCompleted}
            setPrevLocations={setPrevLocations}
            setPreviousJSON={setPreviousJSON}
          />
        );

      case 1:
        return (
          <CameraComponent
            setCurrentIndex={moveNext}
            selectedTask={selectedTask}
            setSelectedCamera={setSelectedCamera}
            setLocationIds={setLocationIds}
            taskId={taskId}
            saveAndGoToNext={saveAndGoToNext}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            isCompleted={isCompleted}
            selectedCamera={selectedCamera}
            setLocations={setLocations}
            locations={locations}
            prevLocations={prevLocations}
          />
        );

      case 2:
        return (
          <ScheduleComponent
            setCurrentIndex={moveNext}
            selectedTask={selectedTask}
            selectedCamera={selectedCamera}
            selectedSchedule={selectedSchedule}
            setSelectedSchedule={setSelectedSchedule}
            locations={getLocations()}
            taskId={taskId}
            saveAndGoToNext={saveAndGoToNext}
            isCompleted={isCompleted}
            prevLocations={prevLocations}
          />
        );

      case 3:
        return (
          <AssignUserComponent
            saveAndGoToNext={saveAndGoToNext}
            selectedTask={selectedTask}
            selectedSchedule={selectedSchedule}
            selectedCamera={selectedCamera}
            setCurrentIndex={moveNext}
            locations={getLocations()}
            taskId={taskId}
            fetchList={getTaskByChecklistId}
            isCompleted={isCompleted}
          />
        );

      default:
        return "";
    }
  };

  return (
    <div className="wrapper">
      <SidebarProcess
        task={task}
        runChecklist={runChecklist}
        checkList={checkList}
        setSelectedTask={setSelectedTask}
        currentTaskIndex={currentTaskIndex}
        backUrl={`${
          props.location.search === "?back"
            ? CHECKLIST
            : `${CHECKLIST}/${checklistId}`
        }`}
        showRunChecklist={false}
        moveToTask={moveToTask}
        isCompleted={isCompleted}
      />
      <div id="content_process" className={!isNavbarVisible ? "active" : ""}>
        <Header />
        {currentIndex === 0
          ? getComponent(currentIndex)
          : taskId !== "" && getComponent(currentIndex)}
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

export default connect(null, mapDispatchToProps)(withRouter(Compliance));
