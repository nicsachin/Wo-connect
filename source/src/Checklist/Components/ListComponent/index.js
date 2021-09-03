import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import callApi from "../../../Services/callApi";
import { API_BASE_URL, COMPLIANCE_RUN } from "../../../Constants";
import HomeComponent from "../HomeComponent";
import moment from "moment";
import { Link } from "react-router-dom";
import IconPencil from "../../../Common/Components/IconsComponent/IconPencil";

const ListComponent = (props) => {
  const [totalRecords, setTotalRecords] = useState(1);
  const [data, setData] = useState([]);

  useEffect(() => {
    callApi(`${API_BASE_URL}/checklist/get/50/0?sortBy=created_at&sort=1`).then(
      (res) => {
        if (res.status === 200 && res.data && res.data) {
          if (!res.data.data.length) {
            if (
              props &&
              props.userData &&
              props.userData.user &&
              props.userData.user.email &&
              props.userData.manifest &&
              props.userData.manifest.company &&
              props.userData.user._id &&
              props.userData.manifest._id &&
              props.userData.manifest.company.name
            ) {
              window.analytics.track(`No checklist | Checklist`, {
                title: `No checklist | Checklist`,
                email: props.userData.user.email,
                username: props.userData.user.username,
                companyName: props.userData.manifest.company.name,
                user_id: props.userData.user._id,
                company_id: props.userData.manifest._id,
              });
            }
          }
          setTotalRecords(res.data.data.total);
          setData(res.data.data);
        }
      }
    );
  }, []);
  //Data-Table
  //DataTable Table-Header
  const columns = [
    {
      name: "Name",
      selector: "checklist",
      sortable: true,
      minWidth: "215px",
      cell: (row) => <span className="fs-14 fw-400">{row.checklist}</span>,
    },
    {
      name: "Tasks",
      selector: "task",
      minWidth: "215px",
      sortable: true,
      cell: (row) => <TaskData row={row} />,
    },
    {
      name: "Created",
      selector: "created_at",
      sortable: true,
      minWidth: "115px",
      cell: (row) => (
        <span>{moment(row.created_at).format("DD MMMM YYYY")}</span>
      ),
    },
    {
      name: "Action",
      selector: "action",
      minWidth: "150px",
      cell: (row) => <ActionData row={row} />,
    },
  ];

  //DataTable Table-Cell
  const TaskData = ({ row }) => (
    <div
      data-tag="allowRowEvents"
      style={{
        overflow: "hidden",
        whiteSpace: "wrap",
        textOverflow: "ellipses",
      }}
    >
      <ul className="mb-0 table-list">
        {row.task.map((el) => {
          return <li>{el}</li>;
        })}
      </ul>
    </div>
  );

  const ActionData = ({ row }) => (
    <div
      data-tag="allowRowEvents"
      style={{
        overflow: "hidden",
        whiteSpace: "wrap",
        textOverflow: "ellipses",
      }}
    >
      <ul className="filter-btn d-flex justify-content-center list-inline">
        {["top"].map((placement, index) => (
          <OverlayTrigger
            key={index}
            placement={placement}
            overlay={<Tooltip id={`tooltip-${placement}`}>Edit</Tooltip>}
          >
            <li
              className="list-inline-item"
              onClick={() => {
                if (
                  props &&
                  props.userData &&
                  props.userData.user &&
                  props.userData.user.email &&
                  props.userData.manifest &&
                  props.userData.manifest.company &&
                  props.userData.user._id &&
                  props.userData.manifest._id &&
                  props.userData.manifest.company.name
                ) {
                  window.analytics.track(
                    `Clicked on edit checklist | Checklist`,
                    {
                      title: `Clicked on edit checklist | Checklist`,
                      email: props.userData.user.email,
                      username: props.userData.user.username,
                      companyName: props.userData.manifest.company.name,
                      user_id: props.userData.user._id,
                      company_id: props.userData.manifest._id,
                      checklistId: row._id,
                    }
                  );
                }
              }}
            >
              <Link to={`${COMPLIANCE_RUN}${row._id}?back`} target={"_blank"}>
                <IconPencil />
              </Link>
            </li>
          </OverlayTrigger>
        ))}
      </ul>
    </div>
  );

  return <HomeComponent data={data} columns={columns} />;
};

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ListComponent);
