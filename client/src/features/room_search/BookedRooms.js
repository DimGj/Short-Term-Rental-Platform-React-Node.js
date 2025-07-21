import React, { useState } from 'react';

import RoomCell from './components/RoomCell';
import PageChangeButtons from '../../components/PageChangeButtons';

export default function BookedRooms({ availableRooms, view }) {
  const [resultsPage, setResultsPage] = useState(1);
  const cellsPerPage = 10;
  const maxResultsPages = availableRooms ? Math.ceil(Object.keys(availableRooms).length / cellsPerPage) : 0;

  return (
    <>
      <PageChangeButtons className="mt-3 mb-2 mb-lg-3 mt-lg-0" currentPage={resultsPage} setCurrentPage={setResultsPage} maxPages={maxResultsPages} />

      <div className="col-12">
        {availableRooms.map((data, index) => {
          if (index >= cellsPerPage * resultsPage || index < cellsPerPage * (resultsPage - 1)) {
            return;
          }

          let room = null;
          let price = null;
          if (view === "booking") {
            room = data.room;
            let booking = data.booking;

            price = booking.totalPrice;
          } else if (view === "host") {
            room = data;
            price = room.price;
          }

          if (room == null || price == null) {
            return;
          }

          return <RoomCell room={room} key={index} roomPrice={price} view={view} />
        })}
      </div>

      <PageChangeButtons className="my-4" currentPage={resultsPage} setCurrentPage={setResultsPage} maxPages={maxResultsPages} />
    </>
  );
}