#!/usr/bin/env python3
"""
Integration example showing how to use the RL agent from the main Ventry application.

This example demonstrates:
1. How to import and use the RL agent
2. How to generate recommendations
3. How to integrate with existing business logic
4. How to handle errors gracefully
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Add the rl-agent directory to the Python path
rl_agent_path = os.path.join(os.path.dirname(__file__))
sys.path.append(rl_agent_path)


class VentryRLIntegration:
    """Integration class for using RL agent within Ventry application"""
    
    def __init__(self):
        self.agent = None
        self.recommendations_cache = {}
        self.cache_duration_hours = 1  # Cache recommendations for 1 hour
        
    def initialize_agent(self) -> bool:
        """Initialize the RL agent (call this on application startup)"""
        try:
            from rl_agent import RestockingAgent
            
            self.agent = RestockingAgent()
            
            # Try to load existing model
            if self.agent.load_model():
                print("✓ RL agent loaded successfully")
                return True
            else:
                print("⚠ No trained model found. Please train the model first.")
                return False
                
        except ImportError as e:
            print(f"⚠ RL dependencies not installed: {e}")
            return False
        except Exception as e:
            print(f"✗ Error initializing RL agent: {e}")
            return False
    
    def get_restocking_recommendation(self, 
                                    current_inventory: Optional[int] = None,
                                    recent_sales: Optional[list] = None,
                                    force_refresh: bool = False) -> Dict[str, Any]:
        """
        Get restocking recommendation for the business.
        
        Args:
            current_inventory: Current inventory level (optional)
            recent_sales: List of recent sales data (optional)
            force_refresh: Force generation of new recommendations
            
        Returns:
            Dictionary containing recommendation details
        """
        
        # Check cache first (unless force refresh)
        if not force_refresh and self._is_cache_valid():
            print("Using cached recommendations")
            return self.recommendations_cache
        
        # Try to get fresh recommendations
        try:
            if self.agent is None:
                if not self.initialize_agent():
                    return self._get_fallback_recommendation("Agent not initialized")
            
            # Generate new recommendations (agent should be initialized by now)
            if self.agent is not None:
                recommendations = self.agent.generate_recommendations(n_episodes=3)
            else:
                return self._get_fallback_recommendation("Agent initialization failed")
            
            # Add business context if provided
            if current_inventory is not None:
                recommendations["current_inventory"] = current_inventory
            
            if recent_sales is not None:
                recommendations["recent_sales_data"] = recent_sales
            
            # Cache the recommendations
            self.recommendations_cache = recommendations
            
            return recommendations
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return self._get_fallback_recommendation(f"Error: {str(e)}")
    
    def _is_cache_valid(self) -> bool:
        """Check if cached recommendations are still valid"""
        if not self.recommendations_cache:
            return False
            
        if "timestamp" not in self.recommendations_cache:
            return False
        
        try:
            cache_time = datetime.fromisoformat(self.recommendations_cache["timestamp"])
            now = datetime.now()
            
            # Check if cache is within valid duration
            time_diff = now - cache_time
            return time_diff.total_seconds() < (self.cache_duration_hours * 3600)
            
        except:
            return False
    
    def _get_fallback_recommendation(self, reason: str) -> Dict[str, Any]:
        """Get fallback recommendation when RL agent is not available"""
        return {
            "action": "monitor",
            "quantity": 0,
            "expected_roi": "0%",
            "confidence": "low",
            "reasoning": f"Using fallback recommendation: {reason}",
            "timestamp": datetime.now().isoformat(),
            "fallback": True
        }
    
    def save_recommendations_to_file(self, filename: str = "recommendations.json") -> bool:
        """Save current recommendations to file"""
        try:
            filepath = os.path.join(rl_agent_path, filename)
            
            if self.recommendations_cache:
                with open(filepath, 'w') as f:
                    json.dump(self.recommendations_cache, f, indent=2)
                print(f"Recommendations saved to {filepath}")
                return True
            else:
                print("No recommendations to save")
                return False
                
        except Exception as e:
            print(f"Error saving recommendations: {e}")
            return False
    
    def get_recommendation_summary(self) -> str:
        """Get a human-readable summary of the current recommendation"""
        rec = self.get_restocking_recommendation()
        
        if rec["action"] == "restock":
            return f"Recommend restocking {rec['quantity']} units (Expected ROI: {rec['expected_roi']})"
        elif rec["action"] == "monitor":
            return "Continue monitoring - no restocking needed at this time"
        else:
            return f"Recommendation: {rec['action']} - {rec.get('reasoning', 'No details available')}"


# Example usage functions
def example_basic_usage():
    """Basic usage example"""
    print("=" * 60)
    print("BASIC USAGE EXAMPLE")
    print("=" * 60)
    
    # Initialize the integration
    rl_integration = VentryRLIntegration()
    
    # Get recommendation
    recommendation = rl_integration.get_restocking_recommendation()
    
    print("Current Recommendation:")
    print(f"  Action: {recommendation['action']}")
    print(f"  Quantity: {recommendation['quantity']}")
    print(f"  Expected ROI: {recommendation['expected_roi']}")
    print(f"  Confidence: {recommendation['confidence']}")
    print(f"  Summary: {rl_integration.get_recommendation_summary()}")
    
    # Save to file
    rl_integration.save_recommendations_to_file()


def example_with_business_data():
    """Example with business context data"""
    print("\n" + "=" * 60)
    print("BUSINESS DATA INTEGRATION EXAMPLE")
    print("=" * 60)
    
    # Simulate business data
    current_inventory = 45
    recent_sales = [12, 15, 18, 22, 19, 16, 14]  # Last 7 days
    
    rl_integration = VentryRLIntegration()
    
    # Get recommendation with business context
    recommendation = rl_integration.get_restocking_recommendation(
        current_inventory=current_inventory,
        recent_sales=recent_sales
    )
    
    print("Business Context:")
    print(f"  Current Inventory: {current_inventory} units")
    print(f"  Recent Sales (7 days): {recent_sales}")
    print(f"  Average Daily Sales: {sum(recent_sales) / len(recent_sales):.1f}")
    
    print("\nRecommendation:")
    print(f"  {rl_integration.get_recommendation_summary()}")
    
    # Demonstrate caching
    print("\nTesting cache (should be instant):")
    start_time = datetime.now()
    cached_rec = rl_integration.get_restocking_recommendation()
    end_time = datetime.now()
    
    print(f"  Cache lookup time: {(end_time - start_time).total_seconds():.3f} seconds")
    print(f"  Same recommendation: {cached_rec['action'] == recommendation['action']}")


def example_error_handling():
    """Example showing error handling"""
    print("\n" + "=" * 60)
    print("ERROR HANDLING EXAMPLE")
    print("=" * 60)
    
    # Create integration without initializing agent
    rl_integration = VentryRLIntegration()
    
    # This should gracefully handle missing model
    recommendation = rl_integration.get_restocking_recommendation()
    
    print("Fallback Recommendation:")
    print(f"  Action: {recommendation['action']}")
    print(f"  Fallback: {recommendation.get('fallback', False)}")
    print(f"  Reasoning: {recommendation['reasoning']}")


def example_scheduled_updates():
    """Example showing how to set up scheduled recommendation updates"""
    print("\n" + "=" * 60)
    print("SCHEDULED UPDATES EXAMPLE")
    print("=" * 60)
    
    def update_recommendations():
        """Function to call on schedule"""
        rl_integration = VentryRLIntegration()
        recommendation = rl_integration.get_restocking_recommendation(force_refresh=True)
        rl_integration.save_recommendations_to_file()
        
        print(f"Updated recommendations: {recommendation['action']} {recommendation['quantity']} units")
        return recommendation
    
    # Simulate scheduled update
    print("Simulating scheduled update...")
    update_recommendations()
    
    print("\nTo set up actual scheduling, use:")
    print("  - Cron job: */30 * * * * /path/to/python /path/to/update_script.py")
    print("  - Python schedule library: schedule.every(30).minutes.do(update_recommendations)")
    print("  - Celery task: @periodic_task(run_every=crontab(minute='*/30'))")


def main():
    """Run all examples"""
    print("VENTRY RL AGENT INTEGRATION EXAMPLES")
    print("=" * 60)
    
    try:
        example_basic_usage()
        example_with_business_data()
        example_error_handling()
        example_scheduled_updates()
        
        print("\n" + "=" * 60)
        print("INTEGRATION EXAMPLES COMPLETED")
        print("=" * 60)
        print("You can now integrate these patterns into your Ventry application!")
        
    except Exception as e:
        print(f"Error running examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main() 