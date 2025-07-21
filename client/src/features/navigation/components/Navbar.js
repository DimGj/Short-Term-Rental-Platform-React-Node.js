import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import ActivatableLink from './ActivatableLink';

import '../assets/css/navbar.min.css';

import { useUserAuth } from '../../user_auth/context/UserContext';

import logoutIcon from '../assets/img/icons/logout_icon.svg';

export default function Navbar({ toggleSidebar, handleLoginBtnClick, handleLogoutBtnClick, handleSignupBtnClick, isAdmin, isHost, currentLocation }) {
  const { isLoggedIn } = useUserAuth();

  return (
    <header id="navbar">
      <div className="navbar__background">
        <div className="container-xl">
          <div className="navbar__row row align-items-center justify-content-between px-4">
            <div className="col-auto d-flex px-0">
              <Link to="/" className="navbar__brand col-auto d-flex px-0">
                <div>
                  <img src={require("../assets/img/brand/dit_logo.png")} alt="dit logo" />
                </div>

                <div className="ms-2 d-flex align-items-end">
                  <p className="mb-0">Travel<br />Agency</p>
                </div>
              </Link>
            </div>

            <div className="col-auto px-0">
              <nav className="row align-items-center gx-5 d-none d-lg-flex">
                <div className="col-auto">
                  <ActivatableLink to="/" className="navbar__link" currentLocation={currentLocation}>
                    <p className="mb-0">
                      Αρχική
                    </p>
                  </ActivatableLink>
                </div>

                {
                  isAdmin &&
                  <div className="col-auto">
                    <ActivatableLink to="/admin" className="navbar__link" currentLocation={currentLocation}>
                      <p className="mb-0">
                        Διαχείριση
                      </p>
                    </ActivatableLink>
                  </div>
                }

                {
                  (isHost) &&
                  <div className="col-auto">
                    <ActivatableLink to="/host" className="navbar__link" currentLocation={currentLocation}>
                      <p className="mb-0">
                        Τα καταλύματα μου
                      </p>
                    </ActivatableLink>
                  </div>
                }

                {
                  !isLoggedIn() &&
                  <div className="col-auto d-flex ps-0">
                    <button className="navbar__login-button secondary-button mx-3" onClick={handleLoginBtnClick}>
                      <p className="mb-0">
                        Σύνδεση
                      </p>
                    </button>

                    <button className="navbar__signup-button primary-button mx-3" onClick={handleSignupBtnClick}>
                      <p className="mb-0">
                        Εγγραφή
                      </p>
                    </button>
                  </div>

                  ||

                  <>

                    {!isAdmin && !isHost &&
                      <div className="col-auto d-flex">
                        <ActivatableLink to="/bookings" className="navbar__link d-flex align-items-center px-0" currentLocation={currentLocation}>
                          <p className="mb-0 lh-base">
                            Οι κρατήσεις μου
                          </p>
                        </ActivatableLink>
                      </div>
                    }

                    <div className="col-auto d-flex">
                      <ActivatableLink to="/profile" className="navbar__settings-button navbar__link d-flex align-items-center px-0" currentLocation={currentLocation}>
                        <p className="mb-0 lh-base">
                          Προφίλ
                        </p>
                      </ActivatableLink>
                    </div>

                    <div className="col-auto d-flex">
                      <button className="navbar__logout-button navbar__link d-flex align-items-center px-0" onClick={handleLogoutBtnClick}>
                        <p className="mb-0 lh-base">
                          Αποσύνδεση
                        </p>

                        <img src={logoutIcon} alt="Αποσύνδεση" />
                      </button>
                    </div>
                  </>
                }
              </nav>

              <button className="d-lg-none sidebar-button col-auto px-0" onClick={toggleSidebar} >
                <img src={require("../assets/img/icons/menu_icon.png")} alt="Άνοιγμα του μενού πλοήγησης" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}