import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from '../../store'

export interface NotificationState {
  message: string | null
  type: string
}

const initialState: NotificationState = {
  message: null,
  type: 'error',
}
export const notificationSlice = createSlice({
  initialState,
  name: 'notification',
  reducers: {
    hideNotification: (state) => {
      state.message = null
    },
    showNotification: (
      state,
      action: PayloadAction<{
        type: string
        message: string
      }>
    ) => {
      state.message = action.payload.message
      state.type = action.payload.type
    },
  },
})

export const selectNotification = (state: RootState) => state.notification
export const selectIsNotificationVisible = (state: RootState) =>
  state.notification.message !== null

export const { showNotification, hideNotification } = notificationSlice.actions

export default notificationSlice.reducer
