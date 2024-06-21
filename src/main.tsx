import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react"

import Home from './pages/home/Home.tsx'
import Map from './pages/map/Map.tsx'

import './index.css'

const router = createHashRouter([
  {
    path: '/',
    element: <Home/>,
  },
  {
    path: '/map',
    element: <Map/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  </React.StrictMode>,
)
