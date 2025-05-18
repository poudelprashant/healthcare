import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../../../assets/assets'

import { AppContext } from '../../../context/AppContext'
import { AdminContext } from '../../../context/AdminContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { use } from 'react'


const AddPackage = () => {
    const navigate = useNavigate()
    const [searchParams]=useSearchParams()
    const { aToken,getPackageDetail } = useContext(AdminContext)
    const[packageData,setPackageData]=useState()
    const packageId = searchParams.get('packageId')

    useEffect(() => {
        if (searchParams.get('packageId')) {
          const fetchPackageData = async () => {
            const data = await getPackageDetail(packageId)
            setPackageData(data)
          }
          fetchPackageData()
        }
    }, [packageId])
    

    useEffect(() => {
        if (packageData) {
            setName(packageData.name)
            setPrice(packageData.price)
            setDescription(packageData.description)
            
        }
    }, [packageData])

    const [packageImg, setPackageImg] = useState(false)
    const [name, setName] = useState(packageData?.name || '')
    const [price, setPrice] = useState(packageData?.price || '')
    const [description, setDescription] = useState(packageData?.description || '')
    const { backendUrl } = useContext(AppContext)
    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {

            if (!packageImg && !packageData) {
                return toast.error('Image Not Selected')
            }

            const formData = new FormData();

            formData.append('image', packageImg)
            formData.append('name', name)
            formData.append('price', price)
            formData.append('description', description)

            if (packageId) {
                const {data} = await axios.put(backendUrl + `/api/admin/packages/${packageId}`, formData, { headers: { aToken } })
                if (data.success) {
                    toast.success(data.message)
                    setPackageImg(false)
                    setName('')
                    setPrice('')
                    setDescription('')
                    navigate('/package-list')
                    
                } else {
                    toast.error(data.message)
                }
            }else {
            const { data } = await axios.post(backendUrl + '/api/admin/packages', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setPackageImg(false)
                setName('')
                setPrice('')
                setDescription('')
            } else {
                toast.error(data.message)
            }
        }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }
    
    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>{packageData ? "Edit":"Add"} Package</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
               <div className='flex items-center gap-4 mb-8 text-gray-500'>
                                   <label htmlFor="doc-img">
                                       <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={packageImg ? URL.createObjectURL(packageImg) : assets.upload_area} alt="" />
                                   </label>
                                   <input onChange={(e) => setPackageImg(e.target.files[0])} type="file" name="" id="doc-img" hidden />
                                   <p>Upload package <br /> image</p>

                                   {
                                    packageData &&
                                    <img src={packageData.image} alt="" className='w-16 h-16 rounded-full' />
                                   }
                               </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Package Name</p>
                            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Package Price</p>
                            <input onChange={e => setPrice(e.target.value)} value={price} className='border rounded px-3 py-2' type="number" placeholder='Price' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Description</p>
                            <textarea onChange={e => setDescription(e.target.value)} value={description} className='w-full px-4 pt-2 border rounded' rows={5} placeholder='Package Description' required></textarea>
                        </div>

                      

                    </div>

                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>{packageData ? "Edit":"Add"} Package</button>

            </div>

        </form>
    )
}

export default AddPackage
