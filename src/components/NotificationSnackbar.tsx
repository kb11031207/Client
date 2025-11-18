import type { SyntheticEvent } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { hideNotification } from '../store/slices/notificationSlice'

/**
 * Notification Snackbar Component
 * 
 * Global notification system using Material UI Snackbar.
 * Displays success, error, warning, and info messages.
 */
export function NotificationSnackbar() {
  const dispatch = useAppDispatch()
  const { open, message, severity } = useAppSelector((state) => state.notification)

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(hideNotification())
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}


