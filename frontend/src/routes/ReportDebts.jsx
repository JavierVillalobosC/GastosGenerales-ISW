import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

function Report() {
    const [rows, setRows] = React.useState([]);
    const [resumen, setResumen] = React.useState(null);
    const { user } = useAuth();
  
    React.useEffect(() => {
      if (!user || !user.id) {
        console.error('User or user ID is undefined');
        return;
      }
    
      axios.get(`/report/deudas/${user.id}`, {
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
          actualamount: debt.actualamount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
        <div style={{ 
          backgroundColor: 'white', 
          height: '100vh', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          alignItems: 'flex-start'  
        }}>
          {/* Mueve el resumen arriba de la tabla de datos */}
          {resumen && (
            <Card style={{ marginBottom: '20px', minWidth: '275px' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Resumen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monto Total: {resumen.totalAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Promedio de Montos: {resumen.averageAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Número total de pagos: {resumen.totalNumberOfPayments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Número Promedio de pagos: {resumen.averageNumberOfPayments}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={async () => {
                    try {
                      const response = await axios.get(`/report/deudas/pdf/${user.id}`, { 
                        headers: {
                          Authorization: `Bearer ${user.token}`
                        },
                        responseType: 'blob' 
                      });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'reporte.pdf');
                      document.body.appendChild(link);
                      link.click();
                    } catch (error) {
                      console.error('Error descargando el archivo', error);
                    }
                  }}
                >
                  Descargar PDF
                </Button>
              </CardContent>
            </Card>
          )}
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            style={{ width: '100%' }}
          />
        </div>
      );
}
export default Report;