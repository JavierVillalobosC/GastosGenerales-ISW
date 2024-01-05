import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form";
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';

function Users() {
  return (
    <AuthProvider>
      <Usuarios />
    </AuthProvider>
  );
}



function Usuarios() {

  const [openForm, setOpenForm] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const { register, handleSubmit } = useForm();
  const [roles, setRoles] = React.useState([]);
  const [states, setStates] = React.useState([]);

  const fetchRolesAndStates = async () => {
    const rolesFromDb = await axios.get('/roles');
    const statesFromDb = await axios.get('/states');
    setRoles(rolesFromDb.data.data);
    setStates(statesFromDb.data.data);
  };

  const handleEditClick = (user) => {

    if (user && user._id) {

      setEditingUser(user);
      setOpen(true);
    } else {
      console.error('No se puede editar el usuario: user o user._id es undefined');
    }
  };
  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };
  const onSubmitcreate = async (data) => {
    //console.log('data:', data);
    // Buscar el rol y el estado por su nombre
    console.log('data:', data);
    const role = await axios.get(`/roles/name/${data.roles}`);
    const state = await axios.get(`/states/name/${data.state}`);
    console.log('role:', role);
    console.log('state:', state);
    // Reemplazar los nombres por los ObjectIds
    data.roles = [role.data.data.name];
    data.state = [state.data.data.name];
    data.debt = Number(data.debt);
    console.log('data:', data);
    axios.post('/users', data)
      .then((response) => {
        console.log(response);
        setOpenForm(false);
        // Aquí puedes actualizar tus datos de usuario (rows) si es necesario
      })
      .catch((error) => {
        console.error('Hubo un error al crear el usuario: ', error);
      });
  };
  const onSubmitedit = async (data) => {
    console.log('editingUser:', editingUser);
    console.log('data:', data);
    const role = await axios.get(`/roles/name/${data.roles}`);
    const state = await axios.get(`/states/name/${data.state}`);
    data.roles = [role.data.data.name];
    data.state = [state.data.data.name];
    console.log('role:', role);
    console.log('state:', state);
    data.debt = Number(data.debt);
    if (editingUser && editingUser._id) {
      axios.put(`/users/${editingUser._id}`, data)
        .then((response) => {
          console.log(response);
          setOpen(false);
        })
        .catch((error) => {
          console.error('Hubo un error al actualizar el usuario: ', error);
        });
    } else {
      console.error('No se puede actualizar el usuario: editingUser o editingUser._id es undefined');
    }
  };

  const columns = [
    { field: 'id', headerName: '#', flex: 1 },
    { field: 'username', headerName: 'Usuario', flex: 1 },
    { field: 'rut', headerName: 'RUT', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'debt', headerName: 'Deuda Total (CLP)', flex: 1, valueFormatter: (params) => `$${params.value}`},
    { field: 'Estado', headerName: 'Estado', flex: 1 },
    {
      field: 'edit', headerName: 'Editar', flex: 1, renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => handleEditClick(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    }
  ];

  React.useEffect(() => {
    fetchRolesAndStates();
    axios.get('/users')
      .then((response) => {
        console.log(response);
        const users = response.data.data;
        Promise.all(users.map(user =>
          axios.get(`/states/${user.state[0]}`)
            .then(response => {
              return { ...user, stateName: response.data.data.name };
            })
        ))
          .then(usersWithStateName => {
            setRows(usersWithStateName.map((user, index) => ({
              _id: user._id,
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
    <div style={{
      backgroundColor: 'white',
      height: '100vh',
      width: '100%',
      display: 'flex',

      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <IconButton color="primary" onClick={handleOpenForm}>
        <AddIcon />
      </IconButton>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        pagination={true}
      />
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>Crear Usuario</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitcreate)}>
          <DialogContent>
            <Box display="flex" flexDirection="column">
              <TextField label="Nombre" {...register("username")} style={{ marginBottom: '10px' }} />
              <TextField label="RUT" {...register("rut")} style={{ marginBottom: '10px' }} />
              <TextField label="Email" {...register("email")} style={{ marginBottom: '10px' }} />
              <TextField label="Contraseña" type="password" {...register("password")} style={{ marginBottom: '10px' }} />

              <FormControl style={{ marginBottom: '10px' }}>
                <InputLabel id="roles-label">Roles</InputLabel>
                <Select labelId="roles-label" {...register("roles")}>
                  {roles.map((role) => (
                    <MenuItem value={role.name}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl style={{ marginBottom: '10px' }}>
                <InputLabel id="state-label">Estado</InputLabel>
                <Select labelId="state-label" {...register("state")}>
                  {states.map((state) => (
                    <MenuItem value={state.name}>{state.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Deuda Total (CLP)" {...register("debt")} style={{ marginBottom: '10px' }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitedit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column">
              <TextField label="Usuario" {...register("username")} style={{ marginBottom: '10px' }} defaultValue={editingUser?.username} />
              <TextField label="RUT" {...register("rut")} style={{ marginBottom: '10px' }} defaultValue={editingUser?.rut} />
              <TextField label="Email" {...register("email")} style={{ marginBottom: '10px' }} defaultValue={editingUser?.email} />
              <TextField label="Contraseña" type="password" {...register("password")} style={{ marginBottom: '10px' }} />
              <FormControl style={{ marginBottom: '10px' }}>
                <InputLabel id="roles-label">Roles</InputLabel>
                <Select labelId="roles-label" {...register("roles")} defaultValue={editingUser?.roles?.join(', ')}>
                  {roles.map((role) => (
                    <MenuItem value={role.name}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl style={{ marginBottom: '10px' }}>
                <InputLabel id="state-label">Estado</InputLabel>
                <Select labelId="state-label" {...register("state")} defaultValue={editingUser?.state?.join(', ')}>
                  {states.map((state) => (
                    <MenuItem value={state.name}>{state.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Deuda Total (CLP)" {...register("debt")} defaultValue={editingUser?.debt} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default Usuarios;

