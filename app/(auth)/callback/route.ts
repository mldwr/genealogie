import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('callback GET',code,requestUrl);

  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          exchangeError.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    // Successfully exchanged code for session, now get user details and ensure profile exists
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
       console.error('Error getting user after session exchange:', getUserError);
       return NextResponse.redirect(
         getErrorRedirect(
           `${requestUrl.origin}/signin`,
           'User Retrieval Error',
           "Could not retrieve your details after login. Please try again."
         )
       );
    }

    // Attempt to create a profile if one doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email!, // Assuming email is non-null for authenticated users
          role: 'user' // Default role
        },
        {
          ignoreDuplicates: true // Insert only if 'id' doesn't exist
        }
      );

    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      // Log the error but proceed with login; profile issues can be handled separately
      // Consider redirecting to an error page or showing a toast in a real app
    }
  } else {
    // Handle case where 'code' is missing in the request URL
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/signin`,
        'Missing Code',
        "Authentication flow issue: Missing authorization code."
      )
    );
  }

  // URL to redirect to after sign in process completes (and profile check)
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/account`,
      'Success!',
      'You are now signed in.'
    )
  );
}