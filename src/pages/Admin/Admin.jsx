// // src/pages/Admin/Admin.jsx
// import React from 'react';

// export default function Admin() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Requests</h2>
//           <p className="text-3xl font-bold text-blue-600">257</p>
//         </div>
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-700 mb-2">Pending Approval</h2>
//           <p className="text-3xl font-bold text-yellow-600">42</p>
//         </div>
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-700 mb-2">Dispatched</h2>
//           <p className="text-3xl font-bold text-green-600">183</p>
//         </div>
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-700 mb-2">Rejected</h2>
//           <p className="text-3xl font-bold text-red-600">32</p>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-lg font-semibold text-gray-700 mb-4">Admin Controls</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <button className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 text-left">
//             <span className="font-medium">User Management</span>
//             <p className="text-sm text-gray-500 mt-1">Add, edit, or deactivate users</p>
//           </button>
//           <button className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 text-left">
//             <span className="font-medium">System Settings</span>
//             <p className="text-sm text-gray-500 mt-1">Configure system parameters</p>
//           </button>
//           <button className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 text-left">
//             <span className="font-medium">Reports</span>
//             <p className="text-sm text-gray-500 mt-1">Generate system reports</p>
//           </button>
//           <button className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 text-left">
//             <span className="font-medium">Logs</span>
//             <p className="text-sm text-gray-500 mt-1">View system logs and activity</p>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    serviceNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    designation: '',
    section: '',
    group: '',
    contactNumber: '',
    employment: '',
    branch: ''
  });
  const [executiveSearchTerm, setExecutiveSearchTerm] = useState('');
  const [generalSearchTerm, setGeneralSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [mode, setMode] = useState('view-executives');
  const [deleteId, setDeleteId] = useState('');
  const [generalUserResult, setGeneralUserResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAllExecutives();
  }, []);

  const fetchAllExecutives = async () => {
    try {
      setMessage({ text: 'Loading executive users...', isError: false });
      
      // First get the list of executive users
      const executivesResponse = await axios.get('http://localhost:9077/api/users/executive');
      
      // Then fetch full details for each user
      const usersWithDetails = await Promise.all(
        executivesResponse.data.map(async (executive) => {
          try {
            const userResponse = await axios.get(`http://localhost:9077/api/users/${executive.serviceNumber}`);
            return {
              ...userResponse.data,
              fullName: `${userResponse.data.firstName} ${userResponse.data.lastName}`
            };
          } catch (error) {
            console.error(`Failed to fetch details for user ${executive.serviceNumber}:`, error);
            return {
              ...executive,
              fullName: executive.fullName || 'Unknown User',
              email: 'N/A',
              role: 'N/A'
            };
          }
        })
      );
      
      setUsers(usersWithDetails);
      setMessage({ text: '', isError: false });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({ text: 'Failed to fetch users. Please try again.', isError: true });
    }
  };

  const fetchUserByServiceNumber = async () => {
    if (!generalSearchTerm.trim()) {
      showMessage('Please enter a service number to search', true);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:9077/api/users/${generalSearchTerm}`);
      if (response.data) {
        const userData = {
          ...response.data,
          fullName: `${response.data.firstName} ${response.data.lastName}`
        };
        setGeneralUserResult(userData);
        showMessage('User found successfully!');
      } else {
        setGeneralUserResult(null);
        showMessage('No user found with that service number', true);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setGeneralUserResult(null);
      showMessage('Failed to find user with that service number', true);
    } finally {
      setIsSearching(false);
    }
  };

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:9077/api/users', formData);
      showMessage('User added successfully!');
      setMode('view-executives');
      setFormData(initialFormData());
      fetchAllExecutives();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add user', true);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:9077/api/users/${formData.serviceNumber}`,
        formData
      );
      showMessage('User updated successfully!');
      setMode('view-executives');
      
      // If we were editing a general user, clear the search result
      if (generalUserResult && generalUserResult.serviceNumber === formData.serviceNumber) {
        setGeneralUserResult(null);
        setGeneralSearchTerm('');
      }
      
      fetchAllExecutives();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to update user', true);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:9077/api/users/${deleteId}`);
      showMessage('User deleted successfully!');
      setMode('view-executives');
      setDeleteId('');
      fetchAllExecutives();
      
      // Clear general user result if that was the deleted user
      if (generalUserResult && generalUserResult.serviceNumber === deleteId) {
        setGeneralUserResult(null);
        setGeneralSearchTerm('');
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete user', true);
    }
  };

  const handleEditClick = async (serviceNumber) => {
    try {
      const response = await axios.get(`http://localhost:9077/api/users/${serviceNumber}`);
      setFormData(response.data);
      setMode('edit');
    } catch (error) {
      showMessage('Failed to fetch user details', true);
    }
  };

  const handleDeleteClick = () => {
    setMode('delete');
  };

  const filteredExecutiveUsers = users.filter(user => 
    user.serviceNumber.toLowerCase().includes(executiveSearchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(executiveSearchTerm.toLowerCase()))
  );

  const initialFormData = () => ({
    serviceNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    designation: '',
    section: '',
    group: '',
    contactNumber: '',
    employment: '',
    branch: ''
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Message Popup */}
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage({ text: '', isError: false })} 
            className="ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex flex-wrap space-x-2 space-y-2 sm:space-y-0 mb-6">
        <button 
          onClick={() => setMode('view-executives')} 
          className={`px-4 py-2 rounded ${mode === 'view-executives' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          View Executive Users
        </button>
        <button 
          onClick={() => setMode('view-all-users')} 
          className={`px-4 py-2 rounded ${mode === 'view-all-users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Search All Users
        </button>
        <button 
          onClick={() => {
            setMode('add');
            setFormData(initialFormData());
          }} 
          className={`px-4 py-2 rounded ${mode === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Add User
        </button>
        <button 
          onClick={handleDeleteClick} 
          className={`px-4 py-2 rounded ${mode === 'delete' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Delete User
        </button>
      </div>

      {/* View Executive Users Mode */}
      {mode === 'view-executives' && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search executive users by name or service number..."
              className="w-full p-2 border rounded"
              value={executiveSearchTerm}
              onChange={(e) => setExecutiveSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExecutiveUsers.length > 0 ? (
                  filteredExecutiveUsers.map((user) => (
                    <tr key={user.serviceNumber}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.serviceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.designation || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(user.serviceNumber)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No executive users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View All Users Mode */}
      {mode === 'view-all-users' && (
        <div>
          <div className="mb-4 flex">
            <input
              type="text"
              placeholder="Enter exact service number to search..."
              className="flex-grow p-2 border rounded-l"
              value={generalSearchTerm}
              onChange={(e) => setGeneralSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUserByServiceNumber()}
            />
            <button
              onClick={fetchUserByServiceNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded-r"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {generalUserResult && (
            <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">{generalUserResult.serviceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{generalUserResult.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{generalUserResult.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{generalUserResult.role || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{generalUserResult.designation || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(generalUserResult.serviceNumber)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {!generalUserResult && !isSearching && generalSearchTerm && (
            <div className="p-4 bg-gray-100 text-center rounded">
              No user found with service number: {generalSearchTerm}
            </div>
          )}
          
          {!generalUserResult && !generalSearchTerm && (
            <div className="p-4 bg-gray-100 text-center rounded">
              Enter a service number to search for any user in the system
            </div>
          )}
        </div>
      )}

      {/* Add Mode */}
      {mode === 'add' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Add New User</h2>
          
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Service Number*</label>
                <input
                  type="text"
                  name="serviceNumber"
                  value={formData.serviceNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Password*</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Role*</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Employee">Employee</option>
                  <option value="Executive Officer">Executive Officer</option>
                  <option value="Duty Officer">Duty Officer</option>
                  <option value="Security Officer">Security Officer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Group</label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Employment Type*</label>
                <select
                  name="employment"
                  value={formData.employment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="SLT">SLT</option>
                  <option value="Non-SLT">Non-SLT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setMode('view-executives')}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Mode */}
      {mode === 'edit' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Edit User - {formData.serviceNumber}</h2>
          
          <form onSubmit={handleUpdateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Service Number</label>
                <input
                  type="text"
                  value={formData.serviceNumber}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Group</label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Employment Type</label>
                <select
                  name="employment"
                  value={formData.employment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Type</option>
                  <option value="SLT">SLT</option>
                  <option value="Non-SLT">Non-SLT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setMode('view-executives')}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Mode */}
      {mode === 'delete' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Delete User</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Service Number*</label>
            <input
              type="text"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter service number to delete"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setMode('view-executives')}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500 text-white rounded"
              disabled={!deleteId}
            >
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;