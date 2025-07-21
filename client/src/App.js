import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Navigation from './features/navigation/Navigation';
import Home from './pages/Home';
import Room from './pages/Room';
import Admin from './pages/Admin';
import User from './pages/User';
import Profile from './pages/Profile';
import Host from './pages/Host';
import AddRoom from './pages/AddRoom';
import EditRoom from './pages/EditRoom';
import Bookings from './pages/Bookings';
import Message from './pages/Message';
import RoomInbox from './pages/RoomInbox';

import { UserAuthProvider } from './features/user_auth/context/UserContext';
import { RoomProvider } from './features/room_search/context/RoomContext';
import { MessagesProvider } from './features/messages/context/MessagesContext';

import './assets/css/app.min.css';

export default function App() {
  return (
    <>
      <Router>
        <UserAuthProvider>
          <RoomProvider>
            <MessagesProvider>
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<User />} />
                <Route path="/rooms/:roomId" element={<Room view="client" />} />
                <Route path="/host" element={<Host />} />
                <Route path="/host/add_room" element={<AddRoom />} />
                <Route path="/host/edit_room/:roomId" element={<EditRoom />} />
                <Route path="/host/rooms/:roomId" element={<Room view="host" />} />
                <Route path="/host/room/inbox/:roomId" element={<RoomInbox />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/user/bookings/rooms/:roomId" element={<Room view="booking" />} />
                <Route path="/room/message/:roomId" element={<Message />} />
              </Routes>
            </MessagesProvider>
          </RoomProvider>
        </UserAuthProvider>
      </Router>
    </>
  );
}
