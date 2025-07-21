import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Buffer } from 'buffer';

import { useUserAuth } from '../features/user_auth/context/UserContext';
import useServer from '../hooks/useServer';
import useAdmin from '../hooks/useAdmin';

import ErrorHandler from '../components/ErrorHandler';

import '../assets/css/user.min.css';

export default function User() {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");

  const { getLoggedUserId, getHeaders, getUserInfo, getAccessToken, refreshAccessToken } = useUserAuth();

  const [error, resetError, isLoading, serverRequest] = useServer();

  const navigate = useNavigate();
  const isAdmin = useAdmin();

  useEffect(() => {
    getUserInfo(getAccessToken(), userId).then((data) => {
      if (!data) {
        return;
      }

      setUserInfo(data);

      switch (data.role) {
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

      switch (data.status) {
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

      let avatar = data.avatar ? data.avatar : "";
      if (avatar.substring(0, 4) !== "http") {
        avatar = "data:image/jpeg;base64," + avatar;
      }
      setUserAvatar(avatar);
    });
  }, []);

  useEffect(() => {
    // Redirects if user is not logged in or not an admin
    if (isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin]);

  async function sendRequestResponse(response) {
    const acceptedResponses = ["accepted", "rejected"];
    if (!response || !acceptedResponses.includes(response)) {
      return;
    }

    const headers = getHeaders(getAccessToken());
    const body = {
      status: response
    };

    serverRequest('user', 'PUT', userId, body, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      navigate(0);
    });
  }

  async function handleDeleteClick() {
    const headers = getHeaders(getAccessToken());

    serverRequest('user', 'DELETE', userId, null, headers, refreshAccessToken).then((data) => {
      if (data == null) {
        return;
      }

      navigate(-1);
    });
  }

  return (
    isAdmin &&
    <>
      <Helmet>
        <title>Πληροφορίες χρήστη</title>
      </Helmet>

      <ErrorHandler error={error} resetError={resetError} />
      {userInfo &&
        <div className="user">
          <div className="container-lg my-5 px-4">
            <div className="row justify-content-center">
              <div className="col-auto">
                <h1 className="mb-0">
                  Πληροφορίες χρήστη: #{userId}
                </h1>
              </div>
            </div>

            <div className="user__info row mt-5 gy-4 gy-lg-0">
              <div className="col-12 col-lg-4 d-flex justify-content-center mt-0">
                <div className="user__info-container p-4">
                  <h2 className="mb-0">
                    Προσωπικά στοιχεία
                  </h2>

                  <div className="mt-2">
                    {userAvatar &&
                      <img className="user__avatar mb-2" src={userAvatar} alt="" />
                      ||
                      <div className="placeholder__avatar mb-2 d-flex align-items-center justify-content-center">
                        <p className="mb-0">
                          Χωρίς φωτογραφία
                        </p>
                      </div>
                    }

                    <p className="mb-0">
                      Όνομα χρήστη: {userInfo.username}
                    </p>

                    <p className="mb-0">
                      Όνομα: {userInfo.firstname}
                    </p>

                    <p className="mb-0">
                      Επώνυμο: {userInfo.lastname}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4 d-flex justify-content-center">
                <div className="user__info-container p-4">
                  <h2 className="mb-0">
                    Στοιχεία επικοινωνίας
                  </h2>

                  <div className="mt-2">
                    <p className="mb-0">
                      Διεύθυνση e-mail: {userInfo.email}
                    </p>

                    <p className="mb-0">
                      Τηλέφωνο: {userInfo.telephone}
                    </p>
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

                    {
                      (isAdmin && userInfo.role != "client") &&
                      <div className="row mt-3 mx-0">
                        {userInfo.status != "accepted" &&

                          <div className="col-12 col-lg px-0 pe-lg-1">
                            <button className="user__approve-button primary-button" onClick={() => {
                              sendRequestResponse("accepted");
                            }}>
                              <p className="mb-0">
                                {
                                  userInfo.status == "pending" &&
                                  <>Έγκριση αίτησης</>
                                }

                                {
                                  userInfo.status == "rejected" &&
                                  <>Προσθήκη δικαιωμάτων οικοδεσπότη</>
                                }
                              </p>
                            </button>
                          </div>
                        }

                        {(userInfo.status != "rejected" && userInfo.role == "host") &&
                          <div className="col-12 col-lg px-0 ps-lg-1 mt-3 mt-lg-0">
                            <button className="user__deny-button primary-button" onClick={() => {
                              sendRequestResponse("rejected");
                            }}>
                              <p className="mb-0">
                                {
                                  userInfo.status == "pending" &&
                                  <>Απόρριψη αίτησης</>
                                }

                                {
                                  userInfo.status == "accepted" &&
                                  <>Αφαίρεση δικαιωμάτων οικοδεσπότη</>
                                }
                              </p>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && userInfo.id != getLoggedUserId() &&
              <div className="row justify-content-center mt-5">
                <div className="col-auto">
                  <button className="user__delete-button" onClick={handleDeleteClick}>
                    <p className="mb-0">
                      Διαγραφή χρήστη
                    </p>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      {
        isLoading &&
        <p className="mb-0 mt-4 text-center">
          Φόρτωση...
        </p>
      }
    </>
  );
}
