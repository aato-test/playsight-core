import React, { useState } from 'react';
import {
  Send,
  Users,
  Calendar,
  Shield,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { TeamMessage } from '../types';
import { MOCK_TEAM_MESSAGES } from '../data/mockData';
import { UserAvatar } from './UserAvatar';

interface TeamHubProps {
  currentBranch: string;
}

export const TeamHub: React.FC<TeamHubProps> = ({ currentBranch }) => {
  const [messages, setMessages] = useState<TeamMessage[]>(MOCK_TEAM_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: TeamMessage = {
      id: `tm-${Date.now()}`,
      sender: 'Prakash S.',
      handle: 'prakash.s',
      avatar: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newMessage.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
  };

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarDays: Array<{ day: string | number; empty?: boolean; isCurrent?: boolean }> = [
    ...Array.from({ length: offset }, () => ({ day: '', empty: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      isCurrent: index + 1 === now.getDate(),
    })),
  ];
  const monthLabel = now.toLocaleString('en', { month: 'short', year: 'numeric' });

  const teamMembers = [
    {
      name: 'Daniel Jones',
      role: 'Staff Quality Engineer',
    },
    {
      name: 'Sarah Jenkins',
      role: 'SDET II - Core Engine',
    },
    {
      name: 'Mike Thomas',
      role: 'Platform Engineering Lead',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-900 max-w-7xl mx-auto w-full font-sans">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Team Quality Pod & Collaboration
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Active workspace collaboration pod · Branch: <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">{currentBranch}</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Left Chat & Right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Hub Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[540px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900">Automation Channel</h3>
                  <span className="text-xs text-slate-500 font-medium">#sprint-qa-automation</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Team Sync Active
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <UserAvatar name={msg.sender} size="md" />
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{msg.sender}</span>
                        <span className="text-xs font-mono text-slate-500">@{msg.handle}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message the quality pod..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Team Members & Scheduled Meetings Calendar */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900">Active Quality Pod</h3>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {teamMembers.length} Members
              </span>
            </div>

            <div className="space-y-2.5">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.name} size="md" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500 font-medium">{member.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900">Release Schedule</h3>
              </div>
              <div className="text-xs font-bold text-indigo-600 font-mono">{monthLabel}</div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-200 mb-2">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((c, i) => (
                  <div
                    key={i}
                    className={`h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
                      c.empty
                        ? 'opacity-0'
                        : c.isCurrent
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                    }`}
                  >
                    {c.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
