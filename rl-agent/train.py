#!/usr/bin/env python3
"""
Training script for the SME Restocking RL Agent

This script trains a reinforcement learning agent to make optimal restocking decisions
for small and medium enterprises (SMEs) based on inventory levels, demand patterns,
and business constraints.

Usage:
    python train.py [--timesteps TIMESTEPS] [--eval] [--demo]

Requirements:
    pip install -r requirements.txt
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rl_agent import RestockingAgent
from restocking_env import RestockingEnv

# Ensure we're working in the correct directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)


def train_agent(timesteps: int = 50000) -> RestockingAgent:
    """Train the RL agent"""
    print("=" * 60)
    print("SME RESTOCKING RL AGENT - TRAINING")
    print("=" * 60)
    
    # Initialize the agent
    agent = RestockingAgent()
    
    # Create and train the model
    print(f"Initializing PPO agent for restocking optimization...")
    agent.create_environment()
    agent.create_model(verbose=1)
    
    # Train the agent
    print(f"Training agent for {timesteps} timesteps...")
    agent.train(total_timesteps=timesteps)
    
    return agent


def evaluate_agent(agent: RestockingAgent) -> Dict[str, float]:
    """Evaluate the trained agent"""
    print("\n" + "=" * 60)
    print("EVALUATING AGENT PERFORMANCE")
    print("=" * 60)
    
    # Evaluate performance
    performance = agent.evaluate_performance(n_episodes=10)
    
    print(f"Performance Metrics (10 episodes):")
    print(f"  Mean Reward: {performance['mean_reward']:.3f} ± {performance['std_reward']:.3f}")
    print(f"  Mean Profit: ${performance['mean_profit']:.2f} ± ${performance['std_profit']:.2f}")
    print(f"  Max Profit:  ${performance['max_profit']:.2f}")
    print(f"  Min Profit:  ${performance['min_profit']:.2f}")
    
    return performance


def generate_recommendations(agent: RestockingAgent) -> Dict[str, Any]:
    """Generate business recommendations"""
    print("\n" + "=" * 60)
    print("GENERATING BUSINESS RECOMMENDATIONS")
    print("=" * 60)
    
    # Generate recommendations
    recommendations = agent.generate_recommendations(n_episodes=5)
    
    print("Current Recommendation:")
    print(f"  Action: {recommendations['action']}")
    print(f"  Quantity: {recommendations['quantity']} units")
    print(f"  Expected ROI: {recommendations['expected_roi']}")
    print(f"  Confidence: {recommendations['confidence']}")
    print(f"  Reasoning: {recommendations['reasoning']}")
    
    if recommendations['alternative_actions']:
        print(f"\nAlternative Actions:")
        for i, alt in enumerate(recommendations['alternative_actions'], 1):
            print(f"  {i}. Restock {alt['quantity']} units (ROI: {alt['expected_roi']})")
    
    return recommendations


def save_recommendations(recommendations: Dict[str, Any], filename: str = "recommendations.json") -> None:
    """Save recommendations to JSON file"""
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    with open(filepath, 'w') as f:
        json.dump(recommendations, f, indent=2)
    
    print(f"\nRecommendations saved to: {filepath}")


def demo_environment() -> None:
    """Demonstrate the environment without training"""
    print("=" * 60)
    print("ENVIRONMENT DEMONSTRATION")
    print("=" * 60)
    
    env = RestockingEnv()
    obs, info = env.reset()
    
    print(f"Initial State:")
    print(f"  Inventory: {obs[0]:.0f} units")
    print(f"  Days Remaining: {obs[1]:.0f}")
    print(f"  Demand Trend: {obs[2]:.2f}")
    print(f"  Season Factor: {obs[3]:.2f}")
    
    total_profit = 0
    actions_taken = []
    
    # Run a few steps with random actions
    for day in range(10):
        # Simple heuristic: restock if inventory is low
        if obs[0] < 30:  # Low inventory
            action = 5  # Restock 50 units
        elif obs[0] < 60:  # Medium inventory
            action = 3  # Restock 30 units
        else:
            action = 0  # No restock
        
        obs, reward, terminated, truncated, info = env.step(action)
        total_profit += info.get("daily_profit", 0)
        
        if info.get("restock_quantity", 0) > 0:
            actions_taken.append({
                "day": day + 1,
                "action": "restock",
                "quantity": info["restock_quantity"],
                "inventory_after": obs[0],
                "daily_profit": info.get("daily_profit", 0)
            })
        
        print(f"Day {day + 1}: Inventory={obs[0]:.0f}, Profit=${info.get('daily_profit', 0):.2f}")
        
        if terminated or truncated:
            break
    
    print(f"\nDemo Results:")
    print(f"  Total Profit: ${total_profit:.2f}")
    print(f"  Actions Taken: {len(actions_taken)}")
    
    if actions_taken:
        print(f"  Sample Action: {actions_taken[0]}")


def main():
    """Main training and evaluation pipeline"""
    parser = argparse.ArgumentParser(description="Train SME Restocking RL Agent")
    parser.add_argument("--timesteps", type=int, default=50000, help="Number of training timesteps")
    parser.add_argument("--eval", action="store_true", help="Only evaluate existing model")
    parser.add_argument("--demo", action="store_true", help="Demonstrate environment without training")
    
    args = parser.parse_args()
    
    try:
        if args.demo:
            demo_environment()
            return
        
        # Initialize agent
        agent = RestockingAgent()
        
        if args.eval:
            # Load existing model for evaluation
            if not agent.load_model():
                print("No trained model found. Please train first.")
                return
        else:
            # Train new model
            agent = train_agent(args.timesteps)
        
        # Evaluate the agent
        performance = evaluate_agent(agent)
        
        # Generate recommendations
        recommendations = generate_recommendations(agent)
        
        # Save recommendations to file
        save_recommendations(recommendations)
        
        # Save performance metrics
        metrics = {
            "timestamp": datetime.now().isoformat(),
            "performance": performance,
            "recommendations": recommendations,
            "training_timesteps": args.timesteps if not args.eval else "N/A"
        }
        
        with open("training_results.json", "w") as f:
            json.dump(metrics, f, indent=2)
        
        print("\n" + "=" * 60)
        print("TRAINING COMPLETE")
        print("=" * 60)
        print(f"Model saved and ready for integration!")
        print(f"Check 'recommendations.json' for the latest business recommendations.")
        
    except KeyboardInterrupt:
        print("\nTraining interrupted by user.")
    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main() 