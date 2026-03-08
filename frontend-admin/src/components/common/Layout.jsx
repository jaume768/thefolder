import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import '../../styles/Layout.css'

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="admin-layout">
      <Sidebar isMobileOpen={isMobileOpen} toggleMobileSidebar={toggleMobileSidebar} />
      <div className="main-content">
        <Navbar toggleMobileSidebar={toggleMobileSidebar} />
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
