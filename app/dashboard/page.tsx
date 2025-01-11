import React from 'react'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'
const layout = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <div className='flex items-center'>
          <Leftbar />
          <div className='w-[75%] ml-[24%] pb-[250px]'>
            <Mainbar />
          </div>
        </div>
    </div>
  )
}

export default layout
