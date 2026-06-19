import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';
import api from '../utils/api';
import { useEffect } from 'react';
import { Alert } from './Alert';
import ChatBubbleOvalLeftIcon from '@heroicons/react/24/solid/ChatBubbleOvalLeftIcon';

export default function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState(null);
  const [authState, setAuthState] = React.useState('login');
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate("/");
  }, []);

  const login = async (data) => {
    const dataUser = { email: data.get('email'), password: data.get('password') };
    if (!dataUser.email || !dataUser.password) {
      setErrors({ message: 'Please fill in all fields' });
      return;
    }
    const result = await api.post('/auth/login', dataUser);
    if (result?.data?.token) {
      auth.setToken(JSON.stringify({ userId: result.data.id, token: result.data.token }));
      navigate("/", { replace: true });
    }
  };

  const register = async (data) => {
    const dataUser = { email: data.get('email'), password: data.get('password'), name: data.get('name') };
    if (!dataUser.email || !dataUser.password || !dataUser.name) {
      setErrors({ message: 'Please fill in all fields' });
      return;
    }
    if (dataUser.password !== data.get('password_compared')) {
      setErrors({ message: 'Passwords do not match' });
      return;
    }
    const result = await api.post('/auth/register', dataUser);
    if (result?.data) {
      setAuthState('login');
      setErrors(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(null);
    setLoading(true);
    try {
      const data = new FormData(event.currentTarget);
      if (authState === 'login') await login(data);
      else await register(data);
    } catch (error) {
      setErrors({ message: error?.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-gray-400";
  const isLogin = authState === 'login';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-200">
            <ChatBubbleOvalLeftIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">ChatRoom</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 px-6 py-8">
          {errors && <div className="mb-4"><Alert type="error" message={errors?.message} /></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!isLogin && (
              <input
                name="name"
                type="text"
                placeholder="Full name"
                className={inputClass}
                autoComplete="name"
              />
            )}
            <input
              name="email"
              type="email"
              placeholder="Email address"
              className={inputClass}
              autoComplete="email"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={inputClass}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && (
              <input
                name="password_compared"
                type="password"
                placeholder="Confirm password"
                className={inputClass}
                autoComplete="new-password"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-sky-200"
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              className="text-sky-600 font-semibold hover:text-sky-800 transition-colors cursor-pointer"
              onClick={() => { setErrors(null); setAuthState(isLogin ? 'register' : 'login'); }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
