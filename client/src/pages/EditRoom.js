import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';

import PopupMessage from '../components/PopupMessage.js';
import ErrorHandler from '../components/ErrorHandler.js';
import AddEditRoomForm from '../features/room_search/components/AddEditRoomForm.js';

import useHost from '../hooks/useHost.js';
import useServer from '../hooks/useServer.js';
import { useUserAuth } from '../features/user_auth/context/UserContext.js';
import { useRoom } from '../features/room_search/context/RoomContext.js';

import '../assets/css/add_room.min.css';

export default function EditRoom() {
  const { register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm();

  const { roomId } = useParams();
  const { getRoomInfo } = useRoom();
  const { getAccessToken, refreshAccessToken, getHeaders, getLoggedUserId } = useUserAuth();
  const isHost = useHost();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirects if user is not logged in or not an accepted host
    getRoomInfo(roomId).then((data) => {
      if (!data[0]) {
        navigate("/");
        return;
      }

      const room = data[0];
      const userId = parseInt(getLoggedUserId());

      if (isHost === false || userId !== room.userId) {
        navigate("/");
      }
    });
  }, [isHost]);

  const { getCoordinates } = useRoom();
  const [error, resetError, isLoading, serverRequest] = useServer();
  const [errorMessage, setErrorMessage] = useState(null);
  const [inputThumbnail, setInputThumbnail] = useState(null);
  const [inputPhotos, setInputPhotos] = useState(null);

  async function onSubmit(data) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    let coordinates = null;
    if (data.street && data.number && data.neighborhood && data.zipcode && data.country) {
      coordinates = await getCoordinates(data.street + " " + data.number + "," + data.neighborhood + "," + data.zipcode + "," + data.country);  // TODO: Use previous data if not changed

      if (coordinates == null) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        setErrorMessage("Η διεύθυνση που δώσατε δεν βρέθηκε. Παρακαλώ προσπαθήστε ξανά.")
        return;
      }
    }

    let body = {};
    for (let key in data) {
      if (data[key]) {
        if (key === "number") {
          continue;
        }

        if (key === "street") {
          body[key] = data[key] + " " + data["number"];
          continue;
        }

        if (key == "amenities") {
          body[key] = data[key].toString();
          continue;
        }

        if (key === "thumbnail") {
          if (data[key].length != 0) {
            body[key] = inputThumbnail;
            continue;
          }
          continue;
        }

        if (key === "photos") {
          if (data[key].length != 0) {
            const photos = inputPhotos.join(',');
            body[key] = photos;
            continue;
          }
          continue;
        }
        body[key] = data[key];
      }
    }

    serverRequest('room', 'PUT', roomId, body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      reset();
      navigate("/host/rooms/" + roomId);
    });
  }

  return (
    isHost &&
    <>
      <Helmet>
        <title>Επεξεργασία καταλύματος</title>
      </Helmet>

      <PopupMessage message={errorMessage} setPopupMessage={setErrorMessage} />
      <ErrorHandler error={error} resetError={resetError} />

      <div className="add-room">
        <div className="container-lg my-5">
          <div className="row justify-content-center">
            <div className="col-auto">
              <h1 className="mb-0">
                Επεξεργασία καταλύματος
              </h1>

              <p className="mb-0 mt-2 add-room__description">
                Συμπληρώστε τα πεδία που επιθυμείτε να αλλάξετε.
              </p>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-6">
              <AddEditRoomForm onSubmit={handleSubmit(onSubmit)} register={register} errors={errors} setError={setError} isLoading={isLoading} isAdd={false} setInputThumbnail={setInputThumbnail} inputPhotos={inputPhotos} setInputPhotos={setInputPhotos} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

