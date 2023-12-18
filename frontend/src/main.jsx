import ReactDOM from 'react-dom/client';
import App from './routes/App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './routes/Root.jsx';
import ErrorPage from './routes/ErrorPage.jsx';
import Login from './routes/Login.jsx';
import Usuarios from './routes/usuarios.jsx';
import Notificaciones from './routes/Notificaciones.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/usuarios', // Ruta para la vista de Usuarios
        element: <Usuarios />, // Componente Usuarios
      },
      {
        path: '/notificaciones', // Ruta para la vista de Notificaciones
        element: <Notificaciones />, // Componente Notificaciones
      },
    ],
  },
  {
    path: '/auth',
    element: <Login />,
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
