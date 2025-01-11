import React from 'react'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'
const layout = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <div className='flex items-center bg-[#1A1D1F]'>
          <Leftbar />
          <div className='w-[75%] ml-[24%] h-[100%]'>
            <Mainbar />
          </div>
        </div>
    </div>
  )
}

export default layout
