import React, { useEffect, useState } from 'react';

import '../assets/css/popup_message.min.css';

export default function PopupMessage({ message, setPopupMessage }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    async function timer() {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setActive(false);
      setPopupMessage(null);
    }

    if (message) {
      setActive(true);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      timer();
    }
  }, [message])

  return (
    active &&
    <>
      <div className="popup-blur-wrapper"></div>

      <div className="popup-message d-flex justify-content-center align-items-center">

        <p className="mb-2 px-3 text-center">
          {message}
        </p>
      </div>
    </>
  )
}
