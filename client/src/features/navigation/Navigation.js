import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserAuth from '../user_auth/UserAuth';
import BlurWrapper from './components/BlurWrapper';

import { useUserAuth } from '../user_auth/context/UserContext';

import useAdmin from '../../hooks/useAdmin';
import useHost from '../../hooks/useHost';

export default function Navigation() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userAuthActive, setUserAuthActive] = useState(false);
  const [userAuthMode, setUserAuthMode] = useState(null);

  const { isLoggedIn, userLogout } = useUserAuth();

  const location = useLocation();

  const isAdmin = useAdmin();
  const isHost = useHost();

  function handleLoginBtnClick() {
    setUserAuthActive(true);
    setUserAuthMode("USER_LOGIN");
  }

  function handleSignupBtnClick() {
    setUserAuthActive(true);
    setUserAuthMode("USER_SIGNUP");
  }

  function handleLogoutBtnClick() {
    userLogout();
  }

  useEffect(() => {
    if (sidebarActive) {
      setSidebarActive(false);
    }

  }, [userAuthActive, location]);

  useEffect(() => {
    if (isLoggedIn() && userAuthActive) {
      setUserAuthActive(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);

    return (() => {
      document.removeEventListener('click', handleDocumentClick);
    });
  }, []);

  // Closes sidebar if a click is detected anywhere in the page but the sidebar
  function handleDocumentClick(evt) {
    const sidebarButton = document.getElementsByClassName("sidebar-button");
    const sidebar = document.querySelector(".sidebar");

    let targetElement = evt.target;

    do {
      if (targetElement == sidebarButton[0] || targetElement == sidebarButton[1] || targetElement == sidebar) {
        return;
      }
      targetElement = targetElement.parentNode;
    } while (targetElement);

    setSidebarActive(false);
  }

  function toggleSidebar() {
    setSidebarActive(sidebarActive => !sidebarActive);
  }

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} handleLoginBtnClick={handleLoginBtnClick} handleLogoutBtnClick={handleLogoutBtnClick} handleSignupBtnClick={handleSignupBtnClick} isAdmin={isAdmin} isHost={isHost} currentLocation={location.pathname} />
      <Sidebar active={sidebarActive} toggleSidebar={toggleSidebar} handleLoginBtnClick={handleLoginBtnClick} handleLogoutBtnClick={handleLogoutBtnClick} handleSignupBtnClick={handleSignupBtnClick} isAdmin={isAdmin} isHost={isHost} currentLocation={location.pathname} />

      {
        userAuthActive &&
        <UserAuth mode={userAuthMode} deactivateUserAuth={() => {
          setUserAuthActive(false);
        }} />
      }

      <BlurWrapper active={userAuthActive || sidebarActive} />
    </>
  );
}