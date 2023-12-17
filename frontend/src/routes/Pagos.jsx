import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Usuario', width: 130 },
    { field: 'amount', headerName: 'Monto Pagado (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
    { field: 'valor_cuota', headerName: 'Valor Cuota (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
    { field: 'date', headerName: 'Fecha', width: 110 },
    { field: 'service', headerName: 'Servicio', width: 130 },
    { field: 'estado', headerName: 'Estado', width: 130 },
    { field: 'paydate', headerName: 'Fecha limite', width: 130 },
    // add more columns as needed
  ];
  
  function Pagos() {
    const [rows, setRows] = React.useState([]);
  
    React.useEffect(() => {
      axios.get('/pagos')
        .then((response) => {
          const payments = response.data.data;
          const servicePromises = payments.map(payment => 
            axios.get(`/categorias/${payment.idService}`)
          );
    
          Promise.all(servicePromises)
            .then(serviceResponses => {
              const rows = payments.map((payment, index) => {
                const serviceResponse = serviceResponses[index];
                const serviceName = serviceResponse.data && serviceResponse.data.data && serviceResponse.data.data.name ? serviceResponse.data.data.name : 'Nombre no disponible';
                return {
                  id: index,
                  username: payment.user.username,
                  amount: payment.total_amount,
                  valor_cuota: payment.valor_cuota,
                  date: new Date(payment.date).toLocaleDateString('es-CL'),
                  paydate: new Date(payment.paydate).toLocaleDateString('es-CL'),
                  service: serviceName,
                  // add more fields as needed
                };
              });
    
              setRows(rows);
            });
        })
        .catch((error) => {
          console.error('Hubo un error al obtener los datos de los pagos: ', error);
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
      </div>
    );
  }
  
  export default Pagos;
