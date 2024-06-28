import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from "next-themes";

import Home from './pages/home/Home.tsx'
import Map from './pages/map/Map.tsx'
import Debug from './pages/debug/Debug.tsx'
import './i18n'

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
  {
    path: '/debug',
    element: <Debug/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="xbox">
        <RouterProvider router={router} />
      </NextThemesProvider>
    </NextUIProvider>
  </React.StrictMode>,
)
