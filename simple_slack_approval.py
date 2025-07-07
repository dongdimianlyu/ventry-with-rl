#!/usr/bin/env python3
"""
Simple Slack Approval Script for RL Agent Recommendations

A simplified version that sends one recommendation and waits for approval.
Easier to test and debug than the full async bot.

Usage:
    python simple_slack_approval.py --send
    python simple_slack_approval.py --listen
    python simple_slack_approval.py --status

Environment Variables:
    SLACK_BOT_TOKEN=xoxb-your-bot-token
    SLACK_CHANNEL_ID=C1234567890 (or user ID for DM)
"""

import json
import os
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import argparse

# Try to load .env file support
try:
    from dotenv import load_dotenv
    # Try multiple .env files
    load_dotenv(".env")  # Load .env file if it exists
    load_dotenv(".env.local")  # Load .env.local file if it exists
except ImportError:
    pass  # dotenv not installed, that's okay

# Slack SDK imports
try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    print("❌ Slack SDK not installed!")
    print("Install with: pip install slack-sdk")
    exit(1)


class SimpleSlackApproval:
    """Simple Slack approval handler for RL recommendations"""
    
    def __init__(self):
        """Initialize the simple Slack approval handler"""
        self.setup_logging()
        
        # Debug: Show what environment variables we can see
        print("🔍 Debug: Checking environment variables...")
        all_env_vars = {k: v for k, v in os.environ.items() if 'SLACK' in k}
        if all_env_vars:
            print(f"   Found {len(all_env_vars)} SLACK-related variables:")
            for k, v in all_env_vars.items():
                if 'TOKEN' in k or 'SECRET' in k:
                    print(f"   {k}: {v[:12]}..." if len(v) > 12 else f"   {k}: {v}")
                else:
                    print(f"   {k}: {v}")
        else:
            print("   No SLACK-related environment variables found")
        
        # Get configuration from environment
        self.bot_token = os.getenv("SLACK_BOT_TOKEN")
        self.channel_id = os.getenv("SLACK_CHANNEL_ID")
        
        print(f"🔍 Debug: bot_token = {'SET' if self.bot_token else 'NOT SET'}")
        print(f"🔍 Debug: channel_id = {'SET' if self.channel_id else 'NOT SET'}")
        
        if not self.bot_token:
            print("❌ SLACK_BOT_TOKEN environment variable not set!")
            print("Set it with: export SLACK_BOT_TOKEN=xoxb-your-token")
            print("Or create a .env file with: SLACK_BOT_TOKEN=xoxb-your-token")
            print("💡 Run 'python debug_env.py' to troubleshoot")
            exit(1)
        
        if not self.channel_id:
            print("❌ SLACK_CHANNEL_ID environment variable not set!")
            print("Set it with: export SLACK_CHANNEL_ID=C1234567890")
            print("Or create a .env file with: SLACK_CHANNEL_ID=C1234567890")
            print("💡 Run 'python debug_env.py' to troubleshoot")
            exit(1)
        
        # Initialize Slack client
        self.client = WebClient(token=self.bot_token)
        
        # File paths
        self.recommendations_file = "recommendations.json"
        self.approved_tasks_file = "approved_tasks.json"
        self.rl_agent_path = "rl-agent"
        
        self.logger.info("Simple Slack Approval initialized")
    
    def setup_logging(self):
        """Setup logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def load_recommendations(self) -> Optional[Dict[str, Any]]:
        """Load recommendations from file"""
        try:
            # Try multiple locations
            possible_paths = [
                self.recommendations_file,
                os.path.join(self.rl_agent_path, self.recommendations_file),
                os.path.join("rl-agent", "recommendations.json")
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    with open(path, 'r') as f:
                        recommendations = json.load(f)
                    self.logger.info(f"Loaded recommendations from {path}")
                    return recommendations
            
            self.logger.error("No recommendations file found")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading recommendations: {e}")
            return None
    
    def format_slack_message(self, recommendation: Dict[str, Any]) -> str:
        """Format recommendation for Slack"""
        action = recommendation.get("action", "unknown").title()
        quantity = recommendation.get("quantity", 0)
        expected_roi = recommendation.get("expected_roi", "0%")
        confidence = recommendation.get("confidence", "unknown")
        reasoning = recommendation.get("reasoning", "No reasoning provided")
        
        message = f"🤖 *AI Recommendation Alert*\n\n"
        message += f"*Suggested Action:* {action} {quantity} units\n"
        message += f"*Expected ROI:* {expected_roi}\n"
        message += f"*Confidence:* {confidence.title()}\n"
        message += f"*Reasoning:* {reasoning}\n\n"
        
        # Add alternatives if available
        alternatives = recommendation.get("alternative_actions", [])
        if alternatives:
            message += "*Alternative Options:*\n"
            for i, alt in enumerate(alternatives[:2], 1):
                alt_roi = alt.get("expected_roi", "N/A")
                alt_qty = alt.get("quantity", "N/A")
                message += f"  {i}. Restock {alt_qty} units (ROI: {alt_roi})\n"
            message += "\n"
        
        message += "*Approve this action?*\n"
        message += "Reply with *Y* (Yes) or *N* (No)"
        
        return message
    
    def send_recommendation(self) -> bool:
        """Send recommendation to Slack"""
        try:
            # Load recommendations
            recommendations = self.load_recommendations()
            if not recommendations:
                print("❌ No recommendations found")
                return False
            
            # Format message
            message = self.format_slack_message(recommendations)
            
            # Send to Slack
            result = self.client.chat_postMessage(
                channel=self.channel_id,
                text=message,
                mrkdwn=True
            )
            
            if result["ok"]:
                print("✅ Recommendation sent successfully!")
                print(f"Message timestamp: {result['ts']}")
                
                # Save message info for tracking
                self.save_pending_approval(recommendations, result['ts'])
                return True
            else:
                print(f"❌ Failed to send message: {result}")
                return False
                
        except SlackApiError as e:
            print(f"❌ Slack API error: {e.response['error']}")
            return False
        except Exception as e:
            print(f"❌ Error sending recommendation: {e}")
            return False
    
    def save_pending_approval(self, recommendation: Dict[str, Any], message_ts: str):
        """Save pending approval info"""
        try:
            pending_file = "pending_approvals.json"
            pending_data = {
                "message_ts": message_ts,
                "sent_at": datetime.now().isoformat(),
                "recommendation": recommendation,
                "status": "pending"
            }
            
            with open(pending_file, 'w') as f:
                json.dump(pending_data, f, indent=2)
            
            self.logger.info(f"Pending approval saved to {pending_file}")
            
        except Exception as e:
            self.logger.error(f"Error saving pending approval: {e}")
    
    def listen_for_responses(self, duration_minutes: int = 60):
        """Listen for Y/N responses in the channel"""
        try:
            print(f"👂 Listening for responses for {duration_minutes} minutes...")
            print("Looking for messages containing 'Y', 'N', 'yes', or 'no'")
            
            start_time = time.time()
            end_time = start_time + (duration_minutes * 60)
            
            # Get initial message history
            initial_result = self.client.conversations_history(
                channel=self.channel_id,
                limit=10
            )
            
            last_checked = time.time()
            
            while time.time() < end_time:
                try:
                    # Get recent messages
                    result = self.client.conversations_history(
                        channel=self.channel_id,
                        oldest=str(last_checked),
                        limit=10
                    )
                    
                    if result["ok"] and result["messages"]:
                        for message in result["messages"]:
                            # Skip bot messages
                            if message.get("bot_id") or message.get("user") == "USLACKBOT":
                                continue
                            
                            text = message.get("text", "").lower().strip()
                            user = message.get("user", "unknown")
                            
                            if text in ["y", "yes", "approve", "approved"]:
                                print(f"✅ APPROVED by user {user}")
                                self.handle_approval(True)
                                return True
                            elif text in ["n", "no", "reject", "rejected", "deny"]:
                                print(f"❌ REJECTED by user {user}")
                                self.handle_approval(False)
                                return True
                    
                    last_checked = time.time()
                    time.sleep(5)  # Check every 5 seconds
                    
                except Exception as e:
                    self.logger.error(f"Error checking messages: {e}")
                    time.sleep(10)
            
            print("⏰ Listening timeout reached - no response received")
            return False
            
        except Exception as e:
            print(f"❌ Error listening for responses: {e}")
            return False
    
    def handle_approval(self, approved: bool):
        """Handle the approval/rejection"""
        try:
            # Load pending approval
            pending_file = "pending_approvals.json"
            if not os.path.exists(pending_file):
                print("❌ No pending approval found")
                return
            
            with open(pending_file, 'r') as f:
                pending_data = json.load(f)
            
            recommendation = pending_data["recommendation"]
            
            if approved:
                # Save to approved tasks
                self.save_approved_task(recommendation)
                
                # Send confirmation
                message = f"✅ *Task Approved!*\n\n"
                message += f"*Action:* {recommendation['action'].title()} {recommendation['quantity']} units\n"
                message += f"*Expected ROI:* {recommendation['expected_roi']}\n"
                message += f"*Status:* Saved to approved tasks\n\n"
                message += "The task has been added to your approved tasks list."
                
                self.client.chat_postMessage(
                    channel=self.channel_id,
                    text=message,
                    mrkdwn=True
                )
                
                print("✅ Task approved and saved")
                
            else:
                # Log rejection
                self.log_rejection(recommendation)
                
                # Send confirmation
                message = f"❌ *Task Rejected*\n\n"
                message += f"*Action:* {recommendation['action'].title()} {recommendation['quantity']} units\n"
                message += f"*Expected ROI:* {recommendation['expected_roi']}\n"
                message += f"*Status:* Rejected and logged\n\n"
                message += "The recommendation has been logged as rejected."
                
                self.client.chat_postMessage(
                    channel=self.channel_id,
                    text=message,
                    mrkdwn=True
                )
                
                print("❌ Task rejected and logged")
            
            # Clean up pending approval
            os.remove(pending_file)
            
        except Exception as e:
            print(f"❌ Error handling approval: {e}")
    
    def save_approved_task(self, recommendation: Dict[str, Any]):
        """Save approved task to file"""
        try:
            # Load existing approved tasks
            approved_tasks = []
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    approved_tasks = json.load(f)
            
            # Add new task
            task = {
                "id": f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "approved_at": datetime.now().isoformat(),
                "status": "approved",
                "executed": False,
                "recommendation": recommendation
            }
            
            approved_tasks.append(task)
            
            # Save to file
            with open(self.approved_tasks_file, 'w') as f:
                json.dump(approved_tasks, f, indent=2)
            
            print(f"✅ Approved task saved to {self.approved_tasks_file}")
            
        except Exception as e:
            print(f"❌ Error saving approved task: {e}")
    
    def log_rejection(self, recommendation: Dict[str, Any]):
        """Log rejected recommendation"""
        try:
            # Load existing rejections
            rejections = []
            rejection_file = "rejected_tasks.json"
            if os.path.exists(rejection_file):
                with open(rejection_file, 'r') as f:
                    rejections = json.load(f)
            
            # Add new rejection
            rejection = {
                "id": f"rejection_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "rejected_at": datetime.now().isoformat(),
                "recommendation": recommendation
            }
            
            rejections.append(rejection)
            
            # Save to file
            with open(rejection_file, 'w') as f:
                json.dump(rejections, f, indent=2)
            
            print(f"📝 Rejection logged to {rejection_file}")
            
        except Exception as e:
            print(f"❌ Error logging rejection: {e}")
    
    def show_status(self):
        """Show current status"""
        print("📊 *Slack Approval Status*\n")
        
        # Check for pending approvals
        if os.path.exists("pending_approvals.json"):
            print("⏳ Pending approval: YES")
        else:
            print("⏳ Pending approval: NO")
        
        # Check approved tasks
        if os.path.exists(self.approved_tasks_file):
            with open(self.approved_tasks_file, 'r') as f:
                approved_tasks = json.load(f)
            print(f"✅ Approved tasks: {len(approved_tasks)}")
        else:
            print("✅ Approved tasks: 0")
        
        # Check rejected tasks
        if os.path.exists("rejected_tasks.json"):
            with open("rejected_tasks.json", 'r') as f:
                rejected_tasks = json.load(f)
            print(f"❌ Rejected tasks: {len(rejected_tasks)}")
        else:
            print("❌ Rejected tasks: 0")
        
        # Check for recommendations
        recommendations = self.load_recommendations()
        if recommendations:
            print(f"\n📋 Latest recommendation:")
            print(f"   Action: {recommendations.get('action', 'N/A')} {recommendations.get('quantity', 0)} units")
            print(f"   Expected ROI: {recommendations.get('expected_roi', 'N/A')}")
            print(f"   Confidence: {recommendations.get('confidence', 'N/A')}")
        else:
            print("\n📋 No recommendations found")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Simple Slack Approval for RL Recommendations")
    parser.add_argument("--send", action="store_true", help="Send current recommendation for approval")
    parser.add_argument("--listen", type=int, default=60, help="Listen for responses (minutes)")
    parser.add_argument("--status", action="store_true", help="Show current status")
    parser.add_argument("--send-and-listen", action="store_true", help="Send recommendation and listen for response")
    
    args = parser.parse_args()
    
    # Create approval handler
    approval = SimpleSlackApproval()
    
    if args.status:
        approval.show_status()
    elif args.send:
        approval.send_recommendation()
    elif args.send_and_listen:
        if approval.send_recommendation():
            print("\n👂 Now listening for your response...")
            approval.listen_for_responses(args.listen)
    else:
        approval.listen_for_responses(args.listen)


if __name__ == "__main__":
    main() 