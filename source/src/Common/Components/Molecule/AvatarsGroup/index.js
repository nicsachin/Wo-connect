import React, { useEffect, useState } from "react";
import "./style.scss";
import Avatar from "react-avatar";
import { Link } from "react-router-dom";

const AvatarGroup = (props) => {
  let [assignee, setAssignee] = useState([]);

  //filter assignee by type key
  useEffect(() => {
    if (props?.assignee?.length)
      setAssignee(props.assignee.filter((el) => el.type === "Assignee"));
  }, [props]);

  //for rendering avatar
  function renderAvatar() {
    if (assignee.length) {
      return assignee.map((el, index) => {
        if (index < 4) {
          return (
            <li className={"avatar-item"}>
              <Link
                to={`/settings/employee/detail/${el.user._id}`}
                target={"_blank"}
                key={index}
              >
                <Avatar
                  name={el.user.name}
                  size="40"
                  round={true}
                  className={"test"}
                  src={el.user.displayImage}
                />
              </Link>
            </li>
          );
        }
      });
    } else return null;
  }

  return (
    <div className={"user-profiles"}>
      <ul className={"avatar-block"}>{renderAvatar()}</ul>
    </div>
  );
};

export default AvatarGroup;
