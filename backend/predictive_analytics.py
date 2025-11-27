"""
Predictive Analytics Module for RankBeacon SEO Exorcist
Task 9.4: Predictive ranking models and algorithm detection
"""

from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import statistics
import math


@dataclass
class RankingDataPoint:
    """Historical ranking data point"""
    date: datetime
    keyword: str
    position: int
    url: str
    search_volume: int = 0
    ctr: float = 0.0


@dataclass
class PredictionResult:
    """Prediction result with confidence intervals"""
    keyword: str
    current_position: int
    predicted_position: float
    confidence_lower: float
    confidence_upper: float
    confidence_level: float  # 0.0 to 1.0
    trend: str  # "improving", "declining", "stable"
    prediction_date: datetime


@dataclass
class AlgorithmUpdate:
    """Detected algorithm update"""
    date: datetime
    name: str
    confidence: float  # 0.0 to 1.0
    impact_score: float  # -100 to +100
    affected_keywords: List[str]
    recovery_strategy: str


class PredictiveRankingModel:
    """
    Predictive model for ranking forecasting using trend analysis
    and seasonal pattern detection
    """
    
    def __init__(self):
        self.min_data_points = 7  # Minimum data points for prediction
        self.prediction_window_days = 30
    
    def predict_ranking(
        self,
        historical_data: List[RankingDataPoint],
        days_ahead: int = 30
    ) -> Optional[PredictionResult]:
        """
        Predict future ranking position with confidence intervals
        
        Args:
            historical_data: List of historical ranking data points
            days_ahead: Number of days to predict ahead
        
        Returns:
            PredictionResult with prediction and confidence intervals
        """
        if len(historical_data) < self.min_data_points:
            return None
        
        # Sort by date
        sorted_data = sorted(historical_data, key=lambda x: x.date)
        
        # Extract positions and calculate trend
        positions = [d.position for d in sorted_data]
        
        # Calculate linear trend
        trend_slope = self._calculate_trend_slope(positions)
        
        # Calculate prediction
        current_position = positions[-1]
        predicted_change = trend_slope * days_ahead
        predicted_position = max(1, current_position + predicted_change)
        
        # Calculate confidence intervals based on historical volatility
        volatility = self._calculate_volatility(positions)
        confidence_range = volatility * math.sqrt(days_ahead)
        
        confidence_lower = max(1, predicted_position - confidence_range)
        confidence_upper = predicted_position + confidence_range
        
        # Calculate confidence level (higher for more stable data)
        confidence_level = self._calculate_confidence_level(positions, volatility)
        
        # Determine trend (adjusted thresholds for better sensitivity)
        if trend_slope < -0.2:
            trend = "improving"  # Lower position number = better ranking
        elif trend_slope > 0.2:
            trend = "declining"
        else:
            trend = "stable"
        
        return PredictionResult(
            keyword=sorted_data[0].keyword,
            current_position=current_position,
            predicted_position=round(predicted_position, 1),
            confidence_lower=round(confidence_lower, 1),
            confidence_upper=round(confidence_upper, 1),
            confidence_level=confidence_level,
            trend=trend,
            prediction_date=sorted_data[-1].date + timedelta(days=days_ahead)
        )
    
    def detect_seasonal_patterns(
        self,
        historical_data: List[RankingDataPoint]
    ) -> Dict[str, any]:
        """
        Detect seasonal patterns in ranking data
        
        Returns:
            Dictionary with seasonal pattern information
        """
        if len(historical_data) < 30:
            return {"has_pattern": False, "reason": "Insufficient data"}
        
        sorted_data = sorted(historical_data, key=lambda x: x.date)
        positions = [d.position for d in sorted_data]
        
        # Calculate weekly patterns
        weekly_avg = self._calculate_weekly_averages(sorted_data)
        
        # Check for significant weekly variation
        if len(weekly_avg) > 1:
            weekly_variance = statistics.variance(weekly_avg)
            has_weekly_pattern = weekly_variance > 2.0
        else:
            has_weekly_pattern = False
        
        return {
            "has_pattern": has_weekly_pattern,
            "weekly_averages": weekly_avg,
            "pattern_strength": "strong" if has_weekly_pattern else "weak",
            "recommendation": "Consider day-of-week optimization" if has_weekly_pattern else "No clear weekly pattern"
        }
    
    def _calculate_trend_slope(self, positions: List[int]) -> float:
        """Calculate linear trend slope using least squares"""
        n = len(positions)
        x = list(range(n))
        
        x_mean = statistics.mean(x)
        y_mean = statistics.mean(positions)
        
        numerator = sum((x[i] - x_mean) * (positions[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 0
        
        return numerator / denominator
    
    def _calculate_volatility(self, positions: List[int]) -> float:
        """Calculate ranking volatility (standard deviation)"""
        if len(positions) < 2:
            return 0
        return statistics.stdev(positions)
    
    def _calculate_confidence_level(self, positions: List[int], volatility: float) -> float:
        """
        Calculate confidence level based on data stability
        Returns value between 0.0 and 1.0
        """
        # More data points = higher confidence
        data_confidence = min(len(positions) / 30, 1.0)
        
        # Lower volatility = higher confidence
        volatility_confidence = max(0, 1.0 - (volatility / 10))
        
        # Combined confidence
        return (data_confidence + volatility_confidence) / 2
    
    def _calculate_weekly_averages(self, data: List[RankingDataPoint]) -> List[float]:
        """Calculate average positions by day of week"""
        weekly_data = {i: [] for i in range(7)}
        
        for point in data:
            day_of_week = point.date.weekday()
            weekly_data[day_of_week].append(point.position)
        
        return [
            statistics.mean(positions) if positions else 0
            for positions in weekly_data.values()
        ]


class AlgorithmUpdateDetector:
    """
    Detects algorithm updates by analyzing ranking volatility
    and industry-wide patterns
    """
    
    def __init__(self):
        self.volatility_threshold = 3.0  # Standard deviations
        self.impact_threshold = 5  # Minimum position change
    
    def detect_algorithm_update(
        self,
        ranking_history: List[RankingDataPoint],
        industry_baseline: Optional[Dict[str, float]] = None
    ) -> Optional[AlgorithmUpdate]:
        """
        Detect potential algorithm updates from ranking changes
        
        Args:
            ranking_history: Historical ranking data
            industry_baseline: Optional industry-wide volatility baseline
        
        Returns:
            AlgorithmUpdate if detected, None otherwise
        """
        if len(ranking_history) < 14:
            return None
        
        sorted_data = sorted(ranking_history, key=lambda x: x.date)
        
        # Analyze recent volatility (last 7 days vs previous 7 days)
        recent_data = sorted_data[-7:]
        previous_data = sorted_data[-14:-7]
        
        recent_positions = [d.position for d in recent_data]
        previous_positions = [d.position for d in previous_data]
        
        # Calculate volatility change
        recent_volatility = statistics.stdev(recent_positions) if len(recent_positions) > 1 else 0
        previous_volatility = statistics.stdev(previous_positions) if len(previous_positions) > 1 else 0
        
        # Calculate position change
        avg_recent = statistics.mean(recent_positions)
        avg_previous = statistics.mean(previous_positions)
        position_change = avg_recent - avg_previous
        
        # Detect significant change
        volatility_increase = recent_volatility - previous_volatility
        
        if abs(position_change) >= self.impact_threshold or volatility_increase >= self.volatility_threshold:
            # Algorithm update likely detected
            confidence = self._calculate_detection_confidence(
                position_change,
                volatility_increase,
                industry_baseline
            )
            
            affected_keywords = list(set(d.keyword for d in recent_data))
            
            # Determine impact and recovery strategy
            impact_score = -position_change * 10  # Negative change = positive impact
            recovery_strategy = self._generate_recovery_strategy(position_change, affected_keywords)
            
            return AlgorithmUpdate(
                date=recent_data[-1].date,
                name=self._identify_update_type(position_change, volatility_increase),
                confidence=confidence,
                impact_score=impact_score,
                affected_keywords=affected_keywords,
                recovery_strategy=recovery_strategy
            )
        
        return None
    
    def correlate_with_known_updates(
        self,
        detected_date: datetime,
        known_updates: List[Dict[str, any]]
    ) -> Optional[str]:
        """
        Correlate detected changes with known algorithm updates
        
        Args:
            detected_date: Date of detected change
            known_updates: List of known algorithm updates with dates
        
        Returns:
            Name of correlated update or None
        """
        for update in known_updates:
            update_date = update.get("date")
            if not update_date:
                continue
            
            # Check if within 7 days of known update
            days_diff = abs((detected_date - update_date).days)
            if days_diff <= 7:
                return update.get("name", "Unknown Update")
        
        return None
    
    def _calculate_detection_confidence(
        self,
        position_change: float,
        volatility_increase: float,
        industry_baseline: Optional[Dict[str, float]]
    ) -> float:
        """Calculate confidence level for algorithm update detection"""
        # Base confidence on magnitude of change (adjusted for better sensitivity)
        change_confidence = min(abs(position_change) / 10, 1.0)  # More sensitive
        volatility_confidence = min(max(volatility_increase, 0) / 3, 1.0)  # More sensitive
        
        # Adjust based on industry baseline if available
        if industry_baseline:
            industry_volatility = industry_baseline.get("volatility", 1.0)
            if volatility_increase > industry_volatility * 2:
                # Significantly higher than industry = higher confidence
                return min((change_confidence + volatility_confidence) / 1.5, 1.0)
        
        return (change_confidence + volatility_confidence) / 2
    
    def _identify_update_type(self, position_change: float, volatility: float) -> str:
        """Identify the likely type of algorithm update"""
        if abs(position_change) > 10:
            return "Core Algorithm Update"
        elif volatility > 5:
            return "Volatility Update"
        elif position_change < -5:
            return "Quality Update (Positive)"
        elif position_change > 5:
            return "Quality Update (Negative)"
        else:
            return "Minor Update"
    
    def _generate_recovery_strategy(
        self,
        position_change: float,
        affected_keywords: List[str]
    ) -> str:
        """Generate recovery strategy based on impact"""
        if position_change > 0:  # Rankings dropped
            return (
                "1. Audit content quality and E-E-A-T signals\n"
                "2. Review technical SEO (speed, mobile, Core Web Vitals)\n"
                "3. Analyze competitor improvements\n"
                "4. Update content with fresh, comprehensive information\n"
                "5. Build high-quality backlinks from authoritative sources"
            )
        elif position_change < -5:  # Significant improvement
            return (
                "1. Document what's working well\n"
                "2. Maintain current optimization strategies\n"
                "3. Expand successful tactics to other pages\n"
                "4. Monitor for sustainability of gains\n"
                "5. Continue building on momentum"
            )
        else:
            return (
                "1. Monitor rankings closely for next 2 weeks\n"
                "2. Continue standard SEO best practices\n"
                "3. Focus on user experience improvements\n"
                "4. Maintain content freshness"
            )


class PerformanceForecaster:
    """
    Forecasts SEO performance metrics like traffic and conversions
    """
    
    def forecast_traffic(
        self,
        ranking_predictions: List[PredictionResult],
        ctr_model: Optional[Dict[int, float]] = None
    ) -> Dict[str, any]:
        """
        Forecast organic traffic based on ranking predictions
        
        Args:
            ranking_predictions: List of ranking predictions
            ctr_model: Optional CTR model by position (default uses industry averages)
        
        Returns:
            Traffic forecast with confidence intervals
        """
        if not ctr_model:
            # Industry average CTR by position
            ctr_model = {
                1: 0.316, 2: 0.158, 3: 0.100, 4: 0.077, 5: 0.061,
                6: 0.050, 7: 0.042, 8: 0.036, 9: 0.031, 10: 0.027
            }
        
        total_traffic_current = 0
        total_traffic_predicted = 0
        
        for prediction in ranking_predictions:
            # Current traffic estimate
            current_ctr = ctr_model.get(prediction.current_position, 0.01)
            current_traffic = current_ctr * 1000  # Assuming 1000 monthly searches
            total_traffic_current += current_traffic
            
            # Predicted traffic estimate (use float position for more accurate CTR)
            predicted_pos = int(round(prediction.predicted_position))
            # Interpolate CTR for positions between known values
            if predicted_pos in ctr_model:
                predicted_ctr = ctr_model[predicted_pos]
            else:
                # Use lower CTR for positions beyond top 10
                predicted_ctr = 0.01
            predicted_traffic = predicted_ctr * 1000
            total_traffic_predicted += predicted_traffic
        
        traffic_change = total_traffic_predicted - total_traffic_current
        traffic_change_percent = (traffic_change / total_traffic_current * 100) if total_traffic_current > 0 else 0
        
        return {
            "current_monthly_traffic": round(total_traffic_current),
            "predicted_monthly_traffic": round(total_traffic_predicted),
            "traffic_change": round(traffic_change),
            "traffic_change_percent": round(traffic_change_percent, 1),
            "forecast_date": datetime.now() + timedelta(days=30),
            "confidence": "medium"  # Based on prediction confidence
        }
