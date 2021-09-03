import React from "react";
import "../style.scss";

const TicketDetailsDefault = (props) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 align-items-center">
            <div className="justify-content-center">
              <div className="default-img-block">
                <img
                  className="mx-auto d-block img-fluid img-style"
                  src={`/assets/images/TicketsDetailsPage.svg`}
                  alt="logo"
                />
              </div>
              <div className="contnet-404 mxw-350">
                <h4 className=" text-primary">No details found</h4>
                <p className="mb-0 fs-14 fw-400 text-primary mt-1">
                  No ticket details to show. Once you start raising tickets, all
                  information will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailsDefault;
