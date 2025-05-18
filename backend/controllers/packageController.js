// Import the package model
import Package from '../models/package.js'; 
import { v2 as cloudinary } from "cloudinary";

// CREATE - Create a new package
export const createPackage = async (req, res) => {
  try {
    const { name, price, description } = req.body;
           const imageFile = req.file

    // Validation
    if (!name  || !price || !description ) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageUrl = imageUpload.secure_url
    
    // Create new package
    const newPackage = new Package({
      name,
      image:imageUrl,
      price,
      description,
      active: req.body.active !== undefined ? req.body.active : true // Default to true if not provided
    });
    
    // Save package to database
    const savedPackage = await newPackage.save();
    
    res.status(201).json({
      success: true,
      data: savedPackage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating package',
      error: error.message
    });
  }
};

// READ - Get all packages
export const getAllPackages = async (req, res) => {
  try {
    // Filter options (e.g., only active packages)
    const filter = {};
    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    }
    
    const packages = await Package.find(filter);
    
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message
    });
  }
};

// READ - Get a single package by ID
export const getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const foundPackage = await Package.findById(packageId);
    
    if (!foundPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: foundPackage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching package',
      error: error.message
    });
  }
};

// UPDATE - Update a package
export const updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    const { name, price, description, image } = req.body;
    let imageUrl;
    // Find the existing package
    const existingPackage = await Package.findById(packageId);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Handle image logic
    if (image === false || image === "false") {
      // Keep the existing image
      imageUrl = existingPackage.image;
    } else if (req.file) {
      // Upload new image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    } else if (typeof image === "string" && image.trim() !== "") {
      // If image is a string (URL), use it directly
      imageUrl = image;
    } else {
      // If nothing is provided, keep the existing image
      imageUrl = existingPackage.image;
    }

    // Prepare update data
    const updateData = {
      name: name !== undefined ? name : existingPackage.name,
      price: price !== undefined ? price : existingPackage.price,
      description: description !== undefined ? description : existingPackage.description,
      image: imageUrl,
      active: req.body.active !== undefined ? req.body.active : existingPackage.active
    };

    // Update the package
    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPackage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating package',
      error: error.message
    });
  }
};

// DELETE - Delete a package
export const deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const deletedPackage = await Package.findByIdAndDelete(packageId);
    
    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting package',
      error: error.message
    });
  }
};

// SOFT DELETE - Mark a package as inactive instead of deleting
export const softDeletePackage = async (req, res) => {
    try {

        const { packageId } = req.body
        const packageData = await Package.findById(packageId)
        await Package.findByIdAndUpdate(packageId, { active: !packageData.active })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ADDITIONAL UTILITY - Search packages by name
export const searchPackages = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const packages = await Package.find({
      name: { $regex: searchTerm, $options: 'i' } // Case insensitive search
    });
    
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching packages',
      error: error.message
    });
  }
};