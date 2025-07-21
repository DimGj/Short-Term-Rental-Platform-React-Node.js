import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import useServer from '../../../hooks/useServer.js';

import '../assets/css/login_form.min.css';

export default function LoginForm({ logUserIn }) {
  const { register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [errorMessage, setErrorMessage] = useState(null);
  const [error, resetError, isLoading, serverRequest] = useServer();

  useEffect(() => { // TODO: add messages
    if (!error) {
      return;
    }
    if (error.error === '910' && error.msg) {
      // Wrong credentials
      setErrorMessage(error.msg);
    } else {
      // Unidentified error
      console.log(error);
      setErrorMessage("Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε.");
    }

    resetError();
  }, [error]);

  function onSubmit(data) {
    const body = {
      username: data.username,
      password: data.password
    };

    serverRequest('user', 'POST', 'login', body).then((data) => {
      if (!data) {
        return;
      }

      reset();
      logUserIn(data.token);
    });
  }

  return (
    <div className="login-form user-auth-form px-sm-3">
      <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
        <div className="container-fluid py-5 px-3 px-sm-4">
          <div className="row">
            <div className="col-12">
              <div className="form-floating">
                <input
                  {...register("username", {
                    required: "Το πεδίο είναι απαιτούμενο."
                  })}
                  className="form-control"
                  id="login-form__username"
                  type="text"
                  placeholder="Username" />
                <label htmlFor="login-form__username" className="form-label">Όνομα χρήστη</label>
              </div>
            </div>

            {errors.username &&
              <div className="col-12 mt-2">
                <p className="error-message mb-0">
                  {errors.username.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  {...register("password", {
                    required: "Το πεδίο είναι απαιτούμενο."
                  })}
                  className="form-control"
                  id="login-form__password"
                  type="password"
                  placeholder="Password" />
                <label htmlFor="login-form__password" className="form-label">Κωδικός</label>
              </div>
            </div>

            {errors.password &&
              <div className="col-12 mt-2">
                <p className="error-message mb-0">
                  {errors.password.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <button type="submit" className="login-form__submit-button w-100" disabled={isLoading}>
                <p className="mb-0">{isLoading ? "Φόρτωση..." : "Σύνδεση"}</p>
              </button>
            </div>
          </div>

          {
            errorMessage &&
            <div className="row mt-3">
              <div className="col-12">
                <p className="mb-0 error-message">
                  {errorMessage}
                </p>
              </div>
            </div>
          }
        </div>
      </form>
    </div>
  );
}
