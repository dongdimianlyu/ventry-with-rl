#!/usr/bin/env python3
"""
Test script to verify the RL agent setup is working correctly.

This script performs basic tests to ensure all components are functioning
before running the full training pipeline.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required libraries can be imported"""
    print("Testing imports...")
    
    required_modules = [
        ("numpy", "NumPy"),
        ("gymnasium", "Gymnasium"),
        ("stable_baselines3", "Stable-Baselines3"),
        ("torch", "PyTorch")
    ]
    
    for module_name, display_name in required_modules:
        try:
            __import__(module_name)
            print(f"✓ {display_name} imported successfully")
        except ImportError as e:
            print(f"✗ {display_name} import failed: {e}")
            return False
    
    return True


def test_environment():
    """Test the custom restocking environment"""
    print("\nTesting custom environment...")
    
    try:
        from restocking_env import RestockingEnv
        
        # Create environment
        env = RestockingEnv()
        print("✓ Environment created successfully")
        
        # Test reset
        obs, info = env.reset()
        print(f"✓ Environment reset successful, observation shape: {obs.shape}")
        
        # Test step
        action = env.action_space.sample()
        obs, reward, terminated, truncated, info = env.step(action)
        print(f"✓ Environment step successful, reward: {reward:.3f}")
        
        # Test action space
        print(f"✓ Action space: {env.action_space}")
        print(f"✓ Observation space: {env.observation_space}")
        
        return True
        
    except Exception as e:
        print(f"✗ Environment test failed: {e}")
        return False


def test_agent():
    """Test the RL agent initialization"""
    print("\nTesting RL agent...")
    
    try:
        from rl_agent import RestockingAgent
        
        # Create agent
        agent = RestockingAgent()
        print("✓ Agent created successfully")
        
        # Create environment
        agent.create_environment()
        print("✓ Agent environment created")
        
        # Create model
        agent.create_model(verbose=0)
        print("✓ PPO model created successfully")
        
        return True
        
    except Exception as e:
        print(f"✗ Agent test failed: {e}")
        return False


def test_quick_training():
    """Test a very short training run"""
    print("\nTesting quick training (100 timesteps)...")
    
    try:
        from rl_agent import RestockingAgent
        
        agent = RestockingAgent()
        agent.create_environment()
        agent.create_model(verbose=0)
        
        # Very short training
        agent.train(total_timesteps=100, save_freq=50)
        print("✓ Quick training completed successfully")
        
        # Test prediction
        if agent.env is not None:
            obs = agent.env.reset()[0]
            action = agent.predict(obs)
            print(f"✓ Prediction successful, action: {action}")
        else:
            print("✗ Agent environment is None")
        
        return True
        
    except Exception as e:
        print(f"✗ Quick training test failed: {e}")
        return False


def test_recommendation_generation():
    """Test recommendation generation"""
    print("\nTesting recommendation generation...")
    
    try:
        from rl_agent import RestockingAgent
        
        # Create and quickly train agent
        agent = RestockingAgent()
        agent.create_environment()
        agent.create_model(verbose=0)
        agent.train(total_timesteps=200, save_freq=100)
        
        # Generate recommendations
        recommendations = agent.generate_recommendations(n_episodes=2)
        print("✓ Recommendations generated successfully")
        
        # Check recommendation format
        required_keys = ['action', 'quantity', 'expected_roi', 'confidence', 'reasoning']
        for key in required_keys:
            if key not in recommendations:
                print(f"✗ Missing key in recommendations: {key}")
                return False
        
        print(f"✓ Recommendation format valid")
        print(f"  Action: {recommendations['action']}")
        print(f"  Quantity: {recommendations['quantity']}")
        print(f"  Expected ROI: {recommendations['expected_roi']}")
        
        return True
        
    except Exception as e:
        print(f"✗ Recommendation generation test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("RL AGENT SETUP TEST")
    print("=" * 60)
    
    tests = [
        ("Import Test", test_imports),
        ("Environment Test", test_environment),
        ("Agent Test", test_agent),
        ("Quick Training Test", test_quick_training),
        ("Recommendation Test", test_recommendation_generation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        
        try:
            if test_func():
                print(f"✓ {test_name} PASSED")
                passed += 1
            else:
                print(f"✗ {test_name} FAILED")
        except Exception as e:
            print(f"✗ {test_name} FAILED with exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"TEST RESULTS: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("🎉 All tests passed! Your RL agent setup is working correctly.")
        print("You can now run 'python train.py' to start training.")
    else:
        print("❌ Some tests failed. Please check the error messages above.")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 