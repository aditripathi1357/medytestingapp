// app/api/users/route.ts

import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma'; // Ensure your prisma client path is correct

export async function POST(request: Request) {

try {

console.log('Received request to save user data');
let body;
try {
  body = await request.json();
  console.log('Request body:', JSON.stringify(body, null, 2));
} catch (parseError) {
  console.error('Error parsing request body:', parseError);
  return NextResponse.json(
    { error: 'Invalid request body' },
    { status: 400 }
  );
}
if (!body.email) {
  return NextResponse.json(
    { error: 'Email is required' },
    { status: 400 }
  );
}
if (!body.supabaseUid) {
  return NextResponse.json(
    { error: 'User ID (supabaseUid) is required' },
    { status: 400 }
  );
}
const userData: any = {
  updatedAt: new Date(),
};
const processData = (source: any, target: any) => {
  if (source.email !== undefined) target.email = source.email;
  if (source.phone !== undefined) target.phone = source.phone;
  if (source.name !== undefined) target.name = source.name;
  if (source.title !== undefined) target.title = source.title;
  if (source.birthDate !== undefined) {
    try {
      target.birthDate = new Date(source.birthDate);
    } catch (e) {
      console.warn('Invalid birthDate provided:', source.birthDate);
      // Decide if you want to set it to null or skip
      target.birthDate = null; 
    }
  }
  if (source.gender !== undefined) target.gender = source.gender;
  if (source.bloodGroup !== undefined) target.bloodGroup = source.bloodGroup;
  if (source.height !== undefined) target.height = parseInt(source.height) || null;
  if (source.weight !== undefined) target.weight = parseInt(source.weight) || null;
  if (source.maritalStatus !== undefined) target.maritalStatus = source.maritalStatus;
  if (source.contactNumber !== undefined) target.contactNumber = source.contactNumber;
  if (source.alternateNumber !== undefined) target.alternateNumber = source.alternateNumber;
  if (source.smokingHabit !== undefined) target.smokingHabit = source.smokingHabit;
  if (source.alcoholConsumption !== undefined) target.alcoholConsumption = source.alcoholConsumption;
  if (source.activityLevel !== undefined) target.activityLevel = source.activityLevel;
  if (source.dietHabit !== undefined) target.dietHabit = source.dietHabit;
  if (source.occupation !== undefined) target.occupation = source.occupation;
  if (source.allergies !== undefined) target.allergies = Array.isArray(source.allergies) ? source.allergies : [];
  if (source.medications !== undefined) target.medications = Array.isArray(source.medications) ? source.medications : [];
  if (source.chronicDiseases !== undefined) target.chronicDiseases = Array.isArray(source.chronicDiseases) ? source.chronicDiseases : [];
  if (source.injuries !== undefined) target.injuries = Array.isArray(source.injuries) ? source.injuries : [];
  if (source.surgeries !== undefined) target.surgeries = Array.isArray(source.surgeries) ? source.surgeries : [];
};
if (body.demographicData || body.lifestyleData || body.medicalData) {
  processData({
    ...body,
    ...body.demographicData,
    ...body.lifestyleData,
    ...body.medicalData
  }, userData);
} else {
  processData(body, userData);
}
let dbUser;
try {
  dbUser = await prisma.$transaction(async (tx) => {
    return await tx.user.upsert({
      where: { supabaseUid: body.supabaseUid },
      create: {
        ...userData, // userData already contains email if provided
        supabaseUid: body.supabaseUid,
        createdAt: new Date(),
      },
      update: userData,
    });
  });
} catch (dbError: any) {
  console.error('Database error:', dbError);
  if (dbError.code === 'P2002') { // Unique constraint failed
    // Could be email or supabaseUid if you have unique constraints on both
    return NextResponse.json(
      { error: 'User with this identifier already exists' }, // More generic message
      { status: 409 }
    );
  }
  return NextResponse.json(
    { error: 'Failed to save user data' },
    { status: 500 }
  );
}
console.log('Successfully upserted user:', dbUser.id);
return NextResponse.json({
  success: true,
  user: dbUser // Return the full user object from the database
});
} catch (error) {

console.error('Error in user POST API:', error);
return NextResponse.json(
  { 
    error: 'Internal server error in POST', 
    details: error instanceof Error ? error.message : String(error) 
  },
  { status: 500 }
);
}

}

export async function GET(request: Request) {

try {

console.log('Received request to fetch user data');
const { searchParams } = new URL(request.url);
const supabaseUidParam = searchParams.get('uid');
const emailParam = searchParams.get('email');
if (!supabaseUidParam && !emailParam) {
  return NextResponse.json(
    { error: 'User ID (uid) or email is required as query parameter' },
    { status: 400 }
  );
}
const dbUser = await prisma.user.findFirst({
  where: supabaseUidParam 
    ? { supabaseUid: supabaseUidParam }
    : { email: emailParam! } // Non-null assertion, already checked emailParam existence
});
if (!dbUser) {
  console.log(`User not found with uid: ${supabaseUidParam} or email: ${emailParam}`);
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
// Return the user data. UserModel.fromJson on the client expects fields like 
// id, email, supabaseUid, createdAt, updatedAt, and profile fields.
// By returning dbUser directly (or a copy), we ensure all these fields are available.
// If you need to specifically omit certain fields before sending to client,
// you can create a new object, but ensure all fields UserModel expects are present.
// const { someHighlySensitiveField, ...userForClient } = dbUser; // Example of excluding a field
console.log('User found, returning data:', dbUser.id);
return NextResponse.json({
  success: true,
  user: dbUser // Send the complete user object as fetched from DB
});
} catch (error) {

console.error('Error fetching user data (GET):', error);
return NextResponse.json(
  { 
    error: 'Internal server error in GET',
    details: error instanceof Error ? error.message : String(error)
  },
  { status: 500 }
);
}

}

export async function PUT(request: Request) {

try {

console.log('Received request to update user data');
let body;
try {
  body = await request.json();
} catch (parseError) {
  return NextResponse.json(
    { error: 'Invalid request body for PUT' },
    { status: 400 }
  );
}
const { supabaseUid, email, ...updateData } = body;
if (!supabaseUid && !email) {
  return NextResponse.json(
    { error: 'User ID (supabaseUid) or email is required for PUT' },
    { status: 400 }
  );
}
// It's good practice to not allow changing supabaseUid or email via a general update endpoint easily
// unless intended. The `updateData` spread should ideally not contain them.
// However, Prisma's update `where` clause handles identification.
const userDataToUpdate = {
  ...updateData,
  updatedAt: new Date(),
};
const dbUser = await prisma.user.update({
  where: supabaseUid 
    ? { supabaseUid: supabaseUid }
    : { email: email }, // Requires email to be unique if used as a lookup
  data: userDataToUpdate,
});
console.log('Successfully updated user:', dbUser.id);
return NextResponse.json({
  success: true,
  user: dbUser // Return the updated user object
});
} catch (error: any) { // Specify 'any' or a more specific error type if known for error.code

console.error('Error updating user data (PUT):', error);
if (error.code === 'P2025') { // Prisma error code for "Record to update not found"
  return NextResponse.json(
    { error: 'User not found to update' },
    { status: 404 }
  );
}
return NextResponse.json(
  { 
    error: 'Internal server error in PUT',
    details: error instanceof Error ? error.message : String(error)
  },
  { status: 500 }
);
}

}

export async function DELETE(request: Request) {

try {

console.log('Received request to delete user data');
const { searchParams } = new URL(request.url);
const supabaseUidParam = searchParams.get('uid');
const emailParam = searchParams.get('email');
if (!supabaseUidParam && !emailParam) {
  return NextResponse.json(
    { error: 'User ID (uid) or email is required for DELETE' },
    { status: 400 }
  );
}
await prisma.user.delete({
  where: supabaseUidParam 
    ? { supabaseUid: supabaseUidParam }
    : { email: emailParam! }
});
console.log(`Successfully deleted user with uid: ${supabaseUidParam} or email: ${emailParam}`);
return NextResponse.json({
  success: true,
  message: 'User deleted successfully'
});
} catch (error: any) { // Specify 'any' or a more specific error type

console.error('Error deleting user data (DELETE):', error);
if (error.code === 'P2025') { // Prisma error code for "Record to delete not found"
  return NextResponse.json(
    { error: 'User not found to delete' },
    { status: 404 }
  );
}
return NextResponse.json(
  { 
    error: 'Internal server error in DELETE',
    details: error instanceof Error ? error.message : String(error)
  },
  { status: 500 }
);
}

}