import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useRoom } from './context/RoomContext';

import './assets/css/room_search.min.css';

export default function RoomSearch() {
  const { getSearchQuery, setSearchQuery, setFreshSearch } = useRoom();

  const { register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  const navigate = useNavigate();

  useEffect(() => {
    const previousSearch = getSearchQuery();
    if (!previousSearch) {
      return;
    }

    const { location, checkInDate, checkOutDate, accommodates } = previousSearch;

    setValue('location', location);
    setValue('checkInDate', checkInDate);
    setValue('checkOutDate', checkOutDate);
    setValue('accommodates', accommodates);
  }, []);

  function onSubmit(data) {
    setFreshSearch(true);

    let extraSearchItems = {};
    const filterSearch = JSON.parse(localStorage.getItem('filterSearch'));
    if (filterSearch) {
      extraSearchItems = filterSearch;
    }

    const baseSearch = {
      location: data.location,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      accommodates: parseInt(data.accommodates),
    }

    localStorage.setItem('baseSearch', JSON.stringify(baseSearch));

    const search = { ...baseSearch, ...extraSearchItems };

    setSearchQuery(search);
  }

  return (
    <div className="room-search">
      <form onSubmit={handleSubmit(onSubmit)} className="room-search-form mt-4 needs-validation" noValidate>
        <div className="row gx-3 justify-content-center">
          <div className="col-12 col-lg-4 row gx-2 gx-lg-3">
            <div className="col-6">
              <div className="form-floating">
                <input
                  {...register("checkInDate", {
                    required: "Το πεδίο είναι απαιτούμενο."
                  })}
                  className="room-search-form__date form-control" id="room-search-form__date-from"
                  type="date"
                  placeholder="" />
                <label htmlFor="room-search-form__date-from" className="form-label">Από:</label>
              </div>
            </div>

            <div className="col-6">
              <div className="form-floating">
                <input
                  {...register("checkOutDate", {
                    required: "Το πεδίο είναι απαιτούμενο."
                  })}
                  className="room-search-form__date form-control" id="room-search-form__date-to"
                  type="date"
                  placeholder="" />
                <label htmlFor="room-search-form__date-to" className="form-label">Μέχρι:</label>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8 row gx-2 gx-lg-3 mt-3 mt-lg-0">
            <div className="col-9 col-lg-5">
              <input
                {...register("location", {
                  required: "Το πεδίο είναι απαιτούμενο."
                })}
                className="form-control"
                type="text"
                placeholder="Τοποθεσία" />
            </div>

            <div className="col-3 col-lg-2">
              <select
                {...register("accommodates", {
                  required: "Το πεδίο είναι απαιτούμενο."
                })}
                className="form-select">
                <option value="1" defaultValue>1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>

            <div className="col-12 col-lg-5 mt-4 pt-2 mt-lg-0 pt-lg-0" >
              <div className="submit-button__wrapper" >
                <button className="room-search-form__submit-button w-100">
                  <p className="mb-0" >
                    Εύρεση
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(errors).length !== 0 &&

          <div className="row justify-content-center mt-4">
            <div className="col-auto error-message-wrapper">
              <p className="error-message mb-0">
                Παρακαλώ συμπληρώστε όλα τα πεδία.
              </p>
            </div>
          </div>
        }
      </form>
    </div>
  );
}