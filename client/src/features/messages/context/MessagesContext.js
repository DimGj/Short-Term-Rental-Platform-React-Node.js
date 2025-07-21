import React, { useState, createContext, useContext, useEffect } from 'react';

import { useUserAuth } from '../../user_auth/context/UserContext';
import useServer from '../../../hooks/useServer';

import ErrorHandler from '../../../components/ErrorHandler';

export const MessagesContext = createContext("");

export function useMessages() {
  return useContext(MessagesContext);
}

export function MessagesProvider({ children }) {
  const { getLoggedUserId, getAccessToken, getHeaders, refreshAccessToken } = useUserAuth();

  const [error, resetError, isLoading, serverRequest] = useServer();

  function getChatHistoryByRoom(roomId, userId) {
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);
    const body = {
      clientId: parseInt(userId),
      roomId: parseInt(roomId)
    }

    return serverRequest('message', 'POST', 'history/', body, headers, refreshAccessToken);
  }

  function getChatHistoryByChatId(chatId) {
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);
    const body = {
      chatId: parseInt(chatId)
    }

    return serverRequest('message', 'POST', 'history/', body, headers, refreshAccessToken);
  }

  function getRoomChats(roomId) {
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);

    return serverRequest('chat', 'GET', 'room/' + roomId, null, headers, refreshAccessToken);
  }

  function createNewChat(roomId, text) {
    const userId = getLoggedUserId();
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);
    const body = {
      roomId: parseInt(roomId),
      userId: parseInt(userId),
      text: text
    };

    return serverRequest('chat', 'POST', "", body, headers, refreshAccessToken);
  }

  function sendNewClientMessage(roomId, text) {
    const userId = getLoggedUserId();
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);
    const body = {
      roomId: parseInt(roomId),
      userId: parseInt(userId),
      text: text
    };

    return serverRequest('message', 'POST', "", body, headers, refreshAccessToken);
  }

  function sendNewHostMessage(chatId, text) {
    const userId = getLoggedUserId();
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);
    const body = {
      chatId: parseInt(chatId),
      userId: parseInt(userId),
      text: text
    };

    return serverRequest('message', 'POST', "", body, headers, refreshAccessToken);
  }

  function deleteChat(chatId) {
    const accessToken = getAccessToken();

    const headers = getHeaders(accessToken);

    return serverRequest('chat', 'DELETE', chatId, null, headers, refreshAccessToken);
  }

  return (
    <MessagesContext.Provider value={{ getChatHistoryByRoom, getChatHistoryByChatId, getRoomChats, createNewChat, sendNewClientMessage, sendNewHostMessage, deleteChat }}>
      <ErrorHandler error={error} resetError={resetError} />
      {children}
    </MessagesContext.Provider>
  )
}