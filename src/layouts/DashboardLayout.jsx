import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { googleService } from '../services/google';

export function DashboardLayout() {
    useEffect(() => {
        // Sync user calendars when dashboard loads
        googleService.syncUserCalendars().catch(err => {
            console.error('Failed to sync user calendars', err);
        });
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-52">
                <Outlet />
            </main>
        </div>
    );
}
