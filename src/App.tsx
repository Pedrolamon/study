
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import Tasks from './pages/Tasks';
import Agenda from './pages/Agenda';
import Simulados from './pages/Simulados';
import Desempenho from './pages/Desempenho';
import Conquistas from './pages/Conquistas';
import Configuracoes from './pages/Configuracoes';
import Materiais from './pages/Materiais';
import Login from './pages/Login';
import Register from './pages/Register';
import PWAInstallPrompt from './components/PWAInstallPrompt';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/timer" element={
            <ProtectedRoute>
              <Layout>
                <Timer />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tarefas" element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/agenda" element={
            <ProtectedRoute>
              <Layout>
                <Agenda />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/simulados" element={
            <ProtectedRoute>
              <Layout>
                <Simulados />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/desempenho" element={
            <ProtectedRoute>
              <Layout>
                <Desempenho />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/conquistas" element={
            <ProtectedRoute>
              <Layout>
                <Conquistas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/materiais" element={
            <ProtectedRoute>
              <Layout>
                <Materiais />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <Layout>
                <Configuracoes />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </Router>
    </AuthProvider>
  );
}

export default App;
