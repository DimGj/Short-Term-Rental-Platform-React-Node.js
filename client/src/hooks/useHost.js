import React, { useState, useEffect } from 'react';

import { useUserAuth } from '../features/user_auth/context/UserContext';

export default function useHost() {
  const [isHost, setIsHost] = useState(null);

  const { isLoggedIn, getLoggedUserInfo } = useUserAuth();

  useEffect(() => {
    if (!isLoggedIn()) {
      setIsHost(false);
      return;
    }

    const loggedUserInfo = getLoggedUserInfo();
    if (!loggedUserInfo) {
      return;
    }

    if (loggedUserInfo.role === "host" && loggedUserInfo.status === "accepted") {
      setIsHost(true);
    } else {
      setIsHost(false);
    }

  }, [getLoggedUserInfo, isLoggedIn]);

  return isHost;
}