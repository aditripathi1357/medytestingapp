import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { uploadFileToCloudinary } from '../../../../cloudinary/uploadImageToCloudinary'; // Adjust import path as needed
import axios from 'axios';

// Use /tmp/uploads on Vercel, and local folder in development
const UPLOAD_DIR =
  process.env.VERCEL === '1'
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), '/tmp/uploads');

// Helper function to ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    console.log(error);
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Helper function to save a file from the form data, upload to Cloudinary, and delete local file
async function processFile(file: File): Promise<{ cloudinaryUrl: string; originalName: string }> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  // Save file locally first
  await fs.writeFile(filePath, fileBuffer);
  
  // Upload to Cloudinary
  const cloudinaryUrl = await uploadFileToCloudinary(filePath);
  
  // Delete local file after successful upload
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
  
  if (!cloudinaryUrl) {
    throw new Error('Failed to upload file to Cloudinary');
  }
  
  return {
    cloudinaryUrl,
    originalName: file.name
  };
}

// Interface for document information
interface DocumentInfo {
  departments: string;
  doctorsCount: string;
  communicationMode: string;
  governmentIdUrl?: string;
  governmentIdOriginalName?: string;
  registrationCertificateUrl?: string;
  registrationCertificateOriginalName?: string;
  accreditationUrl?: string;
  accreditationOriginalName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    await ensureUploadDir();
    
    // Parse the form data
    const formData = await request.formData();
    
    // Extract admin data
    const managementType = formData.get('managementType') as string;
    
    // Extract personal info
    const personalInfo = {
      fullName: formData.get('personalInfo.fullName') as string,
      email: formData.get('personalInfo.email') as string,
      phone: formData.get('personalInfo.phone') as string,
      designation: formData.get('personalInfo.designation') as string,
    };
    
    // Extract clinic info
    const clinicInfo = {
      clinicName: formData.get('clinicInfo.clinicName') as string,
      clinicType: formData.get('clinicInfo.clinicType') as string,
      registrationNumber: formData.get('clinicInfo.registrationNumber') as string,
      establishmentYear: formData.get('clinicInfo.establishmentYear') as string,
      address: formData.get('clinicInfo.address') as string,
    };
    
    // Handle file uploads and store metadata
    const documents: DocumentInfo = {
      departments: formData.get('documents.departments') as string,
      doctorsCount: formData.get('documents.doctorsCount') as string,
      communicationMode: formData.get('documents.communicationMode') as string,
    };
    
    // Process government ID file
    const governmentIdFile = formData.get('documents.governmentId') as File | null;
    if (governmentIdFile && governmentIdFile instanceof File) {
      const { cloudinaryUrl, originalName } = await processFile(governmentIdFile);
      documents.governmentIdUrl = cloudinaryUrl;
      documents.governmentIdOriginalName = originalName;
    }
    
    // Process registration certificate file
    const registrationCertFile = formData.get('documents.registrationCertificate') as File | null;
    if (registrationCertFile && registrationCertFile instanceof File) {
      const { cloudinaryUrl, originalName } = await processFile(registrationCertFile);
      documents.registrationCertificateUrl = cloudinaryUrl;
      documents.registrationCertificateOriginalName = originalName;
    }
    
    // Process accreditation file (optional)
    const accreditationFile = formData.get('documents.accreditation') as File | null;
    if (accreditationFile && accreditationFile instanceof File) {
      const { cloudinaryUrl, originalName } = await processFile(accreditationFile);
      documents.accreditationUrl = cloudinaryUrl;
      documents.accreditationOriginalName = originalName;
    }
    
    // Save admin data to the database using Prisma
    const savedAdmin = await prisma.admin.create({
      data: {
        managementType,
        // Personal info
        fullName: personalInfo.fullName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        designation: personalInfo.designation,
        // Clinic info
        clinicName: clinicInfo.clinicName,
        clinicType: clinicInfo.clinicType,
        registrationNumber: clinicInfo.registrationNumber,
        establishmentYear: clinicInfo.establishmentYear,
        address: clinicInfo.address,
        // Documents info
        departments: documents.departments,
        doctorsCount: documents.doctorsCount,
        communicationMode: documents.communicationMode,
        // File URLs (cloudinary links now instead of local paths)
        governmentIdPath: documents.governmentIdUrl,
        governmentIdOriginalName: documents.governmentIdOriginalName,
        registrationCertificatePath: documents.registrationCertificateUrl,
        registrationCertificateOriginalName: documents.registrationCertificateOriginalName,
        accreditationPath: documents.accreditationUrl,
        accreditationOriginalName: documents.accreditationOriginalName
      }
    });
    

const options = {
  method: 'POST',
  url: 'https://doctor-verification.p.rapidapi.com/',
  headers: {
    'x-rapidapi-key': 'd2c00ff55amsha5d6bf399bb7601p10be96jsn6c78a162bcf3',
    'x-rapidapi-host': 'doctor-verification.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    registrationNo: '117419'
  }
};

try {
	const response = await axios.request(options);
	console.log("wow --> ",response.data);
} catch (error) {
	console.error(error);
}

    return NextResponse.json({ 
      success: true, 
      message: 'Admin registration completed successfully',
      adminId: savedAdmin.id
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing admin registration:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}