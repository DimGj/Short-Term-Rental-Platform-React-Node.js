import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';

import BookedRooms from '../features/room_search/BookedRooms';

import { useUserAuth } from '../features/user_auth/context/UserContext';
import { useRoom } from '../features/room_search/context/RoomContext';
import useHost from '../hooks/useHost';
import useAdmin from '../hooks/useAdmin';

export default function Bookings() {
  const { isLoggedIn, getLoggedUserId } = useUserAuth();

  const [availableRooms, setAvailableRooms] = useState(null);  //TODO: add cache
  const { getUserBookings, getRoomInfo } = useRoom();

  const isHost = useHost();
  const isAdmin = useAdmin();

  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (!loggedIn || isHost || isAdmin) {
      navigate("/");
      return;
    }

    async function fetchBookedRooms() {
      const bookedRooms = [];
      const bookings = await getUserBookings(getLoggedUserId());

      for (let i = 0; i < bookings.length; i++) {
        const roomId = bookings[i].roomId;
        const room = await getRoomInfo(parseInt(roomId));

        bookedRooms.push({ room: room[0], booking: bookings[i] });
      }

      if (bookedRooms.length == 0) {
        setAvailableRooms(null);
      } else {
        setAvailableRooms(bookedRooms);
      }
    }

    fetchBookedRooms();
  }, [isHost, isAdmin, isLoggedIn]);

  return (
    <>
      <Helmet>
        <title>Κρατήσεις</title>
      </Helmet>

      <div className="container-lg px-lg-5 mt-5">
        <div className="row">
          {isLoggedIn && availableRooms &&
            <BookedRooms availableRooms={availableRooms} view="booking" />

            ||

            <div className="col-12 text-center mt-4">
              <p className="mb-0">
                Δεν υπάρχουν κρατήσεις
              </p>
            </div>
          }
        </div>
      </div>
    </>
  )
}
