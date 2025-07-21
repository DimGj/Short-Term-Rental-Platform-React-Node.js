import React, { useEffect, useState } from 'react';

import PopupMessage from './PopupMessage';

import { useUserAuth } from '../features/user_auth/context/UserContext';

export default function ErrorHandler({ error, resetError }) {
  const [message, setMessage] = useState(null);

  const { userLogout } = useUserAuth();

  useEffect(() => {
    if (!error) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    console.log(error);

    if (error.error === '925') {  // No popup message for these errors
      resetError();
      return;
    }

    if (error.error === '901' || error.error === '900' || error.error === '911') {  // User auth errors
      setMessage(error.msg);

      userLogout();
    } else if (error.msg) { // Other errors
      setMessage(error.msg);
    } else {  // Default error message
      setMessage("Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε.")
    }

    resetError();
    // TODO: Add more error codes
  }, [error]);

  return (
    <PopupMessage message={message} setPopupMessage={setMessage} />
  );
}
