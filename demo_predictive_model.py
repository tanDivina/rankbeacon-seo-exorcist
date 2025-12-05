#!/usr/bin/env python3
"""
Demo script to show the Predictive Ranking Model in action
"""

import sys
sys.path.insert(0, 'backend')

from datetime import datetime, timedelta
from backend.predictive_analytics import (
    PredictiveRankingModel,
    RankingDataPoint,
    AlgorithmUpdateDetector,
    PerformanceForecaster
)

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def demo_improving_rankings():
    """Demo: Website with improving rankings"""
    print_header("🔮 DEMO 1: Improving Rankings")
    
    # Create historical data showing improvement
    historical_data = []
    base_date = datetime.now() - timedelta(days=30)
    
    print("📊 Historical Data (Last 30 days):")
    for i in range(30):
        position = 20 - (i * 0.3)  # Improving from position 20 to 11
        data_point = RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="seo optimization",
            position=int(position),
            url="https://example.com",
            search_volume=1500,
            ctr=0.05
        )
        historical_data.append(data_point)
        
        # Print every 5 days
        if i % 5 == 0:
            print(f"  Day {i:2d}: Position {int(position)}")
    
    # Make prediction
    model = PredictiveRankingModel()
    prediction = model.predict_ranking(historical_data, days_ahead=30)
    
    if prediction:
        print(f"\n🎯 Current Position: {prediction.current_position}")
        print(f"🔮 Predicted Position (30 days): {prediction.predicted_position}")
        print(f"📈 Trend: {prediction.trend.upper()}")
        print(f"📊 Confidence: {int(prediction.confidence_level * 100)}%")
        print(f"📉 Confidence Range: {prediction.confidence_lower} - {prediction.confidence_upper}")
        
        # Traffic forecast
        forecaster = PerformanceForecaster()
        traffic = forecaster.forecast_traffic([prediction])
        
        print(f"\n💰 Traffic Forecast:")
        print(f"  Current: {traffic['current_monthly_traffic']} visits/month")
        print(f"  Predicted: {traffic['predicted_monthly_traffic']} visits/month")
        print(f"  Change: {traffic['traffic_change']:+d} ({traffic['traffic_change_percent']:+.1f}%)")

def demo_declining_rankings():
    """Demo: Website with declining rankings"""
    print_header("📉 DEMO 2: Declining Rankings")
    
    # Create historical data showing decline
    historical_data = []
    base_date = datetime.now() - timedelta(days=30)
    
    print("📊 Historical Data (Last 30 days):")
    for i in range(30):
        position = 5 + (i * 0.4)  # Declining from position 5 to 17
        data_point = RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="digital marketing",
            position=int(position),
            url="https://example.com",
            search_volume=2000,
            ctr=0.08
        )
        historical_data.append(data_point)
        
        if i % 5 == 0:
            print(f"  Day {i:2d}: Position {int(position)}")
    
    # Make prediction
    model = PredictiveRankingModel()
    prediction = model.predict_ranking(historical_data, days_ahead=30)
    
    if prediction:
        print(f"\n🎯 Current Position: {prediction.current_position}")
        print(f"🔮 Predicted Position (30 days): {prediction.predicted_position}")
        print(f"📉 Trend: {prediction.trend.upper()}")
        print(f"📊 Confidence: {int(prediction.confidence_level * 100)}%")
        print(f"⚠️  Warning: Rankings are declining!")

def demo_algorithm_detection():
    """Demo: Algorithm update detection"""
    print_header("🕵️ DEMO 3: Algorithm Update Detection")
    
    # Create data showing sudden drop (algorithm update)
    historical_data = []
    base_date = datetime.now() - timedelta(days=14)
    
    print("📊 Historical Data (Last 14 days):")
    for i in range(14):
        if i < 7:
            position = 8  # Stable before update
            status = "Stable"
        else:
            position = 18  # Dropped after update
            status = "⚠️ DROPPED"
        
        data_point = RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="content marketing",
            position=position,
            url="https://example.com"
        )
        historical_data.append(data_point)
        
        if i % 3 == 0 or i == 7:
            print(f"  Day {i:2d}: Position {position} - {status}")
    
    # Detect algorithm update
    detector = AlgorithmUpdateDetector()
    update = detector.detect_algorithm_update(historical_data)
    
    if update:
        print(f"\n⚠️  ALGORITHM UPDATE DETECTED!")
        print(f"📅 Date: {update.date.strftime('%Y-%m-%d')}")
        print(f"🏷️  Type: {update.name}")
        print(f"📊 Confidence: {int(update.confidence * 100)}%")
        print(f"💥 Impact Score: {update.impact_score:+.0f}")
        print(f"🎯 Affected Keywords: {', '.join(update.affected_keywords)}")
        print(f"\n🕯️  RECOVERY STRATEGY:")
        for line in update.recovery_strategy.split('\n'):
            if line.strip():
                print(f"  {line}")
    else:
        print("\n✅ No algorithm updates detected")

def demo_seasonal_patterns():
    """Demo: Seasonal pattern detection"""
    print_header("📅 DEMO 4: Seasonal Pattern Detection")
    
    # Create data with weekly pattern
    historical_data = []
    base_date = datetime.now() - timedelta(days=35)
    
    print("📊 Historical Data (5 weeks):")
    for i in range(35):
        day_of_week = (base_date + timedelta(days=i)).weekday()
        # Better rankings on weekdays, worse on weekends
        if day_of_week < 5:  # Weekday
            position = 10
        else:  # Weekend
            position = 15
        
        data_point = RankingDataPoint(
            date=base_date + timedelta(days=i),
            keyword="business software",
            position=position,
            url="https://example.com"
        )
        historical_data.append(data_point)
        
        if i % 7 == 0:
            print(f"  Week {i//7 + 1}: Positions vary 10-15 based on day")
    
    # Detect patterns
    model = PredictiveRankingModel()
    patterns = model.detect_seasonal_patterns(historical_data)
    
    print(f"\n🔍 Pattern Analysis:")
    print(f"  Has Pattern: {patterns['has_pattern']}")
    print(f"  Pattern Strength: {patterns['pattern_strength']}")
    print(f"  Recommendation: {patterns['recommendation']}")
    
    if patterns.get('weekly_averages'):
        print(f"\n📊 Average Position by Day of Week:")
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for i, avg in enumerate(patterns['weekly_averages']):
            if avg > 0:
                print(f"  {days[i]:9s}: {avg:.1f}")

def demo_multi_keyword_forecast():
    """Demo: Multiple keyword predictions"""
    print_header("🎯 DEMO 5: Multi-Keyword Forecast")
    
    keywords = [
        ("seo tools", 12, -0.2),      # Improving
        ("analytics", 8, 0.1),         # Stable
        ("marketing", 15, 0.3),        # Declining
    ]
    
    model = PredictiveRankingModel()
    forecaster = PerformanceForecaster()
    predictions = []
    
    print("📊 Analyzing multiple keywords...\n")
    
    for keyword, start_pos, trend_slope in keywords:
        # Generate historical data
        historical_data = []
        base_date = datetime.now() - timedelta(days=30)
        
        for i in range(30):
            position = start_pos + (i * trend_slope)
            data_point = RankingDataPoint(
                date=base_date + timedelta(days=i),
                keyword=keyword,
                position=int(max(1, position)),
                url="https://example.com",
                search_volume=1000
            )
            historical_data.append(data_point)
        
        # Make prediction
        prediction = model.predict_ranking(historical_data, days_ahead=30)
        if prediction:
            predictions.append(prediction)
            
            trend_emoji = "📈" if prediction.trend == "improving" else "📉" if prediction.trend == "declining" else "➡️"
            print(f"{trend_emoji} {keyword}:")
            print(f"  Current: Position {prediction.current_position}")
            print(f"  Predicted: Position {prediction.predicted_position}")
            print(f"  Trend: {prediction.trend}")
            print(f"  Confidence: {int(prediction.confidence_level * 100)}%")
            print()
    
    # Overall traffic forecast
    if predictions:
        traffic = forecaster.forecast_traffic(predictions)
        print(f"💰 Overall Traffic Forecast:")
        print(f"  Current: {traffic['current_monthly_traffic']} visits/month")
        print(f"  Predicted: {traffic['predicted_monthly_traffic']} visits/month")
        print(f"  Change: {traffic['traffic_change']:+d} ({traffic['traffic_change_percent']:+.1f}%)")

def main():
    print("\n" + "🎃"*30)
    print("  RANKBEACON PREDICTIVE ANALYTICS DEMO")
    print("  Showing ML Models in Action")
    print("🎃"*30)
    
    try:
        demo_improving_rankings()
        demo_declining_rankings()
        demo_algorithm_detection()
        demo_seasonal_patterns()
        demo_multi_keyword_forecast()
        
        print("\n" + "="*60)
        print("  ✅ All demos completed successfully!")
        print("="*60 + "\n")
        
        print("💡 These ML models are integrated into the MCP server")
        print("   and can be called via natural language in Kiro:")
        print()
        print('   "Predict rankings for example.com"')
        print('   "Check if my site was affected by algorithm updates"')
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
