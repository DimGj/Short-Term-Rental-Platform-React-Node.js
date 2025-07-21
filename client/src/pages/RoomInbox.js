import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import useHost from '../hooks/useHost';
import { useRoom } from '../features/room_search/context/RoomContext';
import { useUserAuth } from '../features/user_auth/context/UserContext';
import { useMessages } from '../features/messages/context/MessagesContext';

import '../assets/css/room_inbox.min.css'

export default function RoomInbox() {
  const { getRoomInfo } = useRoom();
  const { getLoggedUserId, getUserInfo, getAccessToken } = useUserAuth();
  const { getRoomChats, deleteChat } = useMessages();
  const { roomId } = useParams();
  const isHost = useHost();

  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (isHost === false) {
      navigate('/')
      return;
    }

    async function fetchData() {
      const roomInfo = await getRoomInfo(roomId).then(data => data[0]);

      if (roomInfo.userId != getLoggedUserId()) {
        navigate('/');
        return;
      }

      const roomChats = await getRoomChats(roomId);
      const chatArray = [];
      for (let i = 0; i < roomChats.length; i++) {
        const userInfo = await getUserInfo(getAccessToken(), roomChats[i].userId);
        const newChat = {
          ...roomChats[i],
          firstname: userInfo.firstname,
          lastname: userInfo.lastname,
          username: userInfo.username
        }

        chatArray.push(newChat);
      }
      setChats(chatArray);
    }

    fetchData();
  }, [isHost]);

  function handleChatDelete(chatId) {
    deleteChat(chatId).then((data) => {
      navigate(0);
    });
  }

  return (
    <>
      <Helmet>
        <title>Μηνύματα δωματίου</title>
      </Helmet>

      <div className="room-inbox mt-5">
        <div className="container-lg px-4">
          <div className="row justify-content-center mb-3">
            <div className="col-auto">
              <div className="h1 mb-0">
                Μηνύματα
              </div>
            </div>
          </div>
          {chats.length !== 0 ?

            chats.map((chat, index) => {
              const date = new Date(chat.createdAt);
              const chatDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear();
              return (
                <div key={index} className="row justify-content-center">
                  <div className="col-12 col-lg-auto room-inbox__chat d-lg-flex align-items-end py-3">
                    <div>
                      <h2 className="mb-0">
                        {chat.firstname} {chat.lastname}
                      </h2>

                      <p className="room-inbox__chat-date mb-0">
                        Πρώτο μήνυμα: {chatDate}
                      </p>

                      <p className="mb-0 pt-1">
                        Username: {chat.username}
                      </p>
                    </div>

                    <div className="col-auto d-flex justify-content-evenly mt-3 mt-lg-0 mb-1 ps-lg-5">
                      <button className="primary-button room-inbox__chat-view-button" onClick={() => {
                        navigate("/room/message/" + roomId + "?chatId=" + chat.id);
                      }}>
                        Προβολή
                      </button>

                      <button className="room-inbox__chat-delete-button ms-lg-4" onClick={() => {
                        handleChatDelete(chat.id)
                      }}>
                        Διαγραφή
                      </button>
                    </div>
                  </div>
                </div>

              );
            })

            :
            <div className="col-12">
              <p className="mb-0 text-center">
                Δεν υπάρχουν μηνύματα
              </p>
            </div>
          }
        </div>

      </div>
    </>
  )
}
