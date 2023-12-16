import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ListItemButton, AppBar, Toolbar, CssBaseline, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';

function Root() {
  return (
    <AuthProvider>
      <PageRoot />
    </AuthProvider>
  );
}


function PageRoot() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
        <img src="../logo.png" alt="Logo" style={{ height: '50px', marginRight: '10px' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pagos Generales del Municipio
          </Typography>
          <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
            Estas logeado como: {user.email}
          </Typography>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>Cerrar sesion</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: '240px', flexShrink: 0 }}>
        <Drawer variant="permanent" open sx={{ '& .MuiDrawer-paper': { mt: '64px', height: 'calc(100% - 64px)'} }}>
          <List>
            {/* Aquí puedes agregar los elementos de tu barra lateral */}
            <ListItemButton key="Usuarios">
                <ListItemText primary="Usuarios" />
            </ListItemButton>
            <ListItemButton key="Deudas">
                <ListItemText primary="Deudas" />
            </ListItemButton>
            <ListItemButton key="Pagos">
                <ListItemText primary="Pagos" />
            </ListItemButton>
            <ListItemButton key="Reportes">
                <ListItemText primary="Reportes" />
            </ListItemButton>
            <ListItemButton key="Servicios">
                <ListItemText primary="Servicios" />
            </ListItemButton>
            <ListItemButton key="Notificaciones">
                <ListItemText primary="Notificaciones" />
            </ListItemButton>
            <ListItemButton key="Apelaciones">
                <ListItemText primary="Apelaciones" />
            </ListItemButton>
          </List>
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '240px' }}>
        <Toolbar /> {/* This is necessary to ensure the main content starts below the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}



export default Root;
