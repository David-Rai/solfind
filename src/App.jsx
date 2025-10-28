import React from "react";
import { ToastContainer } from "react-toastify";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./routes/Home";
import Explore from "./routes/Explore";
import ImageUpload from './routes/ImageUpload'
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
  },
  {
    path: "/upload",
    element: <ImageUpload />,
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