import React, { useState, useEffect } from 'react';

import { useUserAuth } from '../features/user_auth/context/UserContext';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(null);

  const { isLoggedIn, getLoggedUserInfo } = useUserAuth();

  useEffect(() => {
    if (!isLoggedIn()) {
      setIsAdmin(false);
      return;
    }

    const loggedUserInfo = getLoggedUserInfo();
    if (!loggedUserInfo) {
      return;
    }

    if (loggedUserInfo.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

  }, [getLoggedUserInfo, isLoggedIn]);

  return isAdmin;
}