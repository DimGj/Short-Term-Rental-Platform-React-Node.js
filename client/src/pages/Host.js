import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import BookedRooms from '../features/room_search/BookedRooms';

import useHost from '../hooks/useHost';
import { useUserAuth } from '../features/user_auth/context/UserContext';
import { useRoom } from '../features/room_search/context/RoomContext';

import '../assets/css/host.min.css';

export default function Host() {
  const [availableRooms, setAvailableRooms] = useState(null);

  const navigate = useNavigate();
  const isHost = useHost();

  const { getLoggedUserId } = useUserAuth();
  const { getUserRooms } = useRoom();

  useEffect(() => {
    if (isHost == null) {
      return;
    }

    // Redirects if user is not logged in or not an accepted host
    if (isHost === false) {
      navigate("/");
      return;
    }

    const userId = getLoggedUserId();
    getUserRooms(userId).then((data) => {
      if (!data) {
        return;
      }

      setAvailableRooms(data);
    });
  }, [isHost]);

  return (
    isHost &&
    <>
      <Helmet>
        <title>Καταλύματα</title>
      </Helmet>

      <div className="host">
        <div className="container-lg px-lg-5 mt-5">
          <div className="row justify-content-center">
            <div className="col-auto">
              <h1 className="mb-0">
                Τα καταλύματα μου
              </h1>
            </div>
          </div>

          <div className="row justify-content-end mt-4 mb-5 px-4 px-lg-0">
            <div className="col-auto">
              <Link to="/host/add_room" className="host__add-room-button secondary-button d-block">
                <p className="mb-0">
                  Προσθήκη καταλύματος
                </p>
              </Link>
            </div>
          </div>

          {availableRooms && availableRooms.length != 0 &&
            <div className="row">
              <BookedRooms availableRooms={availableRooms} view="host" />
            </div>

            ||

            <div className="col-12 text-center mt-4">
              <p className="mb-0">
                Δεν υπάρχουν δωμάτια
              </p>
            </div>
          }
        </div>
      </div>
    </>
  )
}
