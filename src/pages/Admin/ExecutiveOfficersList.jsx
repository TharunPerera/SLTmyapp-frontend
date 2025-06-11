import React from 'react';

const ExecutiveOfficersList = ({ executives }) => {
  return (
    <div className="executive-list">
      <h2>Executive Officers</h2>
      <table>
        <thead>
          <tr>
            <th>Service Number</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {executives.map(exec => (
            <tr key={exec.serviceNumber}>
              <td>{exec.serviceNumber}</td>
              <td>{exec.fullName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExecutiveOfficersList;