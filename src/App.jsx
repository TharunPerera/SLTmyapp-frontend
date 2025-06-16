// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import GatePassForm from './components/GatePassForm';
// import Admin from './pages/Admin';
// import ExecutiveApprove from './pages/ExecutiveApprove';
// import Verify from './pages/DutyOfficerVerificationPage';
// import Dispatch from './pages/Dispatch';
// import MyRequests from './pages/MyRequests';
// import MyReceipts from './pages/MyReceipts';
// import Unauthorized from './pages/Unauthorized';
// import ItemTracker from './pages/ItemTracker'; // Import the new ItemTracker page

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Navbar />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />
          
//           {/* Employee routes */}
//           <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
//             <Route path="/gate-pass" element={<GatePassForm />} />
//             <Route path="/my-requests" element={<MyRequests />} />
//             <Route path="/my-receipts" element={<MyReceipts />} />
//           </Route>
          
//           {/* Admin route */}
//           <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
//             <Route path="/admin" element={<Admin />} />
//           </Route>
          
//           {/* Executive Officer route */}
//           <Route element={<ProtectedRoute allowedRoles={['Executive Officer']} />}>
//             <Route path="/executive-approve" element={<ExecutiveApprove />} />
//           </Route>
          
//           {/* Duty Officer route */}
//           <Route element={<ProtectedRoute allowedRoles={['Duty Officer']} />}>
//             <Route path="/verify" element={<Verify />} />
//           </Route>
          
//           {/* Security Officer route */}
//           <Route element={<ProtectedRoute allowedRoles={['Security Officer']} />}>
//             <Route path="/dispatch" element={<Dispatch />} />
//             <Route path="/item-tracker" element={<ItemTracker />} /> {/* Added new route */}
//           </Route>
          
//           {/* Default redirect */}
//           <Route path="*" element={<Login />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

///33333


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import GatePassForm from './components/GatePassForm';
// import ExecutiveApprove from './pages/ExecutiveApprove';
// import Verify from './pages/DutyOfficerVerificationPage';
// import MyRequests from './pages/MyRequests';
// import MyReceipts from './pages/MyReceipts';
// import Unauthorized from './pages/Unauthorized';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Navbar />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />

//           <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
//             <Route path="/gate-pass" element={<GatePassForm />} />
//             <Route path="/my-requests" element={<MyRequests />} />
//             <Route path="/my-receipts" element={<MyReceipts />} />
//           </Route>

//           <Route element={<ProtectedRoute allowedRoles={['EXECUTIVE']} />}>
//             <Route path="/executive-approve" element={<ExecutiveApprove />} />
//           </Route>

//           <Route element={<ProtectedRoute allowedRoles={['DUTY_OFFICER']} />}>
//             <Route path="/verify" element={<Verify />} />
//           </Route>

//           <Route path="*" element={<Login />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import GatePassForm from "./components/GatePassForm"
import ExecutiveApprove from "./pages/ExecutiveApprove"
import Verify from "./pages/DutyOfficerVerificationPage"
import MyRequests from "./pages/MyRequests"
import MyReceipts from "./pages/MyReceipts"
import ItemTracker from "./pages/ItemTracker"
import Admin from "./pages/Admin/Admin"
import Unauthorized from "./pages/Unauthorized"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/gate-pass" element={<GatePassForm />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/my-receipts" element={<MyReceipts />} />
            <Route path="/item-tracker" element={<ItemTracker />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["EXECUTIVE"]} />}>
            <Route path="/executive-approve" element={<ExecutiveApprove />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["DUTY_OFFICER"]} />}>
            <Route path="/verify" element={<Verify />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
