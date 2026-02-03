# 🚀 Analytics Dashboard Setup Guide

## Installation Steps

### Backend Setup (Django)

#### 1. Create Migrations
```bash
cd Pageantry/PageantryVoting
python manage.py makemigrations Analytics
python manage.py migrate Analytics
```

#### 2. Create Superuser (if not already created)
```bash
python manage.py createsuperuser
```

#### 3. Run Development Server
```bash
python manage.py runserver
```

Your backend will be running at `http://127.0.0.1:8000`

---

### Frontend Setup (React)

#### 1. Analytics Dashboard is Already Integrated
The analytics dashboard is now available at:
- Route: `/dashboard/analytics/:eventId`
- Component: `Dashboard/Analytics/index.jsx`

#### 2. Run Frontend Development Server
```bash
cd Pageantry/front_end
npm run dev
```

Your frontend will be running at `http://localhost:5173`

---

## API Endpoints Reference

### Analytics Dashboard Endpoints

#### Get Complete Analytics Dashboard
```
GET /analytics/dashboard/<event_id>/
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "event_overview": { ... },
    "contestants": [ ... ],
    "vote_timeline": [ ... ],
    "device_breakdown": [ ... ],
    "geographic_breakdown": [ ... ],
    "fraud_summary": { ... },
    "revenue_summary": { ... }
  }
}
```

#### Get Live Vote Counter
```
GET /analytics/live-votes/<event_id>/
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "total_votes": 1250,
    "votes_last_minute": 5,
    "votes_last_hour": 85,
    "votes_last_24h": 1250,
    "velocity_per_minute": 1.42,
    "current_leader": {
      "name": "Contestant Name",
      "votes": 450,
      "photo": "photo_url"
    },
    "timestamp": "2026-01-28T10:30:45.123456Z"
  }
}
```

#### Get Contestant Leaderboard
```
GET /analytics/leaderboard/<event_id>/?limit=10&sort_by=votes
Authorization: Bearer {access_token}

Query Parameters:
- limit: number of results (default: 10)
- sort_by: 'votes', 'revenue', 'momentum' (default: 'votes')

Response:
{
  "status": "success",
  "data": [
    {
      "rank": 1,
      "contestant_id": 123,
      "name": "Contestant Name",
      "photo": "photo_url",
      "total_votes": 450,
      "total_revenue": 450.00,
      "percentage_of_total": 36.0,
      "momentum": 1.42
    },
    ...
  ]
}
```

#### Export Analytics Data
```
GET /analytics/export/<event_id>/?format=json&data_type=summary
Authorization: Bearer {access_token}

Query Parameters:
- format: 'csv' or 'json' (default: 'json')
- data_type: 'summary', 'votes', 'contestants', 'timeline' (default: 'summary')

Response: JSON or CSV file download
```

---

## Frontend Usage

### Accessing Analytics Dashboard

#### From Event Management Page
Add a button to navigate to analytics:

```jsx
import { useNavigate } from 'react-router-dom';

function EventManagement({ eventId }) {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate(`/dashboard/analytics/${eventId}`)}>
      📊 View Analytics
    </button>
  );
}
```

#### Direct URL
Navigate to: `http://localhost:5173/dashboard/analytics/EVENT_ID`

### Dashboard Features

1. **Live Vote Counter**
   - Real-time total votes display
   - Unique voter count
   - Total revenue generated
   - Animated updates

2. **Event Overview**
   - Average vote price
   - Payment status breakdown
   - Page views and bounce rate
   - Session duration stats

3. **Contestant Leaderboard**
   - Ranked list of contestants
   - Vote count per contestant
   - Revenue per contestant
   - Percentage of total votes
   - Momentum indicator

4. **Vote Timeline**
   - Hourly vote distribution (24 hours)
   - Bar chart visualization
   - Vote velocity trends

5. **Device Breakdown**
   - Mobile vs. Desktop vs. Tablet
   - Percentage breakdown
   - Device type usage patterns

6. **Geographic Breakdown**
   - Top 10 countries by votes
   - Vote distribution by location
   - Country flags for easy identification

7. **Fraud Detection Summary**
   - Flagged votes count
   - Quarantined votes
   - Fraud detection rate
   - Risk assessment

8. **Revenue Summary**
   - Total revenue breakdown
   - Completed vs. Pending vs. Failed payments
   - Progress visualization
   - Payment status distribution

---

## Key Features

### Real-Time Updates
- Auto-refresh every 5 seconds (configurable from UI)
- Polling mechanism with 4 refresh interval options
- Smooth animations and transitions

### Performance Optimized
- Database indexes on frequently queried fields
- Hourly aggregation for time-series data
- Efficient queryset aggregation using Django ORM

### Security
- Authentication required (Bearer token)
- Owner verification (only event creators can view their analytics)
- Rate limiting recommended

### Database Models

#### EventAnalytics
Stores aggregated event metrics:
- Total votes, unique voters, revenue
- Payment status breakdown
- Fraud metrics
- Engagement metrics

#### VoteTimeSeries
Time-series data (hourly aggregation):
- Vote count by hour
- Revenue by hour
- Average votes per voter by hour

#### DemographicData
Voter demographic information:
- Device type (mobile, tablet, desktop)
- Browser and OS information
- Geographic location (if available)
- Session information

#### ContestantAnalytics
Per-contestant metrics:
- Total votes received
- Total revenue
- Vote rank and percentage
- Momentum (votes per hour trend)

#### AnalyticsSnapshot
Daily snapshots for historical analysis:
- Daily totals
- Trend analysis
- Historical comparison

---

## Automatic Updates

### Vote Signal Handler
When a vote is created/updated with status='completed':
1. Updates EventAnalytics record
2. Creates/updates hourly VoteTimeSeries
3. Updates ContestantAnalytics
4. Creates/updates daily AnalyticsSnapshot

### No Manual Triggers Needed
Analytics are automatically updated via Django signals whenever votes are recorded.

---

## Dashboard Components Structure

```
src/Dashboard/Analytics/
├── index.jsx                    # Main dashboard component
├── analytics.css                # All styling (1000+ lines)
├── components/
│   ├── LiveVoteCounter.jsx      # Real-time vote display
│   ├── EventOverview.jsx        # Event metrics summary
│   ├── ContestantLeaderboard.jsx # Ranked contestant list
│   ├── VoteTimeline.jsx         # Hourly vote chart
│   ├── DeviceBreakdown.jsx      # Device type analytics
│   ├── GeographicBreakdown.jsx  # Location analytics
│   ├── FraudSummary.jsx         # Fraud detection metrics
│   └── RevenueSummary.jsx       # Revenue breakdown
```

---

## Customization Options

### Refresh Interval
Users can select from dropdown in dashboard:
- Every 5 seconds
- Every 10 seconds
- Every 30 seconds
- Every 1 minute

### Export Formats
- JSON export for data integration
- CSV export for spreadsheet analysis

### Color Scheme
Primary colors (customizable in CSS):
- Gradient: #667eea → #764ba2
- Success: #4caf50
- Warning: #ff9800
- Error: #f44336
- Info: #2196f3

---

## Troubleshooting

### Analytics Not Showing Data
1. Verify event creator is logged in
2. Check that votes exist with status='completed'
3. Verify Analytics app is in INSTALLED_APPS
4. Run migrations: `python manage.py migrate`

### Slow Loading
1. Check database indexes (already included in models)
2. Consider implementing caching (Redis recommended)
3. Optimize time-series query range

### Export Not Working
1. Ensure proper file permissions
2. Check MEDIA_ROOT and MEDIA_URL settings
3. Verify token is not expired

---

## Performance Notes

### Database Query Optimization
- All count/sum aggregations use Django ORM aggregation
- Time-based queries use date filters for efficiency
- Geographic queries limited to top 10

### Caching Recommendations
```python
# Consider adding Redis caching
from django.views.decorators.cache import cache_page

@cache_page(60)  # Cache for 60 seconds
def EventAnalyticsDashboard(request, event_id):
    ...
```

### Scaling Considerations
- Current design supports 100k+ votes efficiently
- For higher volumes, consider:
  - Partitioned time-series tables
  - Redis for real-time metrics
  - Elasticsearch for geographic/demographic queries

---

## Next Steps

1. **Deploy Backend**
   - Run migrations on production
   - Configure DEBUG = False
   - Set ALLOWED_HOSTS
   - Use PostgreSQL instead of SQLite

2. **Deploy Frontend**
   - Build: `npm run build`
   - Deploy dist/ folder

3. **Monitor Performance**
   - Set up logs
   - Monitor response times
   - Track user engagement

4. **Enhance Features**
   - Add chart library (Chart.js, Recharts)
   - Implement data export scheduling
   - Add custom date range selection
   - Implement prediction/forecasting

---

**Installation Complete!** 🎉

Your Analytics Dashboard is now ready to track and display real-time voting data.
