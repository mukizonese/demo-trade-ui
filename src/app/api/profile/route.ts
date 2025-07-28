import { NextRequest, NextResponse } from 'next/server';

// Get auth API URL from environment
const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, roles, newPassword } = body;

    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    console.log('Profile update request:', { email, role, roles, hasNewPassword: !!newPassword });

    // Update role using the existing auth API
    if (role) {
      const roleUpdateResponse = await fetch(`${authApiUrl}/api/auth/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth_token=${authToken}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!roleUpdateResponse.ok) {
        const errorData = await roleUpdateResponse.json();
        console.error('Role update failed:', errorData);
        return NextResponse.json(
          { success: false, message: errorData.message || 'Failed to update role' },
          { status: roleUpdateResponse.status }
        );
      }

      const roleUpdateResult = await roleUpdateResponse.json();
      console.log('Role update successful:', roleUpdateResult);
    }

    // TODO: Handle password change if newPassword is provided
    // This would require a separate endpoint in the auth API

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        email,
        role,
        roles: roles || [role],
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get user profile from the existing auth API
    const userResponse = await fetch(`${authApiUrl}/api/auth/me`, {
      headers: {
        'Cookie': `auth_token=${authToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user profile' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    
    return NextResponse.json({
      success: true,
      user: {
        ...userData.user,
        roles: [userData.user.role], // For now, just use the single role
        emailVerified: true, // You might want to get this from the actual user data
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 