import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className=' text-gray-500'>Bhagwati Mandir <br /> Naxal, Kathmandu</p>
          <p className=' text-gray-500'>Tel: 9812345678 <br /> Email: healthcare@gmail.com</p>
          <p className=' font-semibold text-lg text-gray-600'>News Letter And Blog</p>
          <p className=' text-gray-500'>Join our newletter and research blog by suscribing US.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>News And Research</button>
        </div>
      </div>

    </div>
  )
}

export default Contact
