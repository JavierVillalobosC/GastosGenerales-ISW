import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

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
  const [successAlert, setSuccessAlert] = React.useState(false);
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [subjectError, setSubjectError] = React.useState(false);
  const [contentError, setContentError] = React.useState(false);
  const [sendToAll, setSendToAll] = React.useState(false);
  const [emailContent, setEmailContent] = React.useState('');
  const [emailSubject, setEmailSubject] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [username, setUsername] = React.useState('');

  const handleClickOpen = (email, username) => {
    setOpen(true);
    setSendToAll(false);
    setUserEmail(email);
    setUsername(username);
    setEmailContent('');
    setEmailSubject('');
  };

  const handleClickOpenAll = () => {
    setOpen(true);
    setSendToAll(true);
    setEmailContent('');
    setEmailSubject('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = (emailContent, emailSubject, userEmail) => {
    // Verifica si el asunto y el contenido del correo no están vacíos
    if (!emailContent.trim()) {
      setContentError(true);
      handleClose(); // Cierra el cuadro de texto
      return;
    }
  
    if (!emailSubject.trim()) {
      setSubjectError(true);
      handleClose(); // Cierra el cuadro de texto
      return;
    }
  
    if (sendToAll) {
      rows.forEach(row => {
        axios.post('/manualEmail', { emailContent, emailSubject, userEmail: row.email })
          .then(response => {
            console.log(response.data);
            // Muestra el alerta de éxito
            setSuccessAlert(true);
          })
          .catch(error => {
            console.error(error);
            // Muestra el alerta de error
            setErrorAlert(true);
          });
      });
    } else {
      axios.post('/manualEmail', { emailContent, emailSubject, userEmail })
        .then(response => {
          console.log(response.data);
          // Muestra el alerta de éxito
          setSuccessAlert(true);
        })
        .catch(error => {
          console.error(error);
          // Muestra el alerta de error
          setErrorAlert(true);
        });
    }
  
    handleClose(); // Cierra el cuadro de texto
  }

  const columns = [
    { field: 'rowNumber', headerName: 'N°', width: 40, headerAlign: 'center', align: 'center' },
/*     { field: 'id', headerName: 'ID', width: 70, headerAlign: 'center' }, */
    { field: 'username', headerName: 'Nombre de Usuario', flex: 2, headerAlign: 'center' },
    { field: 'email', headerName: 'Correo Electrónico', flex: 3, headerAlign: 'center' },
    {
      field: 'edit',
      headerName: 'Enviar Correo',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params) => (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
            color="primary"
            onClick={() => handleClickOpen(params.row.email, params.row.username)}
          >
            <EmailIcon />
          </IconButton>
        </Grid>
      ),
    },
  ];

  React.useEffect(() => {
    axios.get('/users')
      .then((response) => {
        const users = response.data.data;
        setRows(users.map((user, index) => ({
          id: index,
          rowNumber: index + 1,
          username: user.username,
          email: user.email,
        })));
      });
  }, []);

  return (
    <div style={{ backgroundColor: 'white', height: '90%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        <Button
          startIcon={<MarkAsUnreadIcon />}
          variant="contained"
          color="primary"
          onClick={handleClickOpenAll}
        >
          Enviar Correo A Todos
        </Button>
      </div>
      <div>
        {/* Muestra los alertas según el estado */}
        {successAlert && (
          <Alert severity="success" onClose={() => setSuccessAlert(false)}>
            <AlertTitle>Success</AlertTitle>
            Correo enviado exitosamente
          </Alert>
        )}
        {errorAlert && (
          <Alert severity="error" onClose={() => setErrorAlert(false)}>
            <AlertTitle>Error</AlertTitle>
            Ocurrió un error al enviar el correo
          </Alert>
        )}
        {subjectError && (
          <Alert severity="error" onClose={() => setSubjectError(false)}>
            <AlertTitle>Error</AlertTitle>
            El asunto del correo es obligatorio
          </Alert>
        )}
        {contentError && (
          <Alert severity="error" onClose={() => setContentError(false)}>
            <AlertTitle>Error</AlertTitle>
            El contenido del correo es obligatorio
          </Alert>
        )}
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          slotProps={{
            cell: { style: { borderRight: '1px solid #ddd' } },
            columnHeader: { style: { borderRight: '1px solid #ddd' } },
          }}
        />
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Enviar correo a {sendToAll ? 'todos los usuarios' : username}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Escribe el asunto del correo electrónico:
            </DialogContentText>
            <TextareaAutosizeStyled
              autoFocus
              margin="dense"
              aria-label="Asunto del correo"
              placeholder="Asunto del correo"
              width="100%"
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
            />
            <DialogContentText style={{ marginTop: '20px' }}>
              Escribe el contenido del correo electrónico:
            </DialogContentText>
            <div style={{ minHeight: '200px' }}>
              <TextareaAutosizeStyled
                margin="dense"
                aria-label="Contenido del correo"
                placeholder="Contenido del correo"
                width="100%"
                value={emailContent}
                onChange={(event) => setEmailContent(event.target.value)}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={() => handleSend(emailContent, emailSubject, userEmail)}>Enviar</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Notificaciones;