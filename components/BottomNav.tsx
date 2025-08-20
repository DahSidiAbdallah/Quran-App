import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, GridIcon, ClockIcon, BookmarkIcon } from './Icons';

const NavItem = ({ to, icon }: { to: string, icon: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 ${
        isActive ? 'text-brand-cyan' : 'text-brand-gray hover:text-brand-dark'
      }`
    }
  >
    {icon}
  </NavLink>
);

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] max-w-md mx-auto flex justify-around items-center rounded-t-2xl">
      <NavItem to="/" icon={<HomeIcon className="w-7 h-7" />} />
      <NavItem to="/surahs" icon={<BookOpenIcon className="w-7 h-7" />} />
      <div className="bg-brand-cyan text-white p-4 rounded-full -mt-10 shadow-lg shadow-brand-cyan/50">
          <GridIcon className="w-8 h-8"/>
      </div>
      <NavItem to="/prayers" icon={<ClockIcon className="w-7 h-7" />} />
      <NavItem to="/bookmarks" icon={<BookmarkIcon className="w-7 h-7" />} />
    </nav>
  );
};

export default BottomNav;
