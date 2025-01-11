import React from 'react'
import App from './main'
import SideNav from '@/components/Leftside'
const Layout = () => {
  return (
    <div className='flex p-3'>
    
    <div className='hidden md:flex md:w-[50%] lg:w-[45%] w-[100%]'>
        <SideNav />
      </div>

      <div className='md:w-[50%] lg:w-[55%]'>
        <App />
      </div>
      
    </div>
  )
}

export default Layout
