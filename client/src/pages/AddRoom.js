import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';

import PopupMessage from '../components/PopupMessage.js';
import AddEditRoomForm from '../features/room_search/components/AddEditRoomForm.js';
import ErrorHandler from '../components/ErrorHandler.js';

import useHost from '../hooks/useHost.js';
import useServer from '../hooks/useServer.js';
import { useUserAuth } from '../features/user_auth/context/UserContext.js';
import { useRoom } from '../features/room_search/context/RoomContext.js';

import '../assets/css/add_room.min.css';

export default function AddRoom() {
  const { register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm();

  const navigate = useNavigate();
  const isHost = useHost();

  useEffect(() => {
    // Redirects if user is not logged in or not an accepted host
    if (isHost === false) {
      navigate("/");
    }
  }, [isHost]);

  const { getAccessToken, refreshAccessToken, getHeaders, getLoggedUserId } = useUserAuth();
  const { getCoordinates } = useRoom();
  const [error, resetError, isLoading, serverRequest] = useServer();
  const [errorMessage, setErrorMessage] = useState(null);
  const [inputThumbnail, setInputThumbnail] = useState(null);
  const [inputPhotos, setInputPhotos] = useState(null);

  async function onSubmit(data) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    const coordinates = await getCoordinates(data.street + " " + data.number + "," + data.neighborhood + "," + data.zipcode + "," + data.country);

    if (coordinates == null) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setErrorMessage("Η διεύθυνση που δώσατε δεν βρέθηκε. Παρακαλώ προσπαθήστε ξανά.")
      return;
    }

    const body = {
      hostId: parseInt(getLoggedUserId()),
      name: data.name,
      description: data.description,
      street: data.street + " " + data.number,
      zipcode: parseInt(data.zipcode),
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      country: data.country,
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      room_type: data.room_type,
      neighborhood_description: data.neighborhood_description,
      transition: data.transition,
      accommodates: parseInt(data.accommodates),
      bathrooms: parseInt(data.bathrooms),
      bedrooms: parseInt(data.bedrooms),
      beds: parseInt(data.beds),
      has_couch: data.has_couch === "true" ? true : false,
      amenities: data.amenities.toString(),
      pets_allowed: data.pets_allowed === "true" ? true : false,
      smoking_allowed: data.smoking_allowed === "true" ? true : false,
      events_allowed: data.events_allowed === "true" ? true : false,
      surface: parseInt(data.surface),
      price: parseInt(data.price),
      extraPersonPrice: parseInt(data.extraPersonPrice),
      startingRentingDate: data.startingRentingDate,
      endingRentingDate: data.endingRentingDate,
      minimum_nights: parseInt(data.minimum_nights),
      thumbnail: inputThumbnail,
      photos: inputPhotos.join(',')
    }

    serverRequest('room', 'POST', '', body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      reset();
      navigate("/host");
    });
  }

  return (
    isHost &&
    <>
      <Helmet>
        <title>Προσθήκη καταλύματος</title>
      </Helmet>

      <PopupMessage message={errorMessage} setPopupMessage={setErrorMessage} />
      <ErrorHandler error={error} resetError={resetError} />

      <div className="add-room">
        <div className="container-lg my-5">
          <div className="row justify-content-center">
            <div className="col-auto">
              <h1 className="mb-0">
                Νέο κατάλυμα
              </h1>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-6">
              <AddEditRoomForm onSubmit={handleSubmit(onSubmit)} register={register} errors={errors} setError={setError} isLoading={isLoading} isAdd={true} setInputThumbnail={setInputThumbnail} setInputPhotos={setInputPhotos} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

