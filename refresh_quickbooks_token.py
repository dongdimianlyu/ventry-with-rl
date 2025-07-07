#!/usr/bin/env python3
"""
QuickBooks OAuth Token Refresh Script
Automatically refreshes expired access tokens and updates configuration
"""

import json
import os
import requests
import logging
from datetime import datetime
from typing import Dict, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuickBooksTokenRefresher:
    """Handles QuickBooks OAuth token refresh operations"""
    
    def __init__(self, config_file: str = "quickbooks_config.json"):
        self.config_file = config_file
        self.config = {}
        self.sandbox_base_url = "https://sandbox-quickbooks.api.intuit.com"
        self.production_base_url = "https://quickbooks.api.intuit.com"
        
    def load_config(self) -> Dict:
        """Load configuration from file or environment variables"""
        config = {}
        
        # Try to load from config file first
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                logger.info(f"✅ Loaded configuration from {self.config_file}")
            except Exception as e:
                logger.error(f"❌ Error loading config file: {e}")
        
        # Override with environment variables if present
        env_vars = {
            'QB_CLIENT_ID': os.getenv('QB_CLIENT_ID'),
            'QB_CLIENT_SECRET': os.getenv('QB_CLIENT_SECRET'),
            'QB_ACCESS_TOKEN': os.getenv('QB_ACCESS_TOKEN'),
            'QB_REFRESH_TOKEN': os.getenv('QB_REFRESH_TOKEN'),
            'QB_COMPANY_ID': os.getenv('QB_COMPANY_ID'),
            'QB_SANDBOX': os.getenv('QB_SANDBOX', 'true').lower() == 'true'
        }
        
        for key, value in env_vars.items():
            if value is not None:
                config[key] = value
        
        self.config = config
        return config
    
    def validate_config(self) -> bool:
        """Validate that required configuration is present"""
        required_fields = ['QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_REFRESH_TOKEN']
        
        missing_fields = []
        for field in required_fields:
            if not self.config.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            logger.error(f"❌ Missing required configuration: {', '.join(missing_fields)}")
            return False
        
        logger.info("✅ All required configuration fields present")
        return True
    
    def refresh_token(self) -> Tuple[bool, Optional[Dict]]:
        """Refresh the QuickBooks OAuth token"""
        try:
            # QuickBooks token refresh endpoint
            token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
            
            # Prepare refresh request
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': f'Basic {self._get_basic_auth()}'
            }
            
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': self.config['QB_REFRESH_TOKEN']
            }
            
            logger.info("🔄 Refreshing QuickBooks access token...")
            
            # Make refresh request
            response = requests.post(token_url, headers=headers, data=data)
            
            if response.status_code == 200:
                token_data = response.json()
                logger.info("✅ Token refresh successful!")
                
                # Log token info (without exposing full tokens)
                logger.info(f"   New access token expires in: {token_data.get('expires_in', 'unknown')} seconds")
                logger.info(f"   Token type: {token_data.get('token_type', 'unknown')}")
                
                return True, token_data
            else:
                logger.error(f"❌ Token refresh failed: {response.status_code}")
                logger.error(f"   Response: {response.text}")
                return False, None
                
        except Exception as e:
            logger.error(f"❌ Error during token refresh: {e}")
            return False, None
    
    def _get_basic_auth(self) -> str:
        """Generate Basic Auth header value"""
        import base64
        
        client_id = self.config['QB_CLIENT_ID']
        client_secret = self.config['QB_CLIENT_SECRET']
        
        # Create base64 encoded credentials
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        return encoded_credentials
    
    def update_config_file(self, token_data: Dict) -> bool:
        """Update configuration file with new token data"""
        try:
            # Update config with new token information
            self.config['QB_ACCESS_TOKEN'] = token_data['access_token']
            
            # Update refresh token if provided
            if 'refresh_token' in token_data:
                self.config['QB_REFRESH_TOKEN'] = token_data['refresh_token']
            
            # Add token metadata
            self.config['TOKEN_REFRESHED_AT'] = datetime.now().isoformat()
            self.config['TOKEN_EXPIRES_IN'] = token_data.get('expires_in', 3600)
            
            # Write updated config back to file
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            
            logger.info(f"✅ Configuration updated in {self.config_file}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating config file: {e}")
            return False
    
    def update_environment_variables(self, token_data: Dict) -> None:
        """Update environment variables with new token data"""
        try:
            # Update current session environment variables
            os.environ['QB_ACCESS_TOKEN'] = token_data['access_token']
            
            if 'refresh_token' in token_data:
                os.environ['QB_REFRESH_TOKEN'] = token_data['refresh_token']
            
            logger.info("✅ Environment variables updated for current session")
            
            # Provide export commands for permanent update
            print("\n🔧 **To make these changes permanent, run these commands:**")
            print(f"export QB_ACCESS_TOKEN='{token_data['access_token']}'")
            
            if 'refresh_token' in token_data:
                print(f"export QB_REFRESH_TOKEN='{token_data['refresh_token']}'")
            
        except Exception as e:
            logger.error(f"❌ Error updating environment variables: {e}")
    
    def test_connection(self) -> bool:
        """Test the connection with the new token"""
        try:
            # Use the updated token to test connection
            access_token = self.config['QB_ACCESS_TOKEN']
            company_id = self.config.get('QB_COMPANY_ID')
            is_sandbox = self.config.get('QB_SANDBOX', True)
            
            if not company_id:
                logger.warning("⚠️ No company ID configured, skipping connection test")
                return False
            
            # Choose base URL based on sandbox setting
            base_url = self.sandbox_base_url if is_sandbox else self.production_base_url
            
            # Test with a simple company info request
            test_url = f"{base_url}/v3/company/{company_id}/companyinfo/{company_id}"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            logger.info("🔍 Testing connection with new token...")
            
            response = requests.get(test_url, headers=headers)
            
            if response.status_code == 200:
                logger.info("✅ Connection test successful!")
                return True
            else:
                logger.error(f"❌ Connection test failed: {response.status_code}")
                logger.error(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error during connection test: {e}")
            return False
    
    def run_refresh_process(self) -> bool:
        """Run the complete token refresh process"""
        print("🚀 **QuickBooks Token Refresh Process**")
        print("=" * 50)
        
        # Load configuration
        self.load_config()
        
        # Validate configuration
        if not self.validate_config():
            return False
        
        # Show current configuration status
        print(f"\n📋 **Current Configuration:**")
        print(f"   Client ID: {self.config.get('QB_CLIENT_ID', 'Not set')[:20]}...")
        print(f"   Client Secret: {self.config.get('QB_CLIENT_SECRET', 'Not set')[:20]}...")
        print(f"   Refresh Token: {self.config.get('QB_REFRESH_TOKEN', 'Not set')[:30]}...")
        print(f"   Company ID: {self.config.get('QB_COMPANY_ID', 'Not set')}")
        print(f"   Sandbox Mode: {self.config.get('QB_SANDBOX', 'Not set')}")
        
        # Refresh token
        success, token_data = self.refresh_token()
        
        if not success or token_data is None:
            return False
        
        # Update configuration file
        if not self.update_config_file(token_data):
            return False
        
        # Update environment variables
        self.update_environment_variables(token_data)
        
        # Test connection
        if self.test_connection():
            print("\n🎉 **Token refresh completed successfully!**")
            print("   Your QuickBooks integration should now work properly.")
            return True
        else:
            print("\n⚠️ **Token refreshed but connection test failed**")
            print("   Please check your company ID and sandbox settings.")
            return False


def main():
    """Main function to run the token refresh process"""
    refresher = QuickBooksTokenRefresher()
    
    try:
        success = refresher.run_refresh_process()
        
        if success:
            print("\n✅ **Next Steps:**")
            print("1. Test your QuickBooks integration with: python3 quickbooks_executor.py --status")
            print("2. Run a dry-run test with: python3 quickbooks_executor.py --dry-run")
            print("3. Execute real tasks with: python3 quickbooks_executor.py --execute")
        else:
            print("\n❌ **Token refresh failed. Please check:**")
            print("1. Your refresh token is valid and not expired")
            print("2. Your client ID and client secret are correct")
            print("3. Your QuickBooks app is properly configured")
            print("4. You have network connectivity")
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Token refresh cancelled by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main() 