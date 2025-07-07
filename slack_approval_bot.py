#!/usr/bin/env python3
"""
Slack Approval Bot for RL Agent Recommendations

This script creates a real Slack bot that:
1. Loads recommendations from the RL agent
2. Formats them into clear Slack messages
3. Sends approval requests to users
4. Listens for Y/N responses
5. Saves approved tasks to approved_tasks.json

Usage:
    python slack_approval_bot.py [--config CONFIG_FILE]

Requirements:
    - Slack Bot Token (xoxb-...)
    - Slack App Token (xapp-...)
    - Channel ID or User ID to send messages to

Setup:
    1. Create a Slack app at https://api.slack.com/apps
    2. Add Bot Token Scopes: chat:write, channels:read, im:read, im:write
    3. Add Socket Mode and generate App Token
    4. Install app to workspace
    5. Set environment variables or config file with tokens
"""

import json
import os
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from pathlib import Path
import argparse

# Slack SDK imports
try:
    from slack_bolt.async_app import AsyncApp
    from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
    from slack_sdk.errors import SlackApiError
except ImportError:
    print("❌ Slack SDK not installed!")
    print("Install with: pip install slack-bolt slack-sdk")
    exit(1)


class SlackApprovalBot:
    """
    Slack bot that handles RL agent recommendation approvals
    """
    
    def __init__(self, config_file: Optional[str] = None):
        """Initialize the Slack approval bot"""
        self.config = self._load_config(config_file)
        self.setup_logging()
        
        # Initialize Slack app
        self.app = AsyncApp(
            token=self.config.get("SLACK_BOT_TOKEN"),
            signing_secret=self.config.get("SLACK_SIGNING_SECRET")
        )
        
        # Storage for pending approvals
        self.pending_approvals: Dict[str, Dict[str, Any]] = {}
        
        # Setup message handlers
        self._setup_handlers()
        
        # File paths
        self.recommendations_file = self.config.get("RECOMMENDATIONS_FILE", "recommendations.json")
        self.approved_tasks_file = self.config.get("APPROVED_TASKS_FILE", "approved_tasks.json")
        self.rl_agent_path = self.config.get("RL_AGENT_PATH", "rl-agent")
        
        self.logger.info("Slack Approval Bot initialized successfully")
    
    def _load_config(self, config_file: Optional[str] = None) -> Dict[str, str]:
        """Load configuration from file or environment variables"""
        config = {}
        
        # Try to load from config file first
        if config_file and os.path.exists(config_file):
            try:
                with open(config_file, 'r') as f:
                    file_config = json.load(f)
                config.update(file_config)
            except Exception as e:
                print(f"Warning: Could not load config file {config_file}: {e}")
        
        # Override with environment variables
        env_vars = [
            "SLACK_BOT_TOKEN",
            "SLACK_APP_TOKEN", 
            "SLACK_SIGNING_SECRET",
            "SLACK_CHANNEL_ID",
            "SLACK_USER_ID",
            "RECOMMENDATIONS_FILE",
            "APPROVED_TASKS_FILE",
            "RL_AGENT_PATH"
        ]
        
        for var in env_vars:
            if var in os.environ:
                config[var] = os.environ[var]
        
        # Validate required fields
        required = ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN"]
        missing = [var for var in required if not config.get(var)]
        
        if missing:
            print(f"❌ Missing required configuration: {', '.join(missing)}")
            print("\nPlease set these environment variables or provide a config file:")
            print("  SLACK_BOT_TOKEN=xoxb-your-bot-token")
            print("  SLACK_APP_TOKEN=xapp-your-app-token")
            print("\nOptional:")
            print("  SLACK_CHANNEL_ID=C1234567890  (channel to send messages)")
            print("  SLACK_USER_ID=U1234567890     (user to send DMs)")
            exit(1)
        
        return config
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('slack_approval_bot.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def _setup_handlers(self):
        """Setup Slack message handlers"""
        
        @self.app.message("Y")
        async def handle_approval(message, say):
            """Handle approval (Y) responses"""
            await self._handle_user_response(message, say, approved=True)
        
        @self.app.message("N")
        async def handle_rejection(message, say):
            """Handle rejection (N) responses"""
            await self._handle_user_response(message, say, approved=False)
        
        @self.app.message("yes")
        async def handle_approval_yes(message, say):
            """Handle approval (yes) responses"""
            await self._handle_user_response(message, say, approved=True)
        
        @self.app.message("no")
        async def handle_rejection_no(message, say):
            """Handle rejection (no) responses"""
            await self._handle_user_response(message, say, approved=False)
        
        @self.app.command("/approve")
        async def handle_approve_command(ack, respond, command):
            """Handle /approve slash command"""
            await ack()
            await respond("✅ Checking for new recommendations...")
            await self.send_recommendation_for_approval()
        
        @self.app.command("/status")
        async def handle_status_command(ack, respond, command):
            """Handle /status slash command"""
            await ack()
            status = await self.get_approval_status()
            await respond(status)
    
    async def _handle_user_response(self, message, say, approved: bool):
        """Handle user Y/N response to approval requests"""
        user_id = message["user"]
        channel_id = message["channel"]
        
        # Find pending approval for this user/channel
        approval_key = f"{user_id}_{channel_id}"
        
        if approval_key not in self.pending_approvals:
            await say("🤔 I don't have any pending approvals for you. Use `/approve` to check for new recommendations.")
            return
        
        recommendation = self.pending_approvals[approval_key]
        
        if approved:
            # Save to approved tasks
            await self._save_approved_task(recommendation)
            await say(f"✅ **Task Approved!**\n\n"
                     f"**Action:** {recommendation['action'].title()} {recommendation['quantity']} units\n"
                     f"**Expected ROI:** {recommendation['expected_roi']}\n"
                     f"**Status:** Saved to approved tasks\n\n"
                     f"The task has been added to your approved tasks list.")
            
            self.logger.info(f"Task approved by user {user_id}: {recommendation['action']} {recommendation['quantity']} units")
        else:
            await say(f"❌ **Task Rejected**\n\n"
                     f"**Action:** {recommendation['action'].title()} {recommendation['quantity']} units\n"
                     f"**Expected ROI:** {recommendation['expected_roi']}\n"
                     f"**Status:** Rejected\n\n"
                     f"The recommendation has been logged as rejected.")
            
            self.logger.info(f"Task rejected by user {user_id}: {recommendation['action']} {recommendation['quantity']} units")
        
        # Remove from pending approvals
        del self.pending_approvals[approval_key]
    
    async def _save_approved_task(self, recommendation: Dict[str, Any]):
        """Save approved task to approved_tasks.json"""
        try:
            # Load existing approved tasks
            approved_tasks = []
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    approved_tasks = json.load(f)
            
            # Add new approved task
            approved_task = {
                "id": f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "approved_at": datetime.now().isoformat(),
                "status": "approved",
                "executed": False,
                "recommendation": recommendation
            }
            
            approved_tasks.append(approved_task)
            
            # Save back to file
            with open(self.approved_tasks_file, 'w') as f:
                json.dump(approved_tasks, f, indent=2)
            
            self.logger.info(f"Approved task saved to {self.approved_tasks_file}")
            
        except Exception as e:
            self.logger.error(f"Error saving approved task: {e}")
    
    def load_recommendations(self) -> Optional[Dict[str, Any]]:
        """Load the latest recommendations from the RL agent"""
        try:
            # Try multiple possible locations
            possible_paths = [
                self.recommendations_file,
                os.path.join(self.rl_agent_path, self.recommendations_file),
                os.path.join("rl-agent", "recommendations.json"),
                "recommendations.json"
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    with open(path, 'r') as f:
                        recommendations = json.load(f)
                    
                    self.logger.info(f"Loaded recommendations from {path}")
                    return recommendations
            
            self.logger.warning("No recommendations file found in any expected location")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading recommendations: {e}")
            return None
    
    def format_recommendation_message(self, recommendation: Dict[str, Any]) -> str:
        """Format recommendation into a clear Slack message"""
        
        # Main recommendation
        action = recommendation.get("action", "unknown").title()
        quantity = recommendation.get("quantity", 0)
        expected_roi = recommendation.get("expected_roi", "0%")
        confidence = recommendation.get("confidence", "unknown")
        reasoning = recommendation.get("reasoning", "No reasoning provided")
        
        # Format the main message
        message = f"🤖 **AI Recommendation Alert**\n\n"
        message += f"**Suggested Action:** {action} {quantity} units\n"
        message += f"**Expected ROI:** {expected_roi}\n"
        message += f"**Confidence:** {confidence.title()}\n"
        message += f"**Reasoning:** {reasoning}\n\n"
        
        # Add alternative actions if available
        alternatives = recommendation.get("alternative_actions", [])
        if alternatives:
            message += "**Alternative Options:**\n"
            for i, alt in enumerate(alternatives[:2], 1):  # Show max 2 alternatives
                alt_roi = alt.get("expected_roi", "N/A")
                alt_qty = alt.get("quantity", alt.get("day", "N/A"))
                message += f"  {i}. Restock {alt_qty} units (ROI: {alt_roi})\n"
            message += "\n"
        
        # Add timestamp
        timestamp = recommendation.get("timestamp", recommendation.get("generated_at", ""))
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                formatted_time = dt.strftime("%Y-%m-%d %H:%M")
                message += f"**Generated:** {formatted_time}\n\n"
            except:
                message += f"**Generated:** {timestamp}\n\n"
        
        # Add approval prompt
        message += "**Do you approve this action?**\n"
        message += "Reply with **Y** (Yes) or **N** (No) to approve or reject this recommendation."
        
        return message
    
    async def send_recommendation_for_approval(self) -> bool:
        """Send recommendation to Slack for approval"""
        try:
            # Load recommendations
            recommendations = self.load_recommendations()
            if not recommendations:
                await self._send_message("❌ No recommendations found. Please ensure the RL agent has generated recommendations.")
                return False
            
            # Skip if already processed
            rec_timestamp = recommendations.get("timestamp", recommendations.get("generated_at", ""))
            if await self._is_already_processed(rec_timestamp):
                await self._send_message("ℹ️ Current recommendations have already been processed. Generate new recommendations to get fresh approval requests.")
                return False
            
            # Format message
            message = self.format_recommendation_message(recommendations)
            
            # Determine target (channel or user)
            target = self.config.get("SLACK_CHANNEL_ID") or self.config.get("SLACK_USER_ID")
            if not target:
                self.logger.error("No SLACK_CHANNEL_ID or SLACK_USER_ID configured")
                return False
            
            # Send message
            result = await self.app.client.chat_postMessage(
                channel=target,
                text=message,
                mrkdwn=True
            )
            
            # Store pending approval
            approval_key = f"{target}_{target}"  # Simple key for now
            self.pending_approvals[approval_key] = recommendations
            
            self.logger.info(f"Recommendation sent for approval to {target}")
            return True
            
        except SlackApiError as e:
            self.logger.error(f"Slack API error: {e.response['error']}")
            return False
        except Exception as e:
            self.logger.error(f"Error sending recommendation: {e}")
            return False
    
    async def _send_message(self, message: str):
        """Send a message to the configured channel/user"""
        try:
            target = self.config.get("SLACK_CHANNEL_ID") or self.config.get("SLACK_USER_ID")
            if target:
                await self.app.client.chat_postMessage(
                    channel=target,
                    text=message,
                    mrkdwn=True
                )
        except Exception as e:
            self.logger.error(f"Error sending message: {e}")
    
    async def _is_already_processed(self, timestamp: str) -> bool:
        """Check if recommendation with this timestamp was already processed"""
        try:
            if not os.path.exists(self.approved_tasks_file):
                return False
            
            with open(self.approved_tasks_file, 'r') as f:
                approved_tasks = json.load(f)
            
            for task in approved_tasks:
                rec_timestamp = task.get("recommendation", {}).get("timestamp", "")
                if rec_timestamp == timestamp:
                    return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error checking processed status: {e}")
            return False
    
    async def get_approval_status(self) -> str:
        """Get status of approvals and pending tasks"""
        try:
            status = "📊 **Approval Status**\n\n"
            
            # Pending approvals
            if self.pending_approvals:
                status += f"**Pending Approvals:** {len(self.pending_approvals)}\n"
            else:
                status += "**Pending Approvals:** None\n"
            
            # Approved tasks
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    approved_tasks = json.load(f)
                
                total_approved = len(approved_tasks)
                executed = sum(1 for task in approved_tasks if task.get("executed", False))
                pending_execution = total_approved - executed
                
                status += f"**Total Approved Tasks:** {total_approved}\n"
                status += f"**Executed Tasks:** {executed}\n"
                status += f"**Pending Execution:** {pending_execution}\n"
            else:
                status += "**Approved Tasks:** None\n"
            
            # Latest recommendation
            recommendations = self.load_recommendations()
            if recommendations:
                rec_time = recommendations.get("timestamp", "Unknown")
                status += f"\n**Latest Recommendation:** {rec_time}\n"
                status += f"**Action:** {recommendations.get('action', 'N/A')} {recommendations.get('quantity', 0)} units\n"
                status += f"**Expected ROI:** {recommendations.get('expected_roi', 'N/A')}\n"
            else:
                status += "\n**Latest Recommendation:** None found\n"
            
            return status
            
        except Exception as e:
            self.logger.error(f"Error getting status: {e}")
            return "❌ Error retrieving status"
    
    async def run(self):
        """Start the Slack bot"""
        try:
            self.logger.info("Starting Slack Approval Bot...")
            
            # Check for existing recommendations on startup
            recommendations = self.load_recommendations()
            if recommendations:
                self.logger.info("Found existing recommendations - ready to send for approval")
            else:
                self.logger.info("No recommendations found - waiting for RL agent to generate them")
            
            # Start socket mode handler
            handler = AsyncSocketModeHandler(self.app, self.config["SLACK_APP_TOKEN"])
            await handler.start_async()
            
        except Exception as e:
            self.logger.error(f"Error starting bot: {e}")
            raise


async def main():
    """Main function to run the Slack approval bot"""
    parser = argparse.ArgumentParser(description="Slack Approval Bot for RL Agent Recommendations")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    parser.add_argument("--send-now", action="store_true", help="Send current recommendations immediately")
    
    args = parser.parse_args()
    
    # Create and run bot
    bot = SlackApprovalBot(config_file=args.config)
    
    if args.send_now:
        # Send current recommendations and exit
        success = await bot.send_recommendation_for_approval()
        if success:
            print("✅ Recommendations sent successfully!")
        else:
            print("❌ Failed to send recommendations")
        return
    
    # Run bot continuously
    try:
        await bot.run()
    except KeyboardInterrupt:
        print("\n🛑 Bot stopped by user")
    except Exception as e:
        print(f"❌ Bot error: {e}")


if __name__ == "__main__":
    asyncio.run(main()) 