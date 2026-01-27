import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

export function PublicLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <Outlet />
        </div>
    );
}
