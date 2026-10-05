import React, { useState } from 'react';
import {
  Send,
  Users,
  Calendar,
  Shield,
  MessageSquare,
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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 max-w-7xl mx-auto w-full">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Team Hub & Settings
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Collaborative quality pod · local demo</span>
            <span>·</span>
            <span>Branch: <code className="text-teal-400 font-mono">{currentBranch}</code></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-teal-400 text-xs font-mono">
            Local only
          </span>
        </div>
      </div>

      {/* Main Grid: Left Chat & Right Panels (matching screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Hub Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-100">Team Hub</h3>
                  <span className="text-xs text-slate-400">#sprint-qa-automation channel</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                Sample team data
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <UserAvatar name={msg.sender} size="md" />
                  <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{msg.sender}</span>
                        <span className="text-xs font-mono text-slate-400">@{msg.handle}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message the quality pod..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
              />
              <button
                type="submit"
                className="p-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors font-medium flex items-center justify-center shadow-sm shadow-teal-500/20 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Settings Section (matching screenshot 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Integrations</h3>
              </div>
              <span className="text-xs text-amber-400">
                Not connected
              </span>
            </div>

            <div className="space-y-2">
              {['GitHub', 'Jira Cloud'].map((name) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-sm font-semibold text-slate-200">{name}</div>
                  <span className="text-xs text-amber-400">Not connected · configure server-side</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Team Members & Scheduled Meetings Calendar */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Sample Team Members</h3>
              </div>
              <span className="text-xs text-slate-400">Local fixture</span>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.name} size="md" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.role}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Sample</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Meetings / Calendar Card (matching screenshot 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Calendar</h3>
              </div>
                <div className="text-xs text-teal-400">{monthLabel}</div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 pb-2 border-b border-slate-800 mb-2">
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
                    className={`h-7 flex items-center justify-center rounded text-xs transition-colors ${
                      c.empty
                        ? 'opacity-0'
                        : c.isCurrent
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60'
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
