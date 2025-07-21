import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function useServer() {
  // const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = "http://localhost:3001/";

  function resetError() {
    setError(null);
  }

  async function postReq(url, body, headers) {
    return await axios.post(url, body, {
      headers: headers
    }).then((response) => {
      if (response.data.error) {  // TODO: remove
        setError(response.data);
        return null;
      }
      return response.data;
    }).catch((error) => {
      // Error
      setError(error.response.data);
      return null;
    });
  }

  async function getReq(url, headers) {
    return await axios.get(url, {
      headers: headers
    }).then((response) => {
      if (response.data.error) {  // TODO: remove
        setError(response.data);
        return null;
      }
      return response.data;
    }).catch((error) => {
      // Error
      console.log(error);
      setError(error.response.data);
      return null;
    });
  }

  async function putReq(url, body, headers) {
    return await axios.put(url, body, {
      headers: headers
    }).then((response) => {
      if (response.data.error) {  // TODO: remove
        setError(response.data);
        return null;
      }
      return response.data;
    }).catch((error) => {
      // Error
      setError(error.response.data);
      return null;
    });
  }

  async function deleteReq(url, headers) {
    return await axios.delete(url, {
      headers: headers
    }).then((response) => {
      if (response.data.error) {  // TODO: remove
        setError(response.data);
        return null;
      }
      return response.data;
    }).catch((error) => {
      // Error
      setError(error.response.data);
      return null;
    });
  }


  async function serverRequest(api, method, action, body, headers = null, callback = null) {
    setIsLoading(true);

    const url = baseUrl + api + '/' + action;

    let result = null;
    switch (method) {
      case 'POST':
        result = await postReq(url, body, headers);
        break;
      case 'GET':
        result = await getReq(url, headers);
        break;
      case 'PUT':
        result = await putReq(url, body, headers);
        break;
      case 'DELETE':
        result = await deleteReq(url, headers);
        break;
    }

    callback && callback();

    setIsLoading(false);

    return result;
  };

  return [error, resetError, isLoading, serverRequest];
}
