import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

function Blacklist() {
  const [users, setUsers] = React.useState([]);

  const columns = [
    { field: '_id', headerName: 'ID del Usuario', width: 220 },
    { field: 'username', headerName: 'Usuario', width: 130 },
    { field: 'rut', headerName: 'RUT', width: 130 },
    { field: 'email', headerName: 'Correo Electrónico', width: 300 },
    { field: 'debt', headerName: 'Deuda (CLP)', width: 200, valueFormatter: (params) => `$${Math.round(params.value).toLocaleString('es-CL')}` }, 
    // add more columns as needed
  ];

  
  React.useEffect(() => {
    axios.get('http://localhost:5000/api/deudas/')
    .then(response => {
      console.log(response.data);
      if (response.data) {
        setUsers(response.data);
      } else {
        console.error('La respuesta de la API no contiene datos');
      }
    })
    .catch(error => {
      console.error('Error al obtener las deudas:', error);
    });
    axios.get('http://localhost:5000/api/interes/')
  .then(response => {
    console.log(response.data);
    if (response.data.usuariosEnListaNegra) {
      setUsers(response.data.usuariosEnListaNegra);
    } else {
      console.error('La respuesta de la API no contiene usuariosEnListaNegra');
    }
  })
  .catch(error => {
    console.error('Error al obtener los usuarios:', error);
  });
  }, []);

  return (
    <div style={{ backgroundColor: 'white', 
      height: '100vh', 
      width: '100%', 
      /* display: 'flex',  */
      justifyContent: 'center', 
      alignItems: 'center'  }}>
      <h1>Usuarios en lista negra</h1>
      <DataGrid 
  rows={users} 
  columns={columns} 
  pageSize={5} 
  getRowId={(row) => row._id} 
/>
    </div>
  );
}

export default Blacklist;