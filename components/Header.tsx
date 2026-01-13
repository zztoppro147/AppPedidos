
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Screen } from '../types';
import { NAVIGATION_ITEMS } from '../constants';

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" x2="12" y1="1" y2="3"/><line x1="12" x2="12" y1="21" y2="23"/><line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/><line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/><line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>;


interface HeaderProps {
    activeScreen: Screen;
    toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeScreen, toggleMobileMenu }) => {
    const { darkMode, toggleDarkMode } = useContext(AppContext);
    const screenTitle = NAVIGATION_ITEMS.find(item => item.id === activeScreen)?.label || 'Panel';

    return (
        <header className="flex justify-between items-center h-20 px-6 bg-b44-light-alt dark:bg-b44-dark-alt border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                 <button onClick={toggleMobileMenu} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden mr-4">
                    <MenuIcon />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{screenTitle}</h2>
            </div>
            <button onClick={toggleDarkMode} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-b44-primary">
                {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
        </header>
    );
};

export default Header;