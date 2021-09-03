import React from "react";
import "../style.scss";

const TicketDefaultList = (props) => {
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
                  The tickets you see here are by default set for the last 15
                  days. Reset the filter as per your preference, and get
                  information about your ticketing status
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDefaultList;
