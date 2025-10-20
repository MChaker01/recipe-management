import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "./index.css";
import HomePage from "./pages/HomePage";

// TODO: Importer les pages quand on les créera

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipes/:id" />

        {/* Routes protégées */}
        <Route
          path="/my-recipes"
          element={
            <ProtectedRoute>
              <div>My Recipes Page (TODO)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-recipe"
          element={
            <ProtectedRoute>
              <div>Add Recipe Page (TODO)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-recipe/:id"
          element={
            <ProtectedRoute>
              <div>Edit Recipe Page (TODO)</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
