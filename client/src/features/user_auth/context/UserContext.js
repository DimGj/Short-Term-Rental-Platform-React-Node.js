import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import jwt from 'jwt-decode';

import ErrorHandler from '../../../components/ErrorHandler';
import PopupMessage from '../../../components/PopupMessage';

import useServer from '../../../hooks/useServer';

export const UserAuthContext = createContext("");

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export function UserAuthProvider({ children }) {
  // Get credentials from local storage
  const cachedLoggedUserId = localStorage.getItem('loggedUserId');
  const cachedAccessToken = localStorage.getItem('accessToken');
  const cachedRefreshToken = JSON.parse(localStorage.getItem('refreshToken'));

  const [loginState, setLoginState] = useState(cachedAccessToken ? true : false);
  const [loggedUserCredentials, setLoggedUserCredentials] = useState({
    id: cachedLoggedUserId ? cachedLoggedUserId : null,
    accessToken: cachedAccessToken ? cachedAccessToken : null
  });
  const [refreshToken, setRefreshToken] = useState(cachedRefreshToken ? cachedRefreshToken : null);
  const [loggedUserInfo, setLoggedUserInfo] = useState(null);

  const [popupMessage, setPopupMessage] = useState(null);

  const navigate = useNavigate();

  // Gets user id and access token from local storage, requests user info from server on every page refresh
  useEffect(() => {
    if (!loginState) {
      return;
    }

    if (loggedUserCredentials.id && (loggedUserCredentials.accessToken || refreshToken.token)) {
      const token = refreshToken ? refreshToken.token : loggedUserCredentials.accessToken;

      getUserInfo(token, loggedUserCredentials.id).then((data) => {
        if (!data) {
          return;
        }

        setLoggedUserInfo(data);
      });
    }
  }, []);

  // Server request
  const [error, resetError, isLoading, serverRequest] = useServer();

  function getAccessToken() {
    return refreshToken ? refreshToken.token : loggedUserCredentials.accessToken;
  }

  function refreshAccessToken() {

    const hourInSec = 3600;
    let headers = null;

    if (refreshToken && refreshToken.expires <= Math.floor(new Date() / 1000) + hourInSec) {
      headers = {
        'refresh-token': refreshToken.token
      }
    } else if (!refreshToken && localStorage.getItem('accessToken')) {
      headers = {
        'access-token': localStorage.getItem('accessToken')
      }
    }

    if (!headers) {
      return;
    }

    serverRequest('user', 'POST', 'refresh-token', null, headers).then((data) => {
      if (!data) {
        return;
      }

      const token = data.token;
      const decodedToken = jwt(token);

      const newToken = { token: token, expires: decodedToken.exp };
      setRefreshToken(newToken);

      localStorage.setItem('refreshToken', JSON.stringify(newToken));
    });
  }


  function getHeaders(accessToken) {

    let headers = null;
    if (refreshToken) {
      headers = {
        'refresh-token': accessToken
      }
    } else {
      headers = {
        'access-token': accessToken
      }
    }

    return headers;
  }


  function getLoggedUserId() {
    if (!loggedUserCredentials.id) {
      return null;
    }

    return loggedUserCredentials.id;
  }

  function getLoggedUserInfo() {
    if (!loggedUserInfo) {
      return null;
    }

    return loggedUserInfo;
  }

  function getUserInfo(accessToken, userId) {
    const headers = getHeaders(accessToken);

    return serverRequest('user', 'GET', userId, null, headers, refreshAccessToken);
  }

  function isLoggedIn() {
    return loginState;
  }

  function userSignup(newAccessToken) {
    userLogin(newAccessToken).then((data) => {
      if (data.role == "host") {
        setPopupMessage("Η αίτηση σας για τον ρόλο του οικοδεσπότη εκκρεμεί.");
      }
    });
  }

  function userLogin(newAccessToken) {
    const decodedToken = jwt(newAccessToken);
    const userId = decodedToken.id;

    setLoggedUserCredentials({ id: userId, accessToken: newAccessToken });
    setLoginState(true);

    localStorage.setItem('loggedUserId', userId);
    localStorage.setItem('accessToken', newAccessToken);

    return getUserInfo(newAccessToken, userId).then((data) => {
      if (!data) {
        return;
      }

      setLoggedUserInfo(data);

      if (data.role == "admin") {
        navigate("/admin");
      }

      return data;
    });
  }

  function userLogout() {
    setLoginState(false);
    setLoggedUserCredentials({ id: null, accessToken: null });
    setRefreshToken(null);
    setLoggedUserInfo(null);

    localStorage.removeItem('loggedUserId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    navigate("/");
  }

  return (
    <UserAuthContext.Provider value={{ isLoggedIn, getHeaders, getAccessToken, refreshAccessToken, getLoggedUserId, getLoggedUserInfo, getUserInfo, userSignup, userLogin, userLogout }}>
      <PopupMessage message={popupMessage} setPopupMessage={setPopupMessage} />
      <ErrorHandler error={error} resetError={resetError} />
      {children}
    </UserAuthContext.Provider>
  );
}