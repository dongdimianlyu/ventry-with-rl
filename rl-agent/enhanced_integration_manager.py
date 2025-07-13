#!/usr/bin/env python3
"""
Enhanced RL Integration Manager

This system orchestrates the entire enhanced RL learning system, coordinating:
1. Outcome tracking from real business data
2. User feedback collection
3. Enhanced reward generation
4. Periodic retraining
5. Seamless integration with existing mock data pipeline

The manager ensures everything works together smoothly while maintaining
backward compatibility with the existing system.
"""

import os
import json
import logging
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# Import our enhanced components
try:
    from enhanced_outcome_tracking import EnhancedOutcomeTracker
    from enhanced_rl_training import EnhancedRLTrainingSystem
    from user_feedback_system import UserFeedbackSystem
    from enhanced_roi_calculator import EnhancedROICalculator
    from ai_coo_agent import AICOOAgent
    from rl_agent import RestockingAgent  # Original agent for compatibility
except ImportError as e:
    print(f"Warning: Enhanced RL components not available: {e}")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class SystemStatus:
    """Status of the enhanced RL system"""
    outcome_tracking_active: bool
    feedback_system_active: bool
    training_system_active: bool
    last_retraining: Optional[datetime]
    total_outcomes_tracked: int
    total_feedback_collected: int
    current_model_version: str
    system_health: str  # healthy, warning, error


class EnhancedRLIntegrationManager:
    """Main integration manager for the enhanced RL system"""
    
    def __init__(self, 
                 data_dir: str = ".",
                 mock_mode: bool = True,
                 enable_background_processing: bool = True):
        """
        Initialize the integration manager
        
        Args:
            data_dir: Directory for data files
            mock_mode: Whether to use mock data or real integrations
            enable_background_processing: Whether to run background tasks
        """
        self.data_dir = data_dir
        self.mock_mode = mock_mode
        self.enable_background_processing = enable_background_processing
        
        # Initialize components
        self.outcome_tracker = EnhancedOutcomeTracker(mock_mode=mock_mode)
        self.training_system = EnhancedRLTrainingSystem(
            outcome_tracker=self.outcome_tracker,
            use_real_outcomes=not mock_mode
        )
        self.feedback_system = UserFeedbackSystem(
            data_dir=data_dir,
            slack_integration=True
        )
        self.roi_calculator = EnhancedROICalculator(mock_mode=mock_mode)
        
        # AI COO agent for comprehensive business operations
        self.ai_coo_agent = AICOOAgent(mock_mode=mock_mode)
        
        # Original agent for compatibility
        self.original_agent = RestockingAgent()
        
        # Background processing
        self.background_thread = None
        self.stop_background = False
        self.processing_interval = 300  # 5 minutes
        
        # System status
        self.system_status = SystemStatus(
            outcome_tracking_active=True,
            feedback_system_active=True,
            training_system_active=True,
            last_retraining=None,
            total_outcomes_tracked=0,
            total_feedback_collected=0,
            current_model_version="enhanced-v1.0",
            system_health="healthy"
        )
        
        # Start background processing if enabled
        if enable_background_processing:
            self.start_background_processing()
        
        logger.info(f"Enhanced RL Integration Manager initialized (mock_mode={mock_mode})")
    
    def start_background_processing(self):
        """Start background processing thread"""
        if self.background_thread is None or not self.background_thread.is_alive():
            self.background_thread = threading.Thread(
                target=self._background_processing_loop,
                daemon=True
            )
            self.background_thread.start()
            logger.info("Background processing started")
    
    def stop_background_processing(self):
        """Stop background processing"""
        self.stop_background = True
        if self.background_thread and self.background_thread.is_alive():
            self.background_thread.join(timeout=10)
        logger.info("Background processing stopped")
    
    def _background_processing_loop(self):
        """Background processing loop"""
        while not self.stop_background:
            try:
                # Run periodic tasks
                self._run_periodic_tasks()
                
                # Sleep for the specified interval
                time.sleep(self.processing_interval)
                
            except Exception as e:
                logger.error(f"Error in background processing: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def _run_periodic_tasks(self):
        """Run periodic maintenance tasks"""
        try:
            # Check for new approved tasks
            new_tasks = self.outcome_tracker.check_for_new_approved_tasks()
            if new_tasks > 0:
                logger.info(f"Started tracking {new_tasks} new approved tasks")
            
            # Capture outcomes for ready tasks
            captured_outcomes = self.outcome_tracker.capture_business_outcomes()
            if captured_outcomes > 0:
                logger.info(f"Captured outcomes for {captured_outcomes} tasks")
                
                # Create feedback requests for completed outcomes
                self._create_feedback_requests_for_completed_outcomes()
            
            # Expire old feedback requests
            expired_requests = self.feedback_system.expire_old_requests()
            if expired_requests > 0:
                logger.info(f"Expired {expired_requests} old feedback requests")
            
            # Check if retraining is needed
            self._check_and_perform_retraining()
            
            # Update system status
            self._update_system_status()
            
        except Exception as e:
            logger.error(f"Error in periodic tasks: {e}")
    
    def _create_feedback_requests_for_completed_outcomes(self):
        """Create feedback requests for newly completed outcomes"""
        try:
            # Get completed outcomes without feedback requests
            training_data = self.outcome_tracker.get_training_data()
            completed_outcomes = training_data.get('outcomes', [])
            
            # Check which outcomes need feedback requests
            existing_requests = {req.task_id for req in self.feedback_system.feedback_requests}
            
            for outcome in completed_outcomes:
                task_id = outcome.get('task_id')
                if task_id and task_id not in existing_requests:
                    # Create feedback request
                    request_id = self.feedback_system.create_outcome_feedback_request(
                        task_id=task_id,
                        user_id=outcome.get('user_id', 'unknown'),
                        recommendation_data={
                            'action': 'restock',
                            'quantity': outcome.get('restock_quantity', 0),
                            'expected_roi': f"{outcome.get('predicted_roi', 0):.1f}%"
                        },
                        outcome_data=outcome
                    )
                    
                    if request_id:
                        logger.info(f"Created feedback request {request_id} for outcome {task_id}")
            
        except Exception as e:
            logger.error(f"Error creating feedback requests: {e}")
    
    def _check_and_perform_retraining(self):
        """Check if retraining is needed and perform it"""
        try:
            should_retrain, reason_data = self.training_system.should_retrain()
            
            if should_retrain:
                logger.info(f"Initiating retraining: {reason_data['reason']}")
                
                retraining_result = self.training_system.run_periodic_retraining()
                
                if retraining_result.get('retraining_performed'):
                    self.system_status.last_retraining = datetime.now()
                    self.system_status.current_model_version = f"enhanced-v{datetime.now().strftime('%Y%m%d-%H%M')}"
                    logger.info("Retraining completed successfully")
                else:
                    logger.warning(f"Retraining failed: {retraining_result.get('reason')}")
            
        except Exception as e:
            logger.error(f"Error in retraining check: {e}")
    
    def _update_system_status(self):
        """Update system status metrics"""
        try:
            # Get training data
            training_data = self.outcome_tracker.get_training_data()
            
            # Update metrics
            self.system_status.total_outcomes_tracked = len(training_data.get('outcomes', []))
            self.system_status.total_feedback_collected = len(self.feedback_system.feedback_responses)
            
            # Determine system health
            summary = training_data.get('summary', {})
            roi_accuracy = summary.get('average_roi_accuracy', 0)
            
            if roi_accuracy > 0.7:
                self.system_status.system_health = "healthy"
            elif roi_accuracy > 0.5:
                self.system_status.system_health = "warning"
            else:
                self.system_status.system_health = "error"
            
        except Exception as e:
            logger.error(f"Error updating system status: {e}")
            self.system_status.system_health = "error"
    
    def generate_recommendations(self, 
                               use_enhanced_model: bool = True,
                               n_episodes: int = 5,
                               user_id: Optional[str] = None,
                               use_ai_coo: bool = False) -> Dict[str, Any]:
        """
        Generate recommendations using the enhanced system
        
        Args:
            use_enhanced_model: Whether to use enhanced model or original
            n_episodes: Number of simulation episodes
            user_id: User ID for personalized recommendations
            use_ai_coo: Whether to use AI COO for comprehensive business operations
            
        Returns:
            Dict: Recommendations with enhanced features
        """
        try:
            if use_ai_coo:
                # Use AI COO for comprehensive business operations
                return self._generate_ai_coo_recommendations(n_episodes, user_id)
            elif use_enhanced_model:
                # Use enhanced model with real outcomes
                recommendations = self.training_system.generate_enhanced_recommendations(n_episodes)
                
                # Enhance ROI calculations with the sophisticated calculator
                if isinstance(recommendations, list):
                    enhanced_recs = []
                    for rec in recommendations:
                        if isinstance(rec, dict):
                            enhanced_rec = self._enhance_recommendation_with_roi(rec)
                            enhanced_recs.append(enhanced_rec)
                        else:
                            enhanced_recs.append(rec)
                    recommendations = enhanced_recs
                elif isinstance(recommendations, dict) and 'recommendations' in recommendations:
                    enhanced_recs = []
                    for rec in recommendations.get('recommendations', []):
                        if isinstance(rec, dict):
                            enhanced_rec = self._enhance_recommendation_with_roi(rec)
                            enhanced_recs.append(enhanced_rec)
                        else:
                            enhanced_recs.append(rec)
                    recommendations['recommendations'] = enhanced_recs
                
                # Add system context
                if isinstance(recommendations, dict):
                    recommendations['system_info'] = {
                        'model_type': 'enhanced',
                        'roi_calculator': 'enhanced',
                        'outcomes_tracked': self.system_status.total_outcomes_tracked,
                        'feedback_collected': self.system_status.total_feedback_collected,
                        'system_health': self.system_status.system_health,
                        'last_retraining': self.system_status.last_retraining.isoformat() if self.system_status.last_retraining else None
                    }
                else:
                    # If recommendations is a list, wrap it
                    recommendations = {
                        'recommendations': recommendations,
                        'system_info': {
                            'model_type': 'enhanced',
                            'roi_calculator': 'enhanced',
                            'outcomes_tracked': self.system_status.total_outcomes_tracked,
                            'feedback_collected': self.system_status.total_feedback_collected,
                            'system_health': self.system_status.system_health,
                            'last_retraining': self.system_status.last_retraining.isoformat() if self.system_status.last_retraining else None
                        }
                    }
                
                return recommendations
            else:
                # Use original model for compatibility
                if not self.original_agent.load_model():
                    logger.warning("Original model not found, using enhanced model")
                    return self.generate_recommendations(use_enhanced_model=True, n_episodes=n_episodes, user_id=user_id)
                
                recommendations = self.original_agent.generate_recommendations(n_episodes)
                
                # Add compatibility marker
                recommendations['system_info'] = {
                    'model_type': 'original',
                    'roi_calculator': 'basic',
                    'compatibility_mode': True
                }
                
                return recommendations
                
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return {
                'error': str(e),
                'recommendations': [],
                'system_info': {
                    'model_type': 'error',
                    'roi_calculator': 'none'
                }
            }
    
    def _enhance_recommendation_with_roi(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance a recommendation with sophisticated ROI calculation
        
        Args:
            recommendation: Original recommendation
            
        Returns:
            Dict: Enhanced recommendation with accurate ROI
        """
        try:
            # Extract basic info
            product_id = recommendation.get('product', 'UNKNOWN')
            quantity = recommendation.get('quantity', 0)
            
            if quantity <= 0:
                return recommendation
            
            # Calculate enhanced ROI
            roi_result = self.roi_calculator.calculate_roi(
                product_id=product_id,
                restock_quantity=quantity,
                time_window_days=30
            )
            
            # Update recommendation with enhanced calculations
            enhanced_rec = recommendation.copy()
            enhanced_rec.update({
                'expected_roi': f"{roi_result.projected_roi:.1f}%",
                'predicted_profit_usd': roi_result.expected_profit,
                'total_cost': roi_result.total_restock_cost,
                'expected_revenue': roi_result.expected_revenue,
                'sell_through_rate': roi_result.sell_through_rate,
                'confidence_score': roi_result.confidence_score,
                'time_to_stockout_days': roi_result.time_to_stockout_days,
                'units_likely_to_sell': roi_result.projected_units_sold,
                'roi_calculation_method': 'Enhanced ROI Calculator',
                'roi_factors': {
                    'historical_sales_rate': roi_result.calculation_factors.get('base_daily_sales', 0),
                    'seasonal_factor': roi_result.calculation_factors.get('seasonal_factor', 1.0),
                    'market_factor': roi_result.calculation_factors.get('market_factor', 1.0),
                    'demand_volatility': roi_result.calculation_factors.get('demand_volatility', 0.2),
                    'sell_through_probability': roi_result.sell_through_rate
                }
            })
            
            # Update confidence level based on ROI calculation
            if roi_result.confidence_score >= 0.8:
                enhanced_rec['confidence'] = 'high'
            elif roi_result.confidence_score >= 0.6:
                enhanced_rec['confidence'] = 'medium'
            else:
                enhanced_rec['confidence'] = 'low'
            
            logger.debug(f"Enhanced ROI for {product_id}: {roi_result.projected_roi:.1f}% "
                        f"(confidence: {roi_result.confidence_score:.1%})")
            
            return enhanced_rec
            
        except Exception as e:
            logger.error(f"Error enhancing recommendation ROI: {e}")
            # Return original recommendation if enhancement fails
            return recommendation
    
    def _generate_ai_coo_recommendations(self, n_episodes: int, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate comprehensive AI COO recommendations"""
        try:
            # Load AI COO model if not already loaded
            if not self.ai_coo_agent.load_model():
                logger.info("AI COO model not found, training new model...")
                self.ai_coo_agent.train(total_timesteps=10000)
            
            # Generate comprehensive recommendations
            recommendations = self.ai_coo_agent.generate_coo_recommendations(n_episodes)
            
            # Add user context
            if user_id:
                recommendations['user_id'] = user_id
            
            # Add enhanced features
            recommendations['enhanced_features'] = {
                'outcome_tracking': True,
                'user_feedback': True,
                'roi_calculation': 'enhanced',
                'model_type': 'ai_coo',
                'comprehensive_analysis': True
            }
            
            logger.info(f"Generated AI COO recommendation: {recommendations.get('action', 'unknown')}")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating AI COO recommendations: {e}")
            # Fallback to enhanced model
            return self.training_system.generate_enhanced_recommendations(n_episodes)
    
    def process_approved_task(self, approved_task: Dict[str, Any]) -> bool:
        """
        Process a newly approved task
        
        Args:
            approved_task: Approved task data
            
        Returns:
            bool: True if processed successfully
        """
        try:
            # Start outcome tracking
            success = self.outcome_tracker.start_tracking_approved_task(approved_task)
            
            if success:
                logger.info(f"Started tracking approved task: {approved_task.get('id')}")
                return True
            else:
                logger.error(f"Failed to start tracking approved task: {approved_task.get('id')}")
                return False
            
        except Exception as e:
            logger.error(f"Error processing approved task: {e}")
            return False
    
    def submit_user_feedback(self, 
                           request_id: str,
                           user_id: str,
                           helpful: bool,
                           rating: Optional[float] = None,
                           comment: Optional[str] = None) -> bool:
        """
        Submit user feedback
        
        Args:
            request_id: Feedback request ID
            user_id: User ID
            helpful: Whether outcome was helpful
            rating: Rating (1-5)
            comment: Optional comment
            
        Returns:
            bool: True if feedback submitted successfully
        """
        try:
            success = self.feedback_system.process_feedback_response(
                request_id=request_id,
                user_id=user_id,
                helpful=helpful,
                rating=rating,
                comment=comment
            )
            
            if success:
                # Update outcome tracker with feedback
                self.outcome_tracker.collect_user_feedback(
                    task_id=request_id.split('-')[1],  # Extract task ID from request ID
                    feedback=comment or ("Helpful" if helpful else "Not helpful"),
                    satisfaction=rating or (4.0 if helpful else 2.0)
                )
                
                logger.info(f"Processed user feedback for request {request_id}")
                return True
            else:
                logger.error(f"Failed to process feedback for request {request_id}")
                return False
            
        except Exception as e:
            logger.error(f"Error submitting user feedback: {e}")
            return False
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get current system status
        
        Returns:
            Dict: System status information
        """
        try:
            # Get analytics
            feedback_analytics = self.feedback_system.get_feedback_analytics()
            training_data = self.outcome_tracker.get_training_data()
            
            return {
                'system_status': {
                    'outcome_tracking_active': self.system_status.outcome_tracking_active,
                    'feedback_system_active': self.system_status.feedback_system_active,
                    'training_system_active': self.system_status.training_system_active,
                    'system_health': self.system_status.system_health,
                    'current_model_version': self.system_status.current_model_version,
                    'last_retraining': self.system_status.last_retraining.isoformat() if self.system_status.last_retraining else None
                },
                'metrics': {
                    'total_outcomes_tracked': self.system_status.total_outcomes_tracked,
                    'total_feedback_collected': self.system_status.total_feedback_collected,
                    'average_roi_accuracy': training_data.get('summary', {}).get('average_roi_accuracy', 0),
                    'average_user_satisfaction': training_data.get('summary', {}).get('average_user_satisfaction', 0),
                    'total_actual_profit': training_data.get('summary', {}).get('total_actual_profit', 0),
                    'feedback_response_rate': feedback_analytics.get('response_rate', 0),
                    'feedback_helpful_rate': feedback_analytics.get('helpful_rate', 0)
                },
                'background_processing': {
                    'enabled': self.enable_background_processing,
                    'active': self.background_thread is not None and self.background_thread.is_alive(),
                    'interval_seconds': self.processing_interval
                },
                'configuration': {
                    'mock_mode': self.mock_mode,
                    'data_directory': self.data_dir
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {'error': str(e)}
    
    def run_manual_sync(self) -> Dict[str, Any]:
        """
        Run a manual sync of all systems
        
        Returns:
            Dict: Sync results
        """
        try:
            logger.info("Running manual system sync...")
            
            # Run outcome capture cycle
            outcome_stats = self.outcome_tracker.run_outcome_capture_cycle()
            
            # Generate enhanced rewards
            new_rewards = self.outcome_tracker.generate_enhanced_rewards()
            
            # Update feedback system
            expired_requests = self.feedback_system.expire_old_requests()
            
            # Update system status
            self._update_system_status()
            
            sync_results = {
                'timestamp': datetime.now().isoformat(),
                'outcome_stats': outcome_stats,
                'new_rewards_generated': len(new_rewards),
                'expired_feedback_requests': expired_requests,
                'system_health': self.system_status.system_health
            }
            
            logger.info(f"Manual sync completed: {sync_results}")
            return sync_results
            
        except Exception as e:
            logger.error(f"Error in manual sync: {e}")
            return {'error': str(e)}
    
    def get_integration_health_check(self) -> Dict[str, Any]:
        """
        Perform a comprehensive health check
        
        Returns:
            Dict: Health check results
        """
        try:
            health_check = {
                'timestamp': datetime.now().isoformat(),
                'overall_health': 'healthy',
                'components': {},
                'recommendations': []
            }
            
            # Check outcome tracker
            try:
                training_data = self.outcome_tracker.get_training_data()
                health_check['components']['outcome_tracker'] = {
                    'status': 'healthy',
                    'outcomes_tracked': len(training_data.get('outcomes', [])),
                    'average_roi_accuracy': training_data.get('summary', {}).get('average_roi_accuracy', 0)
                }
            except Exception as e:
                health_check['components']['outcome_tracker'] = {
                    'status': 'error',
                    'error': str(e)
                }
                health_check['overall_health'] = 'error'
            
            # Check feedback system
            try:
                feedback_analytics = self.feedback_system.get_feedback_analytics()
                health_check['components']['feedback_system'] = {
                    'status': 'healthy',
                    'total_requests': feedback_analytics.get('total_requests', 0),
                    'response_rate': feedback_analytics.get('response_rate', 0),
                    'helpful_rate': feedback_analytics.get('helpful_rate', 0)
                }
            except Exception as e:
                health_check['components']['feedback_system'] = {
                    'status': 'error',
                    'error': str(e)
                }
                health_check['overall_health'] = 'error'
            
            # Check training system
            try:
                should_retrain, reason_data = self.training_system.should_retrain()
                health_check['components']['training_system'] = {
                    'status': 'healthy',
                    'should_retrain': should_retrain,
                    'retrain_reason': reason_data.get('reason'),
                    'last_retraining': self.system_status.last_retraining.isoformat() if self.system_status.last_retraining else None
                }
                
                if should_retrain:
                    health_check['recommendations'].append(f"Retraining recommended: {reason_data.get('reason')}")
            except Exception as e:
                health_check['components']['training_system'] = {
                    'status': 'error',
                    'error': str(e)
                }
                health_check['overall_health'] = 'error'
            
            # Check file system
            required_files = [
                'approved_tasks.json',
                'outcome_tracking.json',
                'enhanced_rewards.json',
                'feedback_requests.json',
                'feedback_responses.json'
            ]
            
            file_status = {}
            for file_name in required_files:
                file_path = os.path.join(self.data_dir, file_name)
                file_status[file_name] = {
                    'exists': os.path.exists(file_path),
                    'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0,
                    'last_modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat() if os.path.exists(file_path) else None
                }
            
            health_check['components']['file_system'] = {
                'status': 'healthy',
                'files': file_status
            }
            
            return health_check
            
        except Exception as e:
            logger.error(f"Error in health check: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'overall_health': 'error',
                'error': str(e)
            }
    
    def cleanup_old_data(self, days_to_keep: int = 90) -> Dict[str, Any]:
        """
        Clean up old data across all systems
        
        Args:
            days_to_keep: Number of days of data to keep
            
        Returns:
            Dict: Cleanup results
        """
        try:
            logger.info(f"Cleaning up data older than {days_to_keep} days...")
            
            # Clean up feedback system
            feedback_cleanup = self.feedback_system.cleanup_old_data(days_to_keep)
            
            # Clean up outcome tracking data
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            old_outcomes = [
                o for o in self.outcome_tracker.outcome_data 
                if o.tracking_start and o.tracking_start < cutoff_date
            ]
            
            self.outcome_tracker.outcome_data = [
                o for o in self.outcome_tracker.outcome_data 
                if not o.tracking_start or o.tracking_start >= cutoff_date
            ]
            
            self.outcome_tracker._save_outcome_data()
            
            cleanup_results = {
                'timestamp': datetime.now().isoformat(),
                'days_to_keep': days_to_keep,
                'feedback_cleanup': feedback_cleanup,
                'outcomes_removed': len(old_outcomes),
                'outcomes_remaining': len(self.outcome_tracker.outcome_data)
            }
            
            logger.info(f"Data cleanup completed: {cleanup_results}")
            return cleanup_results
            
        except Exception as e:
            logger.error(f"Error in data cleanup: {e}")
            return {'error': str(e)}
    
    def __del__(self):
        """Cleanup when manager is destroyed"""
        self.stop_background_processing()


# Global instance for easy access
_integration_manager = None

def get_integration_manager(data_dir: str = ".", mock_mode: bool = True) -> EnhancedRLIntegrationManager:
    """
    Get the global integration manager instance
    
    Args:
        data_dir: Data directory
        mock_mode: Whether to use mock mode
        
    Returns:
        EnhancedRLIntegrationManager: The integration manager
    """
    global _integration_manager
    
    if _integration_manager is None:
        _integration_manager = EnhancedRLIntegrationManager(
            data_dir=data_dir,
            mock_mode=mock_mode
        )
    
    return _integration_manager


def main():
    """Main function for testing the integration manager"""
    # Initialize the manager
    manager = EnhancedRLIntegrationManager(mock_mode=True)
    
    # Generate recommendations
    recommendations = manager.generate_recommendations(use_enhanced_model=True)
    print(f"Enhanced recommendations: {recommendations}")
    
    # Get system status
    status = manager.get_system_status()
    print(f"System status: {status}")
    
    # Run health check
    health_check = manager.get_integration_health_check()
    print(f"Health check: {health_check}")
    
    # Clean up
    manager.stop_background_processing()


if __name__ == "__main__":
    main() 