import React, { useState, useEffect } from 'react';

const EditUserForm = ({ user, onUpdateUser, onCancel }) => {
  const [formData, setFormData] = useState({ ...user });

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(user.serviceNumber, formData);
  };

  return (
    <div className="form-container">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Number:</label>
          <input 
            type="text" 
            name="serviceNumber" 
            value={formData.serviceNumber} 
            onChange={handleChange} 
            disabled
          />
        </div>
        
        <div className="form-group">
          <label>First Name:</label>
          <input 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        {/* Include all other fields similar to AddUserForm */}
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">Update User</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;