import React from 'react';
import { HiOutlineUsers } from 'react-icons/hi';
import { Link } from 'react-router-dom';

interface Group {
  name: string;
  members: number;
}

const groups: Group[] = [
  { name: 'Quran Lovers', members: 120 },
  { name: 'Ramadan Circle', members: 80 },
  { name: 'TPO Muslims', members: 64 },
];

const CommunityCard = () => (
  <div className="bg-white p-5 rounded-2xl shadow-lg shadow-brand-cyan/10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-brand-dark">
        <HiOutlineUsers className="w-5 h-5 text-brand-cyan" />
        Community
      </h3>
      <Link to="/community" className="text-sm text-brand-cyan font-medium">
        See All
      </Link>
    </div>
    <ul className="space-y-2">
      {groups.map(g => (
        <li key={g.name} className="flex items-center justify-between">
          <div>
            <span className="block text-brand-dark">{g.name}</span>
            <span className="text-xs text-brand-gray">{g.members} members</span>
          </div>
          <button className="text-sm text-brand-cyan font-medium">Join</button>
        </li>
      ))}
    </ul>
  </div>
);

export default CommunityCard;

