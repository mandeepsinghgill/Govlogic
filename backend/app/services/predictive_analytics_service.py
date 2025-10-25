"""
Predictive Analytics Service - Forecasting, Trends, ML Models
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import statistics
from collections import defaultdict

class PredictiveAnalyticsService:
    """
    Advanced analytics and forecasting:
    - Win rate prediction
    - Pipeline forecasting
    - Revenue projection
    - Trend analysis
    - Anomaly detection
    - Competitive intelligence
    - Performance benchmarking
    """
    
    def __init__(self):
        self.historical_data = []
    
    async def forecast_pipeline_value(
        self,
        historical_opportunities: List[Dict],
        months_ahead: int = 6
    ) -> Dict[str, Any]:
        """
        Forecast pipeline value for next N months
        """
        # Group by month
        monthly_values = defaultdict(list)
        
        for opp in historical_opportunities:
            if 'created_date' in opp and 'value' in opp:
                month_key = opp['created_date'][:7]  # YYYY-MM
                monthly_values[month_key].append(opp['value'])
        
        # Calculate monthly averages
        monthly_avg = {
            month: statistics.mean(values)
            for month, values in monthly_values.items()
        }
        
        # Simple trend-based forecast
        recent_months = sorted(monthly_avg.keys())[-6:]
        if len(recent_months) >= 3:
            recent_values = [monthly_avg[m] for m in recent_months]
            avg_growth = statistics.mean([
                (recent_values[i] - recent_values[i-1]) / recent_values[i-1]
                for i in range(1, len(recent_values))
                if recent_values[i-1] > 0
            ])
        else:
            avg_growth = 0.05  # Default 5% growth
        
        # Generate forecast
        last_value = list(monthly_avg.values())[-1] if monthly_avg else 1000000
        forecast = []
        
        for i in range(1, months_ahead + 1):
            projected_value = last_value * ((1 + avg_growth) ** i)
            confidence = max(0.5, 0.95 - (i * 0.05))  # Confidence decreases over time
            
            forecast.append({
                'month': (datetime.now() + timedelta(days=30*i)).strftime('%Y-%m'),
                'projected_value': round(projected_value, 2),
                'confidence': round(confidence, 2),
                'low_estimate': round(projected_value * 0.8, 2),
                'high_estimate': round(projected_value * 1.2, 2)
            })
        
        return {
            'forecast': forecast,
            'growth_rate': round(avg_growth * 100, 2),
            'methodology': 'trend_extrapolation',
            'confidence_level': 'medium'
        }
    
    async def predict_win_rate(
        self,
        opportunity: Dict[str, Any],
        historical_wins: List[Dict],
        company_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict probability of winning based on historical data
        """
        # Feature extraction
        features = self._extract_features(opportunity, company_profile)
        
        # Find similar historical opportunities
        similar_opps = self._find_similar_opportunities(
            features,
            historical_wins
        )
        
        # Calculate win rate from similar opportunities
        if similar_opps:
            win_count = sum(1 for opp in similar_opps if opp.get('won', False))
            win_rate = win_count / len(similar_opps)
        else:
            win_rate = 0.5  # Default if no similar opportunities
        
        # Adjust based on specific factors
        adjustments = []
        
        if features['naics_match']:
            win_rate += 0.15
            adjustments.append({'factor': 'NAICS Match', 'impact': +15})
        
        if features['past_performance_count'] > 2:
            win_rate += 0.10
            adjustments.append({'factor': 'Strong Past Performance', 'impact': +10})
        
        if features['set_aside_advantage']:
            win_rate += 0.12
            adjustments.append({'factor': 'Set-Aside Advantage', 'impact': +12})
        
        if features['contract_size_ratio'] > 0.5:
            win_rate -= 0.08
            adjustments.append({'factor': 'Large Contract Size', 'impact': -8})
        
        # Cap at reasonable bounds
        win_rate = max(0.05, min(0.95, win_rate))
        
        return {
            'win_probability': round(win_rate * 100, 1),
            'confidence': 0.85,
            'similar_opportunities': len(similar_opps),
            'adjustments': adjustments,
            'recommendation': self._get_recommendation(win_rate)
        }
    
    async def analyze_trends(
        self,
        opportunities: List[Dict],
        time_period_days: int = 90
    ) -> Dict[str, Any]:
        """
        Analyze trends in opportunities
        """
        cutoff_date = datetime.now() - timedelta(days=time_period_days)
        
        # Filter to time period
        recent_opps = [
            opp for opp in opportunities
            if datetime.fromisoformat(opp.get('created_date', datetime.now().isoformat())) > cutoff_date
        ]
        
        # Analyze by agency
        agency_counts = defaultdict(int)
        for opp in recent_opps:
            agency_counts[opp.get('agency', 'Unknown')] += 1
        
        top_agencies = sorted(
            agency_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Analyze by NAICS
        naics_counts = defaultdict(int)
        for opp in recent_opps:
            naics_counts[opp.get('naics', 'Unknown')] += 1
        
        top_naics = sorted(
            naics_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Calculate average values
        values = [opp.get('value', 0) for opp in recent_opps if opp.get('value')]
        avg_value = statistics.mean(values) if values else 0
        
        return {
            'period_days': time_period_days,
            'total_opportunities': len(recent_opps),
            'top_agencies': [{'agency': a, 'count': c} for a, c in top_agencies],
            'top_naics': [{'naics': n, 'count': c} for n, c in top_naics],
            'average_value': round(avg_value, 2),
            'trend': 'increasing' if len(recent_opps) > len(opportunities) * 0.3 else 'stable'
        }
    
    async def detect_anomalies(
        self,
        opportunities: List[Dict]
    ) -> List[Dict[str, Any]]:
        """
        Detect unusual opportunities that deviate from norms
        """
        anomalies = []
        
        # Calculate normal ranges
        values = [opp.get('value', 0) for opp in opportunities if opp.get('value')]
        if not values:
            return anomalies
        
        mean_value = statistics.mean(values)
        stdev_value = statistics.stdev(values) if len(values) > 1 else mean_value * 0.2
        
        # Check each opportunity
        for opp in opportunities:
            value = opp.get('value', 0)
            
            # Unusually large contract
            if value > mean_value + (3 * stdev_value):
                anomalies.append({
                    'opportunity_id': opp.get('id'),
                    'title': opp.get('title'),
                    'type': 'unusually_large',
                    'value': value,
                    'expected_range': f"${mean_value - stdev_value:,.0f} - ${mean_value + stdev_value:,.0f}",
                    'recommendation': 'Review capacity and teaming options'
                })
            
            # Unusually short deadline
            if 'deadline_date' in opp:
                days_to_deadline = (datetime.fromisoformat(opp['deadline_date']) - datetime.now()).days
                if days_to_deadline < 14:
                    anomalies.append({
                        'opportunity_id': opp.get('id'),
                        'title': opp.get('title'),
                        'type': 'short_deadline',
                        'days_remaining': days_to_deadline,
                        'recommendation': 'Prioritize or consider no-bid'
                    })
        
        return anomalies
    
    async def benchmark_performance(
        self,
        company_metrics: Dict[str, Any],
        industry_averages: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Benchmark company performance against industry
        """
        if industry_averages is None:
            # Default industry benchmarks
            industry_averages = {
                'win_rate': 0.35,
                'avg_proposal_time_days': 21,
                'avg_pwin': 0.65,
                'proposals_per_month': 8
            }
        
        benchmarks = []
        
        for metric, company_value in company_metrics.items():
            if metric in industry_averages:
                industry_value = industry_averages[metric]
                difference = company_value - industry_value
                percentage_diff = (difference / industry_value) * 100 if industry_value > 0 else 0
                
                benchmarks.append({
                    'metric': metric,
                    'company_value': company_value,
                    'industry_average': industry_value,
                    'difference': round(difference, 2),
                    'percentage_difference': round(percentage_diff, 1),
                    'performance': 'above' if difference > 0 else 'below' if difference < 0 else 'at',
                    'rating': self._get_rating(percentage_diff)
                })
        
        return {
            'benchmarks': benchmarks,
            'overall_rating': self._calculate_overall_rating(benchmarks),
            'top_strengths': [b for b in benchmarks if b['performance'] == 'above'][:3],
            'areas_for_improvement': [b for b in benchmarks if b['performance'] == 'below'][:3]
        }
    
    async def competitive_intelligence(
        self,
        opportunity: Dict[str, Any],
        known_competitors: List[Dict],
        historical_data: List[Dict]
    ) -> Dict[str, Any]:
        """
        Analyze competitive landscape
        """
        # Find competitors who bid on similar opportunities
        similar_opps = self._find_similar_opportunities(
            self._extract_features(opportunity, {}),
            historical_data
        )
        
        competitor_analysis = []
        
        for competitor in known_competitors:
            # Count wins in similar opportunities
            wins = sum(
                1 for opp in similar_opps
                if opp.get('winner') == competitor.get('name')
            )
            
            bids = sum(
                1 for opp in similar_opps
                if competitor.get('name') in opp.get('bidders', [])
            )
            
            win_rate = wins / bids if bids > 0 else 0
            
            competitor_analysis.append({
                'name': competitor.get('name'),
                'win_rate': round(win_rate * 100, 1),
                'total_wins': wins,
                'total_bids': bids,
                'threat_level': 'high' if win_rate > 0.4 else 'medium' if win_rate > 0.2 else 'low',
                'strengths': competitor.get('strengths', []),
                'weaknesses': competitor.get('weaknesses', [])
            })
        
        # Sort by threat level
        competitor_analysis.sort(key=lambda x: x['win_rate'], reverse=True)
        
        return {
            'competitors': competitor_analysis,
            'market_concentration': self._calculate_market_concentration(competitor_analysis),
            'recommended_strategy': self._recommend_strategy(competitor_analysis)
        }
    
    def _extract_features(
        self,
        opportunity: Dict[str, Any],
        company_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract features for ML models"""
        return {
            'naics_match': opportunity.get('naics') in company_profile.get('naics_codes', []),
            'past_performance_count': len(company_profile.get('past_performance', [])),
            'contract_size_ratio': opportunity.get('value', 0) / max(company_profile.get('revenue', 1), 1),
            'set_aside_advantage': opportunity.get('set_aside') in company_profile.get('certifications', []),
            'agency': opportunity.get('agency'),
            'naics': opportunity.get('naics')
        }
    
    def _find_similar_opportunities(
        self,
        features: Dict[str, Any],
        historical_opps: List[Dict]
    ) -> List[Dict]:
        """Find similar historical opportunities"""
        similar = []
        
        for opp in historical_opps:
            similarity_score = 0
            
            if opp.get('agency') == features.get('agency'):
                similarity_score += 0.3
            
            if opp.get('naics') == features.get('naics'):
                similarity_score += 0.4
            
            if similarity_score >= 0.3:
                similar.append(opp)
        
        return similar
    
    def _get_recommendation(self, win_rate: float) -> str:
        """Get bid recommendation based on win rate"""
        if win_rate >= 0.6:
            return 'Strong Bid - High probability of win'
        elif win_rate >= 0.4:
            return 'Bid - Moderate probability, good opportunity'
        elif win_rate >= 0.25:
            return 'Evaluate - Consider strategic value'
        else:
            return 'No-Bid - Low probability, focus elsewhere'
    
    def _get_rating(self, percentage_diff: float) -> str:
        """Get performance rating"""
        if percentage_diff > 20:
            return 'excellent'
        elif percentage_diff > 10:
            return 'good'
        elif percentage_diff > -10:
            return 'average'
        elif percentage_diff > -20:
            return 'below_average'
        else:
            return 'poor'
    
    def _calculate_overall_rating(self, benchmarks: List[Dict]) -> str:
        """Calculate overall performance rating"""
        ratings = [b['rating'] for b in benchmarks]
        rating_scores = {
            'excellent': 5,
            'good': 4,
            'average': 3,
            'below_average': 2,
            'poor': 1
        }
        
        avg_score = statistics.mean([rating_scores.get(r, 3) for r in ratings])
        
        if avg_score >= 4.5:
            return 'excellent'
        elif avg_score >= 3.5:
            return 'good'
        elif avg_score >= 2.5:
            return 'average'
        else:
            return 'needs_improvement'
    
    def _calculate_market_concentration(self, competitors: List[Dict]) -> str:
        """Calculate market concentration level"""
        if not competitors:
            return 'unknown'
        
        top_3_share = sum(c['win_rate'] for c in competitors[:3]) / 100
        
        if top_3_share > 0.7:
            return 'highly_concentrated'
        elif top_3_share > 0.5:
            return 'moderately_concentrated'
        else:
            return 'fragmented'
    
    def _recommend_strategy(self, competitors: List[Dict]) -> str:
        """Recommend competitive strategy"""
        if not competitors:
            return 'Focus on differentiation and building past performance'
        
        top_competitor_rate = competitors[0]['win_rate']
        
        if top_competitor_rate > 50:
            return 'Consider teaming with top competitor or focus on niche differentiation'
        elif top_competitor_rate > 30:
            return 'Competitive market - emphasize unique strengths and past performance'
        else:
            return 'Open market - focus on quality proposal and compliance'


# Global instance
predictive_analytics_service = PredictiveAnalyticsService()

