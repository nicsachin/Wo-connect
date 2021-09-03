import React from "react";
import { IconAdd } from "../../IconsComponent/Index";
import PageTitle from "../Atoms/PageTitle";
import "./style.scss";
import moment from "moment";
import Clock from "react-live-clock";
import AddViewModal from "../../../../Wocam/Components/ModalComponents/AddViewModal";

const LiveDefault = (props) => {
  return (
    <div className={"default-pages"}>
      <PageTitle
        pageTitle={"Live View"}
        breadcrumb={[{ name: "Wocam" }, { name: "Live" }]}
        showSubTitle={false}
        titleMeta={
          <span>
            {moment().format("DD-MM-YYYY")} |{" "}
            <Clock format={"h:mm:ss A"} ticking={true} />
          </span>
        }
      />
      <div className="container">
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center">
              <div className="default-img-block">
                <img
                  className="mx-auto d-block img-fluid img-style"
                  src={`/assets/images/security-system.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h4 className="text-primary">No View Found</h4>
                <p className="mb-0 fs-14 fw-400 text-primary mt-60">
                  No details were found. Once you add a Camera View, it’s
                  details will appear here.
                </p>
                <button
                  className="btn btn-primary btn-sm btn-text-icon mt-3"
                  onClick={() => {
                    props.setShow(true);
                  }}
                >
                  <span className={"icon-sm"}>
                    <IconAdd /> Create View
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDefault;
