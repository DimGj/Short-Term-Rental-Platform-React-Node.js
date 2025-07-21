import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useMessages } from '../features/messages/context/MessagesContext';
import { useRoom } from '../features/room_search/context/RoomContext';
import { useUserAuth } from '../features/user_auth/context/UserContext';
import useHost from '../hooks/useHost';

import MessageForm from '../features/messages/components/MessageForm';
import MessageHistory from '../features/messages/components/MessageHistory';

import '../assets/css/message.min.css'

export default function Message() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  const [clientId, setClientId] = useState(null);

  const { getChatHistoryByRoom, getChatHistoryByChatId, createNewChat, sendNewClientMessage, sendNewHostMessage } = useMessages();
  const { getRoomInfo } = useRoom();
  const { isLoggedIn, getLoggedUserId } = useUserAuth();

  const [roomName, setRoomName] = useState("");
  const [history, setHistory] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(true);

  const navigate = useNavigate();
  const isHost = useHost();

  useEffect(() => {
    if (!isLoggedIn() || !roomId) {
      navigate('/');
      return;
    }

    getRoomInfo(roomId).then((data) => {
      setRoomName(data[0].name);
    });
  }, []);

  useEffect(() => {
    if (isNewMessage === false) {
      return;
    }

    if (isHost == null) {
      return;
    }

    if (isHost === true) {
      getChatHistoryByChatId(chatId).then((data) => {
        if (!data) { // No history
          return;
        }

        setHistory(data);
      });
    } else if (isHost === false) {
      getChatHistoryByRoom(roomId, getLoggedUserId()).then((data) => {
        if (!data) { // No history
          return;
        }

        setHistory(data);
      });
    }
    setIsNewMessage(false);
  }, [isNewMessage, isHost]);

  async function handleMessageSend(message) {
    if (history.length === 0) {
      // First chat message

      await createNewChat(roomId, message);
    } else if (isHost === true) {
      await sendNewHostMessage(chatId, message);
    } else {
      await sendNewClientMessage(roomId, message);
    }

    setIsNewMessage(true);
  }

  return (
    <>
      <Helmet>
        <title>Συνομιλία</title>
      </Helmet>

      <div className="message my-5">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-auto">
              <h1 className="message-title mb-0">
                {roomName} - Συνομιλία
              </h1>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col px-0 message-row">
              <MessageHistory history={history} />
              <MessageForm sendMessage={handleMessageSend} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
