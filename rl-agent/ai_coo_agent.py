#!/usr/bin/env python3
"""
AI COO Agent - Comprehensive Business Operations Agent

This agent extends beyond simple restocking to become a comprehensive AI-powered
Chief Operating Officer capable of making diverse high-impact business decisions.

Action Categories:
- Inventory Management (restocking, optimization)
- Marketing Operations (ad spend, campaigns)
- Financial Management (invoicing, cost control)
- Pricing Strategy (discounts, optimization)
- Operational Excellence (expense management, supplier relations)
"""

import os
import sys
import numpy as np
import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import logging

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.callbacks import BaseCallback
from ai_coo_environment import AICOOEnvironment, ActionType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AICOOAgent:
    """
    AI Chief Operating Officer Agent
    
    Manages comprehensive business operations using reinforcement learning
    to optimize across multiple business functions simultaneously.
    """
    
    def __init__(self, 
                 model_path: str = "models/ai_coo_agent.zip",
                 algorithm: str = "PPO",
                 mock_mode: bool = True):
        """
        Initialize the AI COO Agent
        
        Args:
            model_path: Path to save/load the trained model
            algorithm: RL algorithm to use (PPO)
            mock_mode: Whether to use mock data or real integrations
        """
        self.model_path = model_path
        self.algorithm = algorithm
        self.mock_mode = mock_mode
        
        # Initialize components
        self.env = None
        self.model = None
        self.training_history = []
        
        # Action categories for interpretation
        self.action_categories = {
            'inventory': list(range(0, 11)),
            'marketing': list(range(11, 21)),
            'financial': list(range(21, 31)),
            'pricing': list(range(31, 41)),
            'operational': list(range(41, 51)),
            'monitor': [51]
        }
        
        logger.info(f"AI COO Agent initialized (algorithm={algorithm}, mock_mode={mock_mode})")
    
    def create_environment(self) -> AICOOEnvironment:
        """Create the AI COO business environment"""
        self.env = AICOOEnvironment(mock_mode=self.mock_mode)
        logger.info("AI COO Environment created")
        return self.env
    
    def create_model(self, **kwargs) -> PPO:
        """Create the PPO model for the AI COO"""
        if self.env is None:
            self.create_environment()
        
        # Create vectorized environment
        vec_env = DummyVecEnv([lambda: self.env])
        
        # PPO configuration optimized for business operations
        model_kwargs = {
            'learning_rate': 3e-4,
            'n_steps': 2048,
            'batch_size': 64,
            'n_epochs': 10,
            'gamma': 0.99,
            'gae_lambda': 0.95,
            'clip_range': 0.2,
            'ent_coef': 0.01,
            'verbose': 1,
            'tensorboard_log': "./tensorboard_logs/"
        }
        
        # Override with any provided kwargs
        model_kwargs.update(kwargs)
        
        self.model = PPO('MlpPolicy', vec_env, **model_kwargs)
        logger.info("PPO model created for AI COO")
        return self.model
    
    def train(self, total_timesteps: int = 100000, save_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Train the AI COO agent
        
        Args:
            total_timesteps: Total training timesteps
            save_path: Optional path to save the model
            
        Returns:
            Training results dictionary
        """
        if self.model is None:
            self.create_model()
        
        logger.info(f"Starting AI COO training for {total_timesteps} timesteps...")
        
        # Train the model
        self.model.learn(total_timesteps=total_timesteps)
        
        # Save the model
        save_path = save_path or self.model_path
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        self.model.save(save_path)
        
        # Generate training results
        results = {
            'algorithm': self.algorithm,
            'total_timesteps': total_timesteps,
            'model_path': save_path,
            'training_completed': datetime.now().isoformat(),
            'environment_type': 'AI_COO_Environment',
            'action_space_size': 52,
            'observation_space_size': 14
        }
        
        # Save training results
        results_path = "ai_coo_training_results.json"
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"AI COO training completed. Model saved to {save_path}")
        return results
    
    def load_model(self, model_path: Optional[str] = None) -> bool:
        """Load a trained model"""
        load_path = model_path or self.model_path
        
        if not os.path.exists(load_path):
            logger.warning(f"Model not found at {load_path}")
            return False
        
        try:
            self.model = PPO.load(load_path)
            logger.info(f"AI COO model loaded from {load_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def predict(self, observation: np.ndarray, deterministic: bool = True) -> int:
        """Make a prediction given an observation"""
        if self.model is None:
            raise ValueError("Model not loaded or trained. Call load_model() or train() first.")
        
        action, _ = self.model.predict(observation, deterministic=deterministic)
        return int(action)
    
    def generate_coo_recommendations(self, n_episodes: int = 5) -> Dict[str, Any]:
        """
        Generate comprehensive COO recommendations across all business functions
        
        Args:
            n_episodes: Number of simulation episodes to run
            
        Returns:
            Comprehensive business recommendations
        """
        if self.model is None:
            if not self.load_model():
                raise ValueError("No trained model available. Train the model first.")
        
        if self.env is None:
            self.create_environment()
        
        all_recommendations = []
        episode_metrics = []
        
        logger.info(f"Generating AI COO recommendations from {n_episodes} episodes...")
        
        for episode in range(n_episodes):
            obs, info = self.env.reset()
            episode_profit = 0
            episode_actions = []
            action_categories_used = set()
            
            for step in range(90):  # 90 days per episode
                action = self.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = self.env.step(action)
                
                episode_profit += info.get('daily_results', {}).get('daily_profit', 0)
                
                # Record action categories used
                action_category = self._get_action_category(action)
                action_categories_used.add(action_category)
                
                # Collect episode actions
                if 'action_result' in info:
                    action_result = info['action_result']
                    if action_result.action_type != ActionType.MONITOR:
                        episode_actions.append({
                            'day': step + 1,
                            'action': action_result.action_type.value,
                            'description': action_result.description,
                            'quantity': action_result.details.get('quantity', 0),
                            'expected_roi': f"{action_result.roi:.1f}%",
                            'predicted_profit_usd': action_result.revenue_impact - action_result.cost,
                            'confidence': action_result.confidence,
                            'impact_score': action_result.impact_score,
                            'cost': action_result.cost,
                            'revenue_impact': action_result.revenue_impact,
                            'category': action_category,
                            'details': action_result.details
                        })
                
                if terminated or truncated:
                    break
            
            episode_metrics.append({
                'profit': episode_profit,
                'actions_taken': len(episode_actions),
                'categories_used': list(action_categories_used),
                'diversity_score': len(action_categories_used) / 6  # 6 total categories
            })
            
            all_recommendations.extend(episode_actions)
        
        # Analyze recommendations by category
        recommendations_by_category = self._categorize_recommendations(all_recommendations)
        
        # Find best overall recommendation
        best_recommendations = sorted(
            all_recommendations, 
            key=lambda x: float(x['expected_roi'].replace('%', '')), 
            reverse=True
        )
        
        # Generate comprehensive analysis
        avg_profit = np.mean([m['profit'] for m in episode_metrics])
        avg_diversity = np.mean([m['diversity_score'] for m in episode_metrics])
        
        # Create final recommendation
        if best_recommendations:
            primary_rec = best_recommendations[0]
            confidence = self._calculate_confidence(episode_metrics, best_recommendations)
            
            return {
                'action': primary_rec['action'],
                'description': primary_rec['description'],
                'category': primary_rec['category'],
                'quantity': primary_rec['quantity'],
                'expected_roi': primary_rec['expected_roi'],
                'predicted_profit_usd': primary_rec['predicted_profit_usd'],
                'confidence': confidence,
                'reasoning': self._generate_coo_reasoning(
                    primary_rec, recommendations_by_category, episode_metrics
                ),
                'timestamp': datetime.now().isoformat(),
                'model_version': 'ai_coo_v1',
                'episodes_analyzed': n_episodes,
                'business_analysis': {
                    'average_profit': f"${avg_profit:.2f}",
                    'recommendation_diversity': f"{avg_diversity:.2f}",
                    'total_recommendations': len(all_recommendations),
                    'categories_covered': list(recommendations_by_category.keys())
                },
                'recommendations_by_category': recommendations_by_category,
                'alternative_actions': [
                    {
                        'action': rec['action'],
                        'description': rec['description'],
                        'category': rec['category'],
                        'expected_roi': rec['expected_roi'],
                        'predicted_profit_usd': rec['predicted_profit_usd']
                    }
                    for rec in best_recommendations[1:4]
                ],
                'comprehensive_plan': self._generate_comprehensive_plan(recommendations_by_category)
            }
        else:
            return {
                'action': 'monitor',
                'description': 'Monitor business operations',
                'category': 'operational',
                'quantity': 0,
                'expected_roi': '0%',
                'predicted_profit_usd': 0,
                'confidence': 'low',
                'reasoning': 'No immediate high-impact actions identified in current market conditions',
                'timestamp': datetime.now().isoformat(),
                'model_version': 'ai_coo_v1'
            }
    
    def _get_action_category(self, action: int) -> str:
        """Get the category name for an action"""
        for category, actions in self.action_categories.items():
            if action in actions:
                return category
        return 'unknown'
    
    def _categorize_recommendations(self, recommendations: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize recommendations by business function"""
        categorized = {}
        
        for rec in recommendations:
            category = rec['category']
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(rec)
        
        # Sort each category by ROI
        for category in categorized:
            categorized[category] = sorted(
                categorized[category], 
                key=lambda x: float(x['expected_roi'].replace('%', '')), 
                reverse=True
            )
        
        return categorized
    
    def _calculate_confidence(self, episode_metrics: List[Dict[str, Any]], 
                            recommendations: List[Dict[str, Any]]) -> str:
        """Calculate confidence level for recommendations"""
        if not recommendations:
            return 'low'
        
        # Factors for confidence calculation
        avg_profit = np.mean([m['profit'] for m in episode_metrics])
        avg_diversity = np.mean([m['diversity_score'] for m in episode_metrics])
        top_roi = float(recommendations[0]['expected_roi'].replace('%', ''))
        
        # Calculate confidence score
        profit_score = 1.0 if avg_profit > 1000 else max(0.0, avg_profit / 1000)
        diversity_score = avg_diversity
        roi_score = min(1.0, max(0.0, top_roi / 30))  # Normalize to 30% ROI
        
        confidence_score = (profit_score + diversity_score + roi_score) / 3
        
        if confidence_score >= 0.7:
            return 'high'
        elif confidence_score >= 0.5:
            return 'medium'
        else:
            return 'low'
    
    def _generate_coo_reasoning(self, primary_rec: Dict[str, Any], 
                               categorized_recs: Dict[str, List[Dict[str, Any]]],
                               episode_metrics: List[Dict[str, Any]]) -> str:
        """Generate sophisticated reasoning for COO recommendations"""
        category = primary_rec['category']
        roi = primary_rec['expected_roi']
        
        # Category-specific reasoning
        category_reasoning = {
            'inventory': f"Inventory optimization shows {roi} ROI through strategic restocking",
            'marketing': f"Marketing investment optimization projects {roi} return on ad spend",
            'financial': f"Financial process improvement delivers {roi} efficiency gains",
            'pricing': f"Pricing strategy adjustment forecasts {roi} revenue impact",
            'operational': f"Operational excellence initiative targets {roi} cost reduction",
            'monitor': "Current market conditions favor monitoring over immediate action"
        }
        
        base_reasoning = category_reasoning.get(category, f"Business operation shows {roi} projected return")
        
        # Add context about recommendation diversity
        num_categories = len(categorized_recs)
        if num_categories > 3:
            diversity_note = f" Analysis covered {num_categories} business functions, indicating comprehensive optimization opportunities."
        else:
            diversity_note = f" Focus on {num_categories} key business areas for maximum impact."
        
        # Add performance context
        avg_profit = np.mean([m['profit'] for m in episode_metrics])
        if avg_profit > 2000:
            performance_note = " Strong business performance supports aggressive growth initiatives."
        elif avg_profit > 0:
            performance_note = " Stable business performance enables strategic improvements."
        else:
            performance_note = " Business performance requires immediate optimization focus."
        
        return base_reasoning + diversity_note + performance_note
    
    def _generate_comprehensive_plan(self, categorized_recs: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Generate a comprehensive business plan from recommendations"""
        plan = {
            'immediate_actions': [],
            'short_term_initiatives': [],
            'strategic_priorities': []
        }
        
        # Immediate actions (high ROI, low complexity)
        for category, recs in categorized_recs.items():
            if recs:
                top_rec = recs[0]
                roi = float(top_rec['expected_roi'].replace('%', ''))
                if roi > 20:
                    plan['immediate_actions'].append({
                        'category': category,
                        'action': top_rec['description'],
                        'roi': top_rec['expected_roi'],
                        'priority': 'high'
                    })
        
        # Short-term initiatives (medium ROI, medium complexity)
        for category, recs in categorized_recs.items():
            if len(recs) > 1:
                second_rec = recs[1]
                roi = float(second_rec['expected_roi'].replace('%', ''))
                if 10 <= roi <= 20:
                    plan['short_term_initiatives'].append({
                        'category': category,
                        'action': second_rec['description'],
                        'roi': second_rec['expected_roi'],
                        'priority': 'medium'
                    })
        
        # Strategic priorities (long-term value)
        strategic_categories = ['operational', 'financial', 'pricing']
        for category in strategic_categories:
            if category in categorized_recs and categorized_recs[category]:
                plan['strategic_priorities'].append({
                    'category': category,
                    'focus': f"Long-term {category} optimization",
                    'priority': 'strategic'
                })
        
        return plan


# Example usage and testing
if __name__ == "__main__":
    # Create AI COO agent
    agent = AICOOAgent(mock_mode=True)
    
    # Create environment and model
    agent.create_environment()
    agent.create_model()
    
    # Quick training for demonstration
    print("Training AI COO Agent...")
    agent.train(total_timesteps=5000)
    
    # Generate comprehensive recommendations
    print("\nGenerating AI COO Recommendations...")
    recommendations = agent.generate_coo_recommendations(n_episodes=3)
    
    print(f"\n=== AI COO Recommendations ===")
    print(f"Primary Action: {recommendations['action']}")
    print(f"Description: {recommendations['description']}")
    print(f"Category: {recommendations['category']}")
    print(f"Expected ROI: {recommendations['expected_roi']}")
    print(f"Confidence: {recommendations['confidence']}")
    print(f"Reasoning: {recommendations['reasoning']}")
    
    if 'recommendations_by_category' in recommendations:
        print(f"\n=== Recommendations by Category ===")
        for category, recs in recommendations['recommendations_by_category'].items():
            print(f"\n{category.upper()}:")
            for i, rec in enumerate(recs[:2], 1):
                print(f"  {i}. {rec['description']} (ROI: {rec['expected_roi']})")
    
    if 'comprehensive_plan' in recommendations:
        print(f"\n=== Comprehensive Business Plan ===")
        plan = recommendations['comprehensive_plan']
        
        if plan['immediate_actions']:
            print("Immediate Actions:")
            for action in plan['immediate_actions']:
                print(f"  • {action['action']} (ROI: {action['roi']})")
        
        if plan['short_term_initiatives']:
            print("\nShort-term Initiatives:")
            for initiative in plan['short_term_initiatives']:
                print(f"  • {initiative['action']} (ROI: {initiative['roi']})")
        
        if plan['strategic_priorities']:
            print("\nStrategic Priorities:")
            for priority in plan['strategic_priorities']:
                print(f"  • {priority['focus']}") 