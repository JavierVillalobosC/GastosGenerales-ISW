import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Report() {
    const [rows, setRows] = React.useState([]);
    const [resumen, setResumen] = React.useState(null);
    const { user } = useAuth();
  
    React.useEffect(() => {
        if (!user || !user.id) {
          console.error('User or user ID is undefined');
          return;
        }
      
        axios.get(`${process.env.REACT_APP_API_URL}/api/report/deudas/${user.id}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          })
        .then((response) => {
          const { deudas, resumen } = response.data;
          setResumen(resumen);
          setRows(deudas.map((debt, index) => ({
            id: debt.id || index, // Usa el ID de la deuda como ID de la fila, si no existe usa el índice
            user: debt.user,
            serviceId: debt.serviceId,
            initialDate: new Date(debt.initialDate).toLocaleDateString('es-CL'),
            finalDate: new Date(debt.finalDate).toLocaleDateString('es-CL'),
            actualamount: debt.actualamount,
            numberOfPayments: debt.numberOfPayments,
            state: debt.state,
          })));
        })
        .catch((error) => {
          console.error('Hubo un error al obtener los datos de las deudas: ', error);
        });
    }, [user]);
  
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'user', headerName: 'Usuario', width: 130 },
        { field: 'serviceId', headerName: 'ID de Servicio', width: 160 },
        { field: 'initialDate', headerName: 'Fecha Inicial', flex: 1},
        { field: 'finalDate', headerName: 'Fecha Final', flex: 1},
        { field: 'actualamount', headerName: 'Monto Actual', flex: 1},
        { field: 'numberOfPayments', headerName: 'Número de Pagos', flex: 1},
        { field: 'state', headerName: 'Estado', flex: 1},
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
        />
        {/* Aquí puedes mostrar la información del resumen, por ejemplo: */}
        {resumen && (
          <div>
            <p>Total Amount: {resumen.totalAmount}</p>
            <p>Average Amount: {resumen.averageAmount}</p>
            <p>Total Number of Payments: {resumen.totalNumberOfPayments}</p>
            <p>Average Number of Payments: {resumen.averageNumberOfPayments}</p>
          </div>
        )}
      </div>
    );
}
export default Report;