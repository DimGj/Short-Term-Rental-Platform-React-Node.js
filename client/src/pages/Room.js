import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet'
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";

import { useUserAuth } from "../features/user_auth/context/UserContext";
import { useRoom } from "../features/room_search/context/RoomContext";
import useHost from "../hooks/useHost";

import "leaflet/dist/leaflet.css";

import ImageShowcase from "../features/image_showcase/ImageShowcase";
import RoomRating from "../features/room_search/components/RoomRating";

import "../assets/css/room.min.css";

import bedIcon from '../assets/img/icons/bed.svg';
import homeIcon from '../assets/img/icons/home.svg';
import wcIcon from '../assets/img/icons/wc.svg';
import dateIcon from '../assets/img/icons/date.svg';
import rulerIcon from '../assets/img/icons/ruler.svg';
import reviewStarFull from '../assets/img/icons/review_star_full.svg';
import reviewStarHalf from '../assets/img/icons/review_star_half.svg';
import reviewStarEmpty from '../assets/img/icons/review_star_empty.svg';
import tickIcon from '../assets/img/icons/tick.svg';
import crossIcon from '../assets/img/icons/cross.svg';
import markerIconPng from "leaflet/dist/images/marker-icon.png"

export default function Room({ view }) {
  const { roomId } = useParams();
  const { getSearchQuery, getTotalNights, getRoomInfo, reserveRoom, getRoomBookings, getUserBookings, deleteRoomReservation, deleteRoom } = useRoom();
  const { isLoggedIn, getLoggedUserId, getUserInfo, getAccessToken } = useUserAuth();

  const [room, setRoom] = useState(null);  //TODO: add cache
  const [hostInfo, setHostInfo] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [roomImages, setRoomImages] = useState([]);
  const [hostAvatar, setHostAvatar] = useState("");
  const totalNights = getTotalNights();

  const search = getSearchQuery();
  const accommodates = search ? search.accommodates : 0;

  const navigate = useNavigate();

  const isHost = useHost();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    getRoomInfo(roomId).then((data) => {
      if (!data) {
        return;
      }

      // If room does not belong to user, redirect to home page
      const loadedRoom = data[0];

      if (view === "client" && loadedRoom.userId == getLoggedUserId()) {
        navigate("/host/rooms/" + roomId, { replace: true });
      }

      if (view === "host" && loadedRoom.userId != getLoggedUserId()) {
        navigate("/");
        return;
      }

      setRoom(loadedRoom);

      const images = [];
      if (!loadedRoom.thumbnail) {
        return;
      }

      let thumbnail = loadedRoom.thumbnail ? loadedRoom.thumbnail : "";
      if (thumbnail.substring(0, 4) !== "http") {
        thumbnail = "data:image/jpeg;base64," + thumbnail;
      }
      images.push(thumbnail);

      if (loadedRoom.photos) {
        let startingIndex = 0;

        while (true) {
          let seperatorIndex = loadedRoom.photos.indexOf(',', startingIndex);

          if (seperatorIndex == -1) {
            let photo = loadedRoom.photos.slice(startingIndex);
            if (photo.substring(0, 4) !== "http") {
              photo = "data:image/jpeg;base64," + photo;
            }
            images.push(photo);
            break;
          }

          let photo = loadedRoom.photos.slice(startingIndex, seperatorIndex);
          if (photo.substring(0, 4) !== "http") {
            photo = "data:image/jpeg;base64," + photo;
          }
          images.push(photo);

          startingIndex = seperatorIndex + 1;
        }
      }
      setRoomImages(images);
    });
  }, []);

  useEffect(() => {
    if (!room || !loggedIn) {
      return;
    }

    getUserInfo(getAccessToken(), room.userId).then((data) => {
      if (!data) {
        return;
      }

      setHostInfo(data);

      let avatar = data.avatar ? data.avatar : "";
      if (avatar.substring(0, 4) !== "http") {
        avatar = "data:image/jpeg;base64," + avatar;
      }
      setHostAvatar(avatar);
    });

    async function fetchBookings() {
      let bookings = null;
      if (view === "client" || view === "booking") {
        bookings = await getUserBookings(getLoggedUserId()).then((data) => {
          let roomBookings = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].roomId == roomId) {
              roomBookings.push(data[i]);
            }
          }

          if (roomBookings.length == 0) {
            return null
          }
          return roomBookings;
        });
      } else {
        bookings = await getRoomBookings(roomId);
      }

      if (bookings == null) {
        return;
      }

      Promise.all(bookings.map(async (booking, i) => {
        const client = view === "host" ? await getUserInfo(getAccessToken(), booking.userId) : null;
        const creationDate = new Date(booking.createdAt);

        return (
          <div className="row gy-3 my-1 pb-3 room__booking-row" key={i}>
            <div className="col-auto">
              <h3 className="mb-0 room-info-description__title mb-2">
                Πληροφορίες κράτησης
              </h3>

              <p className="mb-0 room-info-description pt-0">
                {booking.checkInDate + " έως " + booking.checkOutDate}
              </p>

              <p className="mb-0 room-info-description pt-0">
                Σύνολο κράτησης: {booking.totalPrice}€
              </p>

              <p className="mb-0 room-info-description pt-0">
                Ημερομηνία: {creationDate.getDate() + "-" + creationDate.getMonth() + "-" + creationDate.getFullYear()}
              </p>
            </div>

            {client &&
              <div className="col-auto">
                <h3 className="mb-0 room-info-description__title mb-2">
                  Στοιχεία ενοίκου
                </h3>

                <p className="mb-0 room-info-description pt-0">
                  Ονοματεπώνυμο: {client.firstname} {client.lastname}
                </p>

                <p className="mb-0 room-info-description pt-0">
                  Τηλέφωνο: {client.telephone}
                </p>

                <p className="mb-0 room-info-description pt-0">
                  E-mail: {client.email}
                </p>
              </div>
              || booking.rating == null &&
              <div className="col-auto">
                <h3 className="mb-0 room-info-description__title mb-2">
                  Αξιολόγηση
                </h3>

                <div className="col-auto align-self-end">
                  <ActiveRating bookingId={booking.id} />
                </div>
              </div>
            }

            <div className="col-auto align-self-end">
              <button className="booking__delete-button" onClick={() => {
                handleDeleteBooking(booking.id)
              }}>
                <p className="mb-0">
                  Ακύρωση κράτησης
                </p>
              </button>
            </div>
          </div>
        );
      })).then(bookings => {
        setBookings(bookings);
      });
    }

    fetchBookings();
  }, [room]);

  function handleReserve() {
    reserveRoom(roomId);
  }

  function handleDeleteBooking(bookingId) {
    deleteRoomReservation(bookingId);
    navigate(0);
  }

  function handleDeleteRoom() {
    deleteRoom(roomId);
    navigate("/host");
  }

  return (
    room &&
    <>
      <Helmet>
        <title>Προβολή δωματίου</title>
      </Helmet>

      <div className="room mt-5" >
        <div className="container-lg px-4 px-lg-2 mb-5 pb-5">
          {view === "client" ?
            isHost || !loggedIn ?
              <RoomPriceOnlyFooter price={totalNights * (room.price + (accommodates - 1) * room.extraPersonPrice)} nights={totalNights} />
              :
              <RoomReservationFooter price={totalNights * (room.price + (accommodates - 1) * room.extraPersonPrice)} nights={totalNights} handleReserve={handleReserve} />
            : view === "host" ?
              <RoomEditFooter price={room.price} perExtraPersonPrice={room.extraPersonPrice} roomId={roomId} />
              : null
          }

          <div className="row justify-content-lg-between">
            <div className="col-12 col-lg-5 mt-lg-4 pt-lg-3">
              <ImageShowcase images={roomImages} />
            </div>

            <div className="col-lg-7 row mx-0 px-0 align-content-center ps-lg-4 mt-4 mt-lg-0 pt-2 pt-lg-0 ">
              <div className="room__section col-12">
                <div className="room__section-content pb-4">
                  <h1 className="mb-0">
                    {room.name}
                  </h1>

                  <p className="mb-0 mb-3">
                    {room.description}
                  </p>

                  <RoomRating rating={room.rating} ratingCount={room.number_of_reviews} />
                </div>
              </div>

              <div className="room__section col-12 col-lg-6 mt-4">
                <h2 className="room__section-title mb-0">
                  Χώρος
                </h2>

                <div className="room__section-content mt-2 pb-4 border-lg-0">
                  <div className="d-flex align-items-center">
                    <img className="room-info-icon" src={homeIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2">
                      {room.room_type}
                    </p>
                  </div>

                  <div className="d-flex align-items-center">
                    <img className="room-info-icon" src={bedIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2">
                      {room.beds + (room.beds > 1 ? " κρεβάτια" : " κρεβάτι")}
                    </p>
                  </div>

                  <div className="d-flex align-items-center">
                    <img className="room-info-icon" src={bedIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2">
                      {room.bedrooms + (room.bedrooms > 1 ? " υπνοδωμάτια" : " υπνοδωμάτιο")}
                    </p>
                  </div>

                  <div className="d-flex align-items-center pt-2 mt-1">
                    <img className="room-info-icon" src={wcIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-0">
                      {room.bathrooms + (room.bathrooms > 1 ? " τουαλέτες" : " τουαλέτα")}
                    </p>
                  </div>

                  <div className="d-flex align-items-center pt-2 mt-1">
                    <img className="room-info-icon" src={require("../assets/img/icons/couch.png")} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-0">
                      {room.hasCouch ? "Με καθιστικό" : "Χωρίς καθιστικό"}
                    </p>
                  </div>

                  <div className="d-flex align-items-center pt-2 mt-1">
                    <img className="room-info-icon" src={rulerIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-0">
                      {room.surface} τ.μ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="room__section col-12 col-lg-6 mt-4">
                <h2 className="room__section-title mb-0">
                  Κανόνες
                </h2>

                <div className="room__section-content mt-2 pb-4 border-lg-0">
                  <div className="d-flex align-items-center">
                    <img className="room-info-icon" src={dateIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2">
                      Ελάχιστος αριθμός ημερών: {room.minimum_nights}
                    </p>
                  </div>

                  <div className="d-flex align-items-center mt-2">
                    <img className="room-info-icon" src={room.smoking_allowed ? tickIcon : crossIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-1">
                      Κάπνισμα
                    </p>
                  </div>

                  <div className="d-flex align-items-center mt-2">
                    <img className="room-info-icon" src={room.pets_allowed ? tickIcon : crossIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-1">
                      Κατοικίδια
                    </p>
                  </div>

                  <div className="d-flex align-items-center mt-2">
                    <img className="room-info-icon" src={room.events_allowed ? tickIcon : crossIcon} alt="" />

                    <p className="room-info-description mb-0 ps-2 pt-1">
                      Εκδηλώσεις
                    </p>
                  </div>
                </div>
              </div>

              <div className="room__section col-12 col-lg-6 mt-4">
                <h2 className="room__section-title mb-0">
                  Τοποθεσία
                </h2>

                <div className="room__section-content mt-2 pb-4 border-lg-0">
                  <div className="mt-3 mb-1 pe-lg-3">
                    <MapContainer center={[room.latitude, room.longitude]} zoom={16} scrollWheelZoom={false} >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[room.latitude, room.longitude]} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
                        <Popup>
                          {room.street + ", " + room.neighborhood + ", " + room.city + ", " + room.state + ", " + room.country}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div className="d-flex align-items-center">
                    <img className="room-info-icon" src={require("../assets/img/icons/location.png")} style={{ width: 20 }} alt="" />

                    <p className="room-info-description mb-0 ps-2">
                      {room.street + " " + room.neighborhood + ", " + room.city + ", " + room.state + ", " + room.country}
                    </p>
                  </div>

                  <p className="mb-0 room-info-description">
                    Περιγραφή γειτονιάς: {room.neighborhood_description}
                  </p>

                  <p className="mb-0 room-info-description">
                    Οδηγίες συγκοινωνιών: {room.transport}
                  </p>
                </div>
              </div>

              <div className="room__section col-12 col-lg-6 mt-4">
                <h2 className="room__section-title mb-0">
                  Στοιχεία οικοδεσπότη
                </h2>

                {hostInfo &&
                  <div className="room__section-content mt-2 pb-4 border-0">
                    <div className="d-flex align-items-center mt-3 mb-1">
                      <div>
                        {hostAvatar &&
                          <img className="user__avatar mb-2" src={hostAvatar} alt="" />
                          ||
                          <div className="placeholder__avatar mb-2 d-flex align-items-center justify-content-center">
                            <p className="mb-0">
                              Χωρίς φωτογραφία
                            </p>
                          </div>
                        }
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <p className="room-info-description mb-0">
                        {hostInfo.firstname + " " + hostInfo.lastname}
                      </p>
                    </div>

                    {view !== "host" && !isHost ?
                      <Link to={"/room/message/" + roomId} className="secondary-button d-inline-block lh-sm mt-3 ">
                        <p className="mb-0">
                          Επικοινωνήστε
                        </p>
                      </Link>
                      : view === "host" ?
                        <Link to={"/host/room/inbox/" + roomId} className="secondary-button d-inline-block lh-sm mt-3 ">
                          <p className="mb-0">
                            Προβολή μηνυμάτων
                          </p>
                        </Link>
                        :
                        null
                    }
                  </div>

                  ||

                  <div className="room__section-content mt-2 pb-4 border-0">
                    <div className="d-flex align-items-center">

                      <p className="room-info-description mb-0">
                        Παρακαλώ συνδεθείτε
                      </p>
                    </div>
                  </div>
                }
              </div>

              {bookings &&
                <div className="room__section col-12 mt-4">
                  <h2 className="room__section-title mb-0">
                    Κρατήσεις
                  </h2>

                  <div className="room__section-content mt-2 pb-4">
                    {bookings.length > 0 ? bookings : <p className="mb-0 room-info-description">Δεν υπάρχουν κρατήσεις</p>}
                  </div>
                </div>
              }

              {view === "host" && isHost &&
                <div className="room__section col-12 my-4">
                  <div className="room__section-content mt-2 pb-4 border-0">
                    <button className="room__delete-button" onClick={handleDeleteRoom}>
                      <p className="mb-0">
                        Διαγραφή δωματίου
                      </p>
                    </button>
                  </div>

                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ActiveRating({ bookingId }) {
  const [activeRating, setActiveRating] = useState(0);

  const { rateBooking } = useRoom();

  function handleRate() {
    if (activeRating == 0) {
      return;
    }

    rateBooking(bookingId, activeRating);
  }

  return (
    <>
      <div className="active-rating">
        <div className="row mx-0 align-items-center">
          {
            [...Array(5)].map((star, index) => {
              let isActive = false;
              if (index + 1 <= activeRating) {
                isActive = true;
              }

              return (
                <div key={index} className={"col-auto room-cell__review-star active-rating__review-star px-0" + (isActive ? " active" : "")} onClick={() => {
                  setActiveRating(index + 1);
                }}>
                </div>
              );
            })
          }
        </div>
      </div>

      <div className="col-auto mt-2">
        <p className="mb-0 active-rating__review-disclaimer">
          Αξιολόγηση από 1 μέχρι 5 αστέρια
        </p>
      </div>

      <button className="w-100 secondary-button room__rating-button mt-2" onClick={handleRate}>
        <p className="mb-0">
          Αποστολή αξιολόγησης
        </p>
      </button>
    </>
  );
}

// function ReviewStars({ rating, ratingCount }) {
//   const stars = Math.floor(rating);
//   let hasHalfStar = rating - stars == 0 ? false : true;

//   return (
//     <div className="room-cell__review row mt-3">
//       <div className="col-auto d-flex px-0">
//         {
//           [...Array(5)].map((star, i) => {
//             if (i <= stars - 1) {
//               return (
//                 <div className="col-auto room-cell__review-star px-0" key={i}><img src={reviewStarFull} alt="One review star" /></div>
//               );
//             } else if (hasHalfStar) {
//               hasHalfStar = 0;
//               return (
//                 <div className="col-auto room-cell__review-star px-0" key={i}><img src={reviewStarHalf} alt="One Half review star" /></div>
//               );
//             } else {
//               return (
//                 <div className="col-auto room-cell__review-star px-0" key={i}><img src={reviewStarEmpty} alt="One empty review star" /></div>
//               );
//             }
//           })}
//       </div>

//       <div className="col-auto d-flex align-items-center ps-1 pt-1">
//         <p className="room-cell__review-count mb-0 lh-sm">
//           ({ratingCount})
//         </p>
//       </div>
//     </div>
//   );
// }

function RoomReservationFooter({ price, nights, handleReserve }) {
  return (
    nights &&
    <div className="room-reservation-footer">
      <div className="row mx-0 py-3 py-lg-4 px-2 px-lg-4 align-items-center justify-content-end">
        <div className="room-reservation-footer__price col-auto text-end">
          {price}€
          <div className="room-reservation-footer__nights">
            /&nbsp;
            {(nights > 1 ? nights + " βράδια" : nights + " βράδυ")}
          </div>
        </div>

        <div className="col-auto">
          <button className="room-reservation-footer__reserve-button primary-button" onClick={handleReserve}>
            <p className="mb-0">
              Κράτηση
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomEditFooter({ price, perExtraPersonPrice, roomId }) {
  return (
    <div className="room-reservation-footer">
      <div className="row mx-0 py-3 py-lg-4 px-2 px-lg-4 align-items-center justify-content-end">
        <div className="room-reservation-footer__price col-auto text-end px-0">
          {price}€
          <div className="room-reservation-footer__nights">
            / βράδυ
          </div>
        </div>

        <div className="room-reservation-footer__price col-auto text-end">
          {perExtraPersonPrice}€
          <div className="room-reservation-footer__nights">
            / άτομο
          </div>
        </div>

        <div className="col-auto">
          <Link className="d-block room-reservation-footer__edit-button secondary-button" to={"/host/edit_room/" + roomId}>
            <p className="mb-0">
              Επεξεργασία
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RoomPriceOnlyFooter({ price, nights }) {
  return (
    nights &&
    <div className="room-reservation-footer">
      <div className="row mx-0 py-3 py-lg-4 px-2 px-lg-4 align-items-center justify-content-end">
        <div className="room-reservation-footer__price col-auto text-end pe-lg-5">
          {price}€
          <div className="room-reservation-footer__nights">
            /&nbsp;
            {(nights > 1 ? nights + " βράδια" : nights + " βράδυ")}
          </div>
        </div>
      </div>
    </div>
  );
}