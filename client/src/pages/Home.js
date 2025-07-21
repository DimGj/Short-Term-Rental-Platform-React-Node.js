import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useRoom } from '../features/room_search/context/RoomContext';
import { useUserAuth } from '../features/user_auth/context/UserContext';
import useHost from '../hooks/useHost';
import useAdmin from '../hooks/useAdmin';

import RoomSearch from '../features/room_search/RoomSearch';
import RoomResults from '../features/room_search/RoomResults';
import RoomRecommendations from '../features/room_search/RoomRecommendations';

import '../assets/css/home.min.css';

export default function Home() {
  const { isLoggedIn } = useUserAuth();
  let loginState = isLoggedIn();
  const isHost = useHost();
  const isAdmin = useAdmin();

  const { getUserRoomRecommendations } = useRoom();
  const [userRecommendations, setUserRecommendations] = useState([]);

  const mobileBreakpoint = 992;
  const [isMobile, setIsMobile] = useState(window.innerWidth < mobileBreakpoint);

  useEffect(() => {
    function setMobile() {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    }

    window.addEventListener("resize", setMobile);

    return () => { // Cleanup
      window.removeEventListener("resize", setMobile);
    }
  }, []);

  useEffect(() => {
    if (!loginState || isHost || isAdmin) {
      setUserRecommendations([]);
      return;
    }

    getUserRoomRecommendations().then((data) => {
      setUserRecommendations(data);
    });
  }, [loginState, isHost, isAdmin]);

  return (
    <>
      <Helmet>
        <title>Αρχική</title>
      </Helmet>

      <div className="hero-wrapper">

        <div className="hero d-flex">
          <div className={"hero-content container-lg px-3 align-self-center" + (userRecommendations.length && !isHost && !isAdmin > 0 ? " has-recommended" : "")}>
            <div className="row justify-content-center">
              <div className="col-auto">
                <h1 className="hero-content__title">Επιλογή προορισμού</h1>
              </div>

              <div className="col-12">
                <RoomSearch />
              </div>
            </div>

            {!isHost && !isAdmin && userRecommendations.length > 0 && !isMobile &&
              <div className="row mt-5 pt-4">
                <RoomRecommendations rooms={userRecommendations} isMobile={isMobile} />
              </div>
            }
          </div>
        </div>
      </div>

      <div className="hero-mobile__recommendations container-lg px-4 mb-5">
        {!isHost && !isAdmin && userRecommendations.length > 0 && isMobile &&
          <div className="row gy-4 mt-4">
            <RoomRecommendations rooms={userRecommendations} isMobile={isMobile} />
          </div>
        }
      </div>

      <div className="room-results__wrapper">
        <RoomResults />
      </div>
    </>
  )
}
