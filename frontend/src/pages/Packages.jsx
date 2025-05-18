import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Packages = () => {
  const navigate=useNavigate()
  const { packages, } = useContext(AppContext);


  return (
    <div>
      <p className='text-gray-600'>Browse through the available packages.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
 
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {packages && packages?.length > 0 ? (
            packages.map((item, index) => (
              <div key={index}
              className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              onClick={ ()=>navigate(`/packages/${item._id}`) }
              
              >
                <img className='bg-[#EAEFFF] min-h-[200px]' src={item.image} alt={item.name} />
                <div className='p-4'>
                  <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                  <p className='text-primary font-semibold'>Rs. {item.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-gray-500 text-center w-full'>No packages available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Packages;
