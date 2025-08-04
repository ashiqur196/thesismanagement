// Router.tsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/authContext';
import SignIn from './auth/Signin';
import SignUp from './auth/Signup';
import Home from './pages/Home';
import Myprofile from './pages/accountSettings/Myprofile';
import Contributions from './pages/accountSettings/Contributions';
import Editprofile from './pages/accountSettings/Editprofile';
import SidebarLayout from './components/sidebar-layout';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" replace />
}

const AuthRoute = () => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

export default function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthRoute />}>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
      </Route>

      {/* Protected routes with sidebar layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/account/profile" element={<Myprofile />} />
          <Route path="/account/edit" element={<Editprofile/>} />
          <Route path="/account/contributions" element={<Contributions />} />
          {/* Add more protected routes here */}
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}