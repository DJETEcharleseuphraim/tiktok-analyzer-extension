import React, { useState, useEffect } from 'react';
import MyAccountDashboard from '../components/MyAccountDashboard';
import RevenueTracker from '../components/RevenueTracker';
import PerformanceDeepDive from '../components/PerformanceDeepDive';
import ContentStrategyAdvisor from '../components/ContentStrategyAdvisor';
import BenchmarkingCard from '../components/BenchmarkingCard';
import OptimizationRecommendations from '../components/OptimizationRecommendations';
import PersonalAlerts from '../components/PersonalAlerts';
import '../../styles/my-account.css';

const MyAccount: React.FC = () => {
  const [myStats, setMyStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAccountData();
  }, []);

  const loadMyAccountData = async () => {
    setLoading(true);
    try {
      // Charge les données du compte
      chrome.runtime.sendMessage(
        { type: 'GET_SETTINGS' },
        (response) => {
          if (response?.settings) {
            // Initialise avec les settings
          }
        }
      );

      // Charge l'historique de revenus
      chrome.runtime.sendMessage(
        { type: 'GET_REVENUE_ENTRIES', days: 30 },
        (response) => {
          if (response?.entries) {
            setRevenueData(response);
          }
        }
      );
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="my-account">
      <div className="account-grid">
        <MyAccountDashboard />
        <RevenueTracker revenueData={revenueData} />
        <PerformanceDeepDive />
        <ContentStrategyAdvisor />
        <BenchmarkingCard />
        <OptimizationRecommendations />
        <PersonalAlerts alerts={alerts} />
      </div>
    </div>
  );
};

export default MyAccount;
