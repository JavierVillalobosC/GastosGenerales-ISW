import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';



const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Usuario', width: 130 },
    { field: 'amount', headerName: 'Monto Deuda (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
    { field: 'valor_cuota', headerName: 'Valor Cuota (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
    { field: 'initialdate', headerName: 'Fecha Inicio', width: 130 },
    { field: 'finaldate', headerName: 'Fecha Final', width: 130 },
    { field: 'service', headerName: 'Servicio', width: 130 },
    { field: 'estado', headerName: 'Estado', width: 130 },
    { field: 'interestApplied', headerName: 'Interés Aplicado', width: 150 },
    { field: 'blacklisted', headerName: 'En lista negra', width: 130 },
    // add more columns as needed
    {
        field: 'edit',
        headerName: 'Editar',
        flex: 1,
        renderCell: (params) => (
          <IconButton 
            color="primary" 
            onClick={() => handleEditClick(params.row)}
          >
            <EditIcon />
          </IconButton>
        ),
      },
];

const handleEditClick = (row) => {
    setEditingRow(row);
  setOpen(true);
  };

function Deudas() {
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [editingRow, setEditingRow] = React.useState(null);

    React.useEffect(() => {
        axios.get('/deudas')
            .then((response) => {
                const debts = response.data.data;
                const servicePromises = debts.map(debt => 
                    axios.get(`/categorias/${debt.idService}`)
                );

                Promise.all(servicePromises)
                    .then(serviceResponses => {
                        const rows = debts.map((debt, index) => {
                            const serviceResponse = serviceResponses[index];
                            const serviceName = serviceResponse.data && serviceResponse.data.data && serviceResponse.data.data.name ? serviceResponse.data.data.name : 'Nombre no disponible';
                            return {
                                id: debt.id,
                                username: debt.user.username,
                                amount: debt.amount,
                                valor_cuota: debt.valorcuota,
                                initialdate: new Date(debt.initialdate).toLocaleDateString('es-CL'),
                                finaldate: new Date(debt.finaldate).toLocaleDateString('es-CL'),
                                service: serviceName,
                                estado: debt.estado,
                                interestApplied: debt.interestApplied ? 'Sí' : 'No',
                                blacklisted: debt.user.blacklisted ? 'Sí' : 'No',
                                // add more fields as needed
                            };
                        });

                        setRows(rows);
                    });
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de las deudas: ', error);
            });
    }, []);

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
                rowsPerPageOptions={[5, 10]}
                checkboxSelection
            />
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Editar Deuda</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Usuario"
                        type="text"
                        fullWidth
                        value={editingRow ? editingRow.username : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, username: event.target.value })}
                    />
                    {/* Repite para cada campo que quieras editar */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        // Aquí puedes manejar la actualización de la deuda
                        console.log(editingRow);
                        setOpen(false);
                    }}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Deudas;