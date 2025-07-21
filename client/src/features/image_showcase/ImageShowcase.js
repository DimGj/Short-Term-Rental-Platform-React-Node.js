import React, { useState } from "react";

import "./assets/css/image_showcase.min.css";

import arrowIcon from "./assets/img/icons/arrow_white.png";

export default function ImageShowcase({ images }) {
  const [imageIndex, setImageIndex] = useState(0);

  const maxImageSelectorCount = images.length;

  return (
    <div className="image-showcase">
      <div className="image-showcase__image-wrapper">
        <img className="image-showcase__main-img" src={images[imageIndex]} />

        <button className="image-showcase__change-button" style={{ left: 8 + "px" }} onClick={() => {
          if (imageIndex != 0) {
            setImageIndex(imageIndex - 1);
          }
        }}>
          <img src={arrowIcon} alt="Show previous image" style={{ rotate: 90 + "deg" }} />
        </button>

        <button className="image-showcase__change-button" style={{ right: 8 + "px" }} onClick={() => {
          if (imageIndex != maxImageSelectorCount - 1) {
            setImageIndex(imageIndex + 1);
          }
        }}>
          <img src={arrowIcon} alt="Show next image" style={{ rotate: "-" + 90 + "deg" }} />
        </button>
      </div>
    </div>
  )
}
