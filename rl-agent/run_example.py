#!/usr/bin/env python3
"""
Simple example script to demonstrate the RL agent functionality
without requiring a fully trained model.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def demo_environment():
    """Demonstrate the environment without training"""
    print("=" * 60)
    print("ENVIRONMENT DEMONSTRATION")
    print("=" * 60)
    
    try:
        from restocking_env import RestockingEnv
        
        env = RestockingEnv()
        obs, info = env.reset()
        
        print(f"Initial State:")
        print(f"  Inventory: {obs[0]:.0f} units")
        print(f"  Days Remaining: {obs[1]:.0f}")
        print(f"  Demand Trend: {obs[2]:.2f}")
        print(f"  Season Factor: {obs[3]:.2f}")
        
        total_profit = 0
        actions_taken = []
        
        # Run a few steps with simple heuristic
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
            
        return True
        
    except Exception as e:
        print(f"Error running demo: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality without training"""
    print("\n" + "=" * 60)
    print("BASIC FUNCTIONALITY TEST")
    print("=" * 60)
    
    try:
        from rl_agent import RestockingAgent
        
        # Create agent
        agent = RestockingAgent()
        print("✓ Agent created successfully")
        
        # Create environment
        agent.create_environment()
        print("✓ Agent environment created")
        
        # Create model (but don't train)
        agent.create_model(verbose=0)
        print("✓ PPO model created successfully")
        
        # Test a single prediction (will be random since untrained)
        if agent.env is not None:
            obs = agent.env.reset()[0]
            action = agent.predict(obs, deterministic=False)
            print(f"✓ Random prediction successful, action: {action}")
        else:
            print("✗ Agent environment is None")
        
        return True
        
    except Exception as e:
        print(f"Error in basic functionality test: {e}")
        return False

def generate_sample_recommendation():
    """Generate a sample recommendation format"""
    print("\n" + "=" * 60)
    print("SAMPLE RECOMMENDATION FORMAT")
    print("=" * 60)
    
    import json
    from datetime import datetime
    
    # Create sample recommendation
    sample_recommendation = {
        "action": "restock",
        "quantity": 60,
        "expected_roi": "15.2%",
        "confidence": "medium",
        "reasoning": "Based on environment simulation with simple heuristic",
        "timestamp": datetime.now().isoformat(),
        "model_type": "heuristic",
        "simulation_episodes": 1
    }
    
    print("Sample Recommendation:")
    print(json.dumps(sample_recommendation, indent=2))
    
    # Save to file
    with open("sample_recommendations.json", "w") as f:
        json.dump(sample_recommendation, f, indent=2)
    
    print(f"\nSample recommendation saved to: sample_recommendations.json")
    return True

def main():
    """Run all examples"""
    print("RL AGENT FUNCTIONALITY DEMO")
    print("=" * 60)
    
    success_count = 0
    total_tests = 3
    
    # Run tests
    tests = [
        ("Environment Demo", demo_environment),
        ("Basic Functionality", test_basic_functionality),
        ("Sample Recommendation", generate_sample_recommendation)
    ]
    
    for test_name, test_func in tests:
        try:
            if test_func():
                print(f"✓ {test_name} completed successfully")
                success_count += 1
            else:
                print(f"✗ {test_name} failed")
        except Exception as e:
            print(f"✗ {test_name} failed with error: {e}")
    
    print("\n" + "=" * 60)
    print(f"DEMO RESULTS: {success_count}/{total_tests} tests passed")
    print("=" * 60)
    
    if success_count == total_tests:
        print("🎉 All demos completed successfully!")
        print("The RL agent setup is working correctly.")
        print("\nNext steps:")
        print("1. Install dependencies: python3 setup.py")
        print("2. Train the agent: python3 train.py")
        print("3. Generate recommendations: python3 inference.py")
    else:
        print("❌ Some demos failed. Check error messages above.")
    
    return success_count == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 