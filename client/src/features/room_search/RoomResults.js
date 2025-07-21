import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useForm } from 'react-hook-form';

import RoomCell from "./components/RoomCell";
import PageChangeButtons from "../../components/PageChangeButtons";

import { useRoom } from "./context/RoomContext";

import './assets/css/room_results.min.css';

import filterIcon from './assets/img/icons/filter.svg';

export default function RoomResults() {
  const { getSearchQuery, getSearchResults, freshSearch, setFreshSearch } = useRoom();
  const [availableRooms, setAvailableRooms] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const searchResults = getSearchResults();
    if (!searchResults) {
      return
    }

    setAvailableRooms(searchResults);

    if (freshSearch === false) {
      return;
    }
    setFreshSearch(false);
    navigate('#room-results');
  }, [getSearchResults]);

  const filterRef = useRef(null);

  const [resultsPage, setResultsPage] = useState(1);
  const cellsPerPage = 10;
  const maxResultsPages = availableRooms ? Math.ceil(Object.keys(availableRooms).length / cellsPerPage) : 0;

  const location = useLocation();
  const roomResultsRef = useRef(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash == "#room-results") {
      roomResultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="room-results container-lg px-lg-5 mt-5" ref={roomResultsRef}>
      {availableRooms &&
        <>
          <div className="d-lg-none row justify-content-end px-4 px-lg-0 mb-4">
            <button className="room-results__filters-button col-auto d-flex align-items-center" onClick={() => {
              filterRef.current.classList.toggle("active");
            }}>
              <img src={filterIcon} alt="" />

              <p className="mb-0 ps-2">
                Φίλτρα
              </p>
            </button>
          </div>

          <div className="row mb-lg-5 px-2 px-lg-0">
            <h2 className="room-results__title mb-0">
              Αποτελέσματα αναζήτησης για: Αθήνα, Ελλάδα
            </h2>
          </div>

          {availableRooms.length !== 0 &&
            <PageChangeButtons className="mt-3 mt-lg-0" currentPage={resultsPage} setCurrentPage={setResultsPage} maxPages={maxResultsPages} />
          }

          <div className="d-flex mt-lg-4">
            <FilterForm filterRef={filterRef} />

            {availableRooms.length !== 0 &&
              <div className="col-12 col-lg-9">
                {Object.keys(availableRooms).map((keyName, index) => {
                  if (index >= cellsPerPage * resultsPage || index < cellsPerPage * (resultsPage - 1)) {
                    return;
                  }
                  const room = availableRooms[keyName];

                  const search = getSearchQuery();
                  const searchAccommodates = search ? search.accommodates : null;

                  const price = room.price + room.extraPersonPrice * (searchAccommodates - 1);
                  return <RoomCell room={room} key={index} roomPrice={price} view="client" />
                })}
              </div>

              ||

              <div className="col-12 col-lg-9 text-center mt-4">
                <p className="mb-0">
                  Δεν βρέθηκαν δωμάτια με τα κριτήρια αναζήτησης.
                </p>
              </div>
            }

          </div>

          {availableRooms.length !== 0 &&
            <PageChangeButtons className="my-4" currentPage={resultsPage} setCurrentPage={setResultsPage} maxPages={maxResultsPages} />
          }
        </>
      }
    </div>
  )
}

function FilterForm({ filterRef }) {
  const { register,
    handleSubmit,
    setValue,
    reset
  } = useForm();

  const { getSearchQuery, setSearchQuery } = useRoom();

  useEffect(() => {
    const filterSearch = JSON.parse(localStorage.getItem('filterSearch'));
    if (!filterSearch) {
      return;
    }

    const { room_type, price, amenities } = filterSearch;

    setValue('room_type', room_type);
    setValue('room_price', price);
    setValue('room_services', amenities);
  }, []);

  function onSubmit(data) {
    let baseSearch = JSON.parse(localStorage.getItem('baseSearch'));
    if (!baseSearch) {
      baseSearch = getSearchQuery();
    }

    const filterSearch = {
      room_type: data.room_type,
      price: data.room_price,
      amenities: data.room_services
    };
    localStorage.setItem('filterSearch', JSON.stringify(filterSearch));

    const newSearch = {
      ...baseSearch,
      ...filterSearch
    };

    setSearchQuery(newSearch);

    filterRef.current.classList.remove("active");
  }

  function handleFormClear() {
    reset();

    localStorage.removeItem('filterSearch');

    const baseSearch = JSON.parse(localStorage.getItem('baseSearch'));
    if (!baseSearch) {
      return;
    }

    setSearchQuery(baseSearch);

    filterRef.current.classList.remove("active"); // For mobile view
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="room-results__filters-column me-lg-4 px-4 pe-lg-3 ps-lg-0" ref={filterRef}>
      <h4 className="room-results__filters-title mt-2">Φίλτρα</h4>

      <div className="filters__room-type mt-4">
        <h5 className="filters__inner-title">
          Τύπος δωματίου
        </h5>

        <div className="ps-2">
          <div className="form-check">
            <input
              {...register("room_type")}
              className="form-check-input"
              type="radio"
              value="Private room"
              id="room-type__hotel" />
            <label className="form-check-label" htmlFor="room-type__hotel">
              Ιδιωτικό δωμάτιο
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_type")}
              className="form-check-input"
              type="radio"
              value="Shared room"
              id="room-type__hostel" />
            <label className="form-check-label" htmlFor="room-type__hostel">
              Κοινόχρηστο δωμάτιο
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_type")}
              className="form-check-input"
              type="radio"
              value="Entire home/apt"
              id="room-type__house" />
            <label className="form-check-label" htmlFor="room-type__house">
              Κατοικία
            </label>
          </div>
        </div>
      </div>

      <div className="filters__max-cost mt-4">
        <h5 className="filters__inner-title">
          Μέγιστο κόστος (άνα βράδυ)
        </h5>

        <div className="ps-2 d-flex">
          <input
            {...register("room_price", {
              valueAsNumber: true,
              min: 0,
              max: 999
            })}
            type="number"
            className="no-spinners" />
        </div>
      </div>

      <div className="filters__room-services mt-4">
        <h5 className="filters__inner-title">
          Παροχές δωματίου
        </h5>

        <div className="ps-2">
          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Wireless Internet"
              id="room-services__wifi" />
            <label className="form-check-label" htmlFor="room-services__wifi">
              Ασύρματο Internet
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Cooler"
              id="room-services__cooling" />
            <label className="form-check-label" htmlFor="room-services__cooling">
              Ψύξη
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Heating"
              id="room-services__heating" />
            <label className="form-check-label" htmlFor="room-services__heating">
              Θέρμανση
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Parking"
              id="room-services__parking" />
            <label className="form-check-label" htmlFor="room-services__parking">
              Χώρος στάθμευσης
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Kitchen"
              id="room-services__kitchen" />
            <label className="form-check-label" htmlFor="room-services__kitchen">
              Κουζίνα
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Breakfast"
              id="room-services__breakfast" />
            <label className="form-check-label" htmlFor="room-services__breakfast">
              Πρωϊνό
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="TV"
              id="room-services__tv" />
            <label className="form-check-label" htmlFor="room-services__tv">
              Τηλεόραση
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Elevator"
              id="room-services__elevator" />
            <label className="form-check-label" htmlFor="room-services__elevator">
              Ανελκυστήρας
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Doorman"
              id="room-services__doorman" />
            <label className="form-check-label" htmlFor="room-services__doorman">
              Θυρωρός
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Shampoos"
              id="room-services__shampoos" />
            <label className="form-check-label" htmlFor="room-services__shampoos">
              Σαμπουάν
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Sea View"
              id="room-services__sea-view" />
            <label className="form-check-label" htmlFor="room-services__sea-view">
              Θέα θάλασσας
            </label>
          </div>

          <div className="form-check">
            <input
              {...register("room_services")}
              className="form-check-input"
              type="checkbox"
              value="Jacuzzi"
              id="room-services__jacuzzi" />
            <label className="form-check-label" htmlFor="room-services__jacuzzi">
              Jacuzzi
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-evenly">
        <button type="submit" className="filters__save-button mt-4">
          <p className="mb-0">
            Αποθήκευση
          </p>
        </button>

        <button type="button" className="filters__reset-button mt-4" onClick={handleFormClear}>
          <p className="mb-0">
            Εκκαθάριση
          </p>
        </button>
      </div>
    </form>
  );
}