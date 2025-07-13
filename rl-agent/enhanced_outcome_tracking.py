#!/usr/bin/env python3
"""
Enhanced Outcome Tracking System for RL Agent

This system automatically captures real business outcomes after approved restock recommendations
and integrates with Shopify and QuickBooks data to calculate actual ROI and performance metrics.

Features:
- Automated outcome tracking after approved restocks
- Real ROI calculation from Shopify sales and QuickBooks cost data
- Sell-through rate monitoring
- User feedback integration
- Enhanced reward signal generation for RL training
"""

import json
import os
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class OutcomeData:
    """Data structure for tracking business outcomes"""
    task_id: str
    recommendation_id: str
    approved_at: datetime
    product_id: str
    product_name: str
    
    # Original prediction
    predicted_roi: float
    predicted_profit: float
    restock_quantity: int
    restock_cost: float
    
    # Actual outcomes (captured over time)
    actual_sales_before: float = 0.0
    actual_sales_after: float = 0.0
    actual_cost: float = 0.0
    actual_roi: float = 0.0
    actual_profit: float = 0.0
    sell_through_rate: float = 0.0
    
    # Tracking periods
    tracking_start: Optional[datetime] = None
    tracking_end: Optional[datetime] = None
    outcome_captured_at: Optional[datetime] = None
    
    # User feedback
    user_feedback: Optional[str] = None
    user_satisfaction: Optional[float] = None  # 1-5 scale
    feedback_collected_at: Optional[datetime] = None
    
    # Status
    status: str = "tracking"  # tracking, completed, failed


@dataclass
class EnhancedReward:
    """Enhanced reward signal for RL training"""
    task_id: str
    base_reward: float
    actual_roi_reward: float
    user_feedback_bonus: float
    accuracy_penalty: float
    total_reward: float
    confidence_score: float
    created_at: datetime


class EnhancedOutcomeTracker:
    """Enhanced outcome tracking system for RL agent"""
    
    def __init__(self, 
                 data_dir: str = ".",
                 tracking_period_days: int = 30,
                 mock_mode: bool = True):
        """
        Initialize the outcome tracker
        
        Args:
            data_dir: Directory containing data files
            tracking_period_days: How long to track outcomes after approval
            mock_mode: Whether to use mock data (True) or real integrations (False)
        """
        self.data_dir = data_dir
        self.tracking_period_days = tracking_period_days
        self.mock_mode = mock_mode
        
        # File paths
        self.approved_tasks_file = os.path.join(data_dir, "approved_tasks.json")
        self.outcome_data_file = os.path.join(data_dir, "outcome_tracking.json")
        self.enhanced_rewards_file = os.path.join(data_dir, "enhanced_rewards.json")
        self.user_feedback_file = os.path.join(data_dir, "user_feedback.json")
        
        # Initialize tracking data
        self.outcome_data = self._load_outcome_data()
        self.enhanced_rewards = self._load_enhanced_rewards()
        
        logger.info(f"Enhanced Outcome Tracker initialized (mock_mode={mock_mode})")
    
    def _load_outcome_data(self) -> List[OutcomeData]:
        """Load existing outcome tracking data"""
        try:
            if os.path.exists(self.outcome_data_file):
                with open(self.outcome_data_file, 'r') as f:
                    data = json.load(f)
                    return [OutcomeData(**item) for item in data]
            return []
        except Exception as e:
            logger.error(f"Error loading outcome data: {e}")
            return []
    
    def _save_outcome_data(self):
        """Save outcome tracking data"""
        try:
            data = [asdict(outcome) for outcome in self.outcome_data]
            # Convert datetime objects to ISO strings
            for item in data:
                for key, value in item.items():
                    if isinstance(value, datetime):
                        item[key] = value.isoformat()
            
            with open(self.outcome_data_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            logger.info(f"Saved {len(self.outcome_data)} outcome records")
        except Exception as e:
            logger.error(f"Error saving outcome data: {e}")
    
    def _load_enhanced_rewards(self) -> List[EnhancedReward]:
        """Load enhanced reward data"""
        try:
            if os.path.exists(self.enhanced_rewards_file):
                with open(self.enhanced_rewards_file, 'r') as f:
                    data = json.load(f)
                    return [EnhancedReward(**item) for item in data]
            return []
        except Exception as e:
            logger.error(f"Error loading enhanced rewards: {e}")
            return []
    
    def _save_enhanced_rewards(self):
        """Save enhanced reward data"""
        try:
            data = [asdict(reward) for reward in self.enhanced_rewards]
            # Convert datetime objects to ISO strings
            for item in data:
                for key, value in item.items():
                    if isinstance(value, datetime):
                        item[key] = value.isoformat()
            
            with open(self.enhanced_rewards_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            logger.info(f"Saved {len(self.enhanced_rewards)} enhanced reward records")
        except Exception as e:
            logger.error(f"Error saving enhanced rewards: {e}")
    
    def start_tracking_approved_task(self, approved_task: Dict[str, Any]) -> bool:
        """
        Start tracking outcomes for a newly approved task
        
        Args:
            approved_task: Approved task data from approved_tasks.json
            
        Returns:
            bool: True if tracking started successfully
        """
        try:
            recommendation = approved_task.get('recommendation', {})
            
            # Extract key information
            task_id = approved_task.get('id', 'unknown')
            product_name = self._extract_product_name(recommendation)
            restock_quantity = recommendation.get('quantity', 0)
            predicted_roi = float(recommendation.get('expected_roi', '0%').replace('%', ''))
            predicted_profit = recommendation.get('predicted_profit_usd', 0)
            
            # Calculate restock cost (mock data for now)
            restock_cost = restock_quantity * 10.0  # $10 per unit (mock)
            
            # Create outcome tracking record
            outcome = OutcomeData(
                task_id=task_id,
                recommendation_id=recommendation.get('id', task_id),
                approved_at=datetime.fromisoformat(approved_task.get('approved_at', datetime.now().isoformat())),
                product_id=f"prod-{product_name.lower().replace(' ', '-')}",
                product_name=product_name,
                predicted_roi=predicted_roi,
                predicted_profit=predicted_profit,
                restock_quantity=restock_quantity,
                restock_cost=restock_cost,
                tracking_start=datetime.now(),
                tracking_end=datetime.now() + timedelta(days=self.tracking_period_days),
                status="tracking"
            )
            
            self.outcome_data.append(outcome)
            self._save_outcome_data()
            
            logger.info(f"Started tracking outcomes for task {task_id}: {product_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error starting outcome tracking: {e}")
            return False
    
    def _extract_product_name(self, recommendation: Dict[str, Any]) -> str:
        """Extract product name from recommendation"""
        # Try various fields that might contain product name
        for field in ['product', 'item', 'product_name', 'item_name']:
            if field in recommendation:
                return recommendation[field]
        
        # Fallback to parsing from action description
        action = recommendation.get('action', 'restock')
        reasoning = recommendation.get('reasoning', '')
        
        # Simple extraction from reasoning text
        if 'product' in reasoning.lower():
            words = reasoning.split()
            for i, word in enumerate(words):
                if word.lower() in ['product', 'item']:
                    if i + 1 < len(words):
                        return words[i + 1].strip('.,!?')
        
        return "Default Product"
    
    def capture_business_outcomes(self) -> int:
        """
        Capture business outcomes for all tracking records
        
        Returns:
            int: Number of outcomes captured
        """
        captured_count = 0
        
        for outcome in self.outcome_data:
            if outcome.status == "tracking" and self._should_capture_outcome(outcome):
                if self._capture_outcome_data(outcome):
                    captured_count += 1
        
        if captured_count > 0:
            self._save_outcome_data()
            logger.info(f"Captured outcomes for {captured_count} tasks")
        
        return captured_count
    
    def _should_capture_outcome(self, outcome: OutcomeData) -> bool:
        """Check if outcome should be captured now"""
        if outcome.tracking_end is None:
            return False
        
        # Capture if tracking period has ended
        return datetime.now() >= outcome.tracking_end
    
    def _capture_outcome_data(self, outcome: OutcomeData) -> bool:
        """
        Capture actual business outcome data
        
        Args:
            outcome: OutcomeData record to update
            
        Returns:
            bool: True if data was captured successfully
        """
        try:
            if self.mock_mode:
                return self._capture_mock_outcome_data(outcome)
            else:
                return self._capture_real_outcome_data(outcome)
        except Exception as e:
            logger.error(f"Error capturing outcome data for {outcome.task_id}: {e}")
            return False
    
    def _capture_mock_outcome_data(self, outcome: OutcomeData) -> bool:
        """Capture mock business outcome data for testing"""
        try:
            # Generate realistic mock data based on prediction
            base_accuracy = 0.7 + np.random.normal(0, 0.15)  # 70% base accuracy ± 15%
            base_accuracy = max(0.2, min(1.0, base_accuracy))  # Clamp to reasonable range
            
            # Simulate sales before and after restock
            daily_sales_before = 15 + np.random.normal(0, 5)
            daily_sales_after = daily_sales_before * (1.2 + np.random.normal(0, 0.3))
            
            # Calculate period sales
            period_days = (outcome.tracking_end - outcome.tracking_start).days
            outcome.actual_sales_before = max(0, daily_sales_before * (period_days / 2))
            outcome.actual_sales_after = max(0, daily_sales_after * (period_days / 2))
            
            # Calculate actual cost (with some variation)
            cost_variation = 1.0 + np.random.normal(0, 0.1)
            outcome.actual_cost = outcome.restock_cost * cost_variation
            
            # Calculate actual profit and ROI
            revenue_per_unit = 20.0  # Mock selling price
            units_sold = min(outcome.restock_quantity, outcome.actual_sales_after)
            total_revenue = units_sold * revenue_per_unit
            outcome.actual_profit = total_revenue - outcome.actual_cost
            
            if outcome.actual_cost > 0:
                outcome.actual_roi = (outcome.actual_profit / outcome.actual_cost) * 100
            else:
                outcome.actual_roi = 0
            
            # Calculate sell-through rate
            if outcome.restock_quantity > 0:
                outcome.sell_through_rate = (units_sold / outcome.restock_quantity) * 100
            else:
                outcome.sell_through_rate = 0
            
            # Update status
            outcome.status = "completed"
            outcome.outcome_captured_at = datetime.now()
            
            logger.info(f"Mock outcome captured for {outcome.task_id}: "
                       f"ROI {outcome.actual_roi:.1f}% vs predicted {outcome.predicted_roi:.1f}%")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturing mock outcome data: {e}")
            return False
    
    def _capture_real_outcome_data(self, outcome: OutcomeData) -> bool:
        """Capture real business outcome data from Shopify/QuickBooks"""
        try:
            # This would integrate with real Shopify and QuickBooks APIs
            # For now, we'll simulate the integration
            
            # Get sales data from Shopify
            sales_data = self._get_shopify_sales_data(
                outcome.product_id,
                outcome.tracking_start,
                outcome.tracking_end
            )
            
            # Get cost data from QuickBooks
            cost_data = self._get_quickbooks_cost_data(
                outcome.product_id,
                outcome.approved_at,
                outcome.tracking_end
            )
            
            # Calculate actual outcomes
            outcome.actual_sales_before = sales_data.get('sales_before', 0)
            outcome.actual_sales_after = sales_data.get('sales_after', 0)
            outcome.actual_cost = cost_data.get('actual_cost', outcome.restock_cost)
            
            # Calculate ROI and profit
            total_revenue = sales_data.get('total_revenue', 0)
            outcome.actual_profit = total_revenue - outcome.actual_cost
            
            if outcome.actual_cost > 0:
                outcome.actual_roi = (outcome.actual_profit / outcome.actual_cost) * 100
            else:
                outcome.actual_roi = 0
            
            # Calculate sell-through rate
            units_sold = sales_data.get('units_sold', 0)
            if outcome.restock_quantity > 0:
                outcome.sell_through_rate = (units_sold / outcome.restock_quantity) * 100
            else:
                outcome.sell_through_rate = 0
            
            outcome.status = "completed"
            outcome.outcome_captured_at = datetime.now()
            
            logger.info(f"Real outcome captured for {outcome.task_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error capturing real outcome data: {e}")
            return False
    
    def _get_shopify_sales_data(self, product_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get sales data from Shopify API (placeholder)"""
        # This would use the actual Shopify API
        # For now, return mock data structure
        return {
            'sales_before': 150.0,
            'sales_after': 280.0,
            'total_revenue': 430.0,
            'units_sold': 25
        }
    
    def _get_quickbooks_cost_data(self, product_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get cost data from QuickBooks API (placeholder)"""
        # This would use the actual QuickBooks API
        # For now, return mock data structure
        return {
            'actual_cost': 250.0,
            'cost_variance': 0.05
        }
    
    def collect_user_feedback(self, task_id: str, feedback: str, satisfaction: float) -> bool:
        """
        Collect user feedback for a completed task
        
        Args:
            task_id: Task ID
            feedback: User feedback text
            satisfaction: Satisfaction score (1-5)
            
        Returns:
            bool: True if feedback was collected successfully
        """
        try:
            # Find the outcome record
            outcome = next((o for o in self.outcome_data if o.task_id == task_id), None)
            if not outcome:
                logger.warning(f"No outcome record found for task {task_id}")
                return False
            
            # Update feedback
            outcome.user_feedback = feedback
            outcome.user_satisfaction = satisfaction
            outcome.feedback_collected_at = datetime.now()
            
            # Save feedback to separate file for analysis
            self._save_user_feedback(task_id, feedback, satisfaction)
            
            self._save_outcome_data()
            logger.info(f"Collected user feedback for task {task_id}: {satisfaction}/5")
            
            return True
            
        except Exception as e:
            logger.error(f"Error collecting user feedback: {e}")
            return False
    
    def _save_user_feedback(self, task_id: str, feedback: str, satisfaction: float):
        """Save user feedback to dedicated file"""
        try:
            feedback_data = []
            if os.path.exists(self.user_feedback_file):
                with open(self.user_feedback_file, 'r') as f:
                    feedback_data = json.load(f)
            
            feedback_data.append({
                'task_id': task_id,
                'feedback': feedback,
                'satisfaction': satisfaction,
                'collected_at': datetime.now().isoformat()
            })
            
            with open(self.user_feedback_file, 'w') as f:
                json.dump(feedback_data, f, indent=2)
            
        except Exception as e:
            logger.error(f"Error saving user feedback: {e}")
    
    def generate_enhanced_rewards(self) -> List[EnhancedReward]:
        """
        Generate enhanced reward signals for RL training
        
        Returns:
            List[EnhancedReward]: Enhanced rewards for completed outcomes
        """
        new_rewards = []
        
        for outcome in self.outcome_data:
            if outcome.status == "completed" and outcome.outcome_captured_at:
                # Check if we already have a reward for this task
                existing_reward = next((r for r in self.enhanced_rewards if r.task_id == outcome.task_id), None)
                if existing_reward:
                    continue
                
                # Generate enhanced reward
                reward = self._calculate_enhanced_reward(outcome)
                new_rewards.append(reward)
                self.enhanced_rewards.append(reward)
        
        if new_rewards:
            self._save_enhanced_rewards()
            logger.info(f"Generated {len(new_rewards)} enhanced rewards")
        
        return new_rewards
    
    def _calculate_enhanced_reward(self, outcome: OutcomeData) -> EnhancedReward:
        """Calculate enhanced reward signal for an outcome"""
        # Base reward from actual profit (normalized)
        base_reward = outcome.actual_profit / 100.0
        
        # Actual ROI reward (primary signal)
        roi_accuracy = self._calculate_roi_accuracy(outcome.predicted_roi, outcome.actual_roi)
        actual_roi_reward = (outcome.actual_roi / 100.0) * roi_accuracy
        
        # User feedback bonus
        user_feedback_bonus = 0.0
        if outcome.user_satisfaction is not None:
            # Convert 1-5 scale to -1 to +1 scale
            normalized_satisfaction = (outcome.user_satisfaction - 3) / 2
            user_feedback_bonus = normalized_satisfaction * 0.2  # Small bonus weight
        
        # Accuracy penalty for large prediction errors
        roi_error = abs(outcome.predicted_roi - outcome.actual_roi)
        accuracy_penalty = -min(roi_error / 100.0, 0.5)  # Cap penalty at -0.5
        
        # Calculate total reward
        total_reward = base_reward + actual_roi_reward + user_feedback_bonus + accuracy_penalty
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(outcome)
        
        return EnhancedReward(
            task_id=outcome.task_id,
            base_reward=base_reward,
            actual_roi_reward=actual_roi_reward,
            user_feedback_bonus=user_feedback_bonus,
            accuracy_penalty=accuracy_penalty,
            total_reward=total_reward,
            confidence_score=confidence_score,
            created_at=datetime.now()
        )
    
    def _calculate_roi_accuracy(self, predicted: float, actual: float) -> float:
        """Calculate ROI prediction accuracy (0-1 scale)"""
        if predicted == 0 and actual == 0:
            return 1.0
        
        error = abs(predicted - actual)
        max_error = max(abs(predicted), abs(actual), 10.0)  # Minimum max error of 10%
        accuracy = max(0.0, 1.0 - (error / max_error))
        
        return accuracy
    
    def _calculate_confidence_score(self, outcome: OutcomeData) -> float:
        """Calculate confidence score for the outcome"""
        factors = []
        
        # ROI accuracy factor
        roi_accuracy = self._calculate_roi_accuracy(outcome.predicted_roi, outcome.actual_roi)
        factors.append(roi_accuracy)
        
        # Sell-through rate factor
        if outcome.sell_through_rate >= 80:
            factors.append(1.0)
        elif outcome.sell_through_rate >= 50:
            factors.append(0.7)
        else:
            factors.append(0.3)
        
        # User satisfaction factor
        if outcome.user_satisfaction is not None:
            satisfaction_score = (outcome.user_satisfaction - 1) / 4  # Convert to 0-1 scale
            factors.append(satisfaction_score)
        
        # Profit factor
        if outcome.actual_profit > 0:
            factors.append(1.0)
        elif outcome.actual_profit > -50:
            factors.append(0.5)
        else:
            factors.append(0.0)
        
        return np.mean(factors)
    
    def get_training_data(self) -> Dict[str, Any]:
        """
        Get enhanced training data for RL agent
        
        Returns:
            Dict containing training data with enhanced rewards
        """
        completed_outcomes = [o for o in self.outcome_data if o.status == "completed"]
        
        training_data = {
            'outcomes': [asdict(o) for o in completed_outcomes],
            'enhanced_rewards': [asdict(r) for r in self.enhanced_rewards],
            'summary': {
                'total_outcomes': len(completed_outcomes),
                'average_roi_accuracy': np.mean([
                    self._calculate_roi_accuracy(o.predicted_roi, o.actual_roi)
                    for o in completed_outcomes
                ]) if completed_outcomes else 0.0,
                'average_actual_roi': np.mean([o.actual_roi for o in completed_outcomes]) if completed_outcomes else 0.0,
                'average_user_satisfaction': np.mean([
                    o.user_satisfaction for o in completed_outcomes 
                    if o.user_satisfaction is not None
                ]) if any(o.user_satisfaction is not None for o in completed_outcomes) else None,
                'profitable_recommendations': len([o for o in completed_outcomes if o.actual_profit > 0]),
                'total_actual_profit': sum(o.actual_profit for o in completed_outcomes)
            }
        }
        
        return training_data
    
    def check_for_new_approved_tasks(self) -> int:
        """
        Check for new approved tasks and start tracking them
        
        Returns:
            int: Number of new tasks started tracking
        """
        try:
            if not os.path.exists(self.approved_tasks_file):
                return 0
            
            with open(self.approved_tasks_file, 'r') as f:
                approved_tasks = json.load(f)
            
            # Find tasks we're not already tracking
            tracking_task_ids = {o.task_id for o in self.outcome_data}
            new_tasks = [
                task for task in approved_tasks
                if task.get('id') not in tracking_task_ids
                and task.get('status') == 'approved'
                and not task.get('executed', False)
            ]
            
            # Start tracking new tasks
            started_count = 0
            for task in new_tasks:
                if self.start_tracking_approved_task(task):
                    started_count += 1
            
            return started_count
            
        except Exception as e:
            logger.error(f"Error checking for new approved tasks: {e}")
            return 0
    
    def run_outcome_capture_cycle(self) -> Dict[str, int]:
        """
        Run a complete outcome capture cycle
        
        Returns:
            Dict with statistics about the cycle
        """
        stats = {
            'new_tasks_started': 0,
            'outcomes_captured': 0,
            'rewards_generated': 0
        }
        
        try:
            # Check for new approved tasks
            stats['new_tasks_started'] = self.check_for_new_approved_tasks()
            
            # Capture outcomes for ready tasks
            stats['outcomes_captured'] = self.capture_business_outcomes()
            
            # Generate enhanced rewards
            new_rewards = self.generate_enhanced_rewards()
            stats['rewards_generated'] = len(new_rewards)
            
            logger.info(f"Outcome capture cycle completed: {stats}")
            
        except Exception as e:
            logger.error(f"Error in outcome capture cycle: {e}")
        
        return stats


def main():
    """Main function for testing the outcome tracker"""
    tracker = EnhancedOutcomeTracker(mock_mode=True)
    
    # Run a capture cycle
    stats = tracker.run_outcome_capture_cycle()
    print(f"Capture cycle stats: {stats}")
    
    # Get training data
    training_data = tracker.get_training_data()
    print(f"Training data summary: {training_data['summary']}")


if __name__ == "__main__":
    main() 