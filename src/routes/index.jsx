import * as React from "react";
import Login from '../components/Login';
import Chat from '../components/Chat';
import ProtectedRoute from "./ProtectedRoute";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/authProvider";


const Router = () => {
  const auth = useAuth();
  const token = auth && auth.token;

  const router = React.useMemo(() => createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
          element: <Chat />,
        },
        {
          path: "chat",
          element: <Chat />,
        },
      ],
    },
  ]), [token]);

  return <RouterProvider router={router} />;
};

export default Router;