import './Settings.scss';
import { useState } from 'react';
import { Check as CheckIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Fab, Modal, TextField, Typography, Box, Button, Snackbar } from '@mui/material';
import parseNAVLayoutToIndexes from '../core/NavLayoutParser';

function Settings() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOnSaveFeedback, setShowOnSaveFeedback] = useState(false);
  const [navLayout, setNavLayout] = useState('');

  function parseNAVLayout() {
    const indexes = parseNAVLayoutToIndexes(navLayout);

    if (indexes) {
      localStorage.setItem('NavHeaderIndexes', JSON.stringify(indexes));
      setShowSettingsModal(false);
      setShowOnSaveFeedback(true);
    }
  }

  return (
    <>
      <Modal className='settingsModal' open={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
        <Box className='settingsModalContainer'>
          <Typography variant='h4'>Paste NAV items to config setup your layout</Typography>
          <TextField
            id='navLayoutInput'
            fullWidth
            type='text'
            variant='outlined'
            label='NAV Layout'
            value={navLayout}
            multiline
            rows={10}
            autoFocus
            onChange={e => setNavLayout(e.target.value)}
          />
          <Button variant='outlined' disabled={!navLayout} onClick={parseNAVLayout}>
            Confirm
          </Button>
        </Box>
      </Modal>

      <Fab id='settingsButton' color='primary' aria-label='settings' onClick={() => setShowSettingsModal(true)}>
        <SettingsIcon />
      </Fab>

      <Snackbar
        open={showOnSaveFeedback}
        autoHideDuration={3000}
        onClose={() => setShowOnSaveFeedback(false)}
        message='Layout saved successfully!'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className='snackbar'
        action={<CheckIcon color='primary' />}
      />
    </>
  );
}

export default Settings;
