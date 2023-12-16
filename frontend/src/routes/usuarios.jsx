import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Usuario', width: 130 },
  { field: 'rut', headerName: 'RUT', width: 130 },
  { field: 'email', headerName: 'Email', width: 130 },
  { field: 'debt', headerName: 'Deuda Total', width: 110 , valueFormatter: (params) => `$${params.value}`},
  { field: 'Estado', headerName: 'Estado', width: 160 },
  { field: 'edit', headerName: 'Editar', width: 130,renderCell: (params) => (
      <IconButton 
        color="primary" 
        onClick={() => {
          // Aquí puedes manejar el evento de clic del botón.
          // Por ejemplo, puedes redirigir a la página de edición del usuario con el id del usuario.
          console.log(`Editar usuario con id: ${params.row.id}`);
        }}
      >
        <EditIcon />
      </IconButton>
    ),}
];

function Usuarios() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    axios.get('/users')
      .then((response) => {
        const users = response.data.data;
        Promise.all(users.map(user => 
          axios.get(`/states/${user.state[0]}`)
            .then(response => {
              return { ...user, stateName: response.data.data.name };
            })
        ))
        .then(usersWithStateName => {
          setRows(usersWithStateName.map((user, index) => ({
            id: index,
            username: user.username,
            rut: user.rut,
            email: user.email,
            debt: user.debt,
            Estado: user.stateName
          })));
        });
    })
    .catch((error) => {
      console.error('Hubo un error al obtener los datos de los usuarios: ', error);
    });
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        
      />
    </div>
  );
}

export default Usuarios;

