
import React, { useState, useContext } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/Layout';
import ImportarPedidos from './screens/ImportarPedidos';
import Diseño from './screens/Resumen';
import Albaran from './screens/Albaran';
import Pedidos from './screens/Pedidos';
import ImportarIncidencias from './screens/ImportarIncidencias';
import IncidenciasKanban from './screens/IncidenciasKanban';
import Calendario from './screens/Calendario';
import Dashboard from './screens/Dashboard';
import { Screen } from './types';

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const { darkMode } = useContext(AppContext);

    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'dashboard':
                return <Dashboard />;
            case 'importar-pedidos':
                return <ImportarPedidos />;
            case 'diseño':
                return <Diseño />;
            case 'albaran':
                return <Albaran />;
            case 'pedidos':
                return <Pedidos />;
            case 'importar-incidencias':
                return <ImportarIncidencias />;
            case 'incidencias':
                return <IncidenciasKanban />;
            case 'calendario':
                return <Calendario />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
            {renderScreen()}
        </Layout>
    );
};

export default App;