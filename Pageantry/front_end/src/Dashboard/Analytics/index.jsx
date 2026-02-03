import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './analytics.css';
import LiveVoteCounter from './components/LiveVoteCounter';
import EventOverview from './components/EventOverview';
import ContestantLeaderboard from './components/ContestantLeaderboard';
import VoteTimeline from './components/VoteTimeline';
import DeviceBreakdown from './components/DeviceBreakdown';
import GeographicBreakdown from './components/GeographicBreakdown';
import FraudSummary from './components/FraudSummary';
import RevenueSummary from './components/RevenueSummary';

const Analytics = () => {
  const { eventId } = useParams();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://127.0.0.1:8000/analytics/dashboard/${eventId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data.data);
      setError(null);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Set up auto-refresh
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAnalytics, refreshInterval]);

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="analytics-error">
          <p>❌ Error: {error}</p>
          <button onClick={fetchAnalytics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header with title and refresh controls */}
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="analytics-controls">
          <button 
            onClick={fetchAnalytics}
            className="btn-refresh"
            title="Refresh data"
          >
            🔄 Refresh
          </button>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-interval-select"
          >
            <option value={5000}>Every 5 seconds</option>
            <option value={10000}>Every 10 seconds</option>
            <option value={30000}>Every 30 seconds</option>
            <option value={60000}>Every 1 minute</option>
          </select>
        </div>
      </div>

      {/* Live vote counter - always visible at top */}
      {analyticsData?.event_overview && (
        <LiveVoteCounter eventOverview={analyticsData.event_overview} />
      )}

      {/* Main metrics grid */}
      <div className="analytics-grid">
        {/* Left column - Overview and Revenue */}
        <div className="analytics-column">
          {analyticsData?.event_overview && (
            <EventOverview data={analyticsData.event_overview} />
          )}
          
          {analyticsData?.revenue_summary && (
            <RevenueSummary revenue={analyticsData.revenue_summary} />
          )}
          
          {analyticsData?.fraud_summary && (
            <FraudSummary fraud={analyticsData.fraud_summary} />
          )}
        </div>

        {/* Right column - Leaderboard and Charts */}
        <div className="analytics-column">
          {analyticsData?.contestants && (
            <ContestantLeaderboard contestants={analyticsData.contestants} />
          )}
        </div>
      </div>

      {/* Timeline and breakdown charts */}
      <div className="analytics-grid analytics-secondary">
        {analyticsData?.vote_timeline && (
          <VoteTimeline data={analyticsData.vote_timeline} />
        )}

        {analyticsData?.device_breakdown && (
          <DeviceBreakdown data={analyticsData.device_breakdown} />
        )}

        {analyticsData?.geographic_breakdown && (
          <GeographicBreakdown data={analyticsData.geographic_breakdown} />
        )}
      </div>

      {/* Export section */}
      <div className="analytics-export-section">
        <button 
          onClick={() => window.open(`http://127.0.0.1:8000/analytics/export/${eventId}/?format=csv`, '_blank')}
          className="btn-export"
        >
          📥 Export as CSV
        </button>
        <button 
          onClick={() => window.open(`http://127.0.0.1:8000/analytics/export/${eventId}/?format=json`, '_blank')}
          className="btn-export"
        >
          📥 Export as JSON
        </button>
      </div>
    </div>
  );
};

export default Analytics;
