import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./routes/Home";
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
]);

const App=()=>{
return (
<>
<RouterProvider router={router}/>

</>
)
}

export default App