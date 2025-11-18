import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Join Private League Modal Component
 * 
 * Material UI Dialog for joining a private league by entering the league ID.
 */
export interface JoinPrivateLeagueModalProps {
  open: boolean
  onJoin: (leagueId: number) => Promise<void>
  onClose: () => void
}

export function JoinPrivateLeagueModal({ open, onJoin, onClose }: JoinPrivateLeagueModalProps) {
  const [leagueId, setLeagueId] = useState<string>('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const id = parseInt(leagueId)
    if (!id || id <= 0) {
      setError('Please enter a valid league ID')
      return
    }

    setJoining(true)
    setError(null)

    try {
      await onJoin(id)
      // Success - close modal
      onClose()
      setLeagueId('') // Reset
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join league. Please try again.'
      setError(message)
    } finally {
      setJoining(false)
    }
  }

  const handleClose = () => {
    if (!joining) {
      setError(null)
      setLeagueId('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Join Private League</Typography>
          <IconButton onClick={handleClose} size="small" disabled={joining}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="League ID"
          type="number"
          fullWidth
          variant="outlined"
          value={leagueId}
          onChange={(e) => {
            setLeagueId(e.target.value)
            setError(null)
          }}
          disabled={joining}
          inputProps={{ min: 1 }}
          sx={{ mt: 2 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Enter the league ID provided by the league owner.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={joining}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={joining || !leagueId}>
          {joining ? 'Joining...' : 'Join League'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}




