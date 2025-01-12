'use client'
import React from 'react';
import { FaImages } from "react-icons/fa6";
import { TiRefresh } from "react-icons/ti";

const ProfileUpdate = () => {
  return (
    <div className='flex flex-col mb-[40px] space-y-5 justify-center items-center'>
      <div className='flex items-center gap-x-4'>
        <div className='h-[300px] w-[350px] bg-gray-600 rounded-lg flex justify-center items-center'>
          <div className='border-dashed h-[250px] w-[300px] border-[1px] border-gray-200 rounded-lg flex text-white justify-center items-center'>
            <FaImages size={30} />
          </div>
        </div>
        <button className='bg-orange-500 flex items-center gap-x-2 text-white py-3 mt-5 rounded-lg px-3'>
          <TiRefresh size={20} />Edit image
        </button>
      </div>
      <input type="text" className='h-[50px] p-5 rounded-lg w-[500px]' placeholder='Username' />
      <input type="text" className='h-[50px] p-5 rounded-lg w-[500px]' placeholder='Country of origin' />
      <textarea name="about" placeholder='Tell other Creators about you' id="" className='p-5 rounded-lg' cols={50} rows={8}></textarea>
      <button className='h-[40px] w-[150px] bg-green-500 text-white rounded-lg mt-5'>Save</button>
    </div>
  );
};

export default ProfileUpdate;
