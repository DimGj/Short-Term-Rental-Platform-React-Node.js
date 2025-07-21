import React from 'react';

export default function PageChangeButtons({ currentPage, setCurrentPage, maxPages, className }) {
  return (
    <div className={"row align-items-center justify-content-end mx-0 " + (className ? className : "")}>
      <div className="col-auto">
        <p className="room-results__page-select-title mb-0 lh-sm">
          Σελίδα:
        </p>
      </div>

      <div className="col-auto">
        <button className="room-results__page-button" onClick={() => {
          setCurrentPage(currentPage => currentPage == 1 ? 1 : currentPage - 1);
        }}>
          <p className="mb-0">
            &#60;
          </p>
        </button>
      </div>

      <div className="room-results__page col-auto px-2">
        <p className="mb-0 lh-sm">
          {currentPage} από {maxPages}
        </p>
      </div>

      <div className="col-auto">
        <button className="room-results__page-button" onClick={() => {
          setCurrentPage(currentPage => currentPage == maxPages ? maxPages : currentPage + 1);
        }}>
          <p className="mb-0">
            &#62;
          </p>
        </button>
      </div>
    </div>
  );
}