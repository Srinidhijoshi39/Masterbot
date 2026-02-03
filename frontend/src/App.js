import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [verifyId, setVerifyId] = useState('');
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ totalClients: 0, totalBots: 0, activeBots: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [activeTab, setActiveTab] = useState('register');
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats({
        totalClients: response.data.total_clients,
        totalBots: response.data.total_bots,
        activeBots: response.data.active_bots
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
      fetchStats();
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };



  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      setResult(response.data);
      if (response.data.success) {
        setFormData({ name: '', email: '', phone: '' });
        fetchClients();
        fetchStats();
        setActiveTab('dashboard');
        setShowToast({ type: 'success', message: 'Client registered successfully!' });
        setTimeout(() => setShowToast(null), 3000);
      }
    } catch (error) {
      setResult({ success: false, error: 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/verify`, { bot_id: verifyId });
      setResult({ 
        success: response.data.authorized, 
        message: response.data.authorized ? '✅ Bot Authorized' : '❌ Bot Not Authorized' 
      });
      if (response.data.authorized) {
        setShowToast({ type: 'success', message: 'Bot verified successfully!' });
        setTimeout(() => setShowToast(null), 3000);
      }
    } catch (error) {
      setResult({ success: false, error: 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const viewClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const deleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`${API_URL}/delete/${clientId}`);
        fetchClients();
        fetchStats();
        setShowToast({ type: 'success', message: 'Client deleted successfully!' });
        setTimeout(() => setShowToast(null), 3000);
      } catch (error) {
        setShowToast({ type: 'error', message: 'Failed to delete client' });
        setTimeout(() => setShowToast(null), 3000);
      }
    }
  };

  return (
    <div className="App">
      <div className="header">
        <div className="header-left">
          <div className="brand">
            <span className="brand-icon">🤖</span>
            <div className="brand-text">
              <h1>BotHub Central</h1>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">{stats.totalClients}</div>
              <div className="stat-label">Total Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalBots}</div>
              <div className="stat-label">Total Bots</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.activeBots}</div>
              <div className="stat-label">Active Bots</div>
            </div>
            <button 
              className="view-all-btn"
              onClick={() => setShowClientModal(true)}
              title="View All Clients"
            >
              View All
            </button>
          </div>
        </div>
      </div>
      
      <div className="app-layout">
        <div className="sidebar">
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Clients</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </button>
          </nav>
        </div>

        <div className="main-content">
        {activeTab === 'register' && (
          <div className="tab-content">
            <div className="premium-section register-section">
              <div className="section-header">
                <h2>Register New Client</h2>
              </div>
              <form onSubmit={handleRegister} className="premium-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                
                {result && !result.success && activeTab === 'register' && (
                  <div className="inline-error">
                    ❌ {result.error}
                  </div>
                )}
                
                <button type="submit" className="premium-btn primary" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register Client'}
                </button>
              </form>
            </div>
          </div>
        )}



        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <div className="premium-section">
              <div className="section-header">
                <h2>Registered Clients</h2>
              </div>
              <div className="premium-table">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Registered</th>
                        <th>Client ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Bot ID</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client, index) => (
                        <tr key={client.client_id} className={index % 2 === 0 ? 'even' : 'odd'}>
                          <td className="text-gray">{client.created_at || 'N/A'}</td>
                          <td><span className="client-id">{client.client_id}</span></td>
                          <td className="font-medium">{client.name}</td>
                          <td className="text-gray">{client.email}</td>
                          <td><span className="client-id">{client.bot_id}</span></td>
                          <td>
                            <span className="status-badge active">
                              Active
                            </span>
                          </td>
                          <td>
                            <button 
                              className="delete-btn"
                              onClick={() => deleteClient(client.client_id)}
                              title="Delete Client"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}


        </div>
      </div>
      
      {showToast && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}
      
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Client Data</h3>
              <button className="close-btn" onClick={() => setShowClientModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Registered</th>
                      <th>Client ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Bot ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr key={client.client_id} className={index % 2 === 0 ? 'even' : 'odd'}>
                        <td className="text-gray">{client.created_at || 'N/A'}</td>
                        <td><span className="client-id">{client.client_id}</span></td>
                        <td className="font-medium">{client.name}</td>
                        <td className="text-gray">{client.email}</td>
                        <td className="text-gray">{client.phone}</td>
                        <td><span className="client-id">{client.bot_id}</span></td>
                        <td>
                          <span className="status-badge active">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;