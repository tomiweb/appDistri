import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Comercios from './pages/Comercios'
import ComercioForm from './pages/ComercioForm'
import ComercioDetalle from './pages/ComercioDetalle'
import Articulos from './pages/Articulos'
import ArticuloForm from './pages/ArticuloForm'
import Visitas from './pages/Visitas'
import VisitaForm from './pages/VisitaForm'
import VisitaDetalle from './pages/VisitaDetalle'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Comercios */}
          <Route
            path="/comercios"
            element={
              <ProtectedRoute>
                <Layout>
                  <Comercios />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/comercios/nuevo"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComercioForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/comercios/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComercioDetalle />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/comercios/:id/editar"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComercioForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Artículos */}
          <Route
            path="/articulos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Articulos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/articulos/nuevo"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArticuloForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/articulos/:id/editar"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArticuloForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Visitas */}
          <Route
            path="/visitas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Visitas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitas/nueva"
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitaForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitas/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitaDetalle />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
