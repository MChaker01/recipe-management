import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import "./index.css";

// TODO: Importer les pages quand on les créera

function App() {
  return (
    <>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<div>Home Page (TODO)</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" />
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
