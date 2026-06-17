import * as React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';
import api from '../utils/api';
import { useEffect } from 'react';
import { Alert } from './Alert';


// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          justifyContent: 'center'
        }
      }
    }
  }
});

export default function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState(false);
  const [authState, setAuthState] = React.useState('login');
  const [inputValidated, setInputValidated] = React.useState({
    email: false,
    password: false
  });
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [registerSuccess, setRegisterSuccess] = React.useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/");
    }
  }, [])

  const switchAuth = (state) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthState(state);
      setIsTransitioning(false);
    }, 700); // match your duration
  };

  const login = async (data) => {
    try {
      const dataUser = {
        email: data.get('email'),
        password: data.get('password'),
      }

      setInputValidated({
        email: !dataUser.email,
        password: !dataUser.password
      });

      if (!dataUser.email || !dataUser.password) {
        setErrors({ message: 'please fill your login information' });
        return;
      }
      const result = await api.post('/auth/login', {
        email: dataUser.email,
        password: dataUser.password
      })
      if (result && result.data && result.data.token) {
        auth.setToken(JSON.stringify({
          userId: result.data.id,
          token: result.data.token,
        }));
        navigate("/", { replace: true });
      }
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data.message) {
        setErrors({ message: error.response.data.message });
      } else {
        setErrors({ message: error.message });
      }
    }
  }

  const register = async (data) => {
    try {
      const dataUser = {
        email: data.get('email'),
        password: data.get('password'),
        name: data.get('name')
      }

      setInputValidated({
        email: !dataUser.email,
        password: !dataUser.password,
        name: !dataUser.name
      });

      if (!dataUser.email || !dataUser.password || !dataUser.name) {
        setErrors({ message: 'please fill your registration information' });
        return;
      }

      if (dataUser.password !== data.get('password_compared')) {
        setErrors({message: 'Retyped password not match'});
        return;
      }
      const result = await api.post('/auth/register', {
        email: dataUser.email,
        password: dataUser.password,
        name: dataUser.name
      })
      if (result && result.data && result.data.token) {
        setAuthState('login');
      }
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data.message) {
        setErrors({ message: error.response.data.message });
      } else {
        setErrors({ message: error.message });
      }
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(null);
    const data = new FormData(event.currentTarget);
    if (authState === 'login') {
      await login(data);
      return;
    }
    await register(data);
  };

  return (
    <div className="flex min-h-[100vh] w-full items-center justify-center">
      <div className="flex md:hidden w-full h-screen  flex-col bg-slate-100">
        <div class={`absolute w-full overflow-hidden transition-all duration-700 ${isTransitioning ? 'h-screen' : 'h-[200px]'}`}>
          <div class={`absolute inset-0 ${isTransitioning ? 'bg-sky-900' : 'bg-[linear-gradient(135deg,_theme(colors.sky.700)_0%,_theme(colors.sky.900)_100%)] [clip-path:polygon(0_0,100%_0,100%_70%,0_100%)]'}`}></div>
          <div class="relative z-10 p-7 pt-8">
            <h1 class="text-2xl font-semibold leading-[1.24] text-white">
              {authState === 'register' && 'Create'}
              {authState === 'login' && 'Welcome'}
            </h1>
            <h1 class="text-2xl font-semibold leading-[1.24] text-white">
              {authState === 'register' && 'Account'}
              {authState === 'login' && 'Back'}
            </h1>
            <p class="text-[11px] font-medium text-white mt-2">Please {`${authState === 'login' ? 'sign-in' : 'sign-up'}`} to continue!</p>
          </div>
        </div>
        <form className="flex flex-col w-full px-6 py-6 mt-50" onSubmit={handleSubmit}>
          {authState === 'login' ? (
            <>
              {errors && <Alert type="error" message={errors?.message} />}
              <input name="email" type="email" placeholder="Email" className="bg-gray-50 border border-sky-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <input name="password" type="password" placeholder="Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <button type="submit" className="border text-sm border-sky-900 px-2 py-2 rounded-lg text-gray-900">Login</button>
            </>
          ) : (
            <>
              {errors && <Alert type="error" message={errors?.message} />}
              <input name="email" type="email" placeholder="Email" className="bg-gray-50 border border-sky-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <input name="name" type="text" placeholder="Name" className="bg-gray-50 border border-sky-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <input name="password" type="password" placeholder="Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <input name="password_compared" type="password" placeholder="Re enter password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4" />
              <button type="submit" className="border text-sm border-sky-600 px-2 py-2 rounded-lg text-gray-700">Register</button>
            </>
          )}
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {authState === 'login'
            ? <><span>No account? </span><button className="text-sky-900 underline" onClick={() => { setErrors(null); switchAuth('register'); }}>Register</button></>
            : <><span>Have an account? </span><button className="text-sky-900 underline" onClick={() => { setErrors(null); switchAuth('login'); }}>Login</button></>
          }
        </p>
      </div>
      <div className="md:flex relative hidden md:w-2/3 w-full flex-row">
        <div className={`flex md:w-1/2 bg-slate-100  min-h-120 items-center justify-center px-4 shadow-lg rounded-l-2xl transition-all duration-700`}>
          {authState === 'login' && (
            <form className="flex flex-col w-5/6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center justify-center px-4 min-h-80">
                <span className="text-gray-900 text-sm mb-4">Login to your account !!!</span>
                {errors && <Alert type="error" message={errors?.message} />}
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="bg-gray-50 w-full border border-sky-900 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <div className="flex w-full justify-end px-2 py-2">
                  <button type="submit" className="border-1 text-sm border-sky-900 hover:border-sky-500 hover: border-sky-500 px-2 py-2 min-w-28 rounded-lg hover:cursor-pointer text-gray-900">Login</button>
                </div>
              </div>
            </form>
          )}
        </div>
        <div className={`absolute top-0 h-120 bg-sky-900 md:w-1/2 rounded-2xl shadow-lg z-10 transition-transform duration-700 ${authState === 'login' ? 'translate-x-full' : 'translate-x-0'}`}>
          <div className="flex h-full items-center justify-center">
            {authState === 'login' ? (
              <button className="text-sm border border-teal-500 w-32 px-2 py-2 text-gray-100 rounded-lg transition-all duration-700" onClick={() => setAuthState('register')}>
                Register
              </button>
            ) : (
              <button className="text-sm border border-teal-500 w-32 px-2 py-2 text-gray-100 rounded-lg transition-all duration-700" onClick={() => setAuthState('login')}>
                Login
              </button>
            )}
          </div>
        </div>
        <div className={`flex bg-slate-100 w-1/2 items-center justify-center min-h-120 rounded-r-2xl shadow-lg transition-all duration-700`}>
          {authState === 'register' && (
            <form className="flex flex-col w-5/6 transition-all duration-700" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center justify-center px-4 min-h-80">
                <span className="text-gray-700 text-sm mb-4">Register your account</span>
                {errors && <Alert type="error" message={errors?.message} />}
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="bg-gray-50 w-full border border-sky-900 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="bg-gray-50  border border-sky-900 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <input
                  name="password_compared"
                  type="password"
                  placeholder="Re enter password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5 mb-4"
                />
                <div className="flex w-full justify-end px-2 py-2">
                  <button type="submit" className="border-1 text-sm border-sky-600 hover:border-sky-900 hover: border-sky-500 px-2 py-2 min-w-28 rounded-lg hover:cursor-pointer text-gray-700">Register</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
