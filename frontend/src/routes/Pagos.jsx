import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

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
    const [chartData, setChartData] = React.useState([]);
    const [userChartData, setUserChartData] = React.useState([]);

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
                  const statusNameMap = statusData.reduce((map, status) => {
                    map[status.data.data._id] = status.data.data.name;
                    return map;
                  }, {});
                  const paymentStatusCounts = currentUserPayments.reduce((counts, payment) => {
                    const statusName = statusNameMap[payment.status];
                    if (!counts[statusName]) {
                      counts[statusName] = 0;
                    }
                    counts[statusName]++;
                    return counts;
                  }, {});
  
                  const data = Object.entries(paymentStatusCounts).map(([label, value]) => ({ label, value }));
  
                  setChartData(data);

                  const userPaymentCounts = currentUserPayments.reduce((counts, payment) => {
                    const username = payment.user.username;
                    if (!counts[username]) {
                      counts[username] = 0;
                    }
                    counts[username]++;
                    return counts;
                  }, {});
                  const userData = Object.entries(userPaymentCounts).map(([label, value]) => ({ label, value }));
                  setUserChartData(userData);
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
  
    const size = {
      width: 400,
      height: 200,
    };
    return (
      <div style={{ 
        backgroundColor: 'white', 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center'  
      }}>
        <div style={{ marginBottom: '100px', width: '80%', height: '50%' }}>
        <h2>Pagos Registrados</h2>
        
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
          <h3>Estado de pagos</h3>
          <PieChart
            series={[
              {
                arcLabel: (item) => `${item.label} (${item.value})`,
                arcLabelMinAngle: 45,
                data: chartData,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: 'white',
                fontWeight: 'bold',
              },
            }}
            {...size}
          /></div>
          <div>
          <h3>Pagos por usuario</h3>
          <PieChart
        series={[
          {
            arcLabel: (item) => `${item.label} (${item.value})`,
            arcLabelMinAngle: 45,
            data: userChartData,
          },
        ]}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: 'white',
            fontWeight: 'bold',
          },
        }}
        {...size}
      /></div>
        </div>
      </div>
    );
  }
  
  export default Root;
