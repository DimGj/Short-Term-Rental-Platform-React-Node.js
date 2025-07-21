import React from 'react';

import reviewStarFull from '../../../assets/img/icons/review_star_full.svg';
import reviewStarHalf from '../../../assets/img/icons/review_star_half.svg';
import reviewStarEmpty from '../../../assets/img/icons/review_star_empty.svg';

import '../assets/css/room_rating.min.css';

export default function RoomRating({ rating, ratingCount }) {
  const stars = Math.floor(rating);
  let hasHalfStar = rating - stars == 0 ? false : true;

  return (
    <div className="room-rating__review row">
      <div className="col-auto d-flex px-0">
        {
          [...Array(5)].map((star, i) => {
            if (i <= stars - 1) {
              return (
                <div className="col-auto room-rating__review-star px-0" key={i}><img src={reviewStarFull} alt="One review star" /></div>
              );
            } else if (hasHalfStar) {
              hasHalfStar = 0;
              return (
                <div className="col-auto room-rating__review-star px-0" key={i}><img src={reviewStarHalf} alt="One Half review star" /></div>
              );
            } else {
              return (
                <div className="col-auto room-rating__review-star px-0" key={i}><img src={reviewStarEmpty} alt="One empty review star" /></div>
              );
            }
          })
        }
      </div>

      <div className="col-auto d-flex align-items-center ps-1 pt-1">
        <p className="room-rating__review-count mb-0 lh-sm">
          ({ratingCount})
        </p>
      </div>
    </div>

  )
}