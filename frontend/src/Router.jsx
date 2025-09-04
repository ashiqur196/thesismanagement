// Router.tsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
import SidebarLayout from "./components/sidebar-layout";
import ThesisLayout from "./components/ThesisLayout";

// Auth components
import SignIn from "./auth/Signin";
import SignUp from "./auth/Signup";

//Account settings components
import Myprofile from "./pages/accountSettings/Myprofile";
import Contributions from "./pages/accountSettings/Contributions";
import Editprofile from "./pages/accountSettings/Editprofile";

//Primary sidebar components
import Home from "./pages/Home";
import CreateThesis from "./pages/createThesis/CreateThesis";
import MyThesis from "./pages/myThesis/MyThesis";

//Thesis Sidebar components
import ThesisOverview from "./pages/thesisPages/thesisOverview/ThesisOverview";
import ThesisTasks from "./pages/thesisPages/thesisTasks/ThesisTasks";
import ThesisResources from "./pages/thesisPages/thesisResources/ThesisResources";
import ThesisAppointments from "./pages/thesisPages/thesisAppointments/ThesisAppointments";
import EditThesis from "./pages/thesisPages/thesisSettings/EditThesis";
import ThesisCollaborators from "./pages/thesisPages/thesisSettings/ThesisCollaborators";
import DeleteThesis from "./pages/thesisPages/thesisSettings/DeleteThesis";
import BrowseSupervisors from "./pages/browseSupervisors/BrowseSupervisors";
import Supervisor from "./pages/browseSupervisors/Supervisor";
import ViewThesis from "./pages/viewThesis/ViewThesis";
import SupervisingThesis from "./pages/supervising/SupervisingThesis";
import SupervisingRequests from "./pages/supervising/SupervisingRequests";
import SupervisingCompleted from "./pages/supervising/SupervisingCompleted";
import Requests from "./pages/thesisPages/thesisSettings/Requests";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

const AuthRoute = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

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
          <Route path="/supervisors" element={<BrowseSupervisors />} />
          <Route path="/supervisors/:id" element={<Supervisor/>} />
          <Route path="/createthesis" element={<CreateThesis />} />
          <Route path="/mythesis" element={<MyThesis />} />
          <Route path="/thesis-public/:thesisId" element={<ViewThesis />} />

          <Route path="/supervising" element={<SupervisingThesis />} />
          <Route path="/supervising/requests" element={<SupervisingRequests />} />
          <Route path="/supervising/completed" element={<SupervisingCompleted />} />

          <Route path="/account/profile" element={<Myprofile />} />
          <Route path="/account/edit" element={<Editprofile />} />
          <Route path="/account/contributions" element={<Contributions />} />
        </Route>
        <Route path="/thesis/:thesisId" element={<ThesisLayout />}>
          <Route index element={<ThesisOverview />} />
          <Route path="tasks" element={<ThesisTasks />} />
          <Route path="appointments" element={<ThesisAppointments />} />
          <Route path="resources" element={<ThesisResources />} />
          <Route path="settings">
            <Route index element={<Navigate to="edit" replace />} />
            <Route path="edit" element={<EditThesis />} />
            <Route path="requests" element={<Requests />} />
            <Route path="collaborators" element={<ThesisCollaborators />} />
            <Route path="delete" element={<DeleteThesis />} />
          </Route>
          {/* Add more thesis subroutes here */}
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
