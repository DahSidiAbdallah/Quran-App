import React from 'react';
import { HiOutlineCalendar, HiOutlineBookOpen } from 'react-icons/hi';
import { Link } from 'react-router-dom';

interface ScheduleItem {
  title: string;
  time: string;
  date: string;
}

const sampleSchedule: ScheduleItem[] = [
  { title: 'Quran Juz 1', time: '06:00', date: 'Feb 21' },
  { title: 'Quran Juz 2', time: '07:00', date: 'Feb 22' },
];

const ScheduleCard = () => (
  <div className="bg-white p-5 rounded-2xl shadow-lg shadow-brand-cyan/10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-brand-dark">
        <HiOutlineCalendar className="w-5 h-5 text-brand-cyan" />
        My Schedule
      </h3>
      <Link to="/full-schedule" className="text-sm text-brand-cyan font-medium">
        See All
      </Link>
    </div>
    <ul className="space-y-3">
      {sampleSchedule.map((item, idx) => (
        <li key={idx} className="flex items-center justify-between bg-brand-light rounded-xl px-4 py-2">
          <div className="flex items-center gap-3">
            <HiOutlineBookOpen className="w-5 h-5 text-brand-cyan" />
            <span className="font-medium text-brand-dark">{item.title}</span>
          </div>
          <div className="text-right">
            <span className="block text-sm text-brand-gray">{item.time}</span>
            <span className="block text-xs text-brand-gray">{item.date}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ScheduleCard;

