import ReactDOM from 'react-dom/client';
import App from './routes/App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './routes/Root.jsx';
import ErrorPage from './routes/ErrorPage.jsx';
import Login from './routes/Login.jsx';
import Usuarios from './routes/usuarios.jsx';
import Pagos from './routes/Pagos.jsx';
import Deudas from './routes/Deudas.jsx';
import Appeal from './routes/Appeal.jsx';
import Blacklist from './routes/Blacklist.jsx';
import Notificaciones from './routes/Notificaciones.jsx'
import DebtorAppeal from './routes/DebtorAppeal.jsx';
import Report from './routes/ReportDebts.jsx';
import ReportPays from './routes/ReportPays.jsx';


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
        path: '/pagos', // Ruta para la vista de Pagos
        element: <Pagos />, // Componente Pagos
      },
      {
        path: '/deudas', // Ruta para la vista de Deudas
        element: <Deudas />, // Componente Deudas
      },
      {
        path: '/apelaciones', // Ruta para la vista de Apelaciones
        element: <Appeal />, // Componente Appeal
      },
      {
        path: '/apelacionescrear', // Ruta sin el parámetro userId
        element: <DebtorAppeal />, // Componente DebtorAppeal
      },
      {
        path: '/apelacionescrear/:userId', // Ruta con el parámetro userId
        element: <DebtorAppeal />, // Componente DebtorAppeal
      },
      {
        path: '/reportedeudas', // Ruta para la vista de Reportes
        element: <Report />, // Componente Report
      },
      {
        path: '/reportepagos', // Ruta para la vista de Reportes
        element: <ReportPays />, // Componente Report
      },
      {
        path: '/Notificaciones', // Ruta para la vista de Notificaciones
        element: <Notificaciones />, // Componente Notificaciones
      },
      {
        path: '/blacklist', // Ruta para la vista de Blacklist
        element: <Blacklist />, // Componente Blacklist
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
