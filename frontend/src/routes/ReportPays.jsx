import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AuthProvider, useAuth } from '../context/AuthContext';

function ReportPays() {
    const [rows, setRows] = React.useState([]);
    const [resumen, setResumen] = React.useState(null);
    const { user } = useAuth();
  
    React.useEffect(() => {
      if (!user || !user.id) {
        console.error('User or user ID is undefined');
        return;
      }
    
      axios.get(`/report/pagos/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      .then((response) => {
        console.log(response.data);
        const pagos = response.data.slice(0, -1); // Todos los elementos excepto el último
        const resumen = response.data.slice(-1)[0]; // Solo el último elemento
      
        if (!pagos) {
          console.error('La respuesta de la API no contiene pagos');
          return;
        }
      
        setResumen(resumen);
        setRows(pagos.map((pago, index) => ({
            id: pago.id || index,
            user: pago.user,
            serviceId: pago.serviceId,
            date: new Date(pago.date).toLocaleDateString('es-CL'),
            amount: pago.amount ? pago.amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A',
            type: pago.type,
            status: pago.status,
          })));
      })
    .catch((error) => {
      console.error('Hubo un error al obtener los datos de los pagos: ', error);
    });
    }, [user]);
  
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'user', headerName: 'Usuario', width: 130 },
        { field: 'serviceId', headerName: 'ID de Servicio', width: 160 },
        { field: 'date', headerName: 'Fecha', flex: 1},
        { field: 'amount', headerName: 'Monto', flex: 1},
        { field: 'type', headerName: 'Tipo', flex: 1},
        { field: 'status', headerName: 'Estado', flex: 1},
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
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={async () => {
                    try {
                      const response = await axios.get(`/report/pagos/pdf/${user.id}`, { 
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
export default ReportPays;