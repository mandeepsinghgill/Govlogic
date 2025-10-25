"""
Continuous Learning Service - AI that learns and improves in real-time
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import asyncio
from collections import defaultdict
import numpy as np


class ContinuousLearningService:
    """
    Advanced AI service that continuously learns from user interactions,
    feedback, and corrections to improve content generation quality.
    
    Features:
    - Real-time feedback processing
    - Pattern recognition from user edits
    - Adaptive content generation
    - Quality scoring and improvement tracking
    - Domain-specific knowledge accumulation
    """
    
    def __init__(self):
        self.feedback_history: List[Dict[str, Any]] = []
        self.user_preferences: Dict[str, Dict] = defaultdict(dict)
        self.content_patterns: Dict[str, List[Dict]] = defaultdict(list)
        self.quality_scores: Dict[str, List[float]] = defaultdict(list)
        self.learning_metrics: Dict[str, Any] = {
            'total_interactions': 0,
            'feedback_processed': 0,
            'patterns_learned': 0,
            'quality_improvement': 0.0
        }
    
    async def process_user_feedback(
        self,
        user_id: str,
        content_type: str,
        original_content: str,
        edited_content: str,
        feedback_score: Optional[float] = None,
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process user feedback and learn from edits
        
        Args:
            user_id: User identifier
            content_type: Type of content (proposal, technical_approach, etc.)
            original_content: AI-generated content
            edited_content: User-edited content
            feedback_score: Optional quality score (1-10)
            context: Additional context (RFP info, requirements, etc.)
        
        Returns:
            Learning insights and updated patterns
        """
        feedback_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'content_type': content_type,
            'original': original_content,
            'edited': edited_content,
            'score': feedback_score,
            'context': context or {}
        }
        
        self.feedback_history.append(feedback_entry)
        self.learning_metrics['total_interactions'] += 1
        self.learning_metrics['feedback_processed'] += 1
        
        # Analyze the differences
        differences = self._analyze_content_differences(original_content, edited_content)
        
        # Extract patterns from edits
        patterns = self._extract_edit_patterns(differences, context)
        
        # Update user preferences
        self._update_user_preferences(user_id, content_type, patterns)
        
        # Update content patterns
        self._update_content_patterns(content_type, patterns, feedback_score)
        
        # Calculate quality improvement
        if feedback_score:
            self.quality_scores[content_type].append(feedback_score)
            self._calculate_quality_improvement(content_type)
        
        return {
            'status': 'learned',
            'patterns_extracted': len(patterns),
            'differences_found': len(differences),
            'learning_applied': True,
            'quality_trend': self._get_quality_trend(content_type)
        }
    
    def _analyze_content_differences(
        self,
        original: str,
        edited: str
    ) -> List[Dict[str, Any]]:
        """
        Analyze differences between original and edited content
        """
        differences = []
        
        # Split into sentences
        original_sentences = self._split_sentences(original)
        edited_sentences = self._split_sentences(edited)
        
        # Find additions
        for sentence in edited_sentences:
            if sentence not in original_sentences:
                differences.append({
                    'type': 'addition',
                    'content': sentence,
                    'category': self._categorize_sentence(sentence)
                })
        
        # Find removals
        for sentence in original_sentences:
            if sentence not in edited_sentences:
                differences.append({
                    'type': 'removal',
                    'content': sentence,
                    'category': self._categorize_sentence(sentence)
                })
        
        # Find modifications (simplified)
        # In production, use more sophisticated diff algorithms
        
        return differences
    
    def _extract_edit_patterns(
        self,
        differences: List[Dict],
        context: Optional[Dict]
    ) -> List[Dict[str, Any]]:
        """
        Extract patterns from user edits
        """
        patterns = []
        
        # Analyze additions
        additions = [d for d in differences if d['type'] == 'addition']
        if additions:
            patterns.append({
                'pattern_type': 'preferred_additions',
                'categories': [d['category'] for d in additions],
                'examples': [d['content'] for d in additions[:3]],
                'frequency': len(additions)
            })
        
        # Analyze removals
        removals = [d for d in differences if d['type'] == 'removal']
        if removals:
            patterns.append({
                'pattern_type': 'avoided_content',
                'categories': [d['category'] for d in removals],
                'examples': [d['content'] for d in removals[:3]],
                'frequency': len(removals)
            })
        
        # Extract style patterns
        if context:
            patterns.append({
                'pattern_type': 'contextual_preference',
                'context': context,
                'edit_count': len(differences)
            })
        
        return patterns
    
    def _update_user_preferences(
        self,
        user_id: str,
        content_type: str,
        patterns: List[Dict]
    ):
        """
        Update user-specific preferences
        """
        if content_type not in self.user_preferences[user_id]:
            self.user_preferences[user_id][content_type] = {
                'preferred_additions': [],
                'avoided_content': [],
                'style_preferences': {}
            }
        
        prefs = self.user_preferences[user_id][content_type]
        
        for pattern in patterns:
            if pattern['pattern_type'] == 'preferred_additions':
                prefs['preferred_additions'].extend(pattern['categories'])
            elif pattern['pattern_type'] == 'avoided_content':
                prefs['avoided_content'].extend(pattern['categories'])
    
    def _update_content_patterns(
        self,
        content_type: str,
        patterns: List[Dict],
        score: Optional[float]
    ):
        """
        Update global content patterns
        """
        for pattern in patterns:
            pattern['score'] = score
            pattern['timestamp'] = datetime.utcnow().isoformat()
            self.content_patterns[content_type].append(pattern)
        
        self.learning_metrics['patterns_learned'] += len(patterns)
    
    def _calculate_quality_improvement(self, content_type: str):
        """
        Calculate quality improvement over time
        """
        scores = self.quality_scores[content_type]
        if len(scores) >= 2:
            # Calculate trend (simple moving average comparison)
            recent_avg = np.mean(scores[-10:]) if len(scores) >= 10 else np.mean(scores)
            initial_avg = np.mean(scores[:10]) if len(scores) >= 10 else scores[0]
            improvement = ((recent_avg - initial_avg) / initial_avg) * 100
            self.learning_metrics['quality_improvement'] = improvement
    
    def _get_quality_trend(self, content_type: str) -> Dict[str, Any]:
        """
        Get quality trend for content type
        """
        scores = self.quality_scores[content_type]
        if not scores:
            return {'trend': 'no_data'}
        
        if len(scores) < 5:
            return {
                'trend': 'insufficient_data',
                'average_score': np.mean(scores),
                'sample_size': len(scores)
            }
        
        recent_avg = np.mean(scores[-5:])
        overall_avg = np.mean(scores)
        
        return {
            'trend': 'improving' if recent_avg > overall_avg else 'stable',
            'recent_average': recent_avg,
            'overall_average': overall_avg,
            'improvement_rate': ((recent_avg - overall_avg) / overall_avg) * 100,
            'total_samples': len(scores)
        }
    
    async def apply_learned_patterns(
        self,
        user_id: str,
        content_type: str,
        generated_content: str,
        context: Optional[Dict] = None
    ) -> str:
        """
        Apply learned patterns to improve generated content
        
        Args:
            user_id: User identifier
            content_type: Type of content
            generated_content: Newly generated content
            context: Generation context
        
        Returns:
            Improved content based on learned patterns
        """
        # Get user preferences
        user_prefs = self.user_preferences.get(user_id, {}).get(content_type, {})
        
        # Get global patterns
        global_patterns = self.content_patterns.get(content_type, [])
        
        # Apply improvements (simplified - in production use ML models)
        improved_content = generated_content
        
        # Filter out avoided content
        avoided = user_prefs.get('avoided_content', [])
        for category in avoided:
            # Remove sentences matching avoided categories
            sentences = self._split_sentences(improved_content)
            filtered = [s for s in sentences if self._categorize_sentence(s) not in avoided]
            improved_content = ' '.join(filtered)
        
        # Add preferred content patterns
        # (In production, use more sophisticated NLP to integrate naturally)
        
        return improved_content
    
    def _split_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences
        """
        # Simple sentence splitting (use NLTK or spaCy in production)
        import re
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _categorize_sentence(self, sentence: str) -> str:
        """
        Categorize sentence type
        """
        sentence_lower = sentence.lower()
        
        if any(word in sentence_lower for word in ['experience', 'years', 'past performance']):
            return 'past_performance'
        elif any(word in sentence_lower for word in ['technical', 'approach', 'methodology']):
            return 'technical_approach'
        elif any(word in sentence_lower for word in ['management', 'team', 'personnel']):
            return 'management'
        elif any(word in sentence_lower for word in ['cost', 'price', 'budget']):
            return 'pricing'
        else:
            return 'general'
    
    def get_learning_metrics(self) -> Dict[str, Any]:
        """
        Get current learning metrics
        """
        return {
            **self.learning_metrics,
            'user_count': len(self.user_preferences),
            'content_types': list(self.content_patterns.keys()),
            'total_patterns': sum(len(p) for p in self.content_patterns.values()),
            'average_quality_scores': {
                content_type: np.mean(scores) if scores else 0
                for content_type, scores in self.quality_scores.items()
            }
        }
    
    async def export_learned_knowledge(self) -> Dict[str, Any]:
        """
        Export learned knowledge for fine-tuning or transfer
        """
        return {
            'exported_at': datetime.utcnow().isoformat(),
            'metrics': self.get_learning_metrics(),
            'user_preferences': dict(self.user_preferences),
            'content_patterns': dict(self.content_patterns),
            'quality_scores': dict(self.quality_scores),
            'feedback_history': self.feedback_history[-1000:]  # Last 1000 entries
        }
    
    async def import_learned_knowledge(self, knowledge_data: Dict[str, Any]):
        """
        Import previously learned knowledge
        """
        if 'user_preferences' in knowledge_data:
            self.user_preferences.update(knowledge_data['user_preferences'])
        
        if 'content_patterns' in knowledge_data:
            for content_type, patterns in knowledge_data['content_patterns'].items():
                self.content_patterns[content_type].extend(patterns)
        
        if 'quality_scores' in knowledge_data:
            for content_type, scores in knowledge_data['quality_scores'].items():
                self.quality_scores[content_type].extend(scores)
        
        if 'feedback_history' in knowledge_data:
            self.feedback_history.extend(knowledge_data['feedback_history'])


# Global instance
continuous_learning_service = ContinuousLearningService()

