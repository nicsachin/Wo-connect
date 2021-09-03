import DataTable from "react-data-table-component";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../../Constants";
import callApi from "../../../../Services/callApi";
import { Link } from "react-router-dom";
import { showAlert } from "../../../../Services/showAlert";

const ListSchedule = (props) => {
  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleListTotal, setScheduleListTotal] = useState(0);
  //DataTable Table-Header
  const columns = [
    {
      name: "Schedule Name",
      selector: "schedule",
      minWidth: "25px",
      sortable: true,
    },
    {
      name: "Schedule Timings",
      sortable: true,
      minWidth: "215px",
      cell: (row) => <p>{row.cronText}</p>,
    },
    {
      name: "",
      cell: (row) => <></>,
    },
  ];

  const getScheduleByLocation = async (el) => {
    const url = `${API_BASE_URL}/schedule/get/100/0?&sortBy=_id&sort=-1&task=${props.taskId}&location=${el._id}`;
    const { data } = await callApi(url);
    if (data && data.data) setScheduleList(data.data);
    if (data && data.total) setScheduleListTotal(data.total);
  };

  useEffect(() => {
    getScheduleByLocation(props.el);
  }, [props.updateList]);

  return (
    <div className="block mt-3" key={props.id}>
      <div className="schedule-block mb-3">
        <p className="mb-0 mr-3 fw-500">
          {props.el.area} ({props.el.city && props.el.city.area},{" "}
          {props.el.region && props.el.region.area})
        </p>
        <Link
          to="#"
          className="link"
          onClick={() => {
            props.setScheduleShow(true);
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
                `Step 3 | Clicked on add new schedule | Checklist`,
                {
                  title: `Step 3 | Clicked on add new schedule | Checklist`,
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
          Add New
        </Link>
      </div>

      <div id="table-content">
        <DataTable
          columns={columns}
          data={scheduleList}
          total={scheduleListTotal}
          selectableRows
          onSelectedRowsChange={(row) => {
            // if (!row.selectedRows.length && props.el.schedule)
            //   showAlert(
            //     "Please select at least one schedule for each location",
            //     "info"
            //   );
            if (row.selectedRows) props.el.schedule = row.selectedRows;
          }}
          selectableRowSelected={(row) => {
            return row.isSelected;
          }}
          paginationPerPage={5}
          pagination
          striped={false}
          dense
          paginationRowsPerPageOptions={[5, 10, 20, 25, 50]}
          paginationComponentOptions={{ rowsPerPageText: "" }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ListSchedule);
