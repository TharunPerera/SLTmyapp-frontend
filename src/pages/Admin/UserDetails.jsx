import React from 'react';

const UserDetails = ({ user }) => {
  return (
    <div className="user-details">
      <h2>User Details</h2>
      <div className="details-grid">
        <div>
          <strong>Service Number:</strong> {user.serviceNumber}
        </div>
        <div>
          <strong>Name:</strong> {user.firstName} {user.lastName}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Role:</strong> {user.role}
        </div>
        <div>
          <strong>Designation:</strong> {user.designation}
        </div>
        <div>
          <strong>Section:</strong> {user.section}
        </div>
        <div>
          <strong>Group:</strong> {user.group}
        </div>
        <div>
          <strong>Contact Number:</strong> {user.contactNumber}
        </div>
        <div>
          <strong>Employment Type:</strong> {user.employment}
        </div>
        <div>
          <strong>Branch:</strong> {user.branch}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;