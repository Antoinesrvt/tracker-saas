import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function Account() {
  const supabase = createClient();
  
  try {
    const [user, userDetails, subscription] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getSubscription(supabase)
    ]);

    if (!user) {
      return redirect('/signin');
    }

    return (
      <section className="mb-32 bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Account
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
              We partnered with Stripe for a simplified billing.
            </p>
          </div>
        </div>
        <div className="p-4">
          {subscription && <CustomerPortalForm subscription={subscription} />}
          <NameForm userName={userDetails?.full_name ?? ''} />
          {user.email && <EmailForm userEmail={user.email} />}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading account page:', error);
    return (
      <div className="p-4 text-center text-red-500">
        An error occurred while loading your account information. Please try again later.
      </div>
    );
  }
}
