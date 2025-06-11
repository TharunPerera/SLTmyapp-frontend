import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Update these imports in AdminDashboard1.jsx
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import './AdminDashboard.css'; // Add this line
import UserDetails from './UserDetails';
import ExecutiveOfficersList from './ExecutiveOfficersList';
import EditUserForm from './EditUserForm';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [executives, setExecutives] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchExecutives();
  }, []);

  const fetchUsers = async () => {
    try {
      // You might need to implement a getAllUsers endpoint
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchExecutives = async () => {
    try {
      const response = await axios.get('/api/users/executive');
      setExecutives(response.data);
    } catch (error) {
      console.error('Error fetching executives:', error);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const response = await axios.post('/api/users', userData);
      setUsers([...users, response.data]);
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleUpdateUser = async (serviceNumber, userData) => {
    try {
      const response = await axios.put(`/api/users/${serviceNumber}`, userData);
      setUsers(users.map(u => u.serviceNumber === serviceNumber ? response.data : u));
      setIsEditing(false);
      setSelectedUser(null);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (serviceNumber) => {
    try {
      await axios.delete(`/api/users/${serviceNumber}`);
      setUsers(users.filter(u => u.serviceNumber !== serviceNumber));
      setSelectedUser(null);
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSelectUser = async (serviceNumber) => {
    try {
      const response = await axios.get(`/api/users/${serviceNumber}`);
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    // Clear authentication token and redirect to login
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={activeTab === 'executives' ? 'active' : ''}
          onClick={() => setActiveTab('executives')}
        >
          Executive Officers
        </button>
        <button 
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add New User
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'users' && (
          <div className="user-management">
            <UserList 
              users={users} 
              onSelectUser={handleSelectUser} 
              onDeleteUser={handleDeleteUser}
              onEditUser={(user) => {
                setSelectedUser(user);
                setIsEditing(true);
              }}
            />
            {selectedUser && !isEditing && (
              <UserDetails user={selectedUser} />
            )}
            {isEditing && (
              <EditUserForm 
                user={selectedUser} 
                onUpdateUser={handleUpdateUser}
                onCancel={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'executives' && (
          <ExecutiveOfficersList executives={executives} />
        )}

        {activeTab === 'add' && (
          <AddUserForm onAddUser={handleAddUser} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;