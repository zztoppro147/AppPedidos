
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Screen } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, setActiveScreen }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    return (
        <div className="flex h-screen bg-b44-light dark:bg-b44-dark text-b44-secondary dark:text-b44-light-alt">
            <Sidebar 
                activeScreen={activeScreen} 
                setActiveScreen={setActiveScreen}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
             {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/60 md:hidden" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header activeScreen={activeScreen} toggleMobileMenu={toggleMobileMenu} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-b44-light dark:bg-b44-dark p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;