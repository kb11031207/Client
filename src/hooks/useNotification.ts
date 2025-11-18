import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import { showSuccess, showError, showWarning, showInfo, showNotification } from '../store/slices/notificationSlice'

/**
 * Custom hook for showing notifications
 * 
 * Provides convenient methods to display snackbar notifications.
 * 
 * @example
 * const { showSuccess, showError } = useNotification()
 * showSuccess('Operation completed successfully!')
 * showError('Something went wrong')
 */
export function useNotification() {
  const dispatch = useAppDispatch()

  return {
    showSuccess: useCallback((message: string) => dispatch(showSuccess(message)), [dispatch]),
    showError: useCallback((message: string) => dispatch(showError(message)), [dispatch]),
    showWarning: useCallback((message: string) => dispatch(showWarning(message)), [dispatch]),
    showInfo: useCallback((message: string) => dispatch(showInfo(message)), [dispatch]),
    showNotification: useCallback(
      (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => 
        dispatch(showNotification({ message, severity })),
      [dispatch]
    ),
  }
}

