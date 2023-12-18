import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const TextareaAutosizeStyled = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  width: 500px;
  minHeight: 300px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

function Notificaciones() {
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [emailContent, setEmailContent] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [username, setUsername] = React.useState('');

  const handleClickOpen = (email, username) => {
    setOpen(true);
    setUserEmail(email);
    setUsername(username);
    setEmailContent(''); // Restablecer el contenido del correo electrónico
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = (emailContent, userEmail) => {
    axios.post('/manualEmail', { emailContent, userEmail })
      .then(response => {
        console.log(response.data);
        // Aquí puedes manejar la respuesta del servidor
        if (response.data.message) {
          alert(`Respuesta del servidor: ${response.data.message}`);
        } else {
          alert('Correo enviado exitosamente');
        }
      })
      .catch(error => {
        console.error(error);
        // Aquí puedes manejar cualquier error que ocurra durante la solicitud
        if (error?.response?.data?.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert('Ocurrió un error al enviar el correo');
        }
      });
  }

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'username', headerName: 'Usuario', flex: 2 },
    { field: 'email', headerName: 'Email', flex: 3 },
    {
      field: 'edit',
      headerName: 'Enviar Correo',
      flex: 1,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => handleClickOpen(params.row.email, params.row.username)}
        >
          <EmailIcon />
        </IconButton>
      ),
    }
  ];

  React.useEffect(() => {
    axios.get('/users')
      .then((response) => {
        const users = response.data.data;
        setRows(users.map((user, index) => ({
          id: index,
          username: user.username,
          email: user.email,
        })));
      });
  }, []);

  return (
    <div>
      <DataGrid rows={rows} columns={columns} />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enviar correo a {username}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Escribe el contenido del correo electrónico:
          </DialogContentText>
          <div style={{ minHeight: '200px' }}>
          <TextareaAutosizeStyled
            autoFocus
            margin="dense"
            aria-label="Contenido del correo"
            placeholder="Contenido del correo"
            fullWidth
            value={emailContent}
            onChange={(event) => setEmailContent(event.target.value)}
          />
        </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={() => handleSend(emailContent, userEmail)}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Notificaciones;