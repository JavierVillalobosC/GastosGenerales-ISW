import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

const columns = [
   { field: 'id', headerName: '#', flex: 1, valueGetter: (params) => params.value + 1},
    { field: 'username', headerName: 'Usuario', flex: 1 },
    { field: 'amount', headerName: 'Monto Pagado (CLP)', flex: 1, valueFormatter: (params) => `$${params.value}` },
    { field: 'valor_cuota', headerName: 'Valor Cuota (CLP)', flex: 1, valueFormatter: (params) => `$${params.value}` },
    { field: 'date', headerName: 'Fecha', flex: 1 },
    { field: 'service', headerName: 'Servicio', flex: 1 },
    { field: 'status', headerName: 'Estado', flex: 1 },
    { field: 'paydate', headerName: 'Fecha limite', flex: 1 },
    // add more columns as needed
  ];
  
  function Pagos() {
    const [rows, setRows] = React.useState([]);
  
    React.useEffect(() => {
      axios.get('/pagos')
        .then((response) => {
          const payments = response.data.data;
          console.log(payments);
          const servicePromises = payments.map(payment => 
            axios.get(`/categorias/${payment.idService}`)
          );
          const statusPromises = payments.map(payment => 
            axios.get(`/debstates/${payment.status}`)
          );
          Promise.all([...servicePromises, ...statusPromises])
            .then(responses => {
              const serviceResponses = responses.slice(0, payments.length);
              const statusResponses = responses.slice(payments.length);
              const rows = payments.map((payment, index) => {
                const serviceResponse = serviceResponses[index];
                const statusResponse = statusResponses[index];
                const serviceName = serviceResponse.data && serviceResponse.data.data && serviceResponse.data.data.name ? serviceResponse.data.data.name : 'Nombre no disponible';
                const statusName = statusResponse.data && statusResponse.data.data && statusResponse.data.data.name ? statusResponse.data.data.name : 'Nombre no disponible';
                return {
                  id: index,
                  username: payment.user.username,
                  amount: payment.total_amount,
                  valor_cuota: payment.valorcuota || 'No disponible',
                  date: new Date(payment.date).toLocaleDateString('es-CL'),
                  paydate: new Date(payment.paydate).toLocaleDateString('es-CL'),
                  service: serviceName,
                  status: statusName,
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
        />
      </div>
    );
  }
  
  export default Pagos;
