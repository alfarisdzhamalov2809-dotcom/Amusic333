import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-wrapper">
              <Layout />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;