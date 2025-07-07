#!/usr/bin/env python3
"""
Inference script for the SME Restocking RL Agent

This script loads a trained RL agent and generates business recommendations
that can be integrated into the main Ventry application.

Usage:
    python inference.py [--episodes N] [--output FILE]
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rl_agent import RestockingAgent

# Ensure we're working in the correct directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)


def load_and_generate_recommendations(
    n_episodes: int = 5,
    output_file: str = "recommendations.json"
) -> Optional[Dict[str, Any]]:
    """Load trained model and generate recommendations"""
    
    print("SME Restocking RL Agent - Inference Mode")
    print("=" * 50)
    
    # Initialize and load the agent
    agent = RestockingAgent()
    
    if not agent.load_model():
        print("ERROR: No trained model found!")
        print("Please run 'python train.py' first to train the model.")
        return None
    
    print(f"Generating recommendations from {n_episodes} simulation episodes...")
    
    # Generate recommendations
    recommendations = agent.generate_recommendations(n_episodes=n_episodes)
    
    # Add metadata
    recommendations["generated_at"] = datetime.now().isoformat()
    recommendations["model_type"] = "PPO"
    recommendations["simulation_episodes"] = n_episodes
    
    # Save to file
    output_path = os.path.join(os.path.dirname(__file__), output_file)
    with open(output_path, 'w') as f:
        json.dump(recommendations, f, indent=2)
    
    print(f"\nRecommendations saved to: {output_path}")
    
    # Display recommendations
    print("\nGenerated Recommendation:")
    print(f"  Action: {recommendations['action']}")
    print(f"  Quantity: {recommendations['quantity']} units")
    print(f"  Expected ROI: {recommendations['expected_roi']}")
    print(f"  Confidence: {recommendations['confidence']}")
    print(f"  Reasoning: {recommendations['reasoning']}")
    
    return recommendations


def get_current_recommendation() -> Dict[str, Any]:
    """Get current recommendation for integration with main app"""
    try:
        # Check if recommendations file exists
        rec_file = os.path.join(os.path.dirname(__file__), "recommendations.json")
        
        if os.path.exists(rec_file):
            with open(rec_file, 'r') as f:
                recommendations = json.load(f)
            
            # Check if recommendations are recent (within last 24 hours)
            if "generated_at" in recommendations:
                from datetime import datetime, timedelta
                generated_time = datetime.fromisoformat(recommendations["generated_at"])
                if datetime.now() - generated_time < timedelta(hours=24):
                    return recommendations
        
        # Generate new recommendations if file doesn't exist or is old
        print("Generating fresh recommendations...")
        result = load_and_generate_recommendations(n_episodes=3)
        return result if result is not None else {
            "action": "monitor",
            "quantity": 0,
            "expected_roi": "0%",
            "confidence": "low",
            "reasoning": "Unable to generate recommendations",
        }
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return {
            "action": "monitor",
            "quantity": 0,
            "expected_roi": "0%",
            "confidence": "low",
            "reasoning": "Unable to generate recommendations due to error",
            "error": str(e)
        }


def main():
    """Main inference pipeline"""
    parser = argparse.ArgumentParser(description="Generate SME Restocking Recommendations")
    parser.add_argument("--episodes", type=int, default=5, help="Number of simulation episodes")
    parser.add_argument("--output", type=str, default="recommendations.json", help="Output file name")
    
    args = parser.parse_args()
    
    try:
        recommendations = load_and_generate_recommendations(
            n_episodes=args.episodes,
            output_file=args.output
        )
        
        if recommendations:
            print("\nRecommendations generated successfully!")
            print("Ready for integration with main application.")
        else:
            print("Failed to generate recommendations.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error during inference: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main() 