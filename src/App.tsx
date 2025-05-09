
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { RoleProvider } from "./features/auth/context/RoleContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <Router>
          <AppRoutes />
        </Router>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
