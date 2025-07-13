#!/usr/bin/env python3
"""
Enhanced RL Training System with Real Business Outcomes

This system enhances the RL agent's learning by incorporating:
1. Real business outcomes from Shopify/QuickBooks
2. User feedback on recommendation quality
3. Weighted reward signals based on actual ROI
4. Periodic retraining with enriched data

The system maintains compatibility with the existing mock data pipeline
while providing significant improvements in learning quality.
"""

import os
import json
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import pickle

# RL imports
try:
    from stable_baselines3 import PPO
    from stable_baselines3.common.env_util import make_vec_env
    from stable_baselines3.common.callbacks import EvalCallback
    from stable_baselines3.common.monitor import Monitor
    from stable_baselines3.common.vec_env import VecNormalize
    from enhanced_business_env import EnhancedBusinessEnv
    from enhanced_outcome_tracking import EnhancedOutcomeTracker, OutcomeData, EnhancedReward
except ImportError as e:
    print(f"Warning: RL dependencies not available: {e}")
    print("Install with: pip install -r requirements.txt")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class TrainingMetrics:
    """Metrics for tracking training performance"""
    episode: int
    mean_reward: float
    std_reward: float
    mean_actual_roi: float
    roi_accuracy: float
    user_satisfaction: float
    total_profit: float
    training_time: float
    model_version: str


class EnhancedRLTrainingSystem:
    """Enhanced RL training system with real business outcomes"""
    
    def __init__(self,
                 model_path: str = "models/enhanced_restocking_agent.zip",
                 outcome_tracker: Optional[EnhancedOutcomeTracker] = None,
                 use_real_outcomes: bool = True,
                 retraining_threshold: int = 10):
        """
        Initialize the enhanced training system
        
        Args:
            model_path: Path to save/load the model
            outcome_tracker: Outcome tracking system
            use_real_outcomes: Whether to use real business outcomes
            retraining_threshold: Minimum outcomes needed to trigger retraining
        """
        self.model_path = model_path
        self.use_real_outcomes = use_real_outcomes
        self.retraining_threshold = retraining_threshold
        
        # Initialize outcome tracker
        if outcome_tracker is None:
            self.outcome_tracker = EnhancedOutcomeTracker(mock_mode=not use_real_outcomes)
        else:
            self.outcome_tracker = outcome_tracker
        
        # Training components
        self.model = None
        self.env = None
        self.training_metrics = []
        
        # Enhanced reward parameters
        self.roi_weight = 0.6  # Primary weight for actual ROI
        self.feedback_weight = 0.2  # Weight for user feedback
        self.accuracy_weight = 0.2  # Weight for prediction accuracy
        
        # File paths
        self.training_history_file = "enhanced_training_history.json"
        self.metrics_file = "enhanced_training_metrics.json"
        
        logger.info(f"Enhanced RL Training System initialized (use_real_outcomes={use_real_outcomes})")
    
    def create_enhanced_environment(self, use_real_rewards: bool = True) -> EnhancedBusinessEnv:
        """
        Create an enhanced business environment with real reward signals
        
        Args:
            use_real_rewards: Whether to use real outcome data for rewards
            
        Returns:
            EnhancedBusinessEnv: Enhanced environment
        """
        # Create base environment
        env = EnhancedBusinessEnv()
        
        if use_real_rewards:
            # Inject real reward data into the environment
            env = self._inject_real_rewards(env)
        
        return env
    
    def _inject_real_rewards(self, env: EnhancedBusinessEnv) -> EnhancedBusinessEnv:
        """
        Inject real reward signals into the environment
        
        Args:
            env: Base environment
            
        Returns:
            EnhancedBusinessEnv: Environment with real rewards
        """
        # Get training data from outcome tracker
        training_data = self.outcome_tracker.get_training_data()
        enhanced_rewards = training_data.get('enhanced_rewards', [])
        
        if not enhanced_rewards:
            logger.warning("No enhanced rewards available, using standard environment")
            return env
        
        # Create a reward lookup table
        reward_lookup = {}
        for reward_data in enhanced_rewards:
            task_id = reward_data.get('task_id')
            if task_id:
                reward_lookup[task_id] = {
                    'total_reward': reward_data.get('total_reward', 0),
                    'actual_roi_reward': reward_data.get('actual_roi_reward', 0),
                    'user_feedback_bonus': reward_data.get('user_feedback_bonus', 0),
                    'confidence_score': reward_data.get('confidence_score', 0.5)
                }
        
        # Monkey patch the environment's reward calculation
        original_calculate_reward = env._calculate_enhanced_reward
        
        def enhanced_reward_calculation(daily_results, restock_costs):
            # Get base reward
            base_reward = original_calculate_reward(daily_results, restock_costs)
            
            # Apply real outcome adjustments
            if hasattr(env, '_current_action_id') and env._current_action_id in reward_lookup:
                real_reward_data = reward_lookup[env._current_action_id]
                
                # Weight the reward based on real outcomes
                real_reward_component = real_reward_data['total_reward'] * real_reward_data['confidence_score']
                
                # Blend base reward with real reward
                blend_factor = 0.3  # 30% real reward, 70% simulation
                enhanced_reward = (1 - blend_factor) * base_reward + blend_factor * real_reward_component
                
                logger.debug(f"Enhanced reward: base={base_reward:.3f}, real={real_reward_component:.3f}, "
                           f"final={enhanced_reward:.3f}")
                
                return enhanced_reward
            
            return base_reward
        
        env._calculate_enhanced_reward = enhanced_reward_calculation
        
        logger.info(f"Injected {len(reward_lookup)} real reward signals into environment")
        return env
    
    def should_retrain(self) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if the model should be retrained based on new outcomes
        
        Returns:
            Tuple[bool, Dict]: (should_retrain, reason_data)
        """
        training_data = self.outcome_tracker.get_training_data()
        outcomes = training_data.get('outcomes', [])
        
        # Check if we have enough new outcomes
        if len(outcomes) < self.retraining_threshold:
            return False, {
                'reason': 'insufficient_outcomes',
                'current_outcomes': len(outcomes),
                'threshold': self.retraining_threshold
            }
        
        # Check if model performance is degrading
        summary = training_data.get('summary', {})
        roi_accuracy = summary.get('average_roi_accuracy', 0.0)
        
        if roi_accuracy < 0.6:  # Less than 60% accuracy
            return True, {
                'reason': 'poor_accuracy',
                'roi_accuracy': roi_accuracy,
                'threshold': 0.6
            }
        
        # Check if we have enough user feedback
        user_satisfaction = summary.get('average_user_satisfaction')
        if user_satisfaction is not None and user_satisfaction < 3.0:  # Less than 3/5
            return True, {
                'reason': 'poor_user_satisfaction',
                'user_satisfaction': user_satisfaction,
                'threshold': 3.0
            }
        
        # Check for significant profit losses
        total_profit = summary.get('total_actual_profit', 0)
        if total_profit < -1000:  # More than $1000 in losses
            return True, {
                'reason': 'significant_losses',
                'total_profit': total_profit,
                'threshold': -1000
            }
        
        # Check if it's been a while since last training
        if self.training_metrics:
            last_training = self.training_metrics[-1]
            days_since_training = (datetime.now() - datetime.fromisoformat(last_training.model_version)).days
            
            if days_since_training > 7:  # More than a week
                return True, {
                    'reason': 'scheduled_retraining',
                    'days_since_training': days_since_training,
                    'threshold': 7
                }
        
        return False, {'reason': 'no_retraining_needed'}
    
    def train_enhanced_model(self, 
                           total_timesteps: int = 100000,
                           save_freq: int = 10000,
                           use_real_rewards: bool = True) -> Dict[str, Any]:
        """
        Train the enhanced RL model with real business outcomes
        
        Args:
            total_timesteps: Number of training timesteps
            save_freq: Frequency to save model checkpoints
            use_real_rewards: Whether to use real outcome rewards
            
        Returns:
            Dict: Training results and metrics
        """
        start_time = datetime.now()
        
        try:
            # Create enhanced environment
            self.env = self.create_enhanced_environment(use_real_rewards)
            
            # Create or load model
            if self.model is None:
                self.model = PPO(
                    "MlpPolicy",
                    self.env,
                    learning_rate=3e-4,
                    n_steps=2048,
                    batch_size=64,
                    n_epochs=10,
                    gamma=0.99,
                    gae_lambda=0.95,
                    clip_range=0.2,
                    verbose=1,
                    tensorboard_log="./tensorboard_logs/"
                )
                logger.info("Created new PPO model")
            else:
                logger.info("Using existing model for continued training")
            
            # Create evaluation callback
            eval_env = Monitor(self.create_enhanced_environment(use_real_rewards))
            eval_callback = EvalCallback(
                eval_env,
                best_model_save_path="./models/",
                log_path="./logs/",
                eval_freq=save_freq,
                deterministic=True,
                render=False
            )
            
            # Train the model
            logger.info(f"Starting enhanced training for {total_timesteps} timesteps...")
            self.model.learn(
                total_timesteps=total_timesteps,
                callback=eval_callback,
                progress_bar=True
            )
            
            # Save the model
            self.model.save(self.model_path)
            
            # Evaluate the trained model
            training_results = self._evaluate_enhanced_model()
            
            # Record training metrics
            training_time = (datetime.now() - start_time).total_seconds()
            metrics = TrainingMetrics(
                episode=len(self.training_metrics) + 1,
                mean_reward=training_results.get('mean_reward', 0),
                std_reward=training_results.get('std_reward', 0),
                mean_actual_roi=training_results.get('mean_actual_roi', 0),
                roi_accuracy=training_results.get('roi_accuracy', 0),
                user_satisfaction=training_results.get('user_satisfaction', 0),
                total_profit=training_results.get('total_profit', 0),
                training_time=training_time,
                model_version=datetime.now().isoformat()
            )
            
            self.training_metrics.append(metrics)
            self._save_training_metrics()
            
            logger.info(f"Enhanced training completed in {training_time:.2f} seconds")
            
            return {
                'success': True,
                'training_time': training_time,
                'timesteps': total_timesteps,
                'metrics': training_results,
                'model_path': self.model_path
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced training: {e}")
            return {
                'success': False,
                'error': str(e),
                'training_time': (datetime.now() - start_time).total_seconds()
            }
    
    def _evaluate_enhanced_model(self, n_episodes: int = 10) -> Dict[str, Any]:
        """
        Evaluate the enhanced model with real outcome metrics
        
        Args:
            n_episodes: Number of episodes to evaluate
            
        Returns:
            Dict: Evaluation results
        """
        if self.model is None:
            return {'error': 'No model to evaluate'}
        
        # Create evaluation environment
        eval_env = self.create_enhanced_environment(use_real_rewards=False)
        
        episode_rewards = []
        episode_profits = []
        roi_predictions = []
        
        for episode in range(n_episodes):
            obs, info = eval_env.reset()
            episode_reward = 0
            episode_profit = 0
            
            for step in range(90):  # 90 days per episode
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = eval_env.step(action)
                
                episode_reward += reward
                episode_profit += info.get('total_profit', 0)
                
                # Collect ROI predictions if available
                if 'predicted_roi' in info:
                    roi_predictions.append(info['predicted_roi'])
                
                if terminated or truncated:
                    break
            
            episode_rewards.append(episode_reward)
            episode_profits.append(episode_profit)
        
        # Calculate metrics
        mean_reward = np.mean(episode_rewards)
        std_reward = np.std(episode_rewards)
        mean_profit = np.mean(episode_profits)
        
        # Get real outcome metrics
        training_data = self.outcome_tracker.get_training_data()
        summary = training_data.get('summary', {})
        
        return {
            'mean_reward': mean_reward,
            'std_reward': std_reward,
            'mean_profit': mean_profit,
            'mean_actual_roi': summary.get('average_actual_roi', 0),
            'roi_accuracy': summary.get('average_roi_accuracy', 0),
            'user_satisfaction': summary.get('average_user_satisfaction', 0),
            'total_profit': summary.get('total_actual_profit', 0),
            'profitable_recommendations': summary.get('profitable_recommendations', 0),
            'total_outcomes': summary.get('total_outcomes', 0)
        }
    
    def _save_training_metrics(self):
        """Save training metrics to file"""
        try:
            metrics_data = []
            for metric in self.training_metrics:
                metrics_data.append({
                    'episode': metric.episode,
                    'mean_reward': metric.mean_reward,
                    'std_reward': metric.std_reward,
                    'mean_actual_roi': metric.mean_actual_roi,
                    'roi_accuracy': metric.roi_accuracy,
                    'user_satisfaction': metric.user_satisfaction,
                    'total_profit': metric.total_profit,
                    'training_time': metric.training_time,
                    'model_version': metric.model_version
                })
            
            with open(self.metrics_file, 'w') as f:
                json.dump(metrics_data, f, indent=2)
            
            logger.info(f"Saved {len(metrics_data)} training metrics")
            
        except Exception as e:
            logger.error(f"Error saving training metrics: {e}")
    
    def load_model(self) -> bool:
        """
        Load the enhanced model
        
        Returns:
            bool: True if model loaded successfully
        """
        try:
            if os.path.exists(self.model_path):
                self.model = PPO.load(self.model_path)
                logger.info(f"Loaded enhanced model from {self.model_path}")
                return True
            else:
                logger.warning(f"No model found at {self.model_path}")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def generate_enhanced_recommendations(self, n_episodes: int = 5) -> Dict[str, Any]:
        """
        Generate recommendations using the enhanced model
        
        Args:
            n_episodes: Number of simulation episodes
            
        Returns:
            Dict: Enhanced recommendations with confidence scores
        """
        if self.model is None:
            if not self.load_model():
                return {'error': 'No trained model available'}
        
        # Create test environment
        test_env = self.create_enhanced_environment(use_real_rewards=False)
        
        all_recommendations = []
        episode_metrics = []
        
        for episode in range(n_episodes):
            obs, info = test_env.reset()
            episode_profit = 0
            episode_actions = []
            
            for step in range(90):
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = test_env.step(action)
                
                episode_profit += info.get('total_profit', 0)
                
                # Record actions with enhanced confidence
                if 'episode_actions' in info and info['episode_actions']:
                    for action_info in info['episode_actions']:
                        # Add confidence score based on model certainty
                        action_info['confidence_score'] = self._calculate_action_confidence(action_info)
                        episode_actions.append(action_info)
                
                if terminated or truncated:
                    break
            
            episode_metrics.append({
                'profit': episode_profit,
                'actions': len(episode_actions)
            })
            
            all_recommendations.extend(episode_actions)
        
        # Rank recommendations by enhanced criteria
        ranked_recommendations = self._rank_recommendations(all_recommendations)
        
        # Generate final recommendation
        if ranked_recommendations:
            best_rec = ranked_recommendations[0]
            
            # Get historical performance context
            training_data = self.outcome_tracker.get_training_data()
            summary = training_data.get('summary', {})
            
            return {
                'action': best_rec.get('action', 'restock'),
                'quantity': best_rec.get('quantity', 0),
                'expected_roi': best_rec.get('expected_roi', '0%'),
                'predicted_profit_usd': best_rec.get('predicted_profit_usd', 0),
                'confidence': self._map_confidence_to_level(best_rec.get('confidence_score', 0.5)),
                'reasoning': self._generate_enhanced_reasoning(best_rec, summary),
                'timestamp': datetime.now().isoformat(),
                'model_version': 'enhanced',
                'historical_context': {
                    'average_roi_accuracy': summary.get('average_roi_accuracy', 0),
                    'average_user_satisfaction': summary.get('average_user_satisfaction', 0),
                    'total_outcomes_tracked': summary.get('total_outcomes', 0)
                },
                'alternative_actions': ranked_recommendations[1:3] if len(ranked_recommendations) > 1 else []
            }
        else:
            return {
                'action': 'monitor',
                'quantity': 0,
                'expected_roi': '0%',
                'predicted_profit_usd': 0,
                'confidence': 'low',
                'reasoning': 'No profitable opportunities identified in current market conditions',
                'timestamp': datetime.now().isoformat(),
                'model_version': 'enhanced'
            }
    
    def _calculate_action_confidence(self, action_info: Dict[str, Any]) -> float:
        """Calculate confidence score for an action"""
        # Base confidence from expected ROI
        roi_str = action_info.get('expected_roi', '0%')
        roi_value = float(roi_str.replace('%', ''))
        roi_confidence = min(1.0, max(0.0, roi_value / 100.0))
        
        # Historical accuracy adjustment
        training_data = self.outcome_tracker.get_training_data()
        summary = training_data.get('summary', {})
        historical_accuracy = summary.get('average_roi_accuracy', 0.5)
        
        # Combine factors
        confidence = 0.6 * roi_confidence + 0.4 * historical_accuracy
        
        return min(1.0, max(0.0, confidence))
    
    def _rank_recommendations(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank recommendations by enhanced criteria"""
        def score_recommendation(rec):
            # ROI score
            roi_str = rec.get('expected_roi', '0%')
            roi_value = float(roi_str.replace('%', ''))
            roi_score = roi_value / 100.0
            
            # Confidence score
            confidence_score = rec.get('confidence_score', 0.5)
            
            # Profit score
            profit = rec.get('predicted_profit_usd', 0)
            profit_score = min(1.0, max(0.0, profit / 1000.0))  # Normalize to $1000
            
            # Combined score
            return 0.4 * roi_score + 0.3 * confidence_score + 0.3 * profit_score
        
        return sorted(recommendations, key=score_recommendation, reverse=True)
    
    def _map_confidence_to_level(self, confidence_score: float) -> str:
        """Map confidence score to level"""
        if confidence_score >= 0.8:
            return 'high'
        elif confidence_score >= 0.6:
            return 'medium'
        else:
            return 'low'
    
    def _generate_enhanced_reasoning(self, recommendation: Dict[str, Any], summary: Dict[str, Any]) -> str:
        """Generate enhanced reasoning with historical context"""
        base_reasoning = recommendation.get('reasoning', 'AI-generated recommendation')
        
        # Add historical context
        roi_accuracy = summary.get('average_roi_accuracy', 0)
        user_satisfaction = summary.get('average_user_satisfaction')
        total_outcomes = summary.get('total_outcomes', 0)
        
        context_parts = []
        
        if total_outcomes > 0:
            context_parts.append(f"Based on {total_outcomes} historical outcomes")
            
            if roi_accuracy > 0:
                context_parts.append(f"with {roi_accuracy:.1%} ROI prediction accuracy")
            
            if user_satisfaction is not None:
                context_parts.append(f"and {user_satisfaction:.1f}/5 user satisfaction")
        
        if context_parts:
            enhanced_reasoning = f"{base_reasoning}. {', '.join(context_parts)}."
        else:
            enhanced_reasoning = base_reasoning
        
        return enhanced_reasoning
    
    def run_periodic_retraining(self) -> Dict[str, Any]:
        """
        Run periodic retraining check and execution
        
        Returns:
            Dict: Results of the retraining check/execution
        """
        logger.info("Running periodic retraining check...")
        
        # Check if retraining is needed
        should_retrain, reason_data = self.should_retrain()
        
        if not should_retrain:
            logger.info(f"No retraining needed: {reason_data['reason']}")
            return {
                'retraining_performed': False,
                'reason': reason_data['reason'],
                'details': reason_data
            }
        
        logger.info(f"Retraining triggered: {reason_data['reason']}")
        
        # Perform retraining
        training_results = self.train_enhanced_model(
            total_timesteps=50000,  # Smaller retraining session
            use_real_rewards=True
        )
        
        if training_results['success']:
            logger.info("Retraining completed successfully")
            return {
                'retraining_performed': True,
                'reason': reason_data['reason'],
                'training_results': training_results,
                'trigger_details': reason_data
            }
        else:
            logger.error(f"Retraining failed: {training_results.get('error')}")
            return {
                'retraining_performed': False,
                'reason': 'training_failed',
                'error': training_results.get('error'),
                'trigger_details': reason_data
            }


def main():
    """Main function for testing the enhanced training system"""
    # Initialize the system
    training_system = EnhancedRLTrainingSystem(use_real_outcomes=True)
    
    # Run periodic retraining check
    retraining_result = training_system.run_periodic_retraining()
    print(f"Retraining result: {retraining_result}")
    
    # Generate enhanced recommendations
    recommendations = training_system.generate_enhanced_recommendations()
    print(f"Enhanced recommendation: {recommendations}")


if __name__ == "__main__":
    main() 