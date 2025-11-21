
import React, { useState } from 'react';
import { useStore } from './store';
import Layout from './components/Layout';

// Component Imports
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import CashCloseView from './components/CashCloseView';
import StockEntry from './components/StockEntry';
import Reports from './components/Reports';

type ViewState = 'DASHBOARD' | 'INVENTORY' | 'POS' | 'STOCK_ENTRY' | 'CASH_CLOSE' | 'REPORTS';

const App: React.FC = () => {
  const { currentUser } = useStore();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'INVENTORY': return <Inventory />;
      case 'POS': return <POS />;
      case 'STOCK_ENTRY': return <StockEntry />;
      case 'CASH_CLOSE': return <CashCloseView />;
      case 'REPORTS': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
