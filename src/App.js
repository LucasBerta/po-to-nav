import { Typography } from '@mui/material';
import './App.scss';
import PdfToNav from './components/PdfToNav';
import Settings from './components/Settings';

function App() {
  return (
    <div className='App'>
      <div id='topbar'>
        <img
          className='topbarLeft'
          alt='Logo'
          src='https://joule.ie/wp-content/themes/Joule/assets/dist/img/joule_logo_white.svg'
        />
        <Typography variant='h3'>Joule PO to NAV</Typography>
        <div className='topbarRight'></div>
      </div>
      <div>
        <Typography id='title' variant='h5' textAlign='center'>
          Drop the PO on the box below, click "Copy NAV Items" and paste it on NAV
        </Typography>
      </div>
      <PdfToNav />
      <Settings />
    </div>
  );
}

export default App;
