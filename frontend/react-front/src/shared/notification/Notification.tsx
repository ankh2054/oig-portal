import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useOnClickOutside from '../../hooks/useOnClickOutside'
import IconClose from '../icons/IconClose'
import IconInfo from '../icons/IconInfo'

import {
  hideNotification,
  selectIsNotificationVisible,
  selectNotification,
} from './NotificationSlice'

const Notification = () => {
  const dispatch = useDispatch()

  const isVisible = useSelector(selectIsNotificationVisible)
  const { message, type } = useSelector(selectNotification)
  const ref = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    dispatch(hideNotification())
  }
  useOnClickOutside(ref, handleClose)
  let cssClass = 'bg-error'
  switch (type) {
    case 'error':
      cssClass = 'bg-error'
      break
    case 'warning':
      cssClass = 'bg-orange-600'
      break
    case 'info':
      cssClass = 'bg-blue-500'
      break
    case 'success':
      cssClass = 'bg-success'
      break
  }
  if (isVisible) {
    return (
      <div
        ref={ref}
        className={`absolute left-1/2 top-24 z-10 flex max-w-2xl -translate-x-1/2 transform  items-center  py-3 pl-3 pr-8 text-sm font-bold text-white shadow-lg ${cssClass}`}
        role="alert"
      >
        <div className="flex items-center gap-x-2">
          <IconInfo color="white" />
          <p>{message}</p>
        </div>
        <button onClick={handleClose} className="absolute right-1 top-1">
          <IconClose color="white" />
        </button>
      </div>
    )
  } else {
    return null
  }
}

export default Notification
