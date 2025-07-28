# Scanémon Analytics System 📊

## Overview

The Scanémon Analytics System provides comprehensive tracking and insights for card scanning performance, user behavior, and model accuracy. This system enables data-driven improvements to the scanning experience and helps identify areas for optimization.

## ✅ Completed Features

### 1. Enhanced Scan Logging with Database Integration
- **Database Models**: `ScanAnalytics` and `ScanSession` tables for comprehensive data storage
- **Metadata Tracking**: File size, type, processing time, model version, timestamps
- **User Behavior**: Acceptance rates, collection additions, user feedback
- **Error Tracking**: ML errors, validation errors, processing failures

### 2. Comprehensive Analytics API Endpoints

#### `/api/v1/analytics/stats` - Main Statistics Endpoint
```http
GET /api/v1/analytics/stats?days=30
```
**Returns:**
- Total scans, success rates, acceptance rates
- Confidence score statistics (average, min, max, std dev)
- Processing time metrics
- Most scanned cards and sets
- Daily scan trends
- Configurable time range (1-365 days)

#### `/api/v1/analytics/confidence-distribution` - Confidence Analysis
```http
GET /api/v1/analytics/confidence-distribution
```
**Returns:**
- Distribution across confidence ranges (0-20%, 20-40%, etc.)
- Total scans with confidence scores

#### `/api/v1/analytics/model-performance` - Model Metrics
```http
GET /api/v1/analytics/model-performance?model_version=fake_v1.2.0
```
**Returns:**
- Success rates by model version
- Average confidence scores
- Processing time statistics
- Model comparison data

#### `/api/v1/analytics/error-analysis` - Error Tracking
```http
GET /api/v1/analytics/error-analysis
```
**Returns:**
- Error counts by type
- Total error count
- Error patterns and trends

#### `/api/v1/analytics/history` - Scan History
```http
GET /api/v1/analytics/history?page=1&limit=50
```
**Returns:**
- Paginated scan history
- Detailed scan metadata
- User-specific data (when authenticated)

#### `/api/v1/analytics/realtime` - Live Statistics
```http
GET /api/v1/analytics/realtime
```
**Returns:**
- Last 24 hours statistics
- Last hour scan count
- Active session count
- Real-time performance metrics

#### `/api/v1/analytics/leaderboard` - User Rankings
```http
GET /api/v1/analytics/leaderboard?days=7
```
**Returns:**
- Top users by scan count
- User statistics and achievements
- Configurable time period

### 3. Enhanced ML Model Tracking
- **Model Version**: Enhanced version tracking (`fake_v1.2.0`)
- **Processing Time**: Accurate timing measurements
- **File Metadata**: Size, type, and scan method tracking
- **Model Metadata**: Training data version, model family, last updated

### 4. Lightweight Stats Dashboard
- **Real-time Metrics**: Live performance indicators
- **Interactive Charts**: Confidence distribution, daily trends
- **User-friendly Interface**: Modern, responsive design
- **Time Range Selection**: 7, 30, or 90-day analysis
- **Color-coded Metrics**: Visual performance indicators

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd api
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd app
npm start
```

### 3. Generate Test Data
```bash
python test_analytics.py
```

### 4. Access Analytics
- **Dashboard**: http://localhost:3000/analytics
- **API Docs**: http://localhost:8000/docs
- **Test Results**: Check console output

## 📊 Key Metrics Tracked

### Performance Metrics
- **Total Scans**: Overall scan volume
- **Success Rate**: Percentage of successful scans
- **Acceptance Rate**: User acceptance of scan results
- **Processing Time**: Average, min, max processing times
- **Error Rates**: ML errors, validation errors, system errors

### Quality Metrics
- **Confidence Scores**: Distribution and statistics
- **Model Performance**: Version comparison and accuracy
- **User Feedback**: Acceptance patterns and preferences
- **Card Popularity**: Most scanned cards and sets

### User Behavior
- **Scan Patterns**: Daily trends and usage patterns
- **Session Data**: Scan sessions and user engagement
- **Collection Activity**: Cards added to collections
- **User Rankings**: Leaderboards and achievements

## 🔧 Technical Implementation

### Database Schema

#### ScanAnalytics Table
```sql
CREATE TABLE scan_analytics (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(100),
    scan_method VARCHAR(20),
    file_size INTEGER,
    file_type VARCHAR(20),
    filename VARCHAR(255),
    model_version VARCHAR(50),
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    card_name VARCHAR(200),
    card_set VARCHAR(200),
    card_rarity VARCHAR(50),
    card_type VARCHAR(50),
    card_hp VARCHAR(20),
    accepted BOOLEAN,
    added_to_collection BOOLEAN,
    user_feedback VARCHAR(20),
    error_type VARCHAR(100),
    error_message TEXT,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

#### ScanSession Table
```sql
CREATE TABLE scan_sessions (
    id INTEGER PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE,
    user_id INTEGER,
    total_scans INTEGER,
    successful_scans INTEGER,
    failed_scans INTEGER,
    average_confidence FLOAT,
    total_processing_time_ms INTEGER,
    status VARCHAR(20),
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);
```

### API Response Examples

#### Scan Statistics Response
```json
{
  "total_scans": 150,
  "successful_scans": 142,
  "failed_scans": 8,
  "success_rate": 94.67,
  "acceptance_rate": 78.5,
  "confidence": {
    "average": 0.856,
    "minimum": 0.123,
    "maximum": 1.0,
    "standard_deviation": 0.234
  },
  "processing_time": {
    "average_ms": 245.67,
    "minimum_ms": 89,
    "maximum_ms": 1234
  },
  "most_scanned_cards": [
    {"card_name": "Pikachu", "count": 25},
    {"card_name": "Charizard", "count": 18}
  ],
  "most_common_sets": [
    {"set_name": "Base Set", "count": 45},
    {"set_name": "Jungle", "count": 23}
  ],
  "daily_trends": [
    {"date": "2024-01-01", "count": 12},
    {"date": "2024-01-02", "count": 15}
  ],
  "period_days": 30
}
```

## 🎯 Use Cases

### For Developers
- **Performance Monitoring**: Track API response times and error rates
- **Model Evaluation**: Compare different model versions
- **User Experience**: Understand user behavior and preferences
- **System Optimization**: Identify bottlenecks and improvement areas

### For Users
- **Personal Insights**: View individual scan history and statistics
- **Progress Tracking**: Monitor scanning achievements and streaks
- **Quality Assessment**: Understand confidence levels and accuracy
- **Community Features**: Compare performance with other users

### For Product Managers
- **Feature Usage**: Track which features are most popular
- **User Engagement**: Monitor daily active users and session data
- **Quality Metrics**: Measure user satisfaction and acceptance rates
- **Growth Analysis**: Identify trends and growth opportunities

## 🔮 Future Enhancements

### Planned Features
- **Advanced Visualizations**: Charts, graphs, and interactive dashboards
- **Predictive Analytics**: ML-based insights and recommendations
- **Export Functionality**: Data export for external analysis
- **Real-time Alerts**: Notifications for performance issues
- **A/B Testing**: Support for model comparison and testing

### Integration Opportunities
- **Business Intelligence**: Integration with BI tools
- **Monitoring Systems**: Prometheus, Grafana integration
- **Data Warehousing**: BigQuery, Snowflake integration
- **Machine Learning**: Automated model retraining based on analytics

## 🛠️ Development

### Adding New Metrics
1. **Database**: Add new columns to `ScanAnalytics` table
2. **Service**: Update `ScanAnalyticsService` methods
3. **API**: Add new endpoints in `analytics.py`
4. **Frontend**: Update dashboard components
5. **Testing**: Add test cases to `test_analytics.py`

### Custom Analytics
```python
# Example: Custom analytics service method
def get_custom_metrics(self, user_id: Optional[int] = None) -> Dict[str, Any]:
    """Get custom business metrics"""
    # Implementation here
    pass
```

## 📈 Performance Considerations

### Database Optimization
- **Indexes**: Added on frequently queried columns
- **Partitioning**: Consider partitioning by date for large datasets
- **Caching**: Redis caching for frequently accessed data
- **Archiving**: Move old data to archive tables

### API Optimization
- **Pagination**: All list endpoints support pagination
- **Filtering**: Query parameters for data filtering
- **Caching**: Response caching for expensive queries
- **Rate Limiting**: Protect against abuse

## 🧪 Testing

### Automated Testing
```bash
# Run analytics tests
python test_analytics.py

# Run API tests
pytest tests/test_analytics_api.py

# Run integration tests
pytest tests/test_analytics_integration.py
```

### Manual Testing
1. **Generate Data**: Use `test_analytics.py` to create test data
2. **Check Dashboard**: Visit http://localhost:3000/analytics
3. **Verify API**: Test endpoints via http://localhost:8000/docs
4. **Monitor Database**: Check SQLite database for data integrity

## 📚 Documentation

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

### Code Documentation
- **Service Layer**: `api/app/services/scan_analytics_service.py`
- **API Routes**: `api/app/routes/analytics.py`
- **Database Models**: `api/app/models/scan_analytics.py`
- **Frontend Components**: `app/src/pages/AnalyticsPage.tsx`

## 🤝 Contributing

### Code Standards
- **Type Hints**: All Python functions include type hints
- **Docstrings**: Comprehensive documentation for all methods
- **Error Handling**: Proper exception handling and logging
- **Testing**: Unit tests for all new features

### Pull Request Process
1. **Feature Branch**: Create feature branch from main
2. **Implementation**: Add new analytics features
3. **Testing**: Include comprehensive tests
4. **Documentation**: Update README and API docs
5. **Review**: Submit PR for code review

## 📞 Support

### Getting Help
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and API docs first

### Common Issues
- **Database Connection**: Ensure SQLite database is writable
- **CORS Errors**: Check CORS configuration in FastAPI
- **Missing Data**: Run `test_analytics.py` to generate test data
- **Performance Issues**: Check database indexes and query optimization

---

**🎉 Congratulations!** You now have a comprehensive analytics system for Scanémon that tracks model confidence, scan count, and user behavior over time. The system provides both backend APIs and a beautiful frontend dashboard for monitoring and insights. 