"""
Tests for predictive analytics and algorithm detection
Task 9.4: Test predictive accuracy and reliability
"""

import pytest
from datetime import datetime, timedelta
from backend.predictive_analytics import (
    PredictiveRankingModel,
    AlgorithmUpdateDetector,
    PerformanceForecaster,
    RankingDataPoint,
    PredictionResult,
    AlgorithmUpdate
)


@pytest.fixture
def ranking_model():
    return PredictiveRankingModel()


@pytest.fixture
def algorithm_detector():
    return AlgorithmUpdateDetector()


@pytest.fixture
def performance_forecaster():
    return PerformanceForecaster()


@pytest.fixture
def stable_ranking_data():
    """Generate stable ranking data (position 5 with minimal variation)"""
    base_date = datetime.now() - timedelta(days=30)
    return [
        RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="test keyword",
            position=5 + (i % 3 - 1),  # Varies between 4-6
            url="https://example.com",
            search_volume=1000,
            ctr=0.061
        )
        for i in range(30)
    ]


@pytest.fixture
def improving_ranking_data():
    """Generate improving ranking data (position improving from 20 to 5)"""
    base_date = datetime.now() - timedelta(days=30)
    return [
        RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="improving keyword",
            position=20 - int(i * 0.5),  # Improves by 0.5 positions per day
            url="https://example.com",
            search_volume=1500
        )
        for i in range(30)
    ]


@pytest.fixture
def declining_ranking_data():
    """Generate declining ranking data (position declining from 5 to 15)"""
    base_date = datetime.now() - timedelta(days=30)
    return [
        RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="declining keyword",
            position=5 + int(i * 0.33),  # Declines by 0.33 positions per day
            url="https://example.com",
            search_volume=2000
        )
        for i in range(30)
    ]


@pytest.fixture
def algorithm_update_data():
    """Generate data showing sudden ranking drop (algorithm update)"""
    base_date = datetime.now() - timedelta(days=14)
    data = []
    
    # Stable for first 7 days at position 5
    for i in range(7):
        data.append(RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="affected keyword",
            position=5,
            url="https://example.com",
            search_volume=1000
        ))
    
    # Sudden drop to position 15 in last 7 days
    for i in range(7, 14):
        data.append(RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="affected keyword",
            position=15,
            url="https://example.com",
            search_volume=1000
        ))
    
    return data


# Predictive Ranking Model Tests

def test_predict_stable_rankings(ranking_model, stable_ranking_data):
    """Test prediction for stable rankings"""
    prediction = ranking_model.predict_ranking(stable_ranking_data, days_ahead=30)
    
    assert prediction is not None
    assert prediction.keyword == "test keyword"
    assert prediction.trend == "stable"
    assert 3 <= prediction.predicted_position <= 7  # Should stay around 5
    assert prediction.confidence_level > 0.5  # Stable data = higher confidence


def test_predict_improving_rankings(ranking_model, improving_ranking_data):
    """Test prediction for improving rankings"""
    prediction = ranking_model.predict_ranking(improving_ranking_data, days_ahead=30)
    
    assert prediction is not None
    assert prediction.trend == "improving"
    assert prediction.predicted_position < prediction.current_position  # Should improve
    assert prediction.confidence_lower <= prediction.predicted_position <= prediction.confidence_upper


def test_predict_declining_rankings(ranking_model, declining_ranking_data):
    """Test prediction for declining rankings"""
    prediction = ranking_model.predict_ranking(declining_ranking_data, days_ahead=30)
    
    assert prediction is not None
    assert prediction.trend == "declining"
    assert prediction.predicted_position > prediction.current_position  # Should decline


def test_prediction_confidence_intervals(ranking_model, stable_ranking_data):
    """Test that confidence intervals are reasonable"""
    prediction = ranking_model.predict_ranking(stable_ranking_data, days_ahead=30)
    
    assert prediction is not None
    # Confidence interval should contain predicted position
    assert prediction.confidence_lower <= prediction.predicted_position <= prediction.confidence_upper
    # Confidence interval should be reasonable (not too wide)
    interval_width = prediction.confidence_upper - prediction.confidence_lower
    assert interval_width < 20  # Should be less than 20 positions wide


def test_insufficient_data_returns_none(ranking_model):
    """Test that insufficient data returns None"""
    insufficient_data = [
        RankingDataPoint(
            date=datetime.now(),
            keyword="test",
            position=5,
            url="https://example.com"
        )
        for _ in range(3)  # Only 3 data points
    ]
    
    prediction = ranking_model.predict_ranking(insufficient_data)
    assert prediction is None


def test_seasonal_pattern_detection(ranking_model):
    """Test detection of seasonal/weekly patterns"""
    # Create data with weekly pattern
    base_date = datetime.now() - timedelta(days=60)
    weekly_pattern_data = []
    
    for i in range(60):
        # Better rankings on weekdays, worse on weekends
        day_of_week = (base_date + timedelta(days=i)).weekday()
        position = 5 if day_of_week < 5 else 10
        
        weekly_pattern_data.append(RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="seasonal keyword",
            position=position,
            url="https://example.com"
        ))
    
    patterns = ranking_model.detect_seasonal_patterns(weekly_pattern_data)
    
    assert patterns["has_pattern"] == True
    assert patterns["pattern_strength"] in ["strong", "weak"]
    assert "weekly_averages" in patterns


# Algorithm Update Detection Tests

def test_detect_algorithm_update(algorithm_detector, algorithm_update_data):
    """Test detection of algorithm update from ranking changes"""
    update = algorithm_detector.detect_algorithm_update(algorithm_update_data)
    
    assert update is not None
    assert isinstance(update, AlgorithmUpdate)
    assert update.confidence >= 0.5  # Should have reasonable confidence
    assert len(update.affected_keywords) > 0
    assert update.recovery_strategy  # Should provide recovery strategy


def test_no_false_positive_on_stable_data(algorithm_detector, stable_ranking_data):
    """Test that stable data doesn't trigger false algorithm update detection"""
    update = algorithm_detector.detect_algorithm_update(stable_ranking_data)
    
    # Should not detect update for stable data
    assert update is None


def test_algorithm_update_impact_score(algorithm_detector, algorithm_update_data):
    """Test that impact score is calculated correctly"""
    update = algorithm_detector.detect_algorithm_update(algorithm_update_data)
    
    assert update is not None
    # Negative impact (rankings dropped from 5 to 15)
    assert update.impact_score < 0


def test_recovery_strategy_generation(algorithm_detector, algorithm_update_data):
    """Test that recovery strategies are generated"""
    update = algorithm_detector.detect_algorithm_update(algorithm_update_data)
    
    assert update is not None
    assert "audit" in update.recovery_strategy.lower() or "review" in update.recovery_strategy.lower()
    assert len(update.recovery_strategy) > 50  # Should be detailed


def test_correlate_with_known_updates(algorithm_detector):
    """Test correlation with known algorithm updates"""
    detected_date = datetime(2024, 3, 15)
    known_updates = [
        {"date": datetime(2024, 3, 12), "name": "March 2024 Core Update"},
        {"date": datetime(2024, 2, 1), "name": "February Spam Update"}
    ]
    
    correlated = algorithm_detector.correlate_with_known_updates(detected_date, known_updates)
    
    # Should correlate with March update (within 7 days)
    assert correlated == "March 2024 Core Update"


def test_no_correlation_with_distant_updates(algorithm_detector):
    """Test that distant updates are not correlated"""
    detected_date = datetime(2024, 3, 15)
    known_updates = [
        {"date": datetime(2024, 1, 1), "name": "January Update"}
    ]
    
    correlated = algorithm_detector.correlate_with_known_updates(detected_date, known_updates)
    
    # Should not correlate (more than 7 days apart)
    assert correlated is None


# Performance Forecasting Tests

def test_traffic_forecast_improving_rankings(performance_forecaster, improving_ranking_data, ranking_model):
    """Test traffic forecast for improving rankings"""
    # Generate predictions
    prediction = ranking_model.predict_ranking(improving_ranking_data, days_ahead=30)
    
    if prediction:
        forecast = performance_forecaster.forecast_traffic([prediction])
        
        assert forecast["predicted_monthly_traffic"] > forecast["current_monthly_traffic"]
        assert forecast["traffic_change"] > 0
        assert forecast["traffic_change_percent"] > 0


def test_traffic_forecast_declining_rankings(performance_forecaster, declining_ranking_data, ranking_model):
    """Test traffic forecast for declining rankings"""
    prediction = ranking_model.predict_ranking(declining_ranking_data, days_ahead=30)
    
    if prediction:
        forecast = performance_forecaster.forecast_traffic([prediction])
        
        # Should show decline or at least not improve significantly
        assert forecast["predicted_monthly_traffic"] <= forecast["current_monthly_traffic"]
        assert forecast["traffic_change"] <= 0
        assert forecast["traffic_change_percent"] <= 0


def test_traffic_forecast_multiple_keywords(performance_forecaster, stable_ranking_data, ranking_model):
    """Test traffic forecast with multiple keywords"""
    # Create predictions for multiple keywords
    predictions = []
    for i in range(3):
        data = [
            RankingDataPoint(
                date=d.date,
                keyword=f"keyword_{i}",
                position=d.position,
                url=d.url,
                search_volume=1000
            )
            for d in stable_ranking_data
        ]
        pred = ranking_model.predict_ranking(data, days_ahead=30)
        if pred:
            predictions.append(pred)
    
    forecast = performance_forecaster.forecast_traffic(predictions)
    
    assert forecast["current_monthly_traffic"] > 0
    assert forecast["predicted_monthly_traffic"] > 0
    assert "forecast_date" in forecast


# Integration Tests

def test_end_to_end_prediction_workflow(ranking_model, improving_ranking_data):
    """Test complete prediction workflow"""
    # 1. Make prediction
    prediction = ranking_model.predict_ranking(improving_ranking_data, days_ahead=30)
    assert prediction is not None
    
    # 2. Verify prediction quality
    assert prediction.confidence_level > 0.3  # Reasonable confidence
    assert prediction.trend in ["improving", "declining", "stable"]
    
    # 3. Verify prediction is within reasonable bounds
    assert 1 <= prediction.predicted_position <= 100
    assert 1 <= prediction.confidence_lower <= 100
    assert 1 <= prediction.confidence_upper <= 100


def test_algorithm_detection_accuracy_with_historical_data(algorithm_detector):
    """Test algorithm detection accuracy with known historical patterns"""
    # Simulate known algorithm update scenario
    base_date = datetime(2024, 3, 1)
    
    # Create data showing typical core update impact
    historical_data = []
    
    # Stable period before update
    for i in range(10):
        historical_data.append(RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="test keyword",
            position=8,
            url="https://example.com"
        ))
    
    # Volatility during update
    for i in range(10, 14):
        historical_data.append(RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="test keyword",
            position=8 + (i - 10) * 3,  # Rapid decline
            url="https://example.com"
        ))
    
    update = algorithm_detector.detect_algorithm_update(historical_data)
    
    assert update is not None
    assert update.confidence > 0.4
    assert "Core" in update.name or "Update" in update.name


def test_prediction_accuracy_validation(ranking_model):
    """Test prediction accuracy by comparing with 'future' data"""
    # Create historical data
    base_date = datetime.now() - timedelta(days=60)
    historical_data = [
        RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="validation keyword",
            position=10 - int(i * 0.1),  # Steady improvement
            url="https://example.com"
        )
        for i in range(30)
    ]
    
    # Create 'future' data (next 30 days)
    future_data = [
        RankingDataPoint(
            date=base_date + timedelta(days=30 + i),
            keyword="validation keyword",
            position=7 - int(i * 0.1),  # Continues improving
            url="https://example.com"
        )
        for i in range(30)
    ]
    
    # Make prediction
    prediction = ranking_model.predict_ranking(historical_data, days_ahead=30)
    
    # Compare with actual 'future' position
    actual_future_position = future_data[-1].position
    
    # Prediction should be within confidence interval
    assert prediction.confidence_lower <= actual_future_position <= prediction.confidence_upper


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
