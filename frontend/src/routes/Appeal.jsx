import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

async function downloadFile(fileId) {
    console.log('Downloading file with id:', fileId);
    try {
        const token = localStorage.getItem('token'); // Obtén el token de alguna forma de almacenamiento seguro

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/file/${fileId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob', // Indica que se espera un Blob
        });
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        let filename = response.headers['content-disposition'] ? response.headers['content-disposition'].split('filename=')[1] : `${fileId}.png`; // Si no hay encabezado 'content-disposition', usa el fileId como nombre de archivo
        filename = filename.replace(/['"]+/g, ''); // Elimina las comillas dobles y simples del nombre del archivo
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file', error);
    }
}

function Appeal() {
    const [rows, setRows] = React.useState([]);
  
    React.useEffect(() => {
      axios.get('/appeals')
        .then((response) => {
          const appeals = response.data.data;
          setRows(appeals.map((appeal) => ({
              id: appeal._id, // Usa el ID de la apelación como ID de la fila
              username: appeal.userId.username,
              email: appeal.userId.email,
              appealText: appeal.text,
              appealStatus: appeal.status,
              files: appeal.files,
              createdAt: new Date(appeal.createdAt).toLocaleDateString('es-CL'),
            })));
        })
        .catch((error) => {
          console.error('Hubo un error al obtener los datos de las apelaciones: ', error);
        });
    }, []);
  
    const handleApprove = async (id) => {
        try {
          const response = await axios.put(`/appeals/${id}/status`, { status: 'approved' });
          console.log('Appeal approved:', response.data);
      
          // Update rows state
          setRows(rows.map(row => row.id === id ? { ...row, appealStatus: 'approved' } : row));
        } catch (error) {
          console.error('Error approving appeal:', error);
        }
      };
      
      const handleReject = async (id) => {
        try {
          const response = await axios.put(`/appeals/${id}/status`, { status: 'rejected' });
          console.log('Appeal rejected:', response.data);
      
          // Update rows state
          setRows(rows.map(row => row.id === id ? { ...row, appealStatus: 'rejected' } : row));
        } catch (error) {
          console.error('Error rejecting appeal:', error);
        }
      };

      const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Usuario', width: 130 },
  { field: 'email', headerName: 'Email', width: 160 },
  { field: 'appealText', headerName: 'Texto de Apelación', flex: 1},
  { field: 'appealStatus', headerName: 'Estado de Apelación', width: 150 },
  { field: 'createdAt', headerName: 'Fecha', flex: 1 },
  {
    field: 'files',
    headerName: 'Archivos',
    flex: 1,
    renderCell: (params) => {
      const [open, setOpen] = React.useState(false);
  
      const handleClickOpen = () => {
        setOpen(true);
      };
  
      const handleClose = () => {
        setOpen(false);
      };
  
      return (
        <div>
          <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Ver archivos
          </Button>
          <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Archivos</DialogTitle>
            <DialogContent>
            <List>
            {Array.isArray(params.value) ? params.value.map((fileId, index) => {
                console.log('file id:', fileId); // Imprimir el id del archivo
                return (
                    <ListItem key={index}>
                        <Button variant="contained" color="primary" style={{ color: 'white' }} onClick={() => downloadFile(fileId)}>
                            {"Descargar Archivo"} {/* Nombre genérico para los archivos */}
                        </Button>
                    </ListItem>
                );
            }) : 'No hay archivos'}
            </List>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
        { 
          field: 'approve', 
          headerName: 'Aprobar', 
          width: 130,
          renderCell: (params) => (
            <Button 
              color="primary" 
              onClick={() => handleApprove(params.row.id)}
            >
              <CheckCircleOutlineIcon />
            </Button>
          ),
        },
        { 
            field: 'reject', 
            headerName: 'Rechazar', 
            width: 130,
            renderCell: (params) => (
                <Button 
                    color="secondary" 
                    onClick={() => handleReject(params.row.id)}
                >
                    <HighlightOffIcon />
                </Button> // Add closing tag for Button component
            ),
        }
      ];
  
    return (
      <div style={{ backgroundColor: 'white', 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'  }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          //checkboxSelection
        />
      </div>
    );
  }

export default Appeal;