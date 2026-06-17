import Router from './routes';
import AuthProvider from './provider/authProvider';
import { SocketProvider } from './provider/socketProvider';
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router />
      </SocketProvider>
    </AuthProvider>
  );
}
