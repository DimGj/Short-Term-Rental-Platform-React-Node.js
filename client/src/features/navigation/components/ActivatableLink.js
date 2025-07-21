import React from 'react';
import { Link } from 'react-router-dom';

export default function ActivatableLink({ to, className, currentLocation, children }) {
  return (
    <Link to={to} className={className + (currentLocation == to ? " active" : "")}>
      {children}
    </Link>
  );
}
