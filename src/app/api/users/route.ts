// app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure your prisma client path is correct

// Helper type for Address data from client
interface AddressInput {
  id?: string; // For updates
  type: string;
  houseNumber?: string | null;
  street?: string | null;
  landmark?: string | null;
  area?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
}

export async function POST(request: Request) {
  try {
    console.log('Received request to save user data');
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!body.supabaseUid) {
      return NextResponse.json({ error: 'User ID (supabaseUid) is required' }, { status: 400 });
    }

    const { addresses, ...userDataInput } = body;

    const userData: any = {
      updatedAt: new Date(),
    };

    const processData = (source: any, target: any) => {
      // Keep existing data processing
      if (source.email !== undefined) target.email = source.email;
      if (source.phone !== undefined) target.phone = source.phone;
      if (source.name !== undefined) target.name = source.name;
      if (source.title !== undefined) target.title = source.title;
      if (source.birthDate !== undefined) {
        try {
          target.birthDate = new Date(source.birthDate);
        } catch (e) {
          console.warn('Invalid birthDate provided:', source.birthDate);
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

    if (userDataInput.demographicData || userDataInput.lifestyleData || userDataInput.medicalData) {
      processData({
        ...userDataInput,
        ...userDataInput.demographicData,
        ...userDataInput.lifestyleData,
        ...userDataInput.medicalData
      }, userData);
    } else {
      processData(userDataInput, userData);
    }

    let dbUser;
    try {
      dbUser = await prisma.$transaction(async (tx) => {
        const upsertedUser = await tx.user.upsert({
          where: { supabaseUid: body.supabaseUid },
          create: {
            ...userData,
            supabaseUid: body.supabaseUid,
            createdAt: new Date(),
          },
          update: userData,
          include: { addresses: true }, // Include addresses in the response
        });

        if (addresses && Array.isArray(addresses)) {
          // Simple approach: delete existing addresses and create new ones.
          // For more complex scenarios (updating specific addresses by ID),
          // you'd iterate and upsert each address.
          await tx.address.deleteMany({
            where: { userId: upsertedUser.id },
          });

          const newAddresses = (addresses as AddressInput[]).map(addr => ({
            ...addr,
            id: undefined, // Ensure Prisma generates new ID for creates
            userId: upsertedUser.id,
            isDefault: addr.isDefault ?? false, // Provide default for isDefault
            // Ensure all required fields for Address are present
            // Handle potential nulls from client if Prisma model doesn't allow them without default
            houseNumber: addr.houseNumber,
            street: addr.street,
            landmark: addr.landmark,
            area: addr.area,
            latitude: addr.latitude,
            longitude: addr.longitude,
          }));


          if (newAddresses.length > 0) {
             await tx.address.createMany({
                data: newAddresses.map(addr => {
                    const { id, ...rest } = addr; // Exclude id if present
                    return rest;
                }),
            });
          }
        }
        // Re-fetch user with addresses to return the complete state
        return await tx.user.findUnique({
          where: { id: upsertedUser.id },
          include: { addresses: true },
        });
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      if (dbError.code === 'P2002') {
        return NextResponse.json({ error: 'User with this identifier already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to save user data', details: dbError.message }, { status: 500 });
    }

    console.log('Successfully upserted user:', dbUser?.id);
    return NextResponse.json({ success: true, user: dbUser });

  } catch (error) {
    console.error('Error in user POST API:', error);
    return NextResponse.json({ error: 'Internal server error in POST', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    console.log('Received request to fetch user data');
    const { searchParams } = new URL(request.url);
    const supabaseUidParam = searchParams.get('uid');
    const emailParam = searchParams.get('email');

    if (!supabaseUidParam && !emailParam) {
      return NextResponse.json({ error: 'User ID (uid) or email is required as query parameter' }, { status: 400 });
    }

    const dbUser = await prisma.user.findFirst({
      where: supabaseUidParam ? { supabaseUid: supabaseUidParam } : { email: emailParam! },
      include: { addresses: true }, // Include addresses
    });

    if (!dbUser) {
      console.log(`User not found with uid: ${supabaseUidParam} or email: ${emailParam}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found, returning data:', dbUser.id);
    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Error fetching user data (GET):', error);
    return NextResponse.json({ error: 'Internal server error in GET', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Received request to update user data');
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid request body for PUT' }, { status: 400 });
    }

    const { supabaseUid, email, addresses, ...updateDataInput } = body;

    if (!supabaseUid && !email) {
      return NextResponse.json({ error: 'User ID (supabaseUid) or email is required for PUT' }, { status: 400 });
    }

    const userDataToUpdate: any = {
      ...updateDataInput, // Process this like in POST if it contains nested demographic/lifestyle/medical
      updatedAt: new Date(),
    };
    
    // You might want to refine how processData is used for PUT
    // For now, assuming updateDataInput directly contains fields for User model
    // If it contains demographicData, etc., you'd need processData here too.


    let updatedUser;
    try {
      updatedUser = await prisma.$transaction(async (tx) => {
        const userToUpdate = await tx.user.findFirst({
           where: supabaseUid ? { supabaseUid: supabaseUid } : { email: email! },
        });

        if (!userToUpdate) {
          throw new Error('UserNotFound'); // Custom error to catch below
        }

        const user = await tx.user.update({
          where: { id: userToUpdate.id },
          data: userDataToUpdate,
          include: { addresses: true }
        });

        if (addresses && Array.isArray(addresses)) {
          // Manage addresses: delete old ones, create new ones.
          // For more granular updates (e.g., update address by ID), logic would be more complex.
          await tx.address.deleteMany({
            where: { userId: user.id },
          });

          const newAddresses = (addresses as AddressInput[]).map(addr => ({
            ...addr,
            id: undefined, // Ensure Prisma generates new ID for creates
            userId: user.id,
            isDefault: addr.isDefault ?? false,
            houseNumber: addr.houseNumber,
            street: addr.street,
            landmark: addr.landmark,
            area: addr.area,
            latitude: addr.latitude,
            longitude: addr.longitude,
          }));

          if (newAddresses.length > 0) {
            await tx.address.createMany({
                data: newAddresses.map(addr => {
                    const { id, ...rest } = addr; // Exclude id if present
                    return rest;
                }),
            });
          }
        }
        // Re-fetch user with addresses
        return await tx.user.findUnique({
          where: { id: user.id },
          include: { addresses: true },
        });
      });

    } catch (error: any) {
      if (error.message === 'UserNotFound' || error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found to update' }, { status: 404 });
      }
      console.error('Database error during PUT:', error);
      return NextResponse.json({ error: 'Failed to update user data', details: error.message }, { status: 500 });
    }

    console.log('Successfully updated user:', updatedUser?.id);
    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error('Error updating user data (PUT):', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found to update' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error in PUT', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// DELETE remains largely the same, cascade delete will handle addresses if User is deleted.
export async function DELETE(request: Request) {
  try {
    console.log('Received request to delete user data');
    const { searchParams } = new URL(request.url);
    const supabaseUidParam = searchParams.get('uid');
    const emailParam = searchParams.get('email');

    if (!supabaseUidParam && !emailParam) {
      return NextResponse.json({ error: 'User ID (uid) or email is required for DELETE' }, { status: 400 });
    }

    // Find the user's internal ID first if not using cascade deletes properly or need to log specific user ID
    const user = await prisma.user.findFirst({
        where: supabaseUidParam ? { supabaseUid: supabaseUidParam } : { email: emailParam! }
    });

    if (!user) {
         return NextResponse.json({ error: 'User not found to delete' }, { status: 404 });
    }
    
    // Deleting the user will also delete their addresses due to `onDelete: Cascade`
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log(`Successfully deleted user with id: ${user.id} (uid: ${supabaseUidParam} or email: ${emailParam})`);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting user data (DELETE):', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found to delete' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error in DELETE', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}