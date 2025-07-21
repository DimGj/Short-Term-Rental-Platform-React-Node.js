import React from 'react';

import '../assets/css/blur-wrapper.min.css';

export default function BlurWrapper({ active }) {
  return (
    <>
      {
        active == true &&
        <div className="blur-wrapper"></div>
      }
    </>
  );
}
