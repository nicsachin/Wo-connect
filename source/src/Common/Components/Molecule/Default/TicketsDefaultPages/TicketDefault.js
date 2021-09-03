import React from "react";
import "../style.scss";

const TicketDefault = (props) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center content">
              <div className="default-img-block">
                <img
                  className="mx-auto d-block img-fluid img-style"
                  src={`/assets/images/TicketPage.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h4 className=" text-primary">No tickets found</h4>
                <p className="mb-0 fs-14 fw-400 text-primary mt-1">
                  No tickets were raised. All the tickets that you raise in the
                  future will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDefault;
