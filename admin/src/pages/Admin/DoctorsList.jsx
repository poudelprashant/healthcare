import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import "../../assets/styles/switch.css"
const DoctorsList = () => {

  const { doctors, changeAvailability , aToken , getAllDoctors,changeActiveStatus} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item, index) => (
          <div className='border border-[#deecff] rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
            <img className='bg-[#deecff] group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
              <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
              <div className='mt-2  flex justify-between items-center gap-1 text-sm w-full'>
                <div className='flex'>
                <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p>Available</p>
                  </div>
                {/* <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                 */}
              <label class="toggle-switch">
  <input type="checkbox" onChange={()=>changeActiveStatus(item._id)} checked={item.active}/>
  <div class="toggle-switch-background">
    <div class="toggle-switch-handle"></div>
  </div>
</label>
                {/* <p>Available</p> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList