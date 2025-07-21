import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';

import UserShowcase from '../features/user_showcase/UserShowcase';
import ErrorHandler from '../components/ErrorHandler';

import useServer from '../hooks/useServer';
import useAdmin from '../hooks/useAdmin';
import { useUserAuth } from '../features/user_auth/context/UserContext';
import useExportData from '../hooks/useExportData';

import '../assets/css/admin.min.css';

export default function Admin() {
  const [users, setUsers] = useState(null);

  const [error, resetError, loading, serverRequest] = useServer();

  const navigate = useNavigate();
  const isAdmin = useAdmin();
  const { getAccessToken, refreshAccessToken, getHeaders } = useUserAuth();

  useEffect(() => {
    const headers = getHeaders(getAccessToken());

    serverRequest('user', 'GET', '', null, headers, refreshAccessToken).then((data) => {
      if (!data) {
        return;
      }

      setUsers(data);
    });
  }, []);

  useEffect(() => {
    // Redirects if user is not logged in or not an admin
    if (isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin]);

  const { exportData, isLoading } = useExportData();

  function handleExportDataButtonClick(mode) {
    exportData(mode);
  }

  return (
    isAdmin &&
    <>
      <Helmet>
        <title>Διαχείριση</title>
      </Helmet>

      <ErrorHandler error={error} resetError={resetError} />
      <div className="admin">
        <div className="container-lg mt-5 px-4">
          <div className="row">
            <div className="col-12">
              <h2 className="h1 mb-4 pb-2 text-center">
                Εξαγωγή δεδομένων εφαρμογής
              </h2>

              <div className="admin__export row mx-0 justify-content-center gx-5 gy-4">
                <div className="col-12 col-md-auto d-flex justify-content-center">
                  <button className="export__button secondary-button" onClick={() => {
                    handleExportDataButtonClick('json');
                  }}>
                    {isLoading &&
                      <p className="mb-0">
                        Φόρτωση...
                      </p>
                      ||
                      <p className="mb-0">
                        Εξαγωγή σε JSON
                      </p>
                    }
                  </button>
                </div>

                <div className="col-12 col-md-auto d-flex justify-content-center">
                  <button className="export__button secondary-button" onClick={() => {
                    handleExportDataButtonClick('xml');
                  }}>
                    {isLoading &&
                      <p className="mb-0">
                        Φόρτωση...
                      </p>
                      ||
                      <p className="mb-0">
                        Εξαγωγή σε XML
                      </p>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12 mt-5">
              <h1 className="mb-4 pb-2 text-center">
                Λίστα χρηστών
              </h1>

              {users &&
                <UserShowcase users={users} />
              }

              {isLoading &&
                <p className="mb-0 mt-4 text-center">
                  Φόρτωση...
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
