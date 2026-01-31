import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import './App.css'

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" />
      <Router>
        <Switch>
          <Route path="/" component={HomePage} exact />
          <Route path="/chats" component={ChatPage} />
          <Route path="/admin" component={AdminLogin} exact />
          <Route path="/admin/dashboard" component={AdminDashboard} />
        </Switch>
      </Router>
    </div>
  );
}

export default App