import React from 'react';
import { Input } from '../../ui/input';

const CALL_DATA = [
  {
    agent: '2733',
    description: '3CX PhoneSystem Call',
    callDate: '2025/07/08 10:56',
    duration: '02:48',
    type: 'Outbound',
    recordingLink: 'Listen',
  },
];

export function CallsTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <select className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <Input
          type="search"
          placeholder="Search"
          className="max-w-xs bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Agent</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Description</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Duration</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Recording Link</th>
            </tr>
          </thead>
          <tbody>
            {CALL_DATA.map((call, index) => (
              <tr key={index} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm text-muted-foreground">{call.agent}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{call.description}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{call.callDate}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{call.duration}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{call.type}</td>
                <td className="px-4 py-3 text-sm">
                  <a href="#" className="text-blue-600 hover:underline">{call.recordingLink}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Showing 1 to 1 of 1 entries</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-border rounded-md text-muted-foreground hover:bg-muted/20 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 border border-foreground bg-foreground text-background rounded-md">
            1
          </button>
          <button className="px-3 py-1.5 border border-border rounded-md text-muted-foreground hover:bg-muted/20 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
