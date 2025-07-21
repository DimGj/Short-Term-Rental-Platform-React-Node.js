import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import ActivatableLink from './ActivatableLink';

import { useUserAuth } from '../../user_auth/context/UserContext';

import '../assets/css/sidebar.min.css';

import logoutIcon from '../assets/img/icons/logout_icon.svg';

export default function Sidebar({ active, toggleSidebar, handleLoginBtnClick, handleLogoutBtnClick, handleSignupBtnClick, isAdmin, isHost, currentLocation }) {
  const { isLoggedIn } = useUserAuth();

  return (
    <div className={"sidebar" + (active ? " active" : "")} id="sidebar">
      <div className="container-fluid">
        <div className="sidebar__top pe-2 row flex-row-reverse align-items-center">
          <button className="col-auto d-flex px-0 align-items-center" onClick={toggleSidebar}>
            <div className="col-auto pe-3">
              <p className="mb-0 pt-1">
                Κλείσιμο
              </p>
            </div>

            <div className="sidebar-button col-auto px-0">
              <img src={require("../assets/img/icons/menu_icon.png")} alt="Κλείσιμο του μενού πλοήγησης" />
            </div>
          </button>
        </div>

        <nav className="sidebar__navlinks row justify-content-center">
          <div>
            <ActivatableLink to="/" className="sidebar__navlink d-block py-3 px-3 col-12" currentLocation={currentLocation}>
              <p className="mb-0">
                Αρχική
              </p>
            </ActivatableLink>

            {
              isAdmin &&
              <ActivatableLink to="/admin" className="sidebar__navlink d-block py-3 px-3 col-12" currentLocation={currentLocation}>
                <p className="mb-0">
                  Διαχείριση
                </p>
              </ActivatableLink>
            }

            {
              (isHost) &&
              <ActivatableLink to="/host" className="sidebar__navlink d-block py-3 px-3 col-12" currentLocation={currentLocation}>
                <p className="mb-0">
                  Τα καταλύματα μου
                </p>
              </ActivatableLink>
            }


            {isLoggedIn() &&
              <>
                {!isAdmin && !isHost &&
                  <ActivatableLink to="/bookings" className="sidebar__navlink d-block py-3 px-3 col-12" currentLocation={currentLocation}>
                    <p className="mb-0">
                      Οι κρατήσεις μου
                    </p>
                  </ActivatableLink>
                }

                <ActivatableLink to="/profile" className="sidebar__navlink d-block py-3 px-3 col-12" currentLocation={currentLocation}>
                  <p className="mb-0">
                    Προφίλ
                  </p>
                </ActivatableLink>
              </>
            }
          </div>

          <div className="sidebar__auth-buttons py-3">
            {
              !isLoggedIn() &&

              <div>
                <div className="col-12">
                  <button className="sidebar__login-button secondary-button" onClick={handleLoginBtnClick}>
                    <p className="mb-0">
                      Σύνδεση
                    </p>
                  </button>
                </div>

                <div className="col-12 mt-3">
                  <button className="sidebar__signup-button primary-button" onClick={handleSignupBtnClick}>
                    <p className="mb-0">
                      Εγγραφή
                    </p>
                  </button>
                </div>
              </div>
              ||

              <div className="col-12">
                <button className="sidebar__logout-button d-flex align-items-center px-0" onClick={handleLogoutBtnClick}>
                  <p className="mb-0 lh-base">
                    Αποσύνδεση
                  </p>

                  <img src={logoutIcon} alt="Αποσύνδεση" />
                </button>
              </div>
            }
          </div>
        </nav>
      </div>
    </div>
  );
}
