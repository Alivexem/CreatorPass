import React from 'react'
import Align from './Align'
const page = () => {
  return (
    <div>

      <div className='p-3 box-border' style={{
        backgroundImage: 'url(/pc.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className='absolute lg:hidden top-[5%] left-[5%]'>
          {/* <Whitelogo /> */}
        </div>
        <Align />
      </div>
    </div>
  )
}

export default page
