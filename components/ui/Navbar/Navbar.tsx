
import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <nav className="bg-transparent">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-transparent bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative bg-transparent">
        <div className="flex items-center justify-between h-16">
          {/* Skip to content link */}
          <a href="#skip" className="sr-only focus:not-sr-only">
            Skip to content
          </a>

          {/* Logo/Brand */}
          <Link 
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400"
          >
            YourBrand
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Navlinks user={user} />
            
          </div>
        </div>
      </div>
    </nav>
  );
}
