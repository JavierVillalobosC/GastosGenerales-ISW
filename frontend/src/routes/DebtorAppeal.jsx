import React, { useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { AuthContext } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';

function Deudas() {
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedDebt, setSelectedDebt] = React.useState(null);
    const [text, setText] = React.useState('');
    const [files, setFiles] = React.useState([]);
    const [debtId, setDebtId] = React.useState(null);
    const [alert, setAlert] = React.useState({ open: false, message: '', severity: '' });
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
    
        setAlert(prev => ({ ...prev, open: false }));
    };
    
    const token = localStorage.getItem('token')


    // Obtén el userId del contexto de autenticación
    const { user } = useContext(AuthContext);
    console.log(user);
    const userId = user.id;
    console.log(userId);
    //const { isAuthenticated, user } = useAuth();
    function handleAppealButtonClick(params) {
        if (!params || !params.row) {
            console.error('params or params.row is undefined');
            return;
        }
    
        const debtId = params.row.id;
        console.log(`userId: ${userId}, debtId: ${debtId}`);
        setSelectedDebt({ userId: userId, debtId: debtId });
        setOpen(true);
    }

    function handleSubmit(event) {
        event.preventDefault();

        console.log('userId:', userId);
        console.log('selectedDebt:', selectedDebt);

        if (text.trim() === '') {
            setAlert({ open: true, message: 'El campo de texto de la apelación no puede estar vacío', severity: 'error' });
            return;
        }

        if (!userId || !selectedDebt) {
            console.error('userId and selectedDebt must be set before submitting the form');
            return;
        }

        const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];

        if (!Array.isArray(files) || !files.every(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return typeof file === 'object' && allowedExtensions.includes(extension);
        })) {
            console.error('Todos los archivos deben ser de tipo png, jpg, jpeg o pdf');
            return;
        }
    
        // Primero, crear la apelación
        const appealData = {
            userId: userId,
            debtId: selectedDebt.debtId,
            text: text,
            files: [] // Inicialmente, no hay archivos
        };
    
        console.log('About to make POST request', appealData);
        axios.post('/appeals/', appealData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Apelación creada con éxito: ', response.data);
            setAlert({ open: true, message: 'Apelación enviada con éxito', severity: 'success' });
        
            if (!response.data.data._id) {
                throw new Error('La apelación no se creó correctamente');
            }
            // Luego, si hay archivos, subirlos
            if (files.length > 0 && response.data.data._id) {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('archivo', files[i]);
                }
                formData.append('debtId', selectedDebt.debtId);
        
                console.log('About to upload files', files); // imprimirá los archivos en la consola
        
                return axios.post(`/appeals/${response.data.data._id}/files`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            } else if (!response.data.data._id) {
                throw new Error('No se puede subir archivos porque no se creó correctamente la apelación');
            }
        })
        .then(response => {
            if (response) {
                console.log('Archivos subidos con éxito: ', response.data);
            }
        
            // Limpiar el formulario después de enviarlo
            setText('');
            setFiles([]);
            setOpen(false); // Cerrar el modal
        })
        .catch(error => {
            console.error('Hubo un error al enviar la apelación: ', error);
        });
    }

    React.useEffect(() => {
        axios.get('/deudas', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                console.log('Deudas:', response.data);
                const debts = response.data.data;
                const userDebts = debts.filter(debt => debt.user && debt.user._id && debt.user._id.toString() === userId.toString() && debt.interestApplied === true); // filtra las deudas para obtener solo las del usuario que inició sesión y tienen interestApplied = true
                const servicePromises = userDebts.map(debt => 
                    axios.get(`/categorias/${debt.idService}`)
                );
    
                Promise.all(servicePromises)
                .then(serviceResponses => {
                    const newRows = userDebts.map((debt, index) => {
                        const serviceResponse = serviceResponses[index];
                        const serviceName = serviceResponse.data && serviceResponse.data.data && serviceResponse.data.data.name ? serviceResponse.data.data.name : 'Nombre no disponible';
                        return {
                            id: debt._id,
                            username: debt.user.username,
                            amount: debt.amount,
                            valor_cuota: debt.valorcuota,
                            initialdate: new Date(debt.initialdate).toLocaleDateString('es-CL'),
                            finaldate: new Date(debt.finaldate).toLocaleDateString('es-CL'),
                            service: serviceName,
                            //estado: debt.estado,
                            interestApplied: debt.interestApplied,
                            //blacklisted: debt.blacklisted,
                        };
                    });
                    setRows(newRows);
                });
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de las deudas: ', error);
            });
    }, []);
    
    const columns = [
        //{ field: 'id', headerName: 'ID', width: 70 },
        { field: 'username', headerName: 'Usuario', width: 130 },
        { field: 'amount', headerName: 'Monto Deuda (CLP)', flex: 1, valueFormatter: (params) => `$${params.value}` },
        { field: 'valor_cuota', headerName: 'Valor Cuota (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
        { field: 'initialdate', headerName: 'Fecha Inicio', width: 130 },
        { field: 'finaldate', headerName: 'Fecha Final', width: 130 },
        { field: 'service', headerName: 'Servicio', width: 130 },
        //{ field: 'estado', headerName: 'Estado', width: 130 },
        { field: 'interestApplied', headerName: 'Interés Aplicado', width: 150 },
        //{ field: 'blacklisted', headerName: 'En lista negra', width: 130 },
        {
            field: 'appeal',
            headerName: 'Apelar',
            width: 130,
            renderCell: (params) => (
                <IconButton color="primary" onClick={() => handleAppealButtonClick(params)}>
                    <DescriptionIcon />
                </IconButton>
            ),
        },
    ];
    
    return (
        <div style={{ backgroundColor: 'white', 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        position: 'relative'  }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                //checkboxSelection
            />
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Crear apelación</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Texto de la apelación"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            fullWidth
                        />
                        <input
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            id="upload-button"
                            onChange={e => {
                                setFiles(Array.from(e.target.files));
                                console.log('Files selected', e.target.files);
                            }}
                        />
                        <label htmlFor="upload-button">
                            <Button variant="contained" color="primary" component="span">
                                Subir archivos
                            </Button>
                        </label>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!selectedDebt}
                        >
                            Enviar apelación
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <div style={{ position: 'absolute', top: 0, width: '100%' }}>
                {alert.open && (
                    <Alert severity={alert.severity} onClose={handleClose}>
                        <AlertTitle>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</AlertTitle>
                        {alert.message}
                    </Alert>
                )}
            </div>
        </div>
    );
}

export default Deudas;