import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ListItemButton, ListItemIcon, AppBar, Toolbar, CssBaseline, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportIcon from '@mui/icons-material/Report';
import ServicesIcon from '@mui/icons-material/RoomService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AppealIcon from '@mui/icons-material/ReportProblem';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DoNotTouchIcon from '@mui/icons-material/DoNotTouch';

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

  if(!user?.roles?.[0].name){
    return(<div>Loading...</div>)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,  backgroundColor: '#154360  '}}>
        <Toolbar>
        <img src="../logo.png" alt="Logo" style={{ height: '50px', marginRight: '10px' }} />
        <Button color="inherit"  style={{ padding: '22px'}} onClick={() => navigate('/')}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pagos Generales del Municipio
          </Typography>
        </Button>
          <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
            Estas logeado como: {user.email}
          </Typography>

          <Button color="inherit" onClick={handleLogout}>Cerrar sesion</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: '10px', flexShrink: 0 }}>
        <Drawer variant="permanent" open sx={{ '& .MuiDrawer-paper': { mt: '64px',  width: '200px',height: 'calc(100% - 64px)', backgroundColor: '#222a2d '} }}>
          <List>
            {/* Aquí puedes agregar los elementos de tu barra lateral */}
            {user.roles[0].name === 'admin' && (
            <>
            <ListItemButton key="Usuarios" component={Link} to="/usuarios">
              <ListItemIcon style={{ color: '#FFFFFF' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" style={{ color: '#FFFFFF' }}/>
            </ListItemButton>
            <ListItemButton key="Reportes">
              <ListItemIcon>
                <ReportIcon style={{ color: '#FFFFFF' }}/>
              </ListItemIcon>
              <ListItemText primary="Reportes" style={{ color: '#FFFFFF' }}/>
            </ListItemButton>

            <ListItemButton key="Servicios">
            <ListItemIcon>
            <ServicesIcon style={{ color: '#FFFFFF' }}/>
            </ListItemIcon>
                <ListItemText primary="Servicios" style={{ color: '#FFFFFF' }}/>
            </ListItemButton>
            <ListItemButton key="Notificaciones" component={Link} to="/Notificaciones">
            <ListItemIcon>
            <NotificationsIcon style={{ color: '#FFFFFF' }}/>
            </ListItemIcon>
                <ListItemText primary="Notificaciones" style={{ color: '#FFFFFF' }}/>
            </ListItemButton></>
            )}
            <ListItemButton key="Deudas" component={Link} to="/deudas">
            <ListItemIcon>
              <MoneyOffIcon style={{ color: '#FFFFFF' }}/>
              </ListItemIcon>
                <ListItemText primary="Deudas" style={{ color: '#FFFFFF' }}/>
            </ListItemButton>
            <ListItemButton key="Pagos" component={Link} to="/pagos" >
            <ListItemIcon>
            <PaymentIcon style={{ color: '#FFFFFF' }}/>
            </ListItemIcon>
                <ListItemText primary="Pagos" style={{ color: '#FFFFFF' }}/>
            </ListItemButton>
      
            <ListItemButton key="Apelaciones" component={Link} to="/apelaciones">
                <ListItemIcon>
                  <ReportProblemIcon style={{ color: '#FFFFFF' }}/>
                </ListItemIcon>
                <ListItemText primary="Apelaciones" style={{ color: '#FFFFFF' }}/>
              </ListItemButton>
            <ListItemButton key="Crear Apelación" component={Link} to="/apelacionescrear">
                <ListItemIcon>
                  <ReportProblemIcon style={{ color: '#FFFFFF' }}/>
                </ListItemIcon>
                <ListItemText primary="Crear Apelación" style={{ color: '#FFFFFF' }}/>
              </ListItemButton>
              <ListItemButton key="Reportes" component={Link} to="/reportes">
            <ListItemIcon>
              <AssessmentIcon style={{ color: '#FFFFFF' }}/>
            </ListItemIcon>
            <ListItemText primary="Reportes" style={{ color: '#FFFFFF' }}/>
          </ListItemButton>

          {user.roles[0].name === 'admin' && (
    <ListItemButton key="Blacklist" component={Link} to="/blacklist">
        <ListItemIcon style={{ color: '#FFFFFF' }}>
            <DoNotTouchIcon />
        </ListItemIcon>
        <ListItemText primary="Blacklist" style={{ color: '#FFFFFF' }}/>
    </ListItemButton>
)}
                    
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
