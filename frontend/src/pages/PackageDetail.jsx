import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const PackageDetail = () => {
    const params=useParams()
      const { getPackageDetail } = useContext(AppContext);
    const [packageData,setPackageData]=useState()
      useEffect(() => {
        const fetchPackageDetail = async () => {
            const packageData = await getPackageDetail(params.packageId);
            setPackageData(packageData);
        };
        fetchPackageDetail();
    }, [params.packageId]);


  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img
          src={packageData?.image}
          alt={packageData?.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-full max-w-4xl  p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold  text-center px-4 mb-5">
            {packageData?.name}
          </h1>
        <section className="bg-white shadow-lg rounded-xl p-6 md:p-10 space-y-6">
          <h2 className="text-xl font-semibold text-blue-700">Package Details</h2>
          <p className="text-base leading-relaxed text-gray-700">
            {packageData?.description}
          </p>

          {/* Price & CTA */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-6">
            <span className="text-2xl font-bold text-green-600">
              ${packageData?.price.toFixed(2)}
            </span>

            <button
              className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300"
              onClick={() => alert('Package purchased!')}
            >
              Book Health Package
            </button>
          </div>
        </section>
      </main>


    </div>
  )

}

export default PackageDetail