import React from "react";
import { Link } from "react-router-dom";
import { LOGIN } from "../../../Constants";

const ErrorHandlerComponent = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12 align-items-center">
          <div className="404-thumb">
            <img
              className="mx-auto d-block img-fluid"
              src={`/assets/images/404.svg`}
              alt="logo"
            />
          </div>
          <div className="contnet-404">
            <h3 className="fs-38">Opps 404 - page not found</h3>
            <p>
              The page you are looking for might have been removed had its name
              changes or is temporarily unavailable.
            </p>
            <Link
              to={LOGIN}
              className="btn btn-sm mt-2"
              variant="primary"
              onClick={() => {}}
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlerComponent;
