import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/EnhancedAuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import Home from './pages/Home';
import LandingPage from './components/LandingPage';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import HealthMaps from './pages/HealthMaps';

// Auth Components
import Login from './pages/Login';
import Register from './pages/Register';
import OptimizedAdminLogin from './components/OptimizedAdminLogin';
import AdminLogin from './pages/AdminLogin';

// Dashboard Components
import DashboardHome from './pages/DashboardHome';
import Profile from './pages/Profile';
import InstantAnalysis from './pages/InstantAnalysis';
import ClubHealthMap from './pages/ClubHealthMap';

// Admin Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClubs from './pages/admin/AdminClubs';
import AdminUpload from './pages/admin/AdminUpload';

// Post-login portal
import PostLoginChooser from './pages/PostLoginChooser';
import AnalyzeImages from './pages/AnalyzeImages';
import GolfCourseMap from './components/GolfCourseMap';

// Route Protection
import { ClientRoute, AdminRoute, AuthenticatedRoute, RoleBasedRedirect } from './components/RoleBasedRoutes';

function App() {
  console.log('App rendering');
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/healthmaps" element={<HealthMaps />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<OptimizedAdminLogin />} />
                <Route path="/admin-signin" element={<AdminLogin />} />
                
                {/* Role-based redirect root */}
                <Route path="/auth-redirect" element={<RoleBasedRedirect />} />

                {/* Post-login portal (client + admin) */}
                <Route path="/portal" element={
                  <AuthenticatedRoute>
                    <PostLoginChooser />
                  </AuthenticatedRoute>
                } />
                <Route path="/portal/analyze" element={
                  <AuthenticatedRoute>
                    <AnalyzeImages />
                  </AuthenticatedRoute>
                } />
                <Route path="/portal/map" element={
                  <AuthenticatedRoute>
                    <GolfCourseMap />
                  </AuthenticatedRoute>
                } />
                
                {/* Admin area: layout renders the nested pages through <Outlet /> */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="clubs" element={<AdminClubs />} />
                  <Route path="upload" element={<AdminUpload />} />
                </Route>

                {/* Client Dashboard Routes - Temporarily simplified for testing */}
                <Route path="/dashboard" element={
                  <ClientRoute>
                    <DashboardHome />
                  </ClientRoute>
                } />
                <Route path="/dashboard/profile" element={
                  <ClientRoute>
                    <Profile />
                  </ClientRoute>
                } />
                <Route path="/dashboard/instant-analysis" element={
                  <ClientRoute>
                    <InstantAnalysis />
                  </ClientRoute>
                } />
                <Route path="/dashboard/health-map" element={
                  <ClientRoute>
                    <ClubHealthMap />
                  </ClientRoute>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
