import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * Notification Slice
 * 
 * Manages global notification state for Snackbar messages.
 */
export interface NotificationState {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

const initialState: NotificationState = {
  open: false,
  message: '',
  severity: 'info',
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ message: string; severity?: 'success' | 'error' | 'warning' | 'info' }>
    ) => {
      state.open = true
      state.message = action.payload.message
      state.severity = action.payload.severity || 'info'
    },
    hideNotification: (state) => {
      state.open = false
    },
    // Convenience actions
    showSuccess: (state, action: PayloadAction<string>) => {
      state.open = true
      state.message = action.payload
      state.severity = 'success'
    },
    showError: (state, action: PayloadAction<string>) => {
      state.open = true
      state.message = action.payload
      state.severity = 'error'
    },
    showWarning: (state, action: PayloadAction<string>) => {
      state.open = true
      state.message = action.payload
      state.severity = 'warning'
    },
    showInfo: (state, action: PayloadAction<string>) => {
      state.open = true
      state.message = action.payload
      state.severity = 'info'
    },
  },
})

export const {
  showNotification,
  hideNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} = notificationSlice.actions

export default notificationSlice.reducer

