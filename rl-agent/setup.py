#!/usr/bin/env python3
"""
Setup script for the SME Restocking RL Agent

This script installs all required dependencies and verifies the installation.
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    
    try:
        # Install requirements
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def verify_installation():
    """Verify that all dependencies are installed correctly"""
    print("\nVerifying installation...")
    
    # Test core dependencies
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
    
    # Test custom modules
    try:
        from restocking_env import RestockingEnv
        print("✓ Custom environment imported successfully")
        
        from rl_agent import RestockingAgent
        print("✓ RL agent imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"✗ Custom module import failed: {e}")
        return False

def run_quick_test():
    """Run a quick test to verify everything works"""
    print("\nRunning quick test...")
    
    try:
        # Test environment
        from restocking_env import RestockingEnv
        env = RestockingEnv()
        obs, info = env.reset()
        obs, reward, terminated, truncated, info = env.step(1)
        print("✓ Environment test passed")
        
        # Test agent initialization
        from rl_agent import RestockingAgent
        agent = RestockingAgent()
        agent.create_environment()
        agent.create_model(verbose=0)
        print("✓ Agent initialization test passed")
        
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False

def main():
    """Main setup process"""
    print("=" * 60)
    print("SME RESTOCKING RL AGENT SETUP")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("✗ requirements.txt not found. Please run this script from the rl-agent directory.")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("Setup failed during dependency installation.")
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        print("Setup failed during verification.")
        sys.exit(1)
    
    # Run quick test
    if not run_quick_test():
        print("Setup failed during testing.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("You can now:")
    print("  1. Train the agent: python3 train.py")
    print("  2. Generate recommendations: python3 inference.py")
    print("  3. Run tests: python3 test_setup.py")
    print("  4. See integration examples: python3 integration_example.py")
    print("  5. Demo the environment: python3 train.py --demo")

if __name__ == "__main__":
    main() 