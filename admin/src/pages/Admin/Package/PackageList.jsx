import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../../context/AdminContext'
import "../../../assets/styles/switch.css"
import { useNavigate } from 'react-router-dom'

const PackagesList = () => {
const navigate=useNavigate()
  const { packages, aToken, getAllPackages,changePackageActiveStatus } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllPackages()
    }
  }, [aToken])

  return (
        <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Packages</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {packages?.map((item, index) => (
          <div className='border border-[#deecff] rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index} onClick={()=>navigate(`/package?packageId=${item._id}`)}>
            <img className='bg-[#deecff] group-hover:bg-primary transition-all duration-500 min-h-[200px]' src={item.image} alt="" />
            <div className='flex justify-between items-center gap-3 w-full p-2'>
              <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
              <div className='mt-2  flex justify-between items-center gap-1 text-sm '>
    
              <label class="toggle-switch">
  <input type="checkbox" onChange={()=>changePackageActiveStatus(item._id)} checked={item.active}/>
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

export default PackagesList
