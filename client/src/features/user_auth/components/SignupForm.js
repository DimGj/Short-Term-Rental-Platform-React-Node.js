import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import useServer from '../../../hooks/useServer.js';

import '../assets/css/signup_form.min.css';

export default function SignupForm({ signUserUp }) {
  const { register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm();

  const [errorMessage, setErrorMessage] = useState(null);
  const [error, resetError, isLoading, serverRequest] = useServer();

  useEffect(() => { // TODO: add messages
    if (!error) {
      return;
    }

    if (error.error && error.msg) {
      setErrorMessage(error.msg);
    } else {
      // Unidentified error
      console.log(error);
      setErrorMessage("Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε.");
    }

    resetError();
  }, [error]);

  const [avatar, setAvatar] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAvatar(reader.result.split(',')[1]); // Set the Base64-encoded image string
      };
    }
  }

  function onSubmit(data) {
    const body = {
      username: data.username,
      password: data.password,
      firstname: data.firstname,
      lastname: data.surname,
      email: data.email,
      telephone: data.telephone,
      avatar: avatar,
      role: data.role
    };

    serverRequest('user', 'POST', 'registration', body).then((data) => {
      if (!data) {
        return;
      }

      reset();
      signUserUp(data.token);
    });
  }

  return (
    <div className="signup-form user-auth-form px-sm-3">
      <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
        <div className="container-fluid py-5 px-3 px-sm-4">
          <div className="row gx-2">
            <div className="col-12">
              <div className="form-floating">
                <input
                  {...register("username", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                    minLength: {
                      value: 8,
                      message: "Το όνομα χρήστη πρέπει να είναι μεγαλύτερο από 8 χαρακτήρες."
                    },
                    maxLength: {
                      value: 20,
                      message: "Το όνομα χρήστη πρέπει να είναι μικρότερο από 20 χαρακτήρες."
                    }
                  })}
                  id="signup-form__username"
                  className="form-control"
                  type="text"
                  placeholder="Username" />
                <label htmlFor="signup-form__username" className="form-label">Όνομα χρήστη</label>
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
                    required: "Το πεδίο είναι απαιτούμενο.",
                    minLength: {
                      value: 8,
                      message: "Ο κωδικός πρέπει να είναι μεγαλύτερος από 8 χαρακτήρες."
                    },
                    maxLength: {
                      value: 20,
                      message: "Ο κωδικός πρέπει να είναι μικρότερος από 16 χαρακτήρες."
                    },
                    pattern: {
                      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\-]).{8,16}/,
                      message: "Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα: μικρό γράμμα, κεφαλαίο γράμμα, αριθμό, σύμβολο (!@#$%^&*_=+-)."
                    }
                  })}
                  className="form-control"
                  id="signup-form__password"
                  type="password"
                  placeholder="Password" />
                <label htmlFor="signup-form__password" className="form-label">Κωδικός</label>
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
              <div className="form-floating">
                <input
                  {...register("passwordConf", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                    validate: (value) =>
                      value === getValues('password') || "Οι κωδικοί δεν ταιριάζουν.",
                  })}
                  className="form-control"
                  id="signup-form__password-conf"
                  type="password"
                  placeholder="Password" />
                <label htmlFor="signup-form__password-conf" className="form-label">Επιβεβαίωση κωδικού</label>
              </div>
            </div>

            {errors.passwordConf &&
              <div className="col-12 mt-2">
                <p className="error-message mb-0">
                  {errors.passwordConf.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3 gx-2">
            <div className="col-6">
              <div className="form-floating">
                <input
                  {...register("firstname", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                    pattern: {
                      value: /^[A-Za-z]+/,
                      message: "Το όνομα μπορεί να περιέχει μόνο αλφαβητικούς χαρακτήρες."
                    }
                  })}
                  className="form-control"
                  id="signup-form__first-name"
                  type="text"
                  placeholder="First name"
                  pattern="^[A-Za-z]+" />
                <label htmlFor="signup-form__first-name" className="form-label">Όνομα</label>
              </div>
            </div>

            <div className="col-6">
              <div className="form-floating">
                <input
                  {...register("surname", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                    pattern: {
                      value: /^[A-Za-z]+/,
                      message: "Το όνομα μπορεί να περιέχει μόνο αλφαβητικούς χαρακτήρες."
                    }
                  })}
                  className="form-control"
                  id="signup-form__surname"
                  type="text"
                  placeholder="Surname" />
                <label htmlFor="signup-form__surname" className="form-label">Επώνυμο</label>
              </div>
            </div>

            {errors.firstname &&
              <div className="col-6 mt-2">
                <p className="error-message mb-0">
                  {errors.firstname.message}
                </p>
              </div>
            }

            {errors.surname &&
              <div className="col-6 mt-2 ms-auto">
                <p className="error-message mb-0">
                  {errors.surname.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  {...register("email", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                    pattern: {
                      value: /[^@\s]+@[^@\s]+\.[^@\s]+[^@\s]/,
                      message: "Μη έγκυρο email."
                    }
                  })}
                  className="form-control"
                  id="signup-form__email"
                  type="email"
                  placeholder="E-mail" />
                <label htmlFor="signup-form__email" className="form-label">E-mail</label>
              </div>
            </div>

            {errors.email &&
              <div className="col-12 mt-2">
                <p className="error-message mb-0">
                  {errors.email.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3 gx-2">
            <div className="col-7">
              <select
                {...register("role", {
                  required: "Το πεδίο είναι απαιτούμενο.",
                })}
                className="form-select"
                id="signup-form__role">
                <option value="client" defaultValue>Ενοικιαστής</option>
                <option value="host">Οικοδεσπότης</option>
              </select>
            </div>

            <div className="col-5">
              <div className="form-floating">
                <input
                  {...register("telephone", {
                    required: "Το πεδίο είναι απαιτούμενο.",
                  })}
                  className="form-control"
                  id="signup-form__phone"
                  type="tel"
                  placeholder="Phone number" />
                <label htmlFor="signup-form__phone" className="form-label">Τηλέφωνο</label>
              </div>
            </div>
          </div>

          {errors.telephone &&
            <div className="col-5 mt-2 ms-auto">
              <p className="error-message mb-0">
                {errors.telephone.message}
              </p>
            </div>
          }

          <div className="row mt-3">
            <div className="col-12">
              <label htmlFor="signup_form__photo">Εισαγωγή φωτογραφίας</label>
              <input
                {...register("avatar", {
                  required: "Το πεδίο είναι απαιτούμενο.",
                })}
                type="file"
                accept="image/*"
                className="form-control-file"
                id="signup_form__photo"
                onChange={handleFileChange}
              />
              {/* TODO: Add as required */}
            </div>

            {errors.avatar &&
              <div className="col-12 mt-2 ms-auto">
                <p className="error-message mb-0">
                  {errors.avatar.message}
                </p>
              </div>
            }
          </div>

          <div className="row mt-3" >
            <div className="col-12">
              <button type="submit" className="signup-form__submit-button w-100" disabled={isLoading}>
                <p className="mb-0">{isLoading ? "Φόρτωση..." : "Δημιουργία λογαριασμού"}</p>
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
