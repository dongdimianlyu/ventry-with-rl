#!/usr/bin/env python3
"""
Lightweight User Feedback System for RL Agent

This system provides a lightweight way to collect user feedback on RL recommendations
without requiring UI changes. It integrates with the existing Slack approval workflow
and provides contextual feedback collection.

Features:
- Automatic feedback prompts after task completion
- Contextual feedback collection ("Was this outcome helpful?")
- Integration with existing Slack workflow
- Minimal user friction
- Feedback analytics and insights
"""

import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class FeedbackRequest:
    """Data structure for feedback requests"""
    id: str
    task_id: str
    user_id: str
    recommendation_summary: str
    outcome_summary: str
    request_type: str  # 'outcome_helpful', 'recommendation_quality', 'general'
    created_at: datetime
    expires_at: datetime
    status: str = "pending"  # pending, completed, expired
    response_data: Optional[Dict[str, Any]] = None
    responded_at: Optional[datetime] = None


@dataclass
class FeedbackResponse:
    """Data structure for feedback responses"""
    id: str
    request_id: str
    task_id: str
    user_id: str
    response_type: str
    rating: float  # 1-5 scale
    comment: Optional[str] = None
    helpful: Optional[bool] = None
    would_recommend: Optional[bool] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


class UserFeedbackSystem:
    """Lightweight user feedback system"""
    
    def __init__(self, data_dir: str = ".", slack_integration: bool = True):
        """
        Initialize the feedback system
        
        Args:
            data_dir: Directory for data files
            slack_integration: Whether to integrate with Slack
        """
        self.data_dir = data_dir
        self.slack_integration = slack_integration
        
        # File paths
        self.feedback_requests_file = os.path.join(data_dir, "feedback_requests.json")
        self.feedback_responses_file = os.path.join(data_dir, "feedback_responses.json")
        self.feedback_analytics_file = os.path.join(data_dir, "feedback_analytics.json")
        
        # Data storage
        self.feedback_requests: List[FeedbackRequest] = self._load_feedback_requests()
        self.feedback_responses: List[FeedbackResponse] = self._load_feedback_responses()
        
        # Configuration
        self.request_expiry_hours = 48  # Feedback requests expire after 48 hours
        self.max_requests_per_user = 3  # Maximum pending requests per user
        
        logger.info(f"User Feedback System initialized (slack_integration={slack_integration})")
    
    def _load_feedback_requests(self) -> List[FeedbackRequest]:
        """Load existing feedback requests"""
        try:
            if os.path.exists(self.feedback_requests_file):
                with open(self.feedback_requests_file, 'r') as f:
                    data = json.load(f)
                    requests = []
                    for item in data:
                        # Convert datetime strings back to datetime objects
                        item['created_at'] = datetime.fromisoformat(item['created_at'])
                        item['expires_at'] = datetime.fromisoformat(item['expires_at'])
                        if item.get('responded_at'):
                            item['responded_at'] = datetime.fromisoformat(item['responded_at'])
                        requests.append(FeedbackRequest(**item))
                    return requests
            return []
        except Exception as e:
            logger.error(f"Error loading feedback requests: {e}")
            return []
    
    def _save_feedback_requests(self):
        """Save feedback requests to file"""
        try:
            data = []
            for request in self.feedback_requests:
                request_dict = asdict(request)
                # Convert datetime objects to ISO strings
                request_dict['created_at'] = request.created_at.isoformat()
                request_dict['expires_at'] = request.expires_at.isoformat()
                if request.responded_at:
                    request_dict['responded_at'] = request.responded_at.isoformat()
                data.append(request_dict)
            
            with open(self.feedback_requests_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.debug(f"Saved {len(data)} feedback requests")
            
        except Exception as e:
            logger.error(f"Error saving feedback requests: {e}")
    
    def _load_feedback_responses(self) -> List[FeedbackResponse]:
        """Load existing feedback responses"""
        try:
            if os.path.exists(self.feedback_responses_file):
                with open(self.feedback_responses_file, 'r') as f:
                    data = json.load(f)
                    responses = []
                    for item in data:
                        # Convert datetime strings back to datetime objects
                        item['created_at'] = datetime.fromisoformat(item['created_at'])
                        responses.append(FeedbackResponse(**item))
                    return responses
            return []
        except Exception as e:
            logger.error(f"Error loading feedback responses: {e}")
            return []
    
    def _save_feedback_responses(self):
        """Save feedback responses to file"""
        try:
            data = []
            for response in self.feedback_responses:
                response_dict = asdict(response)
                # Convert datetime objects to ISO strings
                response_dict['created_at'] = response.created_at.isoformat()
                data.append(response_dict)
            
            with open(self.feedback_responses_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.debug(f"Saved {len(data)} feedback responses")
            
        except Exception as e:
            logger.error(f"Error saving feedback responses: {e}")
    
    def create_outcome_feedback_request(self, 
                                      task_id: str, 
                                      user_id: str,
                                      recommendation_data: Dict[str, Any],
                                      outcome_data: Dict[str, Any]) -> Optional[str]:
        """
        Create a feedback request for a completed outcome
        
        Args:
            task_id: Task ID
            user_id: User ID
            recommendation_data: Original recommendation data
            outcome_data: Actual outcome data
            
        Returns:
            Optional[str]: Feedback request ID if created
        """
        try:
            # Check if user has too many pending requests
            pending_requests = [
                r for r in self.feedback_requests 
                if r.user_id == user_id and r.status == "pending"
            ]
            
            if len(pending_requests) >= self.max_requests_per_user:
                logger.warning(f"User {user_id} has too many pending feedback requests")
                return None
            
            # Create request
            request_id = f"feedback-{task_id}-{int(time.time())}"
            
            # Generate summaries
            recommendation_summary = self._generate_recommendation_summary(recommendation_data)
            outcome_summary = self._generate_outcome_summary(outcome_data)
            
            request = FeedbackRequest(
                id=request_id,
                task_id=task_id,
                user_id=user_id,
                recommendation_summary=recommendation_summary,
                outcome_summary=outcome_summary,
                request_type="outcome_helpful",
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=self.request_expiry_hours)
            )
            
            self.feedback_requests.append(request)
            self._save_feedback_requests()
            
            # Send feedback request (via Slack if enabled)
            if self.slack_integration:
                self._send_slack_feedback_request(request)
            
            logger.info(f"Created feedback request {request_id} for task {task_id}")
            return request_id
            
        except Exception as e:
            logger.error(f"Error creating feedback request: {e}")
            return None
    
    def _generate_recommendation_summary(self, recommendation_data: Dict[str, Any]) -> str:
        """Generate a summary of the recommendation"""
        action = recommendation_data.get('action', 'restock')
        quantity = recommendation_data.get('quantity', 0)
        expected_roi = recommendation_data.get('expected_roi', '0%')
        
        return f"{action.title()} {quantity} units (Expected ROI: {expected_roi})"
    
    def _generate_outcome_summary(self, outcome_data: Dict[str, Any]) -> str:
        """Generate a summary of the actual outcome"""
        actual_roi = outcome_data.get('actual_roi', 0)
        actual_profit = outcome_data.get('actual_profit', 0)
        sell_through_rate = outcome_data.get('sell_through_rate', 0)
        
        return f"Actual ROI: {actual_roi:.1f}%, Profit: ${actual_profit:.2f}, Sell-through: {sell_through_rate:.1f}%"
    
    def _send_slack_feedback_request(self, request: FeedbackRequest):
        """Send feedback request via Slack"""
        try:
            # This would integrate with your existing Slack system
            # For now, we'll create a simple message format
            
            message = f"""
📊 **Quick Feedback Request**

**Recommendation:** {request.recommendation_summary}
**Outcome:** {request.outcome_summary}

**Was this outcome helpful?**
Reply with: `feedback {request.id} yes` or `feedback {request.id} no`

Optional: Add a comment like `feedback {request.id} yes Great ROI!`

This request expires in {self.request_expiry_hours} hours.
            """.strip()
            
            # Save message for integration with Slack system
            self._save_slack_message(request.user_id, message, request.id)
            
            logger.info(f"Prepared Slack feedback request for {request.id}")
            
        except Exception as e:
            logger.error(f"Error sending Slack feedback request: {e}")
    
    def _save_slack_message(self, user_id: str, message: str, request_id: str):
        """Save Slack message for integration"""
        try:
            slack_messages_file = os.path.join(self.data_dir, "pending_slack_feedback.json")
            
            messages = []
            if os.path.exists(slack_messages_file):
                with open(slack_messages_file, 'r') as f:
                    messages = json.load(f)
            
            messages.append({
                'user_id': user_id,
                'message': message,
                'request_id': request_id,
                'created_at': datetime.now().isoformat()
            })
            
            with open(slack_messages_file, 'w') as f:
                json.dump(messages, f, indent=2)
            
        except Exception as e:
            logger.error(f"Error saving Slack message: {e}")
    
    def process_feedback_response(self, 
                                request_id: str, 
                                user_id: str,
                                helpful: bool,
                                rating: Optional[float] = None,
                                comment: Optional[str] = None) -> bool:
        """
        Process a feedback response
        
        Args:
            request_id: Feedback request ID
            user_id: User ID
            helpful: Whether the outcome was helpful
            rating: Optional rating (1-5)
            comment: Optional comment
            
        Returns:
            bool: True if response was processed successfully
        """
        try:
            # Find the request
            request = next((r for r in self.feedback_requests if r.id == request_id), None)
            if not request:
                logger.warning(f"Feedback request {request_id} not found")
                return False
            
            # Verify user
            if request.user_id != user_id:
                logger.warning(f"User {user_id} not authorized for request {request_id}")
                return False
            
            # Check if already responded
            if request.status == "completed":
                logger.warning(f"Feedback request {request_id} already completed")
                return False
            
            # Check if expired
            if datetime.now() > request.expires_at:
                request.status = "expired"
                self._save_feedback_requests()
                logger.warning(f"Feedback request {request_id} expired")
                return False
            
            # Create response
            response_id = f"response-{request_id}-{int(time.time())}"
            
            # Auto-generate rating if not provided
            if rating is None:
                rating = 4.0 if helpful else 2.0
            
            response = FeedbackResponse(
                id=response_id,
                request_id=request_id,
                task_id=request.task_id,
                user_id=user_id,
                response_type="outcome_helpful",
                rating=rating,
                comment=comment,
                helpful=helpful,
                would_recommend=helpful  # Simple mapping
            )
            
            # Update request
            request.status = "completed"
            request.responded_at = datetime.now()
            request.response_data = {
                'helpful': helpful,
                'rating': rating,
                'comment': comment
            }
            
            # Save data
            self.feedback_responses.append(response)
            self._save_feedback_responses()
            self._save_feedback_requests()
            
            logger.info(f"Processed feedback response {response_id} for request {request_id}")
            
            # Send confirmation if Slack integration is enabled
            if self.slack_integration:
                self._send_slack_confirmation(request, response)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing feedback response: {e}")
            return False
    
    def _send_slack_confirmation(self, request: FeedbackRequest, response: FeedbackResponse):
        """Send confirmation message via Slack"""
        try:
            helpful_text = "👍 helpful" if response.helpful else "👎 not helpful"
            
            message = f"""
✅ **Feedback Received**

Thanks for your feedback on: {request.recommendation_summary}

You rated this outcome as: {helpful_text}
Rating: {response.rating}/5
{f"Comment: {response.comment}" if response.comment else ""}

Your feedback helps improve our AI recommendations!
            """.strip()
            
            # Save confirmation message
            self._save_slack_message(request.user_id, message, f"confirm-{request.id}")
            
        except Exception as e:
            logger.error(f"Error sending Slack confirmation: {e}")
    
    def expire_old_requests(self) -> int:
        """
        Expire old feedback requests
        
        Returns:
            int: Number of requests expired
        """
        expired_count = 0
        current_time = datetime.now()
        
        for request in self.feedback_requests:
            if request.status == "pending" and current_time > request.expires_at:
                request.status = "expired"
                expired_count += 1
        
        if expired_count > 0:
            self._save_feedback_requests()
            logger.info(f"Expired {expired_count} old feedback requests")
        
        return expired_count
    
    def get_feedback_analytics(self) -> Dict[str, Any]:
        """
        Get analytics on feedback data
        
        Returns:
            Dict: Feedback analytics
        """
        try:
            # Basic statistics
            total_requests = len(self.feedback_requests)
            completed_requests = len([r for r in self.feedback_requests if r.status == "completed"])
            response_rate = (completed_requests / total_requests) if total_requests > 0 else 0
            
            # Response analysis
            helpful_responses = [r for r in self.feedback_responses if r.helpful]
            helpful_rate = len(helpful_responses) / len(self.feedback_responses) if self.feedback_responses else 0
            
            # Rating analysis
            ratings = [r.rating for r in self.feedback_responses if r.rating is not None]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            # Recent feedback (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_responses = [
                r for r in self.feedback_responses 
                if r.created_at >= thirty_days_ago
            ]
            
            analytics = {
                'total_requests': total_requests,
                'completed_requests': completed_requests,
                'response_rate': response_rate,
                'helpful_rate': helpful_rate,
                'average_rating': avg_rating,
                'recent_responses': len(recent_responses),
                'recent_helpful_rate': len([r for r in recent_responses if r.helpful]) / len(recent_responses) if recent_responses else 0,
                'feedback_trends': self._calculate_feedback_trends(),
                'user_engagement': self._calculate_user_engagement(),
                'generated_at': datetime.now().isoformat()
            }
            
            # Save analytics
            with open(self.feedback_analytics_file, 'w') as f:
                json.dump(analytics, f, indent=2)
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating feedback analytics: {e}")
            return {}
    
    def _calculate_feedback_trends(self) -> Dict[str, Any]:
        """Calculate feedback trends over time"""
        try:
            # Group responses by week
            weekly_data = {}
            for response in self.feedback_responses:
                week_key = response.created_at.strftime("%Y-W%U")
                if week_key not in weekly_data:
                    weekly_data[week_key] = {'helpful': 0, 'total': 0, 'ratings': []}
                
                weekly_data[week_key]['total'] += 1
                if response.helpful:
                    weekly_data[week_key]['helpful'] += 1
                if response.rating:
                    weekly_data[week_key]['ratings'].append(response.rating)
            
            # Calculate trends
            trends = {}
            for week, data in weekly_data.items():
                helpful_rate = data['helpful'] / data['total'] if data['total'] > 0 else 0
                avg_rating = sum(data['ratings']) / len(data['ratings']) if data['ratings'] else 0
                
                trends[week] = {
                    'helpful_rate': helpful_rate,
                    'average_rating': avg_rating,
                    'total_responses': data['total']
                }
            
            return trends
            
        except Exception as e:
            logger.error(f"Error calculating feedback trends: {e}")
            return {}
    
    def _calculate_user_engagement(self) -> Dict[str, Any]:
        """Calculate user engagement metrics"""
        try:
            # Response rate by user
            user_stats = {}
            for request in self.feedback_requests:
                user_id = request.user_id
                if user_id not in user_stats:
                    user_stats[user_id] = {'requests': 0, 'responses': 0}
                
                user_stats[user_id]['requests'] += 1
                if request.status == "completed":
                    user_stats[user_id]['responses'] += 1
            
            # Calculate engagement metrics
            engagement_rates = []
            for user_id, stats in user_stats.items():
                if stats['requests'] > 0:
                    engagement_rate = stats['responses'] / stats['requests']
                    engagement_rates.append(engagement_rate)
            
            avg_engagement = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0
            
            return {
                'total_users': len(user_stats),
                'average_engagement_rate': avg_engagement,
                'highly_engaged_users': len([rate for rate in engagement_rates if rate > 0.8]),
                'low_engagement_users': len([rate for rate in engagement_rates if rate < 0.3])
            }
            
        except Exception as e:
            logger.error(f"Error calculating user engagement: {e}")
            return {}
    
    def get_feedback_for_task(self, task_id: str) -> Dict[str, Any]:
        """
        Get feedback data for a specific task
        
        Args:
            task_id: Task ID
            
        Returns:
            Dict: Feedback data for the task
        """
        try:
            # Find request and response
            request = next((r for r in self.feedback_requests if r.task_id == task_id), None)
            response = next((r for r in self.feedback_responses if r.task_id == task_id), None)
            
            if not request:
                return {'error': 'No feedback request found for task'}
            
            return {
                'request': {
                    'id': request.id,
                    'status': request.status,
                    'created_at': request.created_at.isoformat(),
                    'expires_at': request.expires_at.isoformat(),
                    'recommendation_summary': request.recommendation_summary,
                    'outcome_summary': request.outcome_summary
                },
                'response': {
                    'id': response.id,
                    'helpful': response.helpful,
                    'rating': response.rating,
                    'comment': response.comment,
                    'created_at': response.created_at.isoformat()
                } if response else None
            }
            
        except Exception as e:
            logger.error(f"Error getting feedback for task {task_id}: {e}")
            return {'error': str(e)}
    
    def cleanup_old_data(self, days_to_keep: int = 90) -> Dict[str, int]:
        """
        Clean up old feedback data
        
        Args:
            days_to_keep: Number of days of data to keep
            
        Returns:
            Dict: Cleanup statistics
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            # Clean up old requests
            old_requests = [r for r in self.feedback_requests if r.created_at < cutoff_date]
            self.feedback_requests = [r for r in self.feedback_requests if r.created_at >= cutoff_date]
            
            # Clean up old responses
            old_responses = [r for r in self.feedback_responses if r.created_at < cutoff_date]
            self.feedback_responses = [r for r in self.feedback_responses if r.created_at >= cutoff_date]
            
            # Save updated data
            self._save_feedback_requests()
            self._save_feedback_responses()
            
            cleanup_stats = {
                'requests_removed': len(old_requests),
                'responses_removed': len(old_responses),
                'requests_remaining': len(self.feedback_requests),
                'responses_remaining': len(self.feedback_responses)
            }
            
            logger.info(f"Cleaned up old feedback data: {cleanup_stats}")
            return cleanup_stats
            
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")
            return {}


def main():
    """Main function for testing the feedback system"""
    feedback_system = UserFeedbackSystem()
    
    # Test creating a feedback request
    request_id = feedback_system.create_outcome_feedback_request(
        task_id="test-task-123",
        user_id="test-user",
        recommendation_data={
            'action': 'restock',
            'quantity': 100,
            'expected_roi': '25%'
        },
        outcome_data={
            'actual_roi': 22.5,
            'actual_profit': 450.0,
            'sell_through_rate': 85.0
        }
    )
    
    print(f"Created feedback request: {request_id}")
    
    # Test processing a response
    if request_id:
        success = feedback_system.process_feedback_response(
            request_id=request_id,
            user_id="test-user",
            helpful=True,
            rating=4.0,
            comment="Great recommendation, exceeded expectations!"
        )
        print(f"Processed response: {success}")
    
    # Get analytics
    analytics = feedback_system.get_feedback_analytics()
    print(f"Analytics: {analytics}")


if __name__ == "__main__":
    main() 