import React from 'react';
import { Buffer } from 'buffer';
import { useNavigate } from 'react-router';

import RoomRating from './components/RoomRating';

import './assets/css/room_recommendations.min.css';

export default function RoomRecommendations({ rooms, isMobile }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="col-12 mb-2">
        <h3 className="room-recommendation__title text-center">Προτεινόμενα δωμάτια</h3>
      </div>

      {
        rooms.map((room, index) => {
          if (isMobile && index > 2) {
            return; // Load 3 recommendations on mobile, for usability
          }

          const roomInfo = room.roomDetail;
          const roomId = room.roomId;

          let roomThumbnail = roomInfo.thumbnail ? roomInfo.thumbnail : "";
          if (roomThumbnail.substring(0, 4) !== "http") {
            roomThumbnail = "data:image/jpeg;base64," + roomThumbnail;
          }

          return (
            <div key={roomId} className="col-12 col-sm">
              <div className="card room-recommendation__card" onClick={() => {
                navigate("/rooms/" + roomId);
              }}>
                {roomThumbnail &&
                  <img src={roomThumbnail} className="card-img-top" alt={roomInfo.name} />
                }
                <div className="card-body">
                  <h5 className="card-title mb-2">
                    {roomInfo.name}
                  </h5>

                  <p className="card-text mb-1">
                    {roomInfo.description}
                  </p>

                  <RoomRating rating={roomInfo.rating} ratingCount={roomInfo.number_of_reviews} />


                  <p className="recommendation-price card-text text-end mb-0 mt-2 pt-1 pe-1">
                    από <span>{roomInfo.price}€</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })
      }
    </>
  )
}
