// // src/pages/Login/Login.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   const [formData, setFormData] = useState({
//     employmentType: '',
//     serviceNumber: '',
//     password: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
    
//     try {
//       // Map form data to match the expected DTO structure
//       const loginRequestDTO = {
//         serviceNumber: formData.serviceNumber,
//         password: formData.password,
//         employmentType: formData.employmentType
//       };
      
//       const response = await axios.post('/api/auth/login', loginRequestDTO);
      
//       // Store user in auth context
//       login(response.data);
      
//       // Redirect based on user role
//       redirectBasedOnRole(response.data.role);
      
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data || 'Failed to login. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const redirectBasedOnRole = (role) => {
//     switch(role) {
//       case 'Employee':
//         navigate('/new-request');
//         break;
//       case 'Executive Officer':
//         navigate('/executive-approve');
//         break;
//       case 'Duty Officer':
//         navigate('/verify');
//         break;
//       case 'Security Officer':
//         navigate('/dispatch');
//         break;
//       case 'Admin':
//         navigate('/admin');
//         break;
//       default:
//         navigate('/');
//         break;
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
//         <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Gate Pass System Login</h2>
        
//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit}>
//           {/* User Type Dropdown */}
//           <div className="mb-4">
//             <label htmlFor="employmentType" className="block text-gray-700 font-medium mb-2">User Type</label>
//             <select
//               id="employmentType"
//               name="employmentType"
//               value={formData.employmentType}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             >
//               <option value="" disabled>Select User Type</option>
//               <option value="SLT">SLT</option>
//               <option value="Non-SLT">Non-SLT</option>
//             </select>
//           </div>
          
//           {/* Username Field */}
//           <div className="mb-4">
//             <label htmlFor="serviceNumber" className="block text-gray-700 font-medium mb-2">Service Number</label>
//             <input
//               type="text"
//               id="serviceNumber"
//               name="serviceNumber"
//               value={formData.serviceNumber}
//               onChange={handleChange}
//               placeholder="Enter your service number"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>
          
//           {/* Password Field */}
//           <div className="mb-6">
//             <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>
          
//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
//           >
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    employmentType: '',
    serviceNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginRequestDTO = {
        serviceNumber: formData.serviceNumber,
        password: formData.password,
        employmentType: formData.employmentType
      };

      const response = await axios.post('http://localhost:9077/api/auth/login', loginRequestDTO);

      await login({
        serviceNumber: response.data.serviceNumber,
        name: `${response.data.firstName} ${response.data.lastName}`,
        role: response.data.role,
        employmentType: response.data.employmentType
      });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Gate Pass System Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="employmentType" className="block text-gray-700 font-medium mb-2">User Type</label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="" disabled>Select User Type</option>
              <option value="SLT">SLT</option>
              <option value="NON_SLT">Non-SLT</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="serviceNumber" className="block text-gray-700 font-medium mb-2">Service Number</label>
            <input
              type="text"
              id="serviceNumber"
              name="serviceNumber"
              value={formData.serviceNumber}
              onChange={handleChange}
              placeholder="Enter your service number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}