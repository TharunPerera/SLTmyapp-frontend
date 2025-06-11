import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgImage from '../assets/bgimage.jpg'; // Adjust the path based on your file structure

const Login = () => {
  const [employeeType, setEmployeeType] = useState('SLT');
  const [serviceNumber, setServiceNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!serviceNumber || !password) {
      setError('Please enter both service number and password');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:9077/api/auth/login', {
        serviceNumber,
        password,
        employmentType: employeeType === 'SLT' ? 'SLT' : 'Non-SLT',
      });
  
      const userData = response.data;
  
      login({
        serviceNumber: userData.serviceNumber,
        role: userData.role,
        employeeType: userData.employmentType,
        name: `${userData.firstName} ${userData.lastName}`,
      });
  
      // Redirect based on user role
      if (userData.role === 'Employee') {
        navigate('/gate-pass');
      } else if (userData.role === 'Executive Officer') {
        navigate('/executive-approve');
      } else if (userData.role === 'Admin') {
        navigate('/admin');
      } else if (userData.role === 'Duty Officer') {
        navigate('/verify');
      } else if (userData.role === 'Security Officer') {
        navigate('/dispatch');
      } else {
        navigate('/unauthorized'); // Fallback in case role is not recognized
      }
  
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setError('Invalid service number or password');
      } else {
        setError('Login failed. Please try again later.');
      }
    }
  };
  

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }} // Add background image here
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-opacity-90">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee Type
              </label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEmployeeType('SLT')}
                  className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                    employeeType === 'SLT'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  SLT
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeType('Non-SLT')}
                  className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                    employeeType === 'Non-SLT'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Non-SLT
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Service Number
              </label>
              <div className="mt-1">
                <input
                  id="serviceNumber"
                  name="serviceNumber"
                  type="text"
                  required
                  value={serviceNumber}
                  onChange={(e) => setServiceNumber(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
