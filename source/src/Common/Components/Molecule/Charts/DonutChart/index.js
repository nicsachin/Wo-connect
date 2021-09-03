import React from "react";
import "react-vis/dist/style.css";
import { RadialChart } from "react-vis";
import "./style.scss";
const DonutChart = (props) => {
  return (
    <>
      <RadialChart
        colorType="literal"
        innerRadius={65}
        radius={70}
        getAngle={(d) => d.angle}
        data={props.fetchDataList}
        color={(d) => d.color}
        width={145}
        height={145}
        animation={"gentle"}
      >
        <div className={"center-pos center-label"}>
          <label className={"mb-0 fw-500"}>
            {props.showCenterLabel}
            <br />
            <span className={"fs-16 fw-500"}>{props.msgInMiddle}</span>
          </label>
        </div>
      </RadialChart>
    </>
  );
};

export default DonutChart;
