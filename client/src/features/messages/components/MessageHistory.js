import React from 'react';

import { useUserAuth } from '../../user_auth/context/UserContext';
import useHost from '../../../hooks/useHost';

import '../assets/css/message_history.min.css';

export default function MessageHistory({ history }) {
  const { getLoggedUserId, getUserInfo, getAccessToken } = useUserAuth();
  const userId = getLoggedUserId();
  const accessToken = getAccessToken();

  const isHost = useHost();

  return (
    <div className="message-history">
      <div className="container-fluid">
        <div className="row mx-0">
          <div className="message-history-wrapper col-12 px-3 px-sm-4 pb-3 pt-4 mb-1">
            {history.length !== 0 ?
              history.map((message, index) => {
                const date = new Date(message.createdAt).getDay() + '/' + new Date(message.createdAt).getMonth() + '/' + new Date(message.createdAt).getFullYear() + ' ' + new Date(message.createdAt).getHours() + ':' + new Date(message.createdAt).getMinutes();

                const isUserMessage = message.userId === parseInt(userId);
                const otherUser = isHost ? "Ενοικιαστής" : "Οικοδεσπότης";

                return (
                  <div key={index} className="message-history__message-wrapper py-2">
                    <div className="message-history__message">
                      <div className={"message-history__message-text" + (isUserMessage ? " text-end" : "")}>
                        {message.text}
                      </div>

                      <div className={"message-history__message-date" + (isUserMessage ? " text-end" : "")}>
                        {date} - {isUserMessage ? "Εσείς" : otherUser}
                      </div>
                    </div>
                  </div>
                )
              })
              :
              <p className="mb-0 text-center">
                Δεν υπάρχουν μηνύματα
              </p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
