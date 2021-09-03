import React, { useCallback, useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import Datetime from "react-datetime";
import Select from "react-select";
import { Collapse, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { DebounceInput } from "react-debounce-input";
import "react-datetime/css/react-datetime.css";
import ReactPlayer from "react-player";
import {
  API_BASE_URL,
  DEBOUNCE_INPUT_TIME,
  DEFAULT_API_CONFIG,
  PLAYBACK,
} from "../../../Constants";
import callApi from "../../../Services/callApi";
import moment from "moment";
import { showAlert } from "../../../Services/showAlert";
import "./style.scss";
import { connect } from "react-redux";
import {
  IconCameraTwo,
  IconFilterLining,
  IconSearch,
  IconTrash,
} from "../../../Common/Components/IconsComponent/Index";
import { colourStyles } from "../../../Services/colourStyles";
import PageTitle from "../../../Common/Components/Molecule/Atoms/PageTitle";
import ActionBlock from "../../../Common/Components/Molecule/ActionBlock";
import Tag from "../../../Common/Components/Molecule/Atoms/Tag";
import DropDown from "../../../Common/Components/Molecule/Atoms/DropDown/inedx";
import IconPlayForward from "../../../Common/Components/IconsComponent/IconPlayForward";
import IconPlayBackward from "../../../Common/Components/IconsComponent/IconPlayBackward";
import PlaybackDefault from "../../../Common/Components/Molecule/Default/PlaybackDefault";

const createOption = (label, value) => ({
  label,
  value,
});

const PlaybackComponent = (props) => {
  const [apiConfig, setApiConfig] = useState(DEFAULT_API_CONFIG);
  let yesterdayDateAndTime = moment().subtract(15, "days").startOf("day");
  let todayDateAndTime = moment().endOf("day");
  let defaultOptionValue = { label: "All", value: "" };

  //for populated date filters
  const [selectedDateFilter, setSelectedDateFilter] = useState([]);
  const [dateFilterForSearch, setDateFilterForSearch] = useState([]);
  //
  const [endTime, setEndTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [show, setShow] = useState(false);

  const videoPlayer = React.createRef();
  // Toggle (menu)
  const [open, setOpen] = useState(false);
  const toggleOpen = (value) => setOpen(value);

  /**
   * Columns
   * */

  const columns = [
    {
      name: "Camera Name",
      selector: "camera",
      sortable: true,
      minWidth: "220px",
      grow: 5,
      cell: (row) => <span className="fs-14 fw-400">{row.camera}</span>,
    },
    {
      name: "Time",
      selector: "startTime",
      cell: (row) => (
        <ul className={"mb-0"}>
          <li>
            {row.startTime} - {row.endTime}
          </li>
          <li>{row.startDate}</li>
        </ul>
      ),
      minWidth: "180px",
      grow: 3,
    },
    {
      name: "Location",
      selector: "location",
      minWidth: "130px",
      grow: 2,
    },
    {
      name: "Mode type",
      selector: "usecaseType",
      minWidth: "130px",
    },
    {
      name: "Task Available",
      selector: "task",
      sortable: true,
      minWidth: "180px",
      grow: 3,
      cell: (row) => (
        <ul className={"mb-0"}>
          {(row.task || []).map((o) => {
            return <li>{o.model}</li>;
          })}
        </ul>
      ),
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      minWidth: "130px",
      grow: 3,
      cell: (row) => (
        <Tag className={`${row.events ? "tag-default" : "tag-orange"}`}>
          {row.events ? `${row.events} events` : "No events"}
        </Tag>
      ),
    },
    {
      name: "Tag Events",
      selector: "actions",
      minWidth: "200px",
      maxWidth: "240px",
    },
  ];

  /**
   * Playback Table data
   * */

  const [modalVisibility, setModalVisibility] = useState(false);
  const [totalRecords, setTotalRecords] = useState([]);
  const [limit, setLimit] = useState(10);
  const [records, setRecords] = useState([]);
  const [selectedTask, setSelectedTask] = useState(defaultOptionValue);
  const [recordingId, setRecordingId] = useState();
  const [capture, setCapture] = useState([]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [cameraId, setCameraId] = useState();
  const [recordingDetails, setRecordingDetails] = useState([]);
  const [events, setEvents] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [currentImg, setCurrentImg] = useState(true);
  const [cameraList, setCameraList] = useState([]);
  const [cameraForSearch, setCameraForSearch] = useState({});
  const [initialApiCall, setInitialApiCall] = useState(0);
  const [cTime, setCtime] = useState();
  const [filterCount, setFilterCount] = useState(0);

  const [query, setQuery] = useState({
    query: "",
    sortBy: "",
    sort: 1,
    customQuery: "",
  });

  const [page, setPage] = useState(0);
  // const [playing, setPlaying] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [next, setNext] = useState("");
  const [previous, setPrevious] = useState("");

  /**
   * Lists
   * */
  const [
    regionAndSubregionCombinedList,
    setRegionAndSubregionCombinedList,
  ] = useState([defaultOptionValue]);
  const [locationListForSearch, setLocationListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [subRegionForSearch, setSubregionForSearch] = useState(
    defaultOptionValue
  );
  const [locationForSearch, setLocationForSearch] = useState(
    defaultOptionValue
  );
  const [usecaseTypeListForSearch, setUseCaseTypeListForSearch] = useState([
    defaultOptionValue,
  ]);
  const [usecaseTypeForSearch, setUseCaseTypeForSearch] = useState(
    defaultOptionValue
  );
  const [startTimeForSearch, setStartTimeForSearch] = useState(
    yesterdayDateAndTime
  );
  const [endTimeForSearch, setEndTimeForSearch] = useState(todayDateAndTime);
  const [taskList, setTaskList] = useState([
    defaultOptionValue,
    { label: "Direct Recording", value: "directRecording" },
  ]);

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
   *
   * For search
   * */

  const searchButton = () => {
    search();
    toggleOpen(!open);
  };

  const search = (startDate, endDate) => {
    let sDate = "";
    let eDate = "";
    if (startDate && endDate) {
      sDate = moment(startDate).toISOString();
      eDate = moment(endDate).toISOString();
    } else {
      sDate = moment(startTimeForSearch).toISOString();
      eDate = moment(endTimeForSearch).toISOString();
    }
    let searchFields = {
      camera: cameraForSearch.value || "",
      region: subRegionForSearch.parent,
      city: subRegionForSearch.value,
      location: locationForSearch.value,
      usecaseType: usecaseTypeForSearch.value,
      startTime: sDate,
      endTime: eDate,
    };

    //for direct recording
    if (selectedTask.value === "directRecording")
      searchFields.isDirectRecording = "true";
    else searchFields.task = selectedTask.value;

    let count = 0;
    for (let item in searchFields) {
      if (
        !searchFields[item] ||
        searchFields[item]?.trim() == "" ||
        item == "startTime" ||
        item == "endTime"
      )
        continue;
      count++;
    }

    setFilterCount(count);

    let customQuery = "";
    for (let key in searchFields) {
      customQuery += `&${key}=${searchFields[key] || ""}`;
    }

    setQuery({
      ...query,
      customQuery,
    });
  };

  /**
   * For Reset
   * */
  const reset = () => {
    //iterate on date filters from backend and select last 15 days filter
    for (let el of props.userData.manifest.dateFilter) {
      if (el.range === "Last 15 Days") {
        yesterdayDateAndTime = moment(el.date[0], "YYYY-MM-DD");
        todayDateAndTime = moment(el.date[1], "YYYY-MM-DD");
        setStartTimeForSearch(yesterdayDateAndTime);
        setEndTimeForSearch(todayDateAndTime);
        setSelectedDateFilter({ label: el.range, value: el.data });
      }
    }

    setSubregionForSearch(defaultOptionValue);
    setLocationForSearch(defaultOptionValue);

    setLocationListForSearch(defaultOptionValue);
    setSelectedTask(defaultOptionValue);

    setUseCaseTypeForSearch(defaultOptionValue);

    const sDate = moment(yesterdayDateAndTime).toISOString();
    const eDate = moment(todayDateAndTime).toISOString();

    setQuery({
      ...query,
      customQuery: `&startTime=${sDate}&endTime=${eDate}`,
    });
    setFilterCount(0);
  };
  const initializeFields = () => {
    /**
     * Populate region-subregion combined list
     * */
    if (
      props &&
      props.userData &&
      props.userData.manifest &&
      props.userData.manifest.regions
    ) {
      let regionsAndSubregions = [...regionAndSubregionCombinedList];
      for (let el of props.userData.manifest.regions) {
        if (el.type === "region") {
          /**
           * For combined list
           * */
          regionsAndSubregions.push({
            value: el._id,
            label: el.area,
            isDisabled: true,
          });
          let subregionList = getSubregionOrLocation(el._id, "city");
          for (let subregion of subregionList) {
            regionsAndSubregions.push({
              value: subregion.value,
              label: subregion.label,
              parent: el._id,
            });
          }
        }
      }
      setRegionAndSubregionCombinedList(regionsAndSubregions);
      let useCaseList = [...usecaseTypeListForSearch];
      for (let el of props.userData.manifest.usecaseType) {
        useCaseList.push(el);
      }
      setUseCaseTypeListForSearch(useCaseList);
    }

    let tList = [...taskList];

    ((props.userData.manifest && props.userData.manifest.models) || []).forEach(
      (el) => {
        tList.push(createOption(el.model, el.id));
      }
    );

    setTaskList(tList);

    //populate date filters
    let dateFilterList = [...dateFilterForSearch];
    for (let el of props.userData.manifest.dateFilter) {
      if (el.range === "Last 15 Days") {
        yesterdayDateAndTime = moment(el.date[0], "YYYY-MM-DD");
        todayDateAndTime = moment(el.date[1], "YYYY-MM-DD");
        setStartTimeForSearch(yesterdayDateAndTime);
        setEndTimeForSearch(todayDateAndTime);
        setSelectedDateFilter({ label: el.range, value: el.data });
      }
      dateFilterList.push({
        value: el.date,
        label: el.range,
      });
    }
    setDateFilterForSearch(dateFilterList);
  };

  const getActions = (camera) => {
    return (
      <ul className="list-inline mb-0">
        <li
          className="list-inline-item"
          onClick={() => {
            setImage("");
            setVideoLink(camera.video_url);
            setModalVisibility(true);
            setRecordingId(camera._id);
            setCameraId(camera.camera._id);
            setStartTime(camera.startTime);
            setStartDate(camera.startDate);
            setEndTime(camera.endTime);
          }}
        >
          <button
            className="btn btn-primary btn-xs"
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
                  "Clicked on Preview & Tags | open playback pop up | Playback | WOCam",
                  {
                    title:
                      "Clicked on Preview & Tags | open playback pop up | Playback | WOCam",
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
            Preview & Tag
          </button>
        </li>
      </ul>
    );
  };

  const getLocationName = (location, region) => {
    return (
      <ul
        className="white-space mb-0"
        data-tag="allowRowEvents"
        style={{
          overflow: "hidden",
          whiteSpace: "wrap",
          textOverflow: "ellipses",
        }}
      >
        <li className={"mb-1 text-primary"}>{location}</li>
        <li className={"text-other fs-12"}>{region}</li>
      </ul>
    );
  };
  /**
   * Api call
   * */
  const apiCall = useCallback(
    (limit, page) => {
      const sDate = moment(yesterdayDateAndTime).toISOString();
      const eDate = moment(todayDateAndTime).toISOString();

      let url = `${API_BASE_URL}/recordings/get/${limit}/${page}?query=${query.query}${query.customQuery}`;

      if (initialApiCall === 0) {
        /**
         * For first time search with yesterday date and current date filters
         * */

        if (props && props.selectedCamera) {
          setSubregionForSearch({
            label: props.selectedCamera.subRegion,
            value: props.selectedCamera._subRegion,
            parent: props.selectedCamera._region,
          });

          setLocationListForSearch([
            defaultOptionValue,
            ...getSubregionOrLocation(
              props.selectedCamera._subRegion,
              "location"
            ),
          ]);

          setLocationForSearch({
            label: props.selectedCamera.location,
            value: props.selectedCamera._location,
          });

          setCameraForSearch({
            label: props.selectedCamera.camera,
            value: props.selectedCamera._id,
          });
        }

        url = `${API_BASE_URL}/recordings/get/${limit}/${page}?query=${
          query.query
        }&startTime=${sDate}&endTime=${eDate}&camera=${
          props.selectedCamera ? props.selectedCamera._id : ""
        }`;
        setInitialApiCall(1);
      }

      if (query.sort && query.sortBy) {
        url += `&sortBy=${query.sortBy}&sort=${query.sort}`;
      }

      //for default search
      if (!query.customQuery && initialApiCall !== 0)
        url += `&startTime=${sDate}&endTime=${eDate}`;

      callApi(url, {}, apiConfig)
        .then((res) => {
          if (res.status === 200 && res.data) {
            setTotalRecords(res.data.total);
            setRecords(
              res.data.data.map((el, index) => {
                return {
                  _id: el._id,
                  id: el.serial,
                  camera: el.location
                    ? `${el.location}-${el.camera.camera}`
                    : el.camera.camera,
                  startTime: el.startTime,
                  location: getLocationName(el.location, el.region),
                  endTime: el.endTime,
                  task: el.task,
                  startDate: el.startDate,
                  events: el.events,
                  usecaseType: el.usecaseType,
                  actions: getActions(el),
                };
              })
            );
          }
        })
        .catch((e) => {
          showAlert(e, "error");
        });

      setApiConfig(DEFAULT_API_CONFIG);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  useEffect(() => {
    if (locationForSearch && locationForSearch.value) {
      callApi(
        `${API_BASE_URL}/filter/camera?location=${locationForSearch.value}`
      )
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setCameraList([
              {
                label: "All",
                value: "",
              },
              ...res.data.data.map((el) => {
                return {
                  label: el.camera,
                  value: el._id,
                };
              }),
            ]);
          }
        })
        .catch((e) => {
          showAlert(e, "error");
        });
    } else {
      setCameraList([
        {
          label: "All",
          value: "",
        },
      ]);
      setCameraForSearch({
        label: "All",
        value: "",
      });
    }
  }, [locationForSearch]);

  useEffect(() => {
    initializeFields();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [limit]);

  useEffect(() => {
    apiCall(limit, page);
  }, [page, apiCall, limit, modalVisibility]);

  const handleSort = (column, sortDirection) => {
    let sort = sortDirection === "asc" ? 1 : -1;
    setApiConfig({
      showLoader: false,
      callManifest: false,
      loaderLabel: "",
    });
    setQuery({
      ...query,
      sortBy: column.selector,
      sort,
    });
  };
  const handlePageChange = (newPage, page) => {
    setPage(newPage - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setLimit(newPerPage);
  };

  // React Select Style

  const getRecordingDetails = async (id) => {
    if (id) setPlaybackRate(1);
    if (!recordingId) return;
    const res = await callApi(
      `${API_BASE_URL}/recording/get/${id || recordingId}`
    );

    if (res && res.data) {
      if (res?.data?.camera?.camera)
        setCameraName(
          `${res.data.camera.camera} - ${res.data.location} (${res.data.city} , ${res.data.region})`
        );

      let taskArray = [];

      for (let o of res.data.tasksAndSchedules) {
        if (o?.task?.model)
          taskArray.push({
            id: o._id,
            model: o.task.model,
          });
      }

      setNext(res.data.next);
      setPrevious(res.data.previous);

      setVideoLink(res.data.video_url);
      setRecordingDetails(taskArray);
      setEvents(res.data.events);
      if (res.data.events && res.data.events.length && res.data.events[0]) {
        setCurrentImg(res.data.events[0].image);
      }
      setCtime(res.data.cTime);
      setStartTime(res.data.startTime);
      setStartDate(res.data.startDate);
      setEndTime(res.data.endTime);
      if (id) setRecordingId(id);
    }
  };

  const getCaptureTime = (val) => {
    return moment(new Date(cTime)).add(val, "seconds").format("hh:mm:ss A");
  };

  const inUtc = (val) => {
    return moment(new Date(cTime)).add(val, "seconds")._d;
  };

  const getTime = () => {
    return convertTime(videoPlayer.current.getCurrentTime());
  };

  const onlyUnique = (array, propertyName) => {
    return array.filter(
      (e, i) =>
        array.findIndex((a) => a[propertyName] === e[propertyName]) === i
    );
  };

  const convertTime = (input, separator) => {
    let pad = function (input) {
      return input < 10 ? "0" + input : input;
    };
    return [
      pad(Math.floor(input / 3600)),
      pad(Math.floor((input % 3600) / 60)),
      pad(Math.floor(input % 60)),
    ].join(typeof separator !== "undefined" ? separator : ":");
  };

  const captureTime = async (name, id) => {
    let arr = capture;
    arr.push({ name, timestamp: getTime(), id, assigned_at: inUtc(getTime()) });
    let unique = onlyUnique(arr, "timestamp");
    setCapture([...unique]);
  };

  const deleteCapture = async (name, time) => {
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
      window.analytics.track("Clicked on Reset Latest | Playback | WoCam", {
        title: "Clicked on Reset Latest | Playback | WoCam",
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
    if (!name) {
      capture.pop();
      return setCapture([...capture]);
    }
    let data = capture.filter((o) => {
      return o.timestamp !== time;
    });
    setCapture([...data]);
  };

  const closeModal = () => {
    setModalVisibility(false);
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
      window.analytics.track("Closed playback pop up | Playback | WoCam", {
        title: "Closed playback pop up | Playback | WoCam",
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
  };

  const submit = async () => {
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
      window.analytics.track("Clicked on submit | Playback | WoCam", {
        title: "Clicked on submit | Playback | WoCam",
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
    if (!capture.length) return;

    const url = `${API_BASE_URL}/event/capture`;
    try {
      await callApi(url, {
        method: "POST",
        body: JSON.stringify({
          video: videoLink,
          image: "",
          camera: cameraId,
          assigned_at: new Date(),
          location: locationForSearch.value,
          recording: recordingId,
          events: capture,
        }),
      });
      showAlert("Event created");
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
          "Event created successfully | Playback | WoCam",
          {
            title: "Event created successfully | Playback | WoCam",
            email: props.userData.user.email,
            username: props.userData.user.username,
            companyName: props.userData.manifest.company.name,
            user_id: props.userData.user._id,
            company_id: props.userData.manifest._id,
          }
        );
      }
    } catch (e) {
      showAlert(e, "error");
    }
    closeModal();
    getRecordingDetails();
  };

  const resetALl = () => {
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
      window.analytics.track("Clicked on Reset All | Playback | WoCam", {
        title: "Clicked on Reset All | Playback | WoCam",
        email: props.userData.user.email,
        username: props.userData.user.username,
        companyName: props.userData.manifest.company.name,
        user_id: props.userData.user._id,
        company_id: props.userData.manifest._id,
      });
    }
    setCapture([]);
  };

  const handleSetPlaybackRate = (e) => {
    setPlaybackRate(parseFloat(e.target.value));
  };

  useEffect(() => {
    setCapture([]);
    getRecordingDetails();
  }, [recordingId, modalVisibility]);

  const setImage = (x) => {
    setCurrentImg(x.image);
  };

  return (
    <div className="wobot-panel-main">
      <div className="main-body-wrapper">
        <PageTitle
          pageTitle={"Playback"}
          showSubTitle={true}
          subTitle={
            <p className="mb-0">
              View any recorded video that you desire to re-monitor and raise
              tickets regarding any compliance violation.
            </p>
          }
          breadcrumb={[{ name: "Wocam" }, { name: "Playback", link: PLAYBACK }]}
        >
          <ActionBlock showActionList={true} showActionBtn={false}>
            <li className={"list-inline-item"}>
              <div className="search-filter w-100">
                <DebounceInput
                  className="search form-control"
                  placeholder="Search"
                  debounceTimeout={DEBOUNCE_INPUT_TIME}
                  value={query.query}
                  onChange={(e) => {
                    const currValue = e.target.value;
                    setApiConfig({
                      showLoader: false,
                      callManifest: false,
                      loaderLabel: "",
                    });
                    setQuery({ ...query, query: currValue });
                  }}
                />
                <IconSearch />
              </div>
            </li>
          </ActionBlock>
        </PageTitle>

        <ActionBlock showActionList={true} showActionBtn={false}>
          {/*prefilled dates*/}
          <li className={"list-inline-item"}>
            <div className="data-filter-ticketing">
              <Select
                className="react-select"
                value={selectedDateFilter}
                onChange={(selectedOption) => {
                  setSelectedDateFilter(selectedOption);
                  setStartTimeForSearch(moment(selectedOption.value[0]));
                  setEndTimeForSearch(moment(selectedOption.value[1]));

                  if (selectedOption && selectedOption.label !== "Custom") {
                    search(
                      moment(selectedOption.value[0]),
                      moment(selectedOption.value[1])
                    );
                  }
                }}
                options={dateFilterForSearch}
              />
            </div>
          </li>
          {/**/}
          <li className={"list-inline-item"}>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className={
                open || filterCount !== 0
                  ? "btn btn-textIcon menu-trigger active"
                  : "btn btn-textIcon menu-trigger"
              }
            >
              <span>
                <IconFilterLining /> Filter ({filterCount})
              </span>
            </button>
            <div className="filter-box-wrapper">
              <Collapse in={open} className={"filter-box-width max-width-650"}>
                <div className="filter-bar mt-4 mb-4">
                  <div className="filter-title">
                    <p className={"fw-600"}>Advance filters</p>
                  </div>
                  <div className="row">
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="region" className="form-label">
                        Task
                      </label>
                      <Select
                        styles={colourStyles}
                        value={selectedTask}
                        onChange={(selectedOption) => {
                          setSelectedTask(selectedOption);
                        }}
                        options={taskList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="region" className="form-label">
                        Region & City
                      </label>
                      <Select
                        styles={colourStyles}
                        value={subRegionForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setLocationForSearch(defaultOptionValue);
                          setLocationListForSearch([
                            defaultOptionValue,
                            ...getSubregionOrLocation(
                              selectedOption.value,
                              "location"
                            ),
                          ]);
                          setSubregionForSearch(selectedOption);
                        }}
                        options={regionAndSubregionCombinedList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="location" className="form-label">
                        Branch
                      </label>
                      <Select
                        value={locationForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setLocationForSearch(selectedOption);
                        }}
                        options={locationListForSearch}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="location" className="form-label">
                        Use Case Type
                      </label>
                      <Select
                        value={usecaseTypeForSearch}
                        onChange={(selectedOption) => {
                          setUseCaseTypeForSearch(selectedOption);
                        }}
                        options={usecaseTypeListForSearch}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="location" className="form-label">
                        Camera
                      </label>
                      <Select
                        value={cameraForSearch}
                        onChange={(selectedOption) => {
                          /**
                           * To flush out previous value
                           * */
                          setCameraForSearch(selectedOption);
                          // setLocationForSearch(selectedOption);
                        }}
                        options={cameraList}
                      />
                    </div>
                    <div className="col-lg col-md-4 col-sm-6 mb-3">
                      <label htmlFor="startDateAndTime" className="form-label">
                        Start Date & Time
                      </label>
                      <Datetime
                        inputProps={{
                          readOnly: true,
                          disabled:
                            selectedDateFilter &&
                            selectedDateFilter.label !== "Custom"
                              ? true
                              : false,
                        }}
                        isValidDate={(data) => {
                          return !moment(data).isAfter(todayDateAndTime);
                        }}
                        dateFormat="DD-MM-YYYY"
                        value={startTimeForSearch}
                        onChange={(value) => {
                          setStartTimeForSearch(value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-md-4 col-sm-6 mb-3">
                      <label htmlFor="endDateAndTime" className="form-label">
                        End Date & Time
                      </label>
                      <Datetime
                        inputProps={{
                          readOnly: true,
                          disabled:
                            selectedDateFilter &&
                            selectedDateFilter.label !== "Custom"
                              ? true
                              : false,
                        }}
                        isValidDate={(data) => {
                          return !(
                            moment(data).isBefore(startTimeForSearch) ||
                            moment(data).isAfter(todayDateAndTime)
                          );
                          // return !moment(data).isAfter(todayDateAndTime);
                        }}
                        dateFormat="DD-MM-YYYY"
                        value={endTimeForSearch}
                        onChange={(value) => {
                          setEndTimeForSearch(value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-textIcon btn-sm mr-2"
                      onClick={() => reset()}
                    >
                      Clear all
                    </button>
                    <button
                      onClick={searchButton}
                      className="btn btn-primary btn-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>
          </li>
        </ActionBlock>
        {records && records.length ? (
          <>
            <div className={"panel-body mt-60"}>
              <div id="table-content" className={"playback-table"}>
                <DataTable
                  pagination
                  paginationServer
                  paginationPerPage={limit}
                  paginationTotalRows={totalRecords}
                  paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
                  paginationComponentOptions={{ rowsPerPageText: "" }}
                  sortServer
                  striped={false}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  key={limit}
                  columns={columns}
                  data={records}
                  dense
                  sortFunction={(rows, selector, direction) => {
                    return rows.sort((rowA, rowB) => {});
                  }}
                  onSort={handleSort}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <PlaybackDefault setShow={setShow} />
          </>
        )}
        <Modal
          size={`${recordingDetails && recordingDetails.length ? "xl" : "lg"}`}
          className="action-popup tagger-video-popup"
          show={modalVisibility}
          centered
          onHide={() => {
            closeModal();
          }}
        >
          <Modal.Header closeButton>
            <div className={"modal-title"}>
              <h4 className={"title fw-600 mb-2"}>
                {startTime} - {endTime}, {startDate}
              </h4>
              <p>{cameraName}</p>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col">
                <div className={"video-controls-block"}>
                  <button
                    className={"btn d-flex btn-textIcon align-items-center"}
                    disabled={!previous}
                    onClick={() => getRecordingDetails(previous)}
                  >
                    <span className={"mr-2 play-icon"}>
                      <IconPlayBackward />
                    </span>
                    Prev
                  </button>
                  <button
                    className={"btn d-flex btn-textIcon align-items-center"}
                    disabled={!next}
                    onClick={() => getRecordingDetails(next)}
                  >
                    Next{" "}
                    <span className={"ml-2 play-icon"}>
                      <IconPlayForward />
                    </span>
                  </button>
                </div>
                <ReactPlayer
                  className="video-popup"
                  playing={playing}
                  ref={videoPlayer}
                  url={videoLink}
                  loop={true}
                  controls={true}
                  width={"100%"}
                  playbackRate={playbackRate}
                ></ReactPlayer>
                <div className="control-block">
                  <span>Speed</span>
                  <ul className="list-inline ml-2 mb-0">
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 1 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={1}
                      >
                        1x
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 1.5 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={1.5}
                      >
                        1.5x
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 2 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={2}
                      >
                        2x
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 4 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={4}
                      >
                        4x
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 6 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={6}
                      >
                        6x
                      </button>
                    </li>
                    <li className="list-inline-item">
                      <button
                        className={`btn btn-xs tag-default tag-md ${
                          playbackRate === 8 ? "btn-active" : ""
                        }`}
                        onClick={handleSetPlaybackRate}
                        value={8}
                      >
                        8x
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              {recordingDetails && recordingDetails.length ? (
                <div className="col-4 align-self-center">
                  <div className="block-wrap">
                    <h6 className="title">Available Tasks</h6>
                    <ul className="list-inline tagger-action">
                      {recordingDetails.map((t) => {
                        return (
                          <li
                            key={t.id}
                            className="list-inline-item d-flex justify-content-between align-items-center"
                          >
                            <div className={"text-block"}>
                              <span className="fs-14 fw-500 text-dark">
                                {t.model}
                              </span>
                            </div>
                            <div className="action-block">
                              {t.model && (
                                <button
                                  className="btn btn-light btn-textIcon"
                                  onClick={() => {
                                    captureTime(t.model, t.id);
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
                                        "Clicked on capture button | Playback | WoCam",
                                        {
                                          title:
                                            "Clicked on capture button | Playback | WoCam",
                                          email: props.userData.user.email,
                                          username:
                                            props.userData.user.username,
                                          companyName:
                                            props.userData.manifest.company
                                              .name,
                                          user_id: props.userData.user._id,
                                          company_id:
                                            props.userData.manifest._id,
                                        }
                                      );
                                    }
                                  }}
                                >
                                  <span>
                                    <IconCameraTwo /> Capture
                                  </span>
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="align-right mt-4">
                      <button
                        className="btn btn-primary btn-sm mr-3"
                        onClick={submit}
                      >
                        Save Task
                      </button>

                      <Link className="btn-link" onClick={resetALl}>
                        Reset All
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {recordingDetails && recordingDetails.length ? (
              <div className="row">
                <div className="col-lg-6 mt-3">
                  <div className="meta-data">
                    <h6>Current Task Log</h6>
                    <ul className="data">
                      {!capture.length && <p>No Log Found</p>}
                      {capture.map((x) => {
                        return (
                          <li className="output">
                            <span>
                              {x.name} - Captured at
                              <b>{" " + getCaptureTime(x.timestamp)}</b>
                            </span>
                            <ul className={"list-inline"}>
                              {/* {["top"].map((placement, index) => (
                              <OverlayTrigger
                                key={index}
                                placement={placement}
                                overlay={
                                  <Tooltip id={`tooltip-${placement}`}>
                                    View
                                  </Tooltip>
                                }
                              >
                                <li className={"list-inline-item"}>
                                  <span>
                                    <IconView />
                                  </span>
                                </li>
                              </OverlayTrigger>
                            ))} */}

                              {["top"].map((placement, index) => (
                                <OverlayTrigger
                                  key={index}
                                  placement={placement}
                                  overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                      Delete
                                    </Tooltip>
                                  }
                                >
                                  <li className={"list-inline-item"}>
                                    <span
                                      onClick={() =>
                                        deleteCapture(x.name, x.timestamp)
                                      }
                                    >
                                      <IconTrash />
                                    </span>
                                  </li>
                                </OverlayTrigger>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6 mt-3">
                  <div className="meta-data">
                    <h6>Previously Captured Task</h6>
                    <ul className="data">
                      {!events.length && <p>No Events Found</p>}
                      {events.map((x) => {
                        return (
                          <li className="output" onClick={() => setImage(x)}>
                            <span>
                              {x.title} - Captured at
                              <b className="text-dark">
                                {" "}
                                {getCaptureTime(x.timestamp)}
                              </b>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps, null)(PlaybackComponent);
