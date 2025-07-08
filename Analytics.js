import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    activity: [],
    engagement: {},
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const renderMetricCard = (title, value, change, icon, color) => (
    <div className="metric-card">
      <div className="metric-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-value">{formatNumber(value)}</div>
        {change !== undefined && (
          <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityChart = () => (
    <div className="activity-chart">
      <h3>Activity Timeline</h3>
      <div className="chart-container">
        {analytics.activity.map((day, index) => (
          <div key={index} className="chart-bar">
            <div 
              className="bar-fill" 
              style={{ height: `${(day.value / Math.max(...analytics.activity.map(d => d.value))) * 100}%` }}
            ></div>
            <span className="bar-label">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEngagementMetrics = () => (
    <div className="engagement-metrics">
      <h3>Engagement Metrics</h3>
      <div className="metrics-grid">
        <div className="engagement-item">
          <div className="engagement-label">Posts Created</div>
          <div className="engagement-value">{analytics.engagement.postsCreated || 0}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Comments Made</div>
          <div className="engagement-value">{analytics.engagement.commentsMade || 0}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Likes Given</div>
          <div className="engagement-value">{analytics.engagement.likesGiven || 0}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Notes Created</div>
          <div className="engagement-value">{analytics.engagement.notesCreated || 0}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Resources Shared</div>
          <div className="engagement-value">{analytics.engagement.resourcesShared || 0}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Messages Sent</div>
          <div className="engagement-value">{analytics.engagement.messagesSent || 0}</div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceInsights = () => (
    <div className="performance-insights">
      <h3>Performance Insights</h3>
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <h4>Most Active Day</h4>
            <p>{analytics.performance.mostActiveDay || 'N/A'}</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">⏰</div>
          <div className="insight-content">
            <h4>Peak Activity Time</h4>
            <p>{analytics.performance.peakActivityTime || 'N/A'}</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h4>Engagement Rate</h4>
            <p>{(analytics.performance.engagementRate || 0).toFixed(1)}%</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-content">
            <h4>Content Quality Score</h4>
            <p>{(analytics.performance.contentQualityScore || 0).toFixed(1)}/10</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          Engagement
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="metrics-grid">
              {renderMetricCard(
                'Total Posts',
                analytics.overview.totalPosts || 0,
                getPercentageChange(
                  analytics.overview.postsChange?.current || 0,
                  analytics.overview.postsChange?.previous || 0
                ),
                '📝',
                '#007bff'
              )}
              {renderMetricCard(
                'Total Likes',
                analytics.overview.totalLikes || 0,
                getPercentageChange(
                  analytics.overview.likesChange?.current || 0,
                  analytics.overview.likesChange?.previous || 0
                ),
                '❤️',
                '#dc3545'
              )}
              {renderMetricCard(
                'Total Comments',
                analytics.overview.totalComments || 0,
                getPercentageChange(
                  analytics.overview.commentsChange?.current || 0,
                  analytics.overview.commentsChange?.previous || 0
                ),
                '💬',
                '#28a745'
              )}
              {renderMetricCard(
                'Active Users',
                analytics.overview.activeUsers || 0,
                getPercentageChange(
                  analytics.overview.usersChange?.current || 0,
                  analytics.overview.usersChange?.previous || 0
                ),
                '👥',
                '#ffc107'
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            {renderActivityChart()}
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="engagement-section">
            {renderEngagementMetrics()}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-section">
            {renderPerformanceInsights()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 