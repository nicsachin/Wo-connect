import AsyncSelect from "react-select/async/dist/react-select.esm";
import React, { useEffect, useState } from "react";
import callApi from "../../../../Services/callApi";
import { API_BASE_URL } from "../../../../Constants";

const createOption = (label, value) => ({
  label,
  value,
});

const AddUser = (props) => {
  const [executiveUser, setExecutiveUser] = useState([]);
  const [assigneeUser, setAssigneeUser] = useState([]);

  const users = (inputValue) =>
    new Promise((resolve) => {
      callApi(`${API_BASE_URL}/team/get/10/0?query=${inputValue}`).then(
        (obj) => {
          if (obj) {
            let names = [];
            obj.data.data.forEach((obj) => {
              if (obj.name)
                names.push({
                  label: obj.email,
                  value: obj._id,
                });
            });
            resolve(names);
          }
        }
      );
    });

  const getUser = async () => {
    const url = `${API_BASE_URL}/assign/user/get/100/0?task=${props.taskId}&location=${props.el._id}`;
    const { data } = await callApi(url);
    if (data) {
      let executiveUser = [];
      let assigneeUser = [];
      for (const i of data.data) {
        if (i.type.toLowerCase() === "assignee") {
          assigneeUser.push(i);
        }
        if (i.type.toLowerCase() === "executive") {
          executiveUser.push(i);
        }
      }
      setAssigneeUser(assigneeUser);
      setExecutiveUser(executiveUser);
      props.setAssigneeUser(assigneeUser);
      props.setExecutiveUser(executiveUser);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const getSelected = (location, type) => {
    let options = [];
    if (type === "assignee") {
      for (let obj of assigneeUser) {
        if (obj._location === location) {
          if (obj.user && obj.user.email)
            options.push(createOption(obj.user.email, obj._id));
          else options.push(createOption(obj.label, obj.value));
        }
      }
      props.el.assignee = options;
    }
    if (type === "executive") {
      for (let obj of executiveUser) {
        if (obj._location === location) {
          if (obj.user && obj.user.email)
            options.push(createOption(obj.user.email, obj._id));
          else options.push(createOption(obj.label, obj.value));
        }
      }
      props.el.executive = options;
    }
    return options;
  };

  return (
    <>
      <div className="schedule-block mb-3">
        <p className="mb-0 mr-3 fw-500">
          {props.el.area} ({props.el.city && props.el.city.area},{" "}
          {props.el.region && props.el.region.area})
        </p>
      </div>
      <div className="select-block row">
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <label htmlFor="inputEmail4" className="fw-600">
            Task Assignee
          </label>
          <AsyncSelect
            key={props.index}
            defaultOptions
            isMulti
            loadOptions={users}
            onChange={(selectedOption, removedValue) => {
              props.el.assignee = selectedOption;
              setAssigneeUser(
                selectedOption.map((obj) => {
                  obj.location = props.el._id;
                  obj._location = props.el._id;
                  return obj;
                })
              );
              props.setAssigneeUser(
                selectedOption.map((obj) => {
                  obj.location = props.el._id;
                  obj._location = props.el._id;
                  return obj;
                })
              );
              if (removedValue.action === "remove-value") {
                props.setDeletedUsers([
                  ...props.deletedUsers,
                  {
                    location: props.el._id,
                    ...removedValue.removedValue,
                  },
                ]);
              }
            }}
            value={getSelected(props.el._id, "assignee")}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 mb-2">
          <label htmlFor="inputEmail4" className="fw-600">
            Ticketing Executive
          </label>
          <AsyncSelect
            key={props.index}
            isMulti
            defaultOptions
            loadOptions={users}
            onChange={(selectedOption, removedValue) => {
              props.el.executive = selectedOption;
              setExecutiveUser(
                selectedOption.map((obj) => {
                  obj.location = props.el._id;
                  obj._location = props.el._id;
                  return obj;
                })
              );
              props.setExecutiveUser(
                selectedOption.map((obj) => {
                  obj.location = props.el._id;
                  obj._location = props.el._id;
                  return obj;
                })
              );
              if (removedValue.action === "remove-value") {
                props.setDeletedUsers([
                  ...props.deletedUsers,
                  {
                    location: props.el._id,
                    ...removedValue.removedValue,
                  },
                ]);
              }
            }}
            value={getSelected(props.el._id, "executive")}
          />
        </div>
      </div>
    </>
  );
};
export default AddUser;
