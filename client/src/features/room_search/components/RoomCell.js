import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";

import RoomRating from "./RoomRating";

import bedIcon from '../../../assets/img/icons/bed.svg';
import homeIcon from '../../../assets/img/icons/home.svg';

export default function RoomCell({ room, roomPrice, view }) {
  const roomId = room.id;

  // const roomThumbnail = room.thumbnail ? ("data:image/jpeg;base64," + room.thumbnail) : "";
  let roomThumbnail = room.thumbnail ? room.thumbnail : "";
  if (roomThumbnail.substring(0, 4) !== "http") {
    roomThumbnail = "data:image/jpeg;base64," + roomThumbnail;
  }

  const navigate = useNavigate();

  return (
    <div className="row justify-content-center">
      <div className="room-cell__wrapper col-12 col-lg-12 px-4" onClick={() => {
        navigate(view === "client" ? "/rooms/" + roomId : view === "host" ? "/host/rooms/" + roomId : "/user/bookings/rooms/" + roomId);
      }}>
        <div className="room-cell py-4 px-0 d-lg-flex">
          <div className="col-lg-4 d-flex flex-column justify-content-center">
            <img className="room-cell__img" src={roomThumbnail} alt="" />
          </div>

          <div className="col-lg-8 px-lg-4 mt-3 mt-lg-0 d-flex flex-column justify-content-between">
            <div className="col-auto">
              <h3 className="room-cell__title mb-0">
                {room.name}
              </h3>

              <p className="room-cell__description mb-0 mt-2">
                {room.description}
              </p>

              <div className="row align-items-center mt-2 mb-3">
                <div className="col-auto d-flex align-items-center">
                  <img className="room-info-icon" src={homeIcon} alt="" />

                  <p className="room-info-description mb-0 ps-2">
                    {room.room_type}
                  </p>
                </div>

                <div className="col-auto d-flex align-items-center">
                  <img className="room-info-icon" src={bedIcon} alt="" />

                  <p className="room-info-description mb-0 ps-2">
                    {room.bedrooms + (room.bedrooms > 1 ? " κρεβάτια" : " κρεβάτι")}
                  </p>
                </div>
              </div>

              <RoomRating rating={room.rating} ratingCount={room.number_of_reviews} />

            </div>

            <div className="col-auto mt-4 mt-lg-0 d-flex flex-column flex-lg-row justify-content-end align-items-lg-center align-items-end">
              <div className="pe-lg-4">
                <p className="room-cell__cost mb-0 text-end">
                  {/* {clientView ? room.price + room.extraPersonPrice * (searchAccommodates - 1) : room.price} */}
                  {roomPrice}€
                  {view === "booking" ?
                    <span className="room-cell__cost-night">&nbsp;&nbsp;Σύνολο</span>
                    :
                    <span className="room-cell__cost-night"> / βράδυ</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}