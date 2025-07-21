import React from 'react';
import { useForm } from 'react-hook-form';

import '../assets/css/message_form.min.css'

export default function MessageForm({ sendMessage }) {
  const { register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  function onSubmit(data) {
    sendMessage(data.message);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="message-form">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col pe-sm-0">
            <input
              {...register("message", {
                required: true
              })}
              className="message-form__input w-100"
              type="text"
              placeholder="Γράψτε το μήνυμα σας εδώ" />
          </div>

          <div className="col-12 col-sm-auto ps-sm-0 pt-1 pt-sm-0">
            <button className="w-100 message-form__send-button primary-button">
              Αποστολή
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
