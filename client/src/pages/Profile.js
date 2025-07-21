import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { Buffer } from 'buffer';

import { useUserAuth } from '../features/user_auth/context/UserContext';
import useServer from '../hooks/useServer';

import ErrorHandler from '../components/ErrorHandler';

import '../assets/css/profile.min.css';

import editIcon from '../assets/img/icons/edit.svg';

export default function Profile() {
  const { register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const { isLoggedIn, getLoggedUserInfo, getAccessToken, refreshAccessToken, getHeaders } = useUserAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [inputAvatar, setInputAvatar] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (!loggedIn) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const loggedUserInfo = getLoggedUserInfo();

    if (loggedUserInfo) {
      setUserInfo(loggedUserInfo);

      switch (loggedUserInfo.role) {
        case "admin":
          setUserRole("Διαχειριστής");
          break;
        case "host":
          setUserRole("Οικοδεσπότης");
          break;
        case "client":
          setUserRole("Ενοικιαστής");
          break;
      }

      switch (loggedUserInfo.status) {
        case "accepted":
          setUserStatus("Επιτυχής");
          break;
        case "rejected":
          setUserStatus("Απορρίφθηκε");
          break;
        case "pending":
          setUserStatus("Εκκρεμεί");
          break;
      }

      let avatar = loggedUserInfo.avatar ? loggedUserInfo.avatar : "";
      if (avatar.substring(0, 4) !== "http") {
        avatar = "data:image/jpeg;base64," + avatar;
      }
      setUserAvatar(avatar);

    }
  }, [getLoggedUserInfo]);

  function handleEditMode() {
    setEditMode(!editMode);
  }

  const [error, resetError, isLoading, serverRequest] = useServer();

  function onSubmit(data) {
    const accessToken = getAccessToken();
    const headers = getHeaders(accessToken);

    let body = {};
    for (let key in data) {
      if (data[key]) {
        if (key != "avatar") {
          body[key] = data[key];
          continue;
        }

        // If avatar is not empty, set it to the inputAvatar
        if (data[key].length != 0) {
          body[key] = inputAvatar;
          continue;
        }
      }
    }

    if (Object.keys(body).length == 0) {
      // No changes
      return;
    }
    serverRequest('user', 'PUT', userInfo.id, body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      navigate(0);
    });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setInputAvatar(reader.result.split(',')[1]); // Set the Base64-encoded image string
      };
    }
  }

  return (
    <>
      <Helmet>
        <title>Προφίλ</title>
      </Helmet>

      <ErrorHandler error={error} resetError={resetError} />

      <div className="settings">
        <div className="container-lg mt-5 mb-5 mb-lg-0">
          <div className="row justify-content-center">
            <div className="col-auto">
              <h1 className="mb-0">
                Προφίλ χρήστη
              </h1>
            </div>
          </div>

          <div className="row justify-content-end">
            <div className="col-auto">
              <button className="settings__edit-button secondary-button" onClick={handleEditMode}>
                <img src={editIcon} alt="Αλλαγή στοιχείων χρήστη" />
              </button>
            </div>
          </div>

          {userInfo &&
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="user__info row mt-5 gy-4 gy-lg-0">
                <div className="col-12 col-lg-4 d-flex justify-content-center mt-0">
                  <div className="user__info-container p-4">
                    <h2 className="mb-0">
                      Προσωπικά στοιχεία
                    </h2>

                    <div className="mt-2">
                      <div className="row align-items-center mx-0">
                        <div className="col-auto ps-0 pe-2 pb-2">
                          {userAvatar &&
                            <img className="user__avatar" src={userAvatar} alt="" />

                            ||

                            <div className="placeholder__avatar d-flex align-items-center justify-content-center">
                              <p className="mb-0">
                                Χωρίς φωτογραφία
                              </p>
                            </div>
                          }
                        </div>

                        {editMode &&
                          <div className="col-12 mt-2 pb-2">
                            <input
                              {...register("avatar")}
                              className="col settings__input form-control-file"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange} />
                          </div>
                        }
                      </div>

                      <div className="row align-items-center mx-0">
                        <div className="col-auto ps-0 pe-2">
                          <p className="mb-0">
                            Όνομα χρήστη: {!editMode && userInfo.username}
                          </p>
                        </div>

                        {editMode &&
                          <input
                            className="col settings__input"
                            {...register("username", {
                              minLength: {
                                value: 8,
                                message: "Το όνομα χρήστη πρέπει να είναι μεγαλύτερο από 8 χαρακτήρες."
                              },
                              maxLength: {
                                value: 20,
                                message: "Το όνομα χρήστη πρέπει να είναι μικρότερο από 20 χαρακτήρες."
                              }
                            })}
                            type="text" />
                        }
                      </div>

                      <div className="row align-items-center mx-0 pt-1">
                        <div className="col-auto ps-0 pe-2">
                          <p className="mb-0">
                            Όνομα: {!editMode && userInfo.firstname}
                          </p>
                        </div>

                        {editMode &&
                          <input
                            className="col settings__input"
                            {...register("firstname", {
                              pattern: {
                                value: /^[A-Za-z]+/,
                                message: "Το όνομα μπορεί να περιέχει μόνο αλφαβητικούς χαρακτήρες."
                              }
                            })}
                            type="text" />
                        }
                      </div>

                      <div className="row align-items-center mx-0 pt-1">
                        <div className="col-auto ps-0 pe-2">
                          <p className="mb-0">
                            Επώνυμο: {!editMode && userInfo.lastname}
                          </p>
                        </div>

                        {editMode &&
                          <input
                            className="col settings__input"
                            {...register("lastname", {
                              pattern: {
                                value: /^[A-Za-z]+/,
                                message: "Το όνομα μπορεί να περιέχει μόνο αλφαβητικούς χαρακτήρες."
                              }
                            })}
                            type="text" />
                        }
                      </div>

                      {errors.username &&
                        <div className="col-12 px-0 mt-2">
                          <p className="error-message mb-0">
                            {errors.username.message}
                          </p>
                        </div>
                      }

                      {errors.firstname &&
                        <div className="col-12 px-0 mt-2">
                          <p className="error-message mb-0">
                            {errors.firstname.message}
                          </p>
                        </div>
                      }

                      {errors.lastname &&
                        <div className="col-12 px-0 mt-2">
                          <p className="error-message mb-0">
                            {errors.lastname.message}
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4 d-flex justify-content-center">
                  <div className="user__info-container p-4">
                    <h2 className="mb-0">
                      Στοιχεία επικοινωνίας
                    </h2>

                    <div className="mt-2">
                      <div className="row align-items-center mx-0">
                        <div className="col-auto ps-0 pe-2">
                          <p className="mb-0">
                            Διεύθυνση e-mail: {!editMode && userInfo.email}
                          </p>
                        </div>

                        {editMode &&
                          <input
                            className="col settings__input"
                            {...register("email", {
                              pattern: {
                                value: /[^@\s]+@[^@\s]+\.[^@\s]+[^@\s]/,
                                message: "Μη έγκυρο email."
                              }
                            })}
                            type="text" />
                        }
                      </div>

                      <div className="row align-items-center mx-0 pt-1">
                        <div className="col-auto ps-0 pe-2">
                          <p className="mb-0">
                            Τηλέφωνο: {!editMode && userInfo.telephone}
                          </p>
                        </div>

                        {editMode &&
                          <input
                            className="col settings__input"
                            {...register("telephone")}
                            type="text" />
                        }
                      </div>

                      {errors.email &&
                        <div className="col-12 px-0 mt-2">
                          <p className="error-message mb-0">
                            {errors.email.message}
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4 d-flex justify-content-center">
                  <div className="user__info-container p-4">
                    <h2 className="mb-0">
                      Δραστηριότητα εφαρμογής
                    </h2>

                    <div className="mt-2">
                      <p className="mb-0">
                        Ρόλος:&nbsp;
                        {userRole}
                      </p>

                      {
                        userInfo.role == "host" &&
                        <p className="mb-0">
                          Πορεία αίτησης:
                          <span className={"user__role-request-status-" + userInfo.status}>
                            &nbsp;
                            {userStatus}
                          </span>
                        </p>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {editMode &&
                <div className="row justify-content-center mt-5">
                  <div className="col-auto">
                    <button type="submit" className="primary-button">
                      <p className="mb-0">
                        Αποθήκευση
                      </p>
                    </button>
                  </div>
                </div>
              }
            </form>
          }
        </div>
      </div>
    </>
  );
}