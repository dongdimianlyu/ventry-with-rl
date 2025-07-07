#!/usr/bin/env python3
"""
QuickBooks OAuth Token Acquisition Script
Helps get initial access and refresh tokens through OAuth flow
"""

import json
import os
import requests
import logging
from urllib.parse import urlencode, parse_qs
import webbrowser
import base64
from typing import Dict, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuickBooksOAuthHelper:
    """Helps with QuickBooks OAuth token acquisition"""
    
    def __init__(self, config_file: str = "quickbooks_config.json"):
        self.config_file = config_file
        self.config = {}
        self.authorization_base_url = "https://appcenter.intuit.com/connect/oauth2"
        self.token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
        self.scope = "com.intuit.quickbooks.accounting"
        self.redirect_uri = "https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl"
        
    def load_config(self) -> Dict:
        """Load configuration from file"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
                logger.info(f"✅ Loaded configuration from {self.config_file}")
            except Exception as e:
                logger.error(f"❌ Error loading config file: {e}")
                self.config = {}
        else:
            logger.warning(f"⚠️ Config file {self.config_file} not found")
            self.config = {}
        
        return self.config
    
    def get_authorization_url(self) -> str:
        """Generate the authorization URL for OAuth flow"""
        client_id = self.config.get('QB_CLIENT_ID')
        if not client_id:
            logger.error("❌ QB_CLIENT_ID not found in configuration")
            return ""
        
        # Generate state parameter (simple random string)
        import secrets
        state = secrets.token_urlsafe(32)
        
        # Store state for verification
        self.config['OAUTH_STATE'] = state
        
        params = {
            'client_id': client_id,
            'scope': self.scope,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'access_type': 'offline',  # This ensures we get a refresh token
            'state': state
        }
        
        auth_url = f"{self.authorization_base_url}?{urlencode(params)}"
        return auth_url
    
    def exchange_code_for_tokens(self, authorization_code: str, company_id: str, state: str) -> Optional[Dict]:
        """Exchange authorization code for access and refresh tokens"""
        try:
            # Verify state parameter
            if state != self.config.get('OAUTH_STATE'):
                logger.error("❌ State parameter mismatch - possible CSRF attack")
                return None
            
            client_id = self.config.get('QB_CLIENT_ID')
            client_secret = self.config.get('QB_CLIENT_SECRET')
            
            if not client_id or not client_secret:
                logger.error("❌ Client ID or Secret not found in configuration")
                return None
            
            # Prepare token exchange request
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': f'Basic {self._get_basic_auth(client_id, client_secret)}'
            }
            
            data = {
                'grant_type': 'authorization_code',
                'code': authorization_code,
                'redirect_uri': self.redirect_uri
            }
            
            logger.info("🔄 Exchanging authorization code for tokens...")
            
            # Make token exchange request
            response = requests.post(self.token_url, headers=headers, data=data)
            
            if response.status_code == 200:
                token_data = response.json()
                logger.info("✅ Token exchange successful!")
                
                # Add company ID to token data
                token_data['company_id'] = company_id
                
                return token_data
            else:
                logger.error(f"❌ Token exchange failed: {response.status_code}")
                logger.error(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error during token exchange: {e}")
            return None
    
    def _get_basic_auth(self, client_id: str, client_secret: str) -> str:
        """Generate Basic Auth header value"""
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return encoded_credentials
    
    def update_config_with_tokens(self, token_data: Dict) -> bool:
        """Update configuration file with new tokens"""
        try:
            # Update config with token information
            self.config['QB_ACCESS_TOKEN'] = token_data['access_token']
            self.config['QB_REFRESH_TOKEN'] = token_data['refresh_token']
            self.config['QB_COMPANY_ID'] = token_data['company_id']
            
            # Add token metadata
            from datetime import datetime
            self.config['TOKEN_ACQUIRED_AT'] = datetime.now().isoformat()
            self.config['TOKEN_EXPIRES_IN'] = token_data.get('expires_in', 3600)
            
            # Remove temporary OAuth state
            if 'OAUTH_STATE' in self.config:
                del self.config['OAUTH_STATE']
            
            # Write updated config back to file
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            
            logger.info(f"✅ Configuration updated in {self.config_file}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating config file: {e}")
            return False
    
    def run_oauth_flow(self) -> bool:
        """Run the complete OAuth flow"""
        print("🚀 **QuickBooks OAuth Token Acquisition**")
        print("=" * 50)
        
        # Load configuration
        self.load_config()
        
        # Check if we have client credentials
        if not self.config.get('QB_CLIENT_ID') or not self.config.get('QB_CLIENT_SECRET'):
            print("❌ Missing QB_CLIENT_ID or QB_CLIENT_SECRET in configuration")
            print("   Please update your quickbooks_config.json file with these values")
            return False
        
        # Generate authorization URL
        auth_url = self.get_authorization_url()
        if not auth_url:
            return False
        
        print(f"\n🔗 **Step 1: Authorization**")
        print("   Opening QuickBooks authorization page in your browser...")
        print(f"   If it doesn't open automatically, visit: {auth_url}")
        
        # Open browser
        try:
            webbrowser.open(auth_url)
        except Exception as e:
            logger.warning(f"⚠️ Could not open browser: {e}")
        
        print("\n📋 **Step 2: Get Authorization Code**")
        print("   1. Sign in to your QuickBooks account")
        print("   2. Select your company")
        print("   3. Click 'Authorize'")
        print("   4. You'll be redirected to a page with a URL like:")
        print("      https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl?code=...")
        print("   5. Copy the FULL URL from your browser")
        
        # Get the redirect URL from user
        redirect_url = input("\n🔗 Paste the full redirect URL here: ").strip()
        
        if not redirect_url:
            print("❌ No URL provided")
            return False
        
        # Parse the redirect URL
        try:
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(redirect_url)
            query_params = parse_qs(parsed_url.query)
            
            authorization_code = query_params.get('code', [None])[0]
            company_id = query_params.get('realmId', [None])[0]
            state = query_params.get('state', [None])[0]
            
            if not authorization_code:
                print("❌ Authorization code not found in URL")
                return False
            
            if not company_id:
                print("❌ Company ID not found in URL")
                return False
            
            if not state:
                print("❌ State parameter not found in URL")
                return False
            
            logger.info(f"✅ Extracted authorization code and company ID: {company_id}")
            
        except Exception as e:
            logger.error(f"❌ Error parsing redirect URL: {e}")
            return False
        
        # Exchange code for tokens
        token_data = self.exchange_code_for_tokens(authorization_code, company_id, state)
        
        if not token_data:
            return False
        
        # Update configuration
        if not self.update_config_with_tokens(token_data):
            return False
        
        print("\n🎉 **OAuth flow completed successfully!**")
        print(f"   Access Token: {token_data['access_token'][:50]}...")
        print(f"   Refresh Token: {token_data['refresh_token'][:50]}...")
        print(f"   Company ID: {token_data['company_id']}")
        print(f"   Expires In: {token_data.get('expires_in', 'unknown')} seconds")
        
        return True


def main():
    """Main function to run the OAuth flow"""
    oauth_helper = QuickBooksOAuthHelper()
    
    try:
        success = oauth_helper.run_oauth_flow()
        
        if success:
            print("\n✅ **Next Steps:**")
            print("1. Test your connection with: python3 refresh_quickbooks_token.py")
            print("2. Check status with: python3 quickbooks_executor.py --status")
            print("3. Run a dry-run test with: python3 quickbooks_executor.py --dry-run")
        else:
            print("\n❌ **OAuth flow failed. Please try again or check:**")
            print("1. Your client ID and client secret are correct")
            print("2. Your QuickBooks app is properly configured")
            print("3. You have network connectivity")
            print("4. You followed all the steps correctly")
            
    except KeyboardInterrupt:
        print("\n\n⏹️ OAuth flow cancelled by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main() 