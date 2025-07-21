import React, { useEffect } from 'react';

import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

import { useUserAuth } from './context/UserContext';

export default function UserAuth({ mode, deactivateUserAuth }) {
  const { userLogin, userSignup } = useUserAuth();

  function handlePageClick(evt) {
    const navbar = document.getElementById("navbar");
    const sidebar = document.getElementById("sidebar");
    const userAuthForm = document.querySelector(".user-auth-form");

    let targetElement = evt.target;

    do {
      if (targetElement == navbar || targetElement == sidebar || targetElement == userAuthForm) {
        return;
      }
      targetElement = targetElement.parentNode;
    } while (targetElement);

    deactivateUserAuth();
  }

  useEffect(() => {
    document.addEventListener("click", handlePageClick);

    return (() => {
      document.removeEventListener("click", handlePageClick);
    });
  }, []);

  return (
    mode == "USER_LOGIN" ?
      <LoginForm logUserIn={userLogin} />
      :
      <SignupForm signUserUp={userSignup} />
  );
}
