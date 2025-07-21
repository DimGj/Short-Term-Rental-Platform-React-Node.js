import React from 'react';

import useServer from '../hooks/useServer';
import { useUserAuth } from '../features/user_auth/context/UserContext';

function OBJtoXML(obj) {
  var xml = '';
  for (var prop in obj) {
    xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
    if (obj[prop] instanceof Array) {
      for (var array in obj[prop]) {
        xml += "<" + prop + ">";
        xml += OBJtoXML(new Object(obj[prop][array]));
        xml += "</" + prop + ">";
      }
    } else if (typeof obj[prop] == "object") {
      xml += OBJtoXML(new Object(obj[prop]));
    } else {
      xml += obj[prop];
    }
    xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
  }
  var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
  return xml
}

export default function useExportData() {
  const [error, resetError, isLoading, serverRequest] = useServer();
  const { getAccessToken, getHeaders, refreshAccessToken } = useUserAuth();

  function exportData(mode) {
    async function fetchData() {
      const accessToken = getAccessToken();
      const headers = getHeaders(accessToken);

      const exportedData = { rooms: [] }

      const roomData = await serverRequest('room', 'GET', '', null, headers, refreshAccessToken);

      for (let i = 0; i < roomData.length; i++) {
        const room = roomData[i];
        const roomId = room.id;
        const roomHostId = room.userId;

        const roomHostData = await serverRequest(`user/${roomHostId}`, 'GET', '', null, headers, refreshAccessToken);

        const roomBookings = await serverRequest(`booking/roomId/${roomId}`, 'GET', '', null, headers, refreshAccessToken);
        const roomBookingsExport = [];

        for (let j = 0; j < roomBookings.length; j++) {
          const booking = roomBookings[j];
          const clientId = booking.userId;

          const clientData = await serverRequest(`user/${clientId}`, 'GET', '', null, headers, refreshAccessToken);

          roomBookingsExport.push({ bookingInfo: { ...booking }, clientInfo: { ...clientData } });
        }

        const roomRatings = await serverRequest(`rating/roomId/${roomId}`, 'GET', '', null, headers, refreshAccessToken);
        const roomRatingsExport = [];

        for (let j = 0; j < roomRatings.length; j++) {
          const rating = roomRatings[j];
          const clientId = rating.userId;

          const clientData = await serverRequest(`user/${clientId}`, 'GET', '', null, headers, refreshAccessToken);

          roomRatingsExport.push({ ratingInfo: { ...rating }, reviewerInfo: { ...clientData } });
        }

        exportedData.rooms.push({ roomInfo: { ...room }, roomHost: { ...roomHostData }, roomBookings: { ...roomBookingsExport }, roomRatings: { ...roomRatingsExport } });
      }
      return exportedData;
    }

    function downloadData(data, mode) {
      const element = document.createElement("a");

      if (mode === 'json') {
        var file = new Blob([JSON.stringify(data, null, 4)], { type: 'text/plain' });
        element.download = "export.json";
      } else if (mode === 'xml') {
        const xml = OBJtoXML(data);
        var file = new Blob([xml], { type: 'text/plain' });
        element.download = "export.xml";
      } else {
        return;
      }

      element.href = URL.createObjectURL(file);
      document.body.appendChild(element);
      element.click();
    }

    fetchData().then((data) => {
      downloadData(data, mode);
    });
  }

  return { exportData, isLoading };
}
