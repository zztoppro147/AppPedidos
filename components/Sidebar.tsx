
import React from 'react';
import { Screen } from '../types';
import { NAVIGATION_ITEMS } from '../constants';

interface SidebarProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen, isMobileMenuOpen, setIsMobileMenuOpen }) => {

    const handleNavigation = (screen: Screen) => {
        setActiveScreen(screen);
        setIsMobileMenuOpen(false);
    };

    return (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-b44-light-alt dark:bg-b44-dark-alt flex flex-col transition-transform duration-300 ease-in-out md:relative md:flex md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-b44-primary">Base44</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {NAVIGATION_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors duration-200 ${
                            activeScreen === item.id 
                                ? 'bg-b44-primary text-white' 
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <span className="w-6 h-6 mr-3">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;