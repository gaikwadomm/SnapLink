import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Signup, Addurl, LinkList, Filterurl, Login} from './components/index.js'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router'

 const router = createBrowserRouter(
   createRoutesFromElements(
     <Route path="/">
       <Route path="signup" element={<Signup />} />
       <Route path="login" element={<Login />} />
       <Route path="addurl" element={<Addurl />} />
       <Route path="UserLinks" element={<LinkList />} />
       <Route path="filter-url" element={<Filterurl />} />
       {/* Add more routes as needed */}
     </Route>
   )
 );

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
