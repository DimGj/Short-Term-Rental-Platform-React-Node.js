import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function AddEditRoomForm({ onSubmit, register, errors, setError, isLoading, isAdd, setInputThumbnail, inputPhotos, setInputPhotos }) {
  function handleFileChange(e, mode) {
    const fileArray = e.target.files;

    const photos = [];
    let fileSizeCount = 0;
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileSize = file.size; // In bytes

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (mode === "thumbnail") {
          if (fileSize > 1000000) {
            e.target.value = "";
            setError("thumbnail", { type: "custom", message: "Μέγιστο μέγεθος αρχείου 1MB" });
            return;
          }
          setInputThumbnail(reader.result.split(',')[1]); // Set the Base64-encoded image string
          return;
        } else if (mode === "photos") {
          if (fileSize > 1000000) {
            e.target.value = "";
            setError("photos", { type: "custom", message: "Μέγιστο μέγεθος κάθε αρχείου 1MB" });
            return;
          }

          fileSizeCount += fileSize;
          if (fileSizeCount > 5000000) {
            e.target.value = "";
            setError("photos", { type: "custom", message: "Μέγιστο συνολικό μέγεθος αρχείων 5MB" });
            return;
          }

          photos.push(reader.result.split(',')[1]);
        }
      };
    }

    setInputPhotos(photos);
  }

  return (
    <div className="add-room-form">
      <form onSubmit={onSubmit} className="needs-validation" noValidate>
        <Section title="Βασικά στοιχεία">
          <div className="col-12 col-lg-6 form-floating">
            <input {...register("name", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Όνομα καταλύματος</label>

            {errors.name &&
              <p className="error-message mb-0 mt-2">
                {errors.name.message}
              </p>
            }
          </div>

          <div className="col-12 form-floating">
            <input {...register("description", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" id="add-room-form__description" type="text" placeholder="placeholder" required />
            <label htmlFor="add-room-form__description" className="add-room-form__label form-label">Περιγραφή</label>

            {errors.description &&
              <p className="error-message mb-0 mt-2">
                {errors.description.message}
              </p>
            }
          </div>
        </Section>

        <Section title="Τοποθεσία" classList="mt-3">
          <div className="col-12 col-lg-6 form-floating">
            <input {...register("street", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Οδός</label>

            {errors.street &&
              <p className="error-message mb-0 mt-2">
                {errors.street.message}
              </p>
            }
          </div>

          <div className="col-6 col-lg-3 form-floating">
            <input {...register("number", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Αριθμός</label>

            {errors.number &&
              <p className="error-message mb-0 mt-2">
                {errors.number.message}
              </p>
            }
          </div>

          <div className="col-6 col-lg-3 form-floating">
            <input {...register("zipcode", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Τ.Κ.</label>

            {errors.zipcode &&
              <p className="error-message mb-0 mt-2">
                {errors.zipcode.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("city", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Πόλη</label>

            {errors.city &&
              <p className="error-message mb-0 mt-2">
                {errors.city.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("neighborhood", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Περιοχή</label>

            {errors.neighborhood &&
              <p className="error-message mb-0 mt-2">
                {errors.neighborhood.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("state", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Νομός</label>

            {errors.state &&
              <p className="error-message mb-0 mt-2">
                {errors.state.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("country", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Χώρα</label>

            {errors.country &&
              <p className="error-message mb-0 mt-2">
                {errors.country.message}
              </p>
            }
          </div>

          <div className="col-12 form-floating">
            <input {...register("neighborhood_description", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Περιγραφή γειτονιάς</label>

            {errors.neighborhood_description &&
              <p className="error-message mb-0 mt-2">
                {errors.neighborhood_description.message}
              </p>
            }
          </div>

          <p className="mb-0">
            Συγκοινωνίες:
          </p>

          <div className="col-12 form-floating">
            <input {...register("transition", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-control add-room-form__input" id="add-room-form__transport" type="text" placeholder="placeholder" required />
            <label htmlFor="add-room-form__transport" className="add-room-form__label form-label">Περιγραφή πρόσβασης</label>

            {errors.transition &&
              <p className="error-message mb-0 mt-2">
                {errors.transition.message}
              </p>
            }
          </div>
        </Section>

        <Section title="Κοστολόγηση" classList="mt-3">
          <div className="col-6 form-floating">
            <input
              {...register("startingRentingDate", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })}
              className="add-room-form__input form-control" id="add-room-form__starting-date"
              type="date"
              placeholder="" />
            <label htmlFor="add-room-form__starting-date" className="form-label">Διατείθεται από:</label>

            {errors.startingRentingDate &&
              <p className="error-message mb-0 mt-2">
                {errors.startingRentingDate.message}
              </p>
            }
          </div>

          <div className="col-6 form-floating">
            <input
              {...register("endingRentingDate", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })}
              className="add-room-form__input form-control" id="add-room-form__ending-date"
              type="date"
              placeholder="" />
            <label htmlFor="add-room-form__ending-date" className="form-label">Διατείθεται έως:</label>

            {errors.endingRentingDate &&
              <p className="error-message mb-0 mt-2">
                {errors.endingRentingDate.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("price", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Ελάχιστη τιμή</label>

            {errors.price &&
              <p className="error-message mb-0 mt-2">
                {errors.price.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("extraPersonPrice", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 0,
                message: "Ο αριθμός πρέπει να είναι θετικός."
              }
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Επιπλέον κόστος ανά άτομο</label>

            {errors.extraPersonPrice &&
              <p className="error-message mb-0 mt-2">
                {errors.extraPersonPrice.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input  {...register("accommodates", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Μέγιστος αριθμός ατόμων</label>

            {errors.accommodates &&
              <p className="error-message mb-0 mt-2">
                {errors.accommodates.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input  {...register("minimum_nights", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input no-spinners" type="number" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Ελάχιστος αριθμός ημερών</label>

            {errors.minimum_nights &&
              <p className="error-message mb-0 mt-2">
                {errors.minimum_nights.message}
              </p>
            }
          </div>
        </Section>

        <Section title="Χαρακτηριστικά χώρου" classList="mt-3">
          <div className="col-12 col-lg-6">
            <select {...register("room_type", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
            })} className="form-select py-3" aria-label="" id="add-room-form__room-type" defaultValue="" required>
              <option value="" disabled hidden>Τύπος χώρου</option>

              <option value="Private room">Ιδιωτικό δωμάτιο</option>
              <option value="Shared room">Κοινόχρηστο δωμάτιο</option>
              <option value="Entire home/apt">Κατοικία</option>
            </select>

            {errors.room_type &&
              <p className="error-message mb-0 mt-2">
                {errors.room_type.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("beds", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Αριθμός κρεβατιών</label>

            {errors.beds &&
              <p className="error-message mb-0 mt-2">
                {errors.beds.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("bathrooms", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Αριθμός μπάνιων</label>

            {errors.bathrooms &&
              <p className="error-message mb-0 mt-2">
                {errors.bathrooms.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("bedrooms", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 0,
                message: "Ο αριθμός πρέπει να είναι θετικός."
              }
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Αριθμός υπνοδωματίων</label>

            {errors.bedrooms &&
              <p className="error-message mb-0 mt-2">
                {errors.bedrooms.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 form-floating">
            <input {...register("surface", {
              required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false,
              min: {
                value: 1,
                message: "Ο αριθμός πρέπει να είναι μεγαλύτερος του 0."
              }
            })} className="form-control add-room-form__input" type="text" placeholder="placeholder" required />
            <label className="add-room-form__label form-label">Εμβαδόν χώρου</label>

            {errors.surface &&
              <p className="error-message mb-0 mt-2">
                {errors.surface.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input {...register("has_couch", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="true" type="radio" />
              <label className="form-check-label">
                Με καθιστικό
              </label>
            </div>

            <div className="col-auto form-check">
              <input {...register("has_couch", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="false" type="radio" defaultChecked={isAdd} />
              <label className="form-check-label">
                Χωρίς καθιστικό
              </label>
            </div>
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Wireless Internet" />
              <label>Wireless Internet</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Cooler" />
              <label>Ψύξη</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Heating" />
              <label>Θέρμανση</label>
            </div>


            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Parking" />
              <label>Parking</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Elevator" />
              <label>Ανελκυστήρας</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Sea View" />
              <label>Θέα θάλασσας</label>
            </div>
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Breakfast" />
              <label>Πρωϊνό</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Kitchen" />
              <label>Κουζίνα</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="TV" />
              <label>TV</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Doorman" />
              <label>Θυρωρός</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Shampoos" />
              <label>Σαμπουάν</label>
            </div>

            <div className="col-auto form-check">
              <input
                {...register("amenities")}
                className="form-check-input"
                type="checkbox"
                value="Jacuzzi" />
              <label>Jacuzzi</label>
            </div>
          </div>
        </Section>

        <Section title="Κανόνες" classList="mt-3">
          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input {...register("smoking_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="true" type="radio" id="add-room-form__smoking-rule" />
              <label className="form-check-label" htmlFor="add-room-form__smoking-rule">
                Επιτρέπεται το κάπνισμα
              </label>
            </div>

            <div className="col-auto form-check">
              <input {...register("smoking_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="false" type="radio" id="add-room-form__smoking-rule" defaultChecked={isAdd} />
              <label className="form-check-label" htmlFor="add-room-form__smoking-rule">
                Δεν επιτρέπεται το κάπνισμα
              </label>
            </div>
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input {...register("pets_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="true" type="radio" id="add-room-form__pet-rule" />
              <label className="form-check-label" htmlFor="add-room-form__pet-rule">
                Επιτρέπονται τα κατοικίδια
              </label>
            </div>

            <div className="col-auto form-check">
              <input {...register("pets_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="false" type="radio" id="add-room-form__pet-rule" defaultChecked={isAdd} />
              <label className="form-check-label" htmlFor="add-room-form__pet-rule">
                Δεν επιτρέπονται τα κατοικίδια
              </label>
            </div>
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <div className="col-auto form-check">
              <input {...register("events_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="true" type="radio" id="add-room-form__party-rule" />
              <label className="form-check-label" htmlFor="add-room-form__party-rule">
                Επιτρέπονται οι εκδηλώσεις
              </label>
            </div>

            <div className="col-auto form-check">
              <input {...register("events_allowed", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })} className="form-check-input" value="false" type="radio" id="add-room-form__party-rule" defaultChecked={isAdd} />
              <label className="form-check-label" htmlFor="add-room-form__party-rule">
                Δεν επιτρέπονται οι εκδηλώσεις
              </label>
            </div>
          </div>
        </Section>

        <Section title="Φωτογραφίες χώρου" classList="mt-3">
          <div className="col-12 col-lg-6 ps-2">
            <label htmlFor="add-room-form__main-photo">Κύρια φωτογραφία:</label>
            <input
              {...register("thumbnail", {
                required: isAdd ? "Το πεδίο είναι απαιτούμενο." : false
              })}
              className="form-control-file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e, "thumbnail")
              }} />
            {errors.thumbnail &&
              <p className="error-message mb-0 mt-2">
                {errors.thumbnail.message}
              </p>
            }
          </div>

          <div className="col-12 col-lg-6 ps-2">
            <label htmlFor="add-room-form__sec-photos">Δευτερεύον φωτογραφίες:</label>
            <input {...register("photos")}
              className="form-control-file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e, "photos")
              }}
              multiple="multiple" />
            {errors.photos &&
              <p className="error-message mb-0 mt-2">
                {errors.photos.message}
              </p>
            }
          </div>
        </Section>

        <div className="row justify-content-end align-items-center mt-5">
          <div className="col col-lg-auto pe-lg-4">
            <Link to="/host" className="add-room-form__cancel-button">
              <p className="mb-0 text-center">
                Ακύρωση
              </p>
            </Link>
          </div>

          <div className="col col-lg-auto">
            <button className="add-room-form__submit-button primary-button">
              {isLoading &&
                <p className="mb-0">
                  Φόρτωση...
                </p>
                ||
                <p className="mb-0">
                  Καταχώρηση δωματίου
                </p>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, classList, children }) {
  return (
    <div className={"add-room-form__section row align-items-center gx-2 gy-3 pb-4 " + (classList ? classList : "")}>
      <div className="col-12">
        <h2 className="h5 fw-normal mb-0">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}