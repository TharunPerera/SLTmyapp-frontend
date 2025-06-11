// // src/components/Navbar.jsx
// import { useAuth } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   if (!user) return null;

//   return (
//     <nav className="bg-blue-600 text-white p-4 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//         <div className="flex space-x-4">
//           {/* Employee links */}
//           {user.role === 'Employee' && (
//             <>
//               <Link to="/gate-pass" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 Create Gate Pass
//               </Link>
//               <Link to="/my-requests" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 My Requests
//               </Link>
//               <Link to="/my-receipts" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 My Receipts
//               </Link>
//             </>
//           )}
          
//           {/* Admin link */}
//           {user.role === 'Admin' && (
//             <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded">
//               Admin Dashboard
//             </Link>
//           )}
          
//           {/* Executive Officer link */}
//           {user.role === 'Executive Officer' && (
//             <Link to="/executive-approve" className="hover:bg-blue-700 px-3 py-2 rounded">
//               Approve Requests
//             </Link>
//           )}
          
//           {/* Duty Officer link */}
//           {user.role === 'Duty Officer' && (
//             <Link to="/verify" className="hover:bg-blue-700 px-3 py-2 rounded">
//               Verify Requests
//             </Link>
//           )}
          
//           {/* Security Officer links */}
//           {user.role === 'Security Officer' && (
//             <>
//               <Link to="/dispatch" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 Dispatch Management
//               </Link>
//               <Link to="/item-tracker" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 Item Tracker
//               </Link>
//             </>
//           )}
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <span className="text-sm">
//             {user.name} ({user.role})
//           </span>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded text-sm"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// ///3333333
// import { useAuth } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   if (!user) return null;

//   return (
//     <nav className="bg-blue-600 text-white p-4 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//         <div className="flex space-x-4">
//           {user.role === 'EMPLOYEE' && (
//             <>
//               <Link to="/gate-pass" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 Create Gate Pass
//               </Link>
//               <Link to="/my-requests" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 My Requests
//               </Link>
//               <Link to="/my-receipts" className="hover:bg-blue-700 px-3 py-2 rounded">
//                 My Receipts
//               </Link>
//             </>
//           )}
//           {user.role === 'EXECUTIVE' && (
//             <Link to="/executive-approve" className="hover:bg-blue-700 px-3 py-2 rounded">
//               Approve Requests
//             </Link>
//           )}
//           {user.role === 'DUTY_OFFICER' && (
//             <Link to="/verify" className="hover:bg-blue-700 px-3 py-2 rounded">
//               Verify Requests
//             </Link>
//           )}
//         </div>

//         <div className="flex items-center space-x-4">
//           <span className="text-sm">
//             {user.name} ({user.role})
//           </span>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded text-sm"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



"use client"

import { useAuth } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) return null

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {user.role === "EMPLOYEE" && (
            <>
              <Link to="/gate-pass" className="hover:bg-blue-700 px-3 py-2 rounded">
                Create Gate Pass
              </Link>
              <Link to="/my-requests" className="hover:bg-blue-700 px-3 py-2 rounded">
                My Requests
              </Link>
              <Link to="/my-receipts" className="hover:bg-blue-700 px-3 py-2 rounded">
                My Receipts
              </Link>
              <Link to="/item-tracker" className="hover:bg-blue-700 px-3 py-2 rounded">
                Track Items
              </Link>
            </>
          )}
          {user.role === "EXECUTIVE" && (
            <Link to="/executive-approve" className="hover:bg-blue-700 px-3 py-2 rounded">
              Approve Requests
            </Link>
          )}
          {user.role === "DUTY_OFFICER" && (
            <Link to="/verify" className="hover:bg-blue-700 px-3 py-2 rounded">
              Verify Requests
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded">
              Admin Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user.name} ({user.role}){user.branch && <span className="text-xs block">Branch: {user.branch}</span>}
          </span>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded text-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
