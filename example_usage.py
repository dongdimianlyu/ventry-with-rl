#!/usr/bin/env python3
"""
Example Usage of Slack Approval System

This script demonstrates how to integrate the Slack approval system 
with your RL agent and business workflow.

Usage:
    python example_usage.py --demo              # Run demo with sample data
    python example_usage.py --full-workflow     # Run complete workflow
    python example_usage.py --test-slack        # Test Slack connection
"""

import json
import os
import subprocess
import time
import argparse
from datetime import datetime
from typing import Dict, Any, Optional


class SlackApprovalExample:
    """Example integration of Slack approval system"""
    
    def __init__(self):
        """Initialize the example"""
        self.rl_agent_path = "rl-agent"
        self.recommendations_file = "recommendations.json"
        self.approved_tasks_file = "approved_tasks.json"
        
        print("🚀 Slack Approval System Example")
        print("=" * 50)
    
    def create_sample_recommendation(self) -> Dict[str, Any]:
        """Create a sample recommendation for testing"""
        sample_rec = {
            "action": "restock",
            "quantity": 50,
            "expected_roi": "25.5%",
            "confidence": "high",
            "reasoning": "Based on demand analysis and inventory levels - sample data for testing",
            "timestamp": datetime.now().isoformat(),
            "alternative_actions": [
                {
                    "day": 5,
                    "action": "restock",
                    "quantity": 30,
                    "expected_roi": "22.0%",
                    "inventory_level": 20,
                    "daily_demand": 35
                },
                {
                    "day": 10,
                    "action": "restock",
                    "quantity": 40,
                    "expected_roi": "20.5%",
                    "inventory_level": 15,
                    "daily_demand": 40
                }
            ],
            "generated_at": datetime.now().isoformat(),
            "model_type": "PPO",
            "simulation_episodes": 3
        }
        return sample_rec
    
    def save_sample_recommendation(self) -> bool:
        """Save sample recommendation to file"""
        try:
            sample_rec = self.create_sample_recommendation()
            
            with open(self.recommendations_file, 'w') as f:
                json.dump(sample_rec, f, indent=2)
            
            print(f"✅ Sample recommendation saved to {self.recommendations_file}")
            print(f"   Action: {sample_rec['action']} {sample_rec['quantity']} units")
            print(f"   Expected ROI: {sample_rec['expected_roi']}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving sample recommendation: {e}")
            return False
    
    def run_rl_agent(self) -> bool:
        """Run the RL agent to generate recommendations"""
        try:
            print("🤖 Running RL agent to generate recommendations...")
            
            # Check if RL agent exists
            if not os.path.exists(self.rl_agent_path):
                print(f"⚠️  RL agent directory not found: {self.rl_agent_path}")
                print("   Using sample recommendation instead...")
                return self.save_sample_recommendation()
            
            # Try to run the RL agent
            result = subprocess.run([
                "python", f"{self.rl_agent_path}/inference.py"
            ], capture_output=True, text=True, cwd=".")
            
            if result.returncode == 0:
                print("✅ RL agent completed successfully")
                
                # Check if recommendations file was created
                rec_paths = [
                    self.recommendations_file,
                    f"{self.rl_agent_path}/{self.recommendations_file}"
                ]
                
                for path in rec_paths:
                    if os.path.exists(path):
                        print(f"✅ Recommendations found at: {path}")
                        return True
                
                print("⚠️  No recommendations file found, using sample data")
                return self.save_sample_recommendation()
                
            else:
                print(f"❌ RL agent failed: {result.stderr}")
                print("   Using sample recommendation instead...")
                return self.save_sample_recommendation()
                
        except Exception as e:
            print(f"❌ Error running RL agent: {e}")
            print("   Using sample recommendation instead...")
            return self.save_sample_recommendation()
    
    def test_slack_connection(self) -> bool:
        """Test Slack connection and configuration"""
        try:
            print("🔗 Testing Slack connection...")
            
            # Check environment variables
            bot_token = os.getenv("SLACK_BOT_TOKEN")
            channel_id = os.getenv("SLACK_CHANNEL_ID")
            
            if not bot_token:
                print("❌ SLACK_BOT_TOKEN not set")
                print("   Set with: export SLACK_BOT_TOKEN=xoxb-your-token")
                return False
            
            if not channel_id:
                print("❌ SLACK_CHANNEL_ID not set")
                print("   Set with: export SLACK_CHANNEL_ID=C1234567890")
                return False
            
            print("✅ Environment variables found")
            print(f"   Bot token: {bot_token[:12]}...")
            print(f"   Channel ID: {channel_id}")
            
            # Test with simple approval script
            result = subprocess.run([
                "python", "simple_slack_approval.py", "--status"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Slack approval script working")
                print("   Output:")
                for line in result.stdout.split('\n'):
                    if line.strip():
                        print(f"   {line}")
                return True
            else:
                print(f"❌ Slack approval script failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing Slack connection: {e}")
            return False
    
    def send_for_approval(self, wait_for_response: bool = True) -> bool:
        """Send recommendation for approval"""
        try:
            print("📤 Sending recommendation for approval...")
            
            if wait_for_response:
                # Send and wait for response
                result = subprocess.run([
                    "python", "simple_slack_approval.py", "--send-and-listen", "--listen", "5"
                ], capture_output=True, text=True)
            else:
                # Just send
                result = subprocess.run([
                    "python", "simple_slack_approval.py", "--send"
                ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Recommendation sent successfully")
                print("   Output:")
                for line in result.stdout.split('\n'):
                    if line.strip():
                        print(f"   {line}")
                return True
            else:
                print(f"❌ Failed to send recommendation: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending for approval: {e}")
            return False
    
    def check_approved_tasks(self) -> None:
        """Check and display approved tasks"""
        try:
            print("📋 Checking approved tasks...")
            
            result = subprocess.run([
                "python", "task_manager.py", "--stats"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Task status:")
                for line in result.stdout.split('\n'):
                    if line.strip():
                        print(f"   {line}")
            else:
                print(f"❌ Error checking tasks: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error checking approved tasks: {e}")
    
    def run_demo(self) -> None:
        """Run a complete demo"""
        print("\n🎬 Running Demo Mode")
        print("-" * 30)
        
        # Step 1: Create sample recommendation
        print("\n1️⃣ Creating sample recommendation...")
        if not self.save_sample_recommendation():
            print("❌ Demo failed - could not create sample recommendation")
            return
        
        # Step 2: Test Slack connection
        print("\n2️⃣ Testing Slack connection...")
        if not self.test_slack_connection():
            print("❌ Demo stopped - Slack connection failed")
            print("   Please set up Slack tokens and try again")
            return
        
        # Step 3: Send for approval (without waiting)
        print("\n3️⃣ Sending for approval...")
        if self.send_for_approval(wait_for_response=False):
            print("✅ Demo recommendation sent to Slack!")
            print("   Check your Slack channel and reply with Y or N")
        else:
            print("❌ Demo failed - could not send to Slack")
            return
        
        # Step 4: Show status
        print("\n4️⃣ Current status:")
        self.check_approved_tasks()
        
        print("\n🎉 Demo completed!")
        print("   Next steps:")
        print("   - Reply to the Slack message with Y or N")
        print("   - Run: python task_manager.py --stats")
        print("   - Run: python task_manager.py --pending")
    
    def run_full_workflow(self) -> None:
        """Run the complete workflow"""
        print("\n🔄 Running Full Workflow")
        print("-" * 30)
        
        # Step 1: Generate recommendations
        print("\n1️⃣ Generating recommendations...")
        if not self.run_rl_agent():
            print("❌ Workflow failed - could not generate recommendations")
            return
        
        # Step 2: Test Slack
        print("\n2️⃣ Testing Slack connection...")
        if not self.test_slack_connection():
            print("❌ Workflow stopped - Slack connection failed")
            return
        
        # Step 3: Send for approval with waiting
        print("\n3️⃣ Sending for approval and waiting for response...")
        print("   (Waiting 5 minutes for response)")
        if self.send_for_approval(wait_for_response=True):
            print("✅ Approval process completed!")
        else:
            print("⚠️  Approval process had issues, but recommendation was sent")
        
        # Step 4: Final status
        print("\n4️⃣ Final status:")
        self.check_approved_tasks()
        
        print("\n🏁 Full workflow completed!")
    
    def show_setup_instructions(self) -> None:
        """Show setup instructions"""
        print("\n📋 Setup Instructions")
        print("-" * 30)
        
        print("1. Install dependencies:")
        print("   pip install -r requirements_slack.txt")
        print()
        
        print("2. Set up Slack bot (see SLACK_SETUP_GUIDE.md for details):")
        print("   - Create Slack app at https://api.slack.com/apps")
        print("   - Add bot permissions: chat:write, channels:read, etc.")
        print("   - Install to workspace and get bot token")
        print()
        
        print("3. Set environment variables:")
        print("   export SLACK_BOT_TOKEN=xoxb-your-token")
        print("   export SLACK_CHANNEL_ID=C1234567890")
        print()
        
        print("4. Test the setup:")
        print("   python example_usage.py --test-slack")
        print()
        
        print("5. Run demo:")
        print("   python example_usage.py --demo")
        print()
        
        print("📖 For detailed setup guide, see: SLACK_SETUP_GUIDE.md")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Slack Approval System Example")
    parser.add_argument("--demo", action="store_true", help="Run demo with sample data")
    parser.add_argument("--full-workflow", action="store_true", help="Run complete workflow")
    parser.add_argument("--test-slack", action="store_true", help="Test Slack connection")
    parser.add_argument("--setup", action="store_true", help="Show setup instructions")
    
    args = parser.parse_args()
    
    example = SlackApprovalExample()
    
    if args.demo:
        example.run_demo()
    elif args.full_workflow:
        example.run_full_workflow()
    elif args.test_slack:
        example.test_slack_connection()
    elif args.setup:
        example.show_setup_instructions()
    else:
        # Default: show setup instructions
        example.show_setup_instructions()


if __name__ == "__main__":
    main() 