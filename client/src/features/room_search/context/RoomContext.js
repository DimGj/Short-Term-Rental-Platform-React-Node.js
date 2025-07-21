import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

import ErrorHandler from '../../../components/ErrorHandler';
import PopupMessage from '../../../components/PopupMessage';

import useServer from '../../../hooks/useServer';
import { useUserAuth } from '../../user_auth/context/UserContext';

export const RoomContext = createContext();

export function useRoom() {
  return useContext(RoomContext);
}

export function RoomProvider({ children }) {
  const cachedSearch = JSON.parse(localStorage.getItem('roomSearch'));
  const [search, setSearch] = useState(cachedSearch ? cachedSearch : null);
  const [freshSearch, setFreshSearch] = useState(false);
  const [results, setResults] = useState(null);
  const [totalNights, setTotalNights] = useState(0);

  const [popupMessage, setPopupMessage] = useState(null);

  const { getLoggedUserId, getAccessToken, refreshAccessToken, getHeaders } = useUserAuth();

  // Server request (error, isLoading)
  const [error, resetError, isLoading, serverRequest] = useServer();

  function getSearchQuery() {
    if (!search) {
      return null
    }

    return search;
  }

  function setSearchQuery(query) {
    setSearch(query);
  }

  function getSearchResults() {
    return results;
  }

  function setSearchResults(results) {
    setResults(results);
  }

  function getTotalNights() {
    return totalNights;
  }

  function getRoomInfo(roomId) {
    return serverRequest('room', 'GET', roomId);
  }

  function getUserRooms(userId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('room', 'GET', 'user/' + userId, null, headers, refreshAccessToken);
  }

  useEffect(() => {
    if (!search) {
      return;
    }

    localStorage.setItem('roomSearch', JSON.stringify(search));

    const checkInDate = new Date(search.checkInDate)
    const checkOutDate = new Date(search.checkOutDate)
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setTotalNights(diffDays);

    serverRequest('room', 'POST', 'search_available', search, null, refreshAccessToken).then((data) => {
      setResults(data);
    });
  }, [search]);

  async function getCoordinates(address) {
    const openStreetMapUrl = "https://nominatim.openstreetmap.org/search?q=" + address + "&format=json&polygon=1&addressdetails=1";

    const res = await axios.get(openStreetMapUrl);

    if (res.data.length == 0) {
      return null;
    }

    const lat = res.data[0].lat;
    const lon = res.data[0].lon;

    return { lat, lon };
  }

  const navigate = useNavigate();

  function reserveRoom(roomId) {
    const userId = getLoggedUserId();
    const checkInDate = search.checkInDate;
    const checkOutDate = search.checkOutDate;
    const accommodates = search.accommodates;

    if (!roomId || !userId || !checkInDate || !checkOutDate) {
      return;
    }

    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    const body = {
      roomId: parseInt(roomId),
      clientId: parseInt(userId),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfPeople: parseInt(accommodates)
    }

    serverRequest('booking', 'POST', "", body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      setPopupMessage("Η κράτηση ολοκληρώθηκε επιτυχώς. Μπορείτε να αξιολογήσετε την εμπειρία σας στη σελίδα του δωματίου.")
      setSearchQuery(null);
      setSearchResults(null);
      setTotalNights(null);
      navigate("/");
    });
  }

  function getUserBookings(userId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('booking', 'GET', 'userId/' + userId, null, headers, refreshAccessToken);
  }

  function getRoomBookings(roomId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('booking', 'GET', 'roomId/' + roomId, null, headers, refreshAccessToken);
  }

  function deleteRoomReservation(bookingId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('booking', 'DELETE', bookingId, null, headers, refreshAccessToken);
  }

  function deleteRoom(roomId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('room', 'DELETE', roomId, null, headers, refreshAccessToken);
  }

  function getBookingInfo(bookingId) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    return serverRequest('booking', 'GET', bookingId, null, headers, refreshAccessToken);
  }

  async function rateBooking(bookingId, rating) {
    if (bookingId == null || rating == null) {
      return;
    }

    const bookingReview = await getBookingInfo(bookingId).then((data) => {
      return data.rating;
    });

    if (rating < 1 || rating > 5 || bookingReview != null) {
      return;
    }
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    const body = {
      review: "",
      rating: rating
    }
    let interval = null;
    serverRequest('rating', 'POST', bookingId, body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      setPopupMessage("Η αξιολόγηση ολοκληρώθηκε επιτυχώς.");
      interval = setInterval(() => {
        navigate(0);
      }, 3000);
    });

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    }
  }

  function getUserRoomRecommendations() {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);
    const userId = getLoggedUserId();

    return serverRequest('user', 'GET', 'recommendation/' + userId, null, headers, refreshAccessToken).then((data) => {
      if (!data) {
        return [];
      }

      return data;
    });
  }

  return (
    <RoomContext.Provider value={{ getSearchQuery, setSearchQuery, getSearchResults, setSearchResults, getTotalNights, getRoomInfo, getUserRooms, getCoordinates, freshSearch, setFreshSearch, reserveRoom, getUserBookings, getRoomBookings, deleteRoomReservation, rateBooking, getUserRoomRecommendations, deleteRoom }}>
      <ErrorHandler error={error} resetError={resetError} />
      <PopupMessage message={popupMessage} setPopupMessage={setPopupMessage} />
      {children}
    </RoomContext.Provider>
  );
}