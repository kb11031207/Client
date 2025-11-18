import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Create League Modal Component
 * 
 * Material UI Dialog for creating new leagues.
 */
export interface CreateLeagueModalProps {
  open: boolean
  onCreate: (isPublic: boolean) => Promise<void>
  onClose: () => void
}

export function CreateLeagueModal({ open, onCreate, onClose }: CreateLeagueModalProps) {
  const [leagueType, setLeagueType] = useState<'public' | 'private'>('public')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setCreating(true)
    setError(null)

    try {
      // Backend: true = public, false = private
      const isPublic = leagueType === 'public'
      await onCreate(isPublic)
      // Success - close modal (parent will handle navigation)
      onClose()
      setLeagueType('public') // Reset
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create league. Please try again.'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    if (!creating) {
      setError(null)
      setLeagueType('public')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New League</Typography>
          <IconButton onClick={handleClose} size="small" disabled={creating}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth sx={{ mt: 1 }}>
          <FormLabel component="legend">League Type</FormLabel>
          <RadioGroup
            value={leagueType}
            onChange={(e) => setLeagueType(e.target.value as 'public' | 'private')}
          >
            <Box
              sx={{
                border: 2,
                borderColor: leagueType === 'public' ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: 2,
                mb: 2,
                backgroundColor: leagueType === 'public' ? 'action.hover' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => setLeagueType('public')}
            >
              <FormControlLabel
                value="public"
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight="medium">Public League</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Anyone can join this league
                    </Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Box>
            <Box
              sx={{
                border: 2,
                borderColor: leagueType === 'private' ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: 2,
                backgroundColor: leagueType === 'private' ? 'action.hover' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => setLeagueType('private')}
            >
              <FormControlLabel
                value="private"
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight="medium">Private League</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only invited members can join
                    </Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Box>
          </RadioGroup>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={creating}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={creating}>
          {creating ? 'Creating...' : 'Create League'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}




