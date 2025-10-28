import React from "react";
import { ToastContainer } from "react-toastify";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./routes/Home";
import Explore from "./routes/Explore";
import Report from "./routes/Report";
import ConnectWallet from './routes/ConnectWallet'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/connectWallet",
    element: <ConnectWallet />,
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/report",
    element: <Report />,
  }
  // ,
  // {
  //   path: "/all",
  //   element: <All />,
  // }
]);

const App=()=>{
return (
<>
<RouterProvider router={router}/>
<ToastContainer />
</>
)
}

export default App