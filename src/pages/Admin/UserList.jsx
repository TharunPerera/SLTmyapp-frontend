import React from 'react';

const UserList = ({ users, onSelectUser, onDeleteUser, onEditUser }) => {
  return (
    <div className="user-list">
      <h2>User List</h2>
      <table>
        <thead>
          <tr>
            <th>Service Number</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.serviceNumber}>
              <td>{user.serviceNumber}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.role}</td>
              <td className="actions">
                <button onClick={() => onSelectUser(user.serviceNumber)}>View</button>
                <button onClick={() => onEditUser(user)}>Edit</button>
                <button onClick={() => onDeleteUser(user.serviceNumber)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;