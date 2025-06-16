// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import bgImage from '../assets/bgimage.jpg'; // Adjust the path based on your file structure

// const Login = () => {
//   const [employeeType, setEmployeeType] = useState('SLT');
//   const [serviceNumber, setServiceNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
  
//     if (!serviceNumber || !password) {
//       setError('Please enter both service number and password');
//       return;
//     }
  
//     try {
//       const response = await axios.post('http://localhost:9077/api/auth/login', {
//         serviceNumber,
//         password,
//         employmentType: employeeType === 'SLT' ? 'SLT' : 'Non-SLT',
//       });
  
//       const userData = response.data;
  
//       login({
//         serviceNumber: userData.serviceNumber,
//         role: userData.role,
//         employeeType: userData.employmentType,
//         name: `${userData.firstName} ${userData.lastName}`,
//       });
  
//       // Redirect based on user role
//       if (userData.role === 'Employee') {
//         navigate('/gate-pass');
//       } else if (userData.role === 'Executive Officer') {
//         navigate('/executive-approve');
//       } else if (userData.role === 'Admin') {
//         navigate('/admin');
//       } else if (userData.role === 'Duty Officer') {
//         navigate('/verify');
//       } else if (userData.role === 'Security Officer') {
//         navigate('/dispatch');
//       } else {
//         navigate('/unauthorized'); // Fallback in case role is not recognized
//       }
  
//     } catch (error) {
//       console.error('Login error:', error);
//       if (error.response && error.response.status === 401) {
//         setError('Invalid service number or password');
//       } else {
//         setError('Login failed. Please try again later.');
//       }
//     }
//   };
  

//   return (
//     <div
//       className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center"
//       style={{ backgroundImage: `url(${bgImage})` }} // Add background image here
//     >
      
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Sign in to your account
//         </h2>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-opacity-90">
//           {error && (
//             <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Employee Type
//               </label>
//               <div className="mt-1 grid grid-cols-2 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setEmployeeType('SLT')}
//                   className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
//                     employeeType === 'SLT'
//                       ? 'bg-blue-600 text-white border-blue-600'
//                       : 'bg-white text-gray-700 border-gray-300'
//                   }`}
//                 >
//                   SLT
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setEmployeeType('Non-SLT')}
//                   className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
//                     employeeType === 'Non-SLT'
//                       ? 'bg-blue-600 text-white border-blue-600'
//                       : 'bg-white text-gray-700 border-gray-300'
//                   }`}
//                 >
//                   Non-SLT
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="serviceNumber"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Service Number
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="serviceNumber"
//                   name="serviceNumber"
//                   type="text"
//                   required
//                   value={serviceNumber}
//                   onChange={(e) => setServiceNumber(e.target.value)}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Sign in
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



// src/pages/Login/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/bgimage.jpg'; // Fixed path - go up two levels

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

      // Redirect based on user role
      if (response.data.role === 'Employee') {
        navigate('/gate-pass');
      } else if (response.data.role === 'Executive Officer') {
        navigate('/executive-approve');
      } else if (response.data.role === 'Admin') {
        navigate('/admin');
      } else if (response.data.role === 'Duty Officer') {
        navigate('/verify');
      } else if (response.data.role === 'Security Officer') {
        navigate('/dispatch');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.status === 401) {
        setError('Invalid service number or password');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 bg-opacity-90">
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