import React from 'react';
import { HiOutlineUsers } from 'react-icons/hi';

const groups = ['Quran Lovers', 'Ramadan Circle', 'TPO Muslims'];

const CommunityCard = () => (
  <div className="bg-white p-5 rounded-2xl shadow-lg shadow-brand-cyan/10">
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-brand-dark">
      <HiOutlineUsers className="w-5 h-5 text-brand-cyan" />
      Community
    </h3>
    <ul className="space-y-2">
      {groups.map(g => (
        <li key={g} className="flex items-center justify-between">
          <span className="text-brand-dark">{g}</span>
          <button className="text-sm text-brand-cyan font-medium">Join</button>
        </li>
      ))}
    </ul>
  </div>
);

export default CommunityCard;

