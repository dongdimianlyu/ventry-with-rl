#!/usr/bin/env python3
"""
Enhanced RL Integration Example

This example demonstrates how to integrate the enhanced RL learning system
with the existing Ventry application. It shows:

1. How to use the enhanced system alongside existing mock data
2. How to collect real business outcomes and user feedback
3. How to trigger retraining based on performance
4. How to maintain backward compatibility

This example can be used as a reference for integrating the enhanced system
into your existing application workflow.
"""

import os
import sys
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the enhanced system
try:
    from enhanced_integration_manager import EnhancedRLIntegrationManager, get_integration_manager
    from enhanced_outcome_tracking import EnhancedOutcomeTracker
    from user_feedback_system import UserFeedbackSystem
    from enhanced_rl_training import EnhancedRLTrainingSystem
except ImportError as e:
    print(f"Error importing enhanced components: {e}")
    print("Please ensure all enhanced RL files are in the same directory")
    sys.exit(1)


class VentryEnhancedRLIntegration:
    """
    Integration class for using enhanced RL system within Ventry application
    
    This class provides a clean interface between the Ventry application
    and the enhanced RL learning system.
    """
    
    def __init__(self, use_real_integrations: bool = False):
        """
        Initialize the enhanced RL integration
        
        Args:
            use_real_integrations: Whether to use real Shopify/QuickBooks data
        """
        self.use_real_integrations = use_real_integrations
        self.mock_mode = not use_real_integrations
        
        # Initialize the integration manager
        self.manager = get_integration_manager(
            data_dir=".",
            mock_mode=self.mock_mode
        )
        
        print(f"✓ Enhanced RL integration initialized (mock_mode={self.mock_mode})")
    
    def generate_enhanced_recommendation(self, 
                                       user_id: str = "demo-user",
                                       force_enhanced: bool = True) -> Dict[str, Any]:
        """
        Generate an enhanced recommendation for the user
        
        Args:
            user_id: User ID
            force_enhanced: Whether to force use of enhanced model
            
        Returns:
            Dict: Enhanced recommendation with additional context
        """
        try:
            print("\n🤖 Generating enhanced recommendation...")
            
            # Generate recommendation using enhanced system
            recommendation = self.manager.generate_recommendations(
                use_enhanced_model=force_enhanced,
                n_episodes=5
            )
            
            # Add user context
            recommendation['user_id'] = user_id
            recommendation['generated_for'] = 'ventry_application'
            
            print(f"✓ Generated recommendation: {recommendation.get('action')} "
                  f"{recommendation.get('quantity', 0)} units")
            print(f"  Expected ROI: {recommendation.get('expected_roi', '0%')}")
            print(f"  Confidence: {recommendation.get('confidence', 'unknown')}")
            
            return recommendation
            
        except Exception as e:
            print(f"❌ Error generating recommendation: {e}")
            return {
                'error': str(e),
                'action': 'monitor',
                'quantity': 0,
                'expected_roi': '0%',
                'confidence': 'low'
            }
    
    def simulate_approval_workflow(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate the approval workflow for a recommendation
        
        Args:
            recommendation: Recommendation to approve
            
        Returns:
            Dict: Approved task data
        """
        try:
            print("\n📋 Simulating approval workflow...")
            
            # Create approved task data (simulating Slack approval)
            approved_task = {
                'id': f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'approved_at': datetime.now().isoformat(),
                'status': 'approved',
                'executed': False,
                'recommendation': recommendation,
                'user_id': recommendation.get('user_id', 'demo-user'),
                'approved_via': 'enhanced_rl_demo'
            }
            
            # Save to approved tasks file (simulating existing workflow)
            self._save_approved_task(approved_task)
            
            # Process the approved task through enhanced system
            success = self.manager.process_approved_task(approved_task)
            
            if success:
                print(f"✓ Approved task {approved_task['id']} and started outcome tracking")
            else:
                print(f"❌ Failed to process approved task {approved_task['id']}")
            
            return approved_task
            
        except Exception as e:
            print(f"❌ Error in approval workflow: {e}")
            return {}
    
    def _save_approved_task(self, approved_task: Dict[str, Any]):
        """Save approved task to file (simulating existing system)"""
        try:
            approved_tasks_file = "approved_tasks.json"
            
            # Load existing tasks
            approved_tasks = []
            if os.path.exists(approved_tasks_file):
                with open(approved_tasks_file, 'r') as f:
                    approved_tasks = json.load(f)
            
            # Add new task
            approved_tasks.append(approved_task)
            
            # Save back to file
            with open(approved_tasks_file, 'w') as f:
                json.dump(approved_tasks, f, indent=2)
            
        except Exception as e:
            print(f"❌ Error saving approved task: {e}")
    
    def simulate_business_outcome(self, approved_task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate business outcome after some time has passed
        
        Args:
            approved_task: The approved task
            
        Returns:
            Dict: Simulated outcome data
        """
        try:
            print(f"\n📊 Simulating business outcome for task {approved_task['id']}...")
            
            # Simulate time passing (in real system, this would be days/weeks)
            print("⏳ Simulating time passage (30 days)...")
            
            # Force capture of outcomes (normally done by background process)
            captured_outcomes = self.manager.outcome_tracker.capture_business_outcomes()
            
            if captured_outcomes > 0:
                print(f"✓ Captured outcomes for {captured_outcomes} tasks")
                
                # Get the outcome data
                training_data = self.manager.outcome_tracker.get_training_data()
                outcomes = training_data.get('outcomes', [])
                
                # Find our task's outcome
                task_outcome = None
                for outcome in outcomes:
                    if outcome.get('task_id') == approved_task['id']:
                        task_outcome = outcome
                        break
                
                if task_outcome:
                    print(f"  Actual ROI: {task_outcome.get('actual_roi', 0):.1f}%")
                    print(f"  Actual Profit: ${task_outcome.get('actual_profit', 0):.2f}")
                    print(f"  Sell-through Rate: {task_outcome.get('sell_through_rate', 0):.1f}%")
                    
                    return task_outcome
                else:
                    print("❌ No outcome found for this task")
                    return {}
            else:
                print("❌ No outcomes captured")
                return {}
                
        except Exception as e:
            print(f"❌ Error simulating business outcome: {e}")
            return {}
    
    def collect_user_feedback(self, task_id: str, helpful: bool = True, rating: float = 4.0) -> bool:
        """
        Collect user feedback for a task
        
        Args:
            task_id: Task ID
            helpful: Whether the outcome was helpful
            rating: User rating (1-5)
            
        Returns:
            bool: True if feedback was collected
        """
        try:
            print(f"\n💬 Collecting user feedback for task {task_id}...")
            
            # Find feedback request for this task
            feedback_request = None
            for request in self.manager.feedback_system.feedback_requests:
                if request.task_id == task_id:
                    feedback_request = request
                    break
            
            if not feedback_request:
                print("❌ No feedback request found for this task")
                return False
            
            # Submit feedback
            success = self.manager.submit_user_feedback(
                request_id=feedback_request.id,
                user_id=feedback_request.user_id,
                helpful=helpful,
                rating=rating,
                comment="Demo feedback - outcome was as expected" if helpful else "Demo feedback - outcome was disappointing"
            )
            
            if success:
                print(f"✓ Feedback submitted: {'👍 Helpful' if helpful else '👎 Not helpful'} ({rating}/5)")
                return True
            else:
                print("❌ Failed to submit feedback")
                return False
                
        except Exception as e:
            print(f"❌ Error collecting feedback: {e}")
            return False
    
    def check_retraining_status(self) -> Dict[str, Any]:
        """
        Check if the system needs retraining
        
        Returns:
            Dict: Retraining status information
        """
        try:
            print("\n🔄 Checking retraining status...")
            
            should_retrain, reason_data = self.manager.training_system.should_retrain()
            
            if should_retrain:
                print(f"⚠️  Retraining recommended: {reason_data['reason']}")
                return {
                    'should_retrain': True,
                    'reason': reason_data['reason'],
                    'details': reason_data
                }
            else:
                print(f"✓ No retraining needed: {reason_data['reason']}")
                return {
                    'should_retrain': False,
                    'reason': reason_data['reason']
                }
                
        except Exception as e:
            print(f"❌ Error checking retraining status: {e}")
            return {'error': str(e)}
    
    def trigger_retraining(self) -> Dict[str, Any]:
        """
        Trigger model retraining
        
        Returns:
            Dict: Retraining results
        """
        try:
            print("\n🔄 Triggering model retraining...")
            
            retraining_result = self.manager.training_system.run_periodic_retraining()
            
            if retraining_result.get('retraining_performed'):
                print("✓ Retraining completed successfully")
                print(f"  Reason: {retraining_result.get('reason')}")
                
                # Generate new recommendation to test improved model
                print("\n🧪 Testing retrained model...")
                new_recommendation = self.generate_enhanced_recommendation(force_enhanced=True)
                
                return {
                    'retraining_successful': True,
                    'retraining_result': retraining_result,
                    'test_recommendation': new_recommendation
                }
            else:
                print(f"❌ Retraining not performed: {retraining_result.get('reason')}")
                return {
                    'retraining_successful': False,
                    'reason': retraining_result.get('reason')
                }
                
        except Exception as e:
            print(f"❌ Error triggering retraining: {e}")
            return {'error': str(e)}
    
    def get_system_analytics(self) -> Dict[str, Any]:
        """
        Get comprehensive system analytics
        
        Returns:
            Dict: System analytics and performance metrics
        """
        try:
            print("\n📊 Getting system analytics...")
            
            # Get system status
            system_status = self.manager.get_system_status()
            
            # Get feedback analytics
            feedback_analytics = self.manager.feedback_system.get_feedback_analytics()
            
            # Get training data
            training_data = self.manager.outcome_tracker.get_training_data()
            
            analytics = {
                'system_status': system_status,
                'feedback_analytics': feedback_analytics,
                'training_summary': training_data.get('summary', {}),
                'performance_metrics': {
                    'total_recommendations': len(training_data.get('outcomes', [])),
                    'roi_accuracy': training_data.get('summary', {}).get('average_roi_accuracy', 0),
                    'user_satisfaction': training_data.get('summary', {}).get('average_user_satisfaction', 0),
                    'total_profit': training_data.get('summary', {}).get('total_actual_profit', 0),
                    'feedback_response_rate': feedback_analytics.get('response_rate', 0)
                }
            }
            
            print("✓ Analytics retrieved successfully")
            return analytics
            
        except Exception as e:
            print(f"❌ Error getting analytics: {e}")
            return {'error': str(e)}
    
    def run_health_check(self) -> Dict[str, Any]:
        """
        Run a comprehensive health check
        
        Returns:
            Dict: Health check results
        """
        try:
            print("\n🏥 Running system health check...")
            
            health_check = self.manager.get_integration_health_check()
            
            overall_health = health_check.get('overall_health', 'unknown')
            print(f"  Overall Health: {overall_health}")
            
            # Show component status
            components = health_check.get('components', {})
            for component, status in components.items():
                component_health = status.get('status', 'unknown')
                print(f"  {component}: {component_health}")
            
            # Show recommendations
            recommendations = health_check.get('recommendations', [])
            if recommendations:
                print("  Recommendations:")
                for rec in recommendations:
                    print(f"    - {rec}")
            
            return health_check
            
        except Exception as e:
            print(f"❌ Error running health check: {e}")
            return {'error': str(e)}
    
    def demonstrate_full_workflow(self) -> Dict[str, Any]:
        """
        Demonstrate the complete enhanced RL workflow
        
        Returns:
            Dict: Results from the full workflow demonstration
        """
        try:
            print("\n🚀 Demonstrating Full Enhanced RL Workflow")
            print("=" * 60)
            
            workflow_results = {
                'steps_completed': [],
                'errors': [],
                'final_analytics': {}
            }
            
            # Step 1: Generate enhanced recommendation
            print("\n1️⃣ STEP 1: Generate Enhanced Recommendation")
            recommendation = self.generate_enhanced_recommendation()
            if 'error' not in recommendation:
                workflow_results['steps_completed'].append('recommendation_generated')
                workflow_results['recommendation'] = recommendation
            else:
                workflow_results['errors'].append('recommendation_generation_failed')
            
            # Step 2: Simulate approval workflow
            print("\n2️⃣ STEP 2: Simulate Approval Workflow")
            approved_task = self.simulate_approval_workflow(recommendation)
            if approved_task:
                workflow_results['steps_completed'].append('task_approved')
                workflow_results['approved_task'] = approved_task
            else:
                workflow_results['errors'].append('approval_workflow_failed')
            
            # Step 3: Simulate business outcome
            print("\n3️⃣ STEP 3: Simulate Business Outcome")
            outcome = self.simulate_business_outcome(approved_task)
            if outcome:
                workflow_results['steps_completed'].append('outcome_captured')
                workflow_results['outcome'] = outcome
            else:
                workflow_results['errors'].append('outcome_capture_failed')
            
            # Step 4: Collect user feedback
            print("\n4️⃣ STEP 4: Collect User Feedback")
            feedback_success = self.collect_user_feedback(
                task_id=approved_task.get('id', ''),
                helpful=True,
                rating=4.0
            )
            if feedback_success:
                workflow_results['steps_completed'].append('feedback_collected')
            else:
                workflow_results['errors'].append('feedback_collection_failed')
            
            # Step 5: Check retraining status
            print("\n5️⃣ STEP 5: Check Retraining Status")
            retraining_status = self.check_retraining_status()
            workflow_results['retraining_status'] = retraining_status
            
            # Step 6: Get system analytics
            print("\n6️⃣ STEP 6: Get System Analytics")
            analytics = self.get_system_analytics()
            workflow_results['final_analytics'] = analytics
            
            # Step 7: Run health check
            print("\n7️⃣ STEP 7: Run Health Check")
            health_check = self.run_health_check()
            workflow_results['health_check'] = health_check
            
            # Summary
            print("\n✅ WORKFLOW SUMMARY")
            print("=" * 60)
            print(f"Steps completed: {len(workflow_results['steps_completed'])}/6")
            print(f"Errors encountered: {len(workflow_results['errors'])}")
            
            if workflow_results['errors']:
                print("Errors:")
                for error in workflow_results['errors']:
                    print(f"  - {error}")
            
            print(f"System health: {health_check.get('overall_health', 'unknown')}")
            
            return workflow_results
            
        except Exception as e:
            print(f"❌ Error in full workflow demonstration: {e}")
            return {'error': str(e)}


def main():
    """
    Main function demonstrating the enhanced RL integration
    """
    print("🚀 Enhanced RL Integration Example")
    print("=" * 60)
    print("This example demonstrates the enhanced RL learning system")
    print("with real business outcomes and user feedback integration.")
    print()
    
    # Initialize the integration
    integration = VentryEnhancedRLIntegration(use_real_integrations=False)
    
    # Run the full workflow demonstration
    results = integration.demonstrate_full_workflow()
    
    # Show final results
    print("\n📊 FINAL RESULTS")
    print("=" * 60)
    
    if 'error' in results:
        print(f"❌ Workflow failed with error: {results['error']}")
    else:
        print(f"✅ Workflow completed successfully!")
        print(f"Steps completed: {len(results.get('steps_completed', []))}")
        
        # Show key metrics
        analytics = results.get('final_analytics', {})
        performance = analytics.get('performance_metrics', {})
        
        print(f"\n📈 Key Performance Metrics:")
        print(f"  ROI Accuracy: {performance.get('roi_accuracy', 0):.1%}")
        user_satisfaction = performance.get('user_satisfaction', 0)
        if user_satisfaction is not None:
            print(f"  User Satisfaction: {user_satisfaction:.1f}/5")
        else:
            print(f"  User Satisfaction: No data yet")
        print(f"  Total Profit: ${performance.get('total_profit', 0):.2f}")
        print(f"  Feedback Response Rate: {performance.get('feedback_response_rate', 0):.1%}")
    
    print("\n🎯 Integration Example Complete!")
    print("You can now use this enhanced system in your Ventry application.")


if __name__ == "__main__":
    main() 