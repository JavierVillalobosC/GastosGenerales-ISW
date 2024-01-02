import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Root() {
  return (
    <AuthProvider>
      <Pagos />
    </AuthProvider>
  );
}

  
  function Pagos() {
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
    const { user } = useAuth();
  console.log(user);
    const [rows, setRows] = React.useState([]);
    
    React.useEffect(() => {
      axios.get(`/users/email/${user.email}`)
        .then((response) => {
          const userId = response.data.data._id;
          axios.get('/pagos')
            .then((response) => {
              const allPayments = response.data.data;
              console.log('Todos los pagos: ', allPayments); 
              const currentUserPayments = user.roles[0].name === 'admin' ? allPayments : allPayments.filter(payment => {
                console.log('ID de usuario del pago: ', payment.user._id); // Agregado para depuración
                console.log('ID de usuario actual: ', userId); // Agregado para depuración
                return payment.user._id === userId;
              });
              console.log('Pagos del usuario actual: ', currentUserPayments);
              const servicePromises = currentUserPayments.map(payment => 
                axios.get(`/categorias/${payment.idService}`)
              );
              const statusPromises = currentUserPayments.map(payment => 
                axios.get(`/debstates/${payment.status}`)
              );
              Promise.all([...servicePromises, ...statusPromises])
                .then(responses => {
                  const serviceData = responses.slice(0, currentUserPayments.length);
                  const statusData = responses.slice(currentUserPayments.length);
                  const newRows = currentUserPayments.map((payment, index) => {
                    const serviceResponse = serviceData[index];
                    const statusResponse = statusData[index];
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
                    };
                  });
  
                  setRows(newRows);
                });
            })
            .catch((error) => {
              console.error('Hubo un error al obtener los datos de los pagos: ', error);
            });
        })
        .catch((error) => {
          console.error('Hubo un error al obtener los datos del usuario: ', error);
        });
    }, [user]);
  
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
  
  export default Root;
