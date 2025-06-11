import React, { useState } from 'react';

const AddUserForm = ({ onAddUser }) => {
  const [userData, setUserData] = useState({
    serviceNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'User',
    designation: '',
    section: '',
    group: '',
    contactNumber: '',
    employment: 'Permanent',
    branch: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser(userData);
    setUserData({
      serviceNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User',
      designation: '',
      section: '',
      group: '',
      contactNumber: '',
      employment: 'Permanent',
      branch: ''
    });
  };

  return (
    <div className="form-container">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Number:</label>
          <input 
            type="text" 
            name="serviceNumber" 
            value={userData.serviceNumber} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>First Name:</label>
          <input 
            type="text" 
            name="firstName" 
            value={userData.firstName} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Last Name:</label>
          <input 
            type="text" 
            name="lastName" 
            value={userData.lastName} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={userData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={userData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={userData.role} onChange={handleChange}>
            <option value="User">User</option>
            <option value="Executive Officer">Executive Officer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Designation:</label>
          <input 
            type="text" 
            name="designation" 
            value={userData.designation} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Section:</label>
          <input 
            type="text" 
            name="section" 
            value={userData.section} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Group:</label>
          <input 
            type="text" 
            name="group" 
            value={userData.group} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Contact Number:</label>
          <input 
            type="text" 
            name="contactNumber" 
            value={userData.contactNumber} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Employment Type:</label>
          <select name="employment" value={userData.employment} onChange={handleChange}>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Branch:</label>
          <input 
            type="text" 
            name="branch" 
            value={userData.branch} 
            onChange={handleChange} 
          />
        </div>
        
        <button type="submit" className="submit-btn">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;