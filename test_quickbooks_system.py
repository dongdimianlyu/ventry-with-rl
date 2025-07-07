#!/usr/bin/env python3
"""
QuickBooks Integration System Test Script
Tests the complete system from token refresh to task execution
"""

import json
import os
import sys
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuickBooksSystemTester:
    """Comprehensive tester for QuickBooks integration system"""
    
    def __init__(self):
        self.config_file = "quickbooks_config.json"
        self.approved_tasks_file = "approved_tasks.json"
        self.test_results = []
        
    def log_test_result(self, test_name: str, passed: bool, message: str = ""):
        """Log a test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        result = {
            'test': test_name,
            'passed': passed,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"        {message}")
    
    def test_config_file_exists(self) -> bool:
        """Test if config file exists and is readable"""
        try:
            exists = os.path.exists(self.config_file)
            if exists:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                self.log_test_result("Config file exists and readable", True, f"Found {len(config)} configuration items")
                return True
            else:
                self.log_test_result("Config file exists and readable", False, "quickbooks_config.json not found")
                return False
        except Exception as e:
            self.log_test_result("Config file exists and readable", False, f"Error reading config: {e}")
            return False
    
    def test_required_config_fields(self) -> bool:
        """Test if all required config fields are present"""
        try:
            with open(self.config_file, 'r') as f:
                config = json.load(f)
            
            required_fields = ['QB_CLIENT_ID', 'QB_CLIENT_SECRET', 'QB_ACCESS_TOKEN', 'QB_COMPANY_ID']
            missing_fields = []
            placeholder_fields = []
            
            for field in required_fields:
                if field not in config or not config[field]:
                    missing_fields.append(field)
                elif config[field].startswith('your-') or config[field] == 'your-quickbooks-refresh-token-here':
                    placeholder_fields.append(field)
            
            if missing_fields:
                self.log_test_result("Required config fields present", False, f"Missing: {', '.join(missing_fields)}")
                return False
            elif placeholder_fields:
                self.log_test_result("Required config fields present", False, f"Still have placeholders: {', '.join(placeholder_fields)}")
                return False
            else:
                self.log_test_result("Required config fields present", True, "All required fields configured")
                return True
                
        except Exception as e:
            self.log_test_result("Required config fields present", False, f"Error checking config: {e}")
            return False
    
    def test_refresh_token_available(self) -> bool:
        """Test if refresh token is available"""
        try:
            with open(self.config_file, 'r') as f:
                config = json.load(f)
            
            refresh_token = config.get('QB_REFRESH_TOKEN')
            if not refresh_token:
                self.log_test_result("Refresh token available", False, "No refresh token found")
                return False
            elif refresh_token == 'your-quickbooks-refresh-token-here':
                self.log_test_result("Refresh token available", False, "Refresh token is still placeholder")
                return False
            else:
                self.log_test_result("Refresh token available", True, f"Refresh token present ({refresh_token[:30]}...)")
                return True
                
        except Exception as e:
            self.log_test_result("Refresh token available", False, f"Error checking refresh token: {e}")
            return False
    
    def test_token_refresh_functionality(self) -> bool:
        """Test if token refresh works"""
        try:
            # Import and run the refresh script
            import subprocess
            import sys
            
            result = subprocess.run([sys.executable, 'refresh_quickbooks_token.py'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                self.log_test_result("Token refresh functionality", True, "Token refresh script executed successfully")
                return True
            else:
                self.log_test_result("Token refresh functionality", False, f"Token refresh failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log_test_result("Token refresh functionality", False, "Token refresh timed out")
            return False
        except Exception as e:
            self.log_test_result("Token refresh functionality", False, f"Error testing token refresh: {e}")
            return False
    
    def test_quickbooks_connection(self) -> bool:
        """Test QuickBooks API connection"""
        try:
            import subprocess
            import sys
            
            result = subprocess.run([sys.executable, 'quickbooks_executor.py', '--status'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and "QuickBooks connection failed" not in result.stdout:
                self.log_test_result("QuickBooks connection", True, "Connection test passed")
                return True
            else:
                self.log_test_result("QuickBooks connection", False, "Connection test failed")
                return False
                
        except subprocess.TimeoutExpired:
            self.log_test_result("QuickBooks connection", False, "Connection test timed out")
            return False
        except Exception as e:
            self.log_test_result("QuickBooks connection", False, f"Error testing connection: {e}")
            return False
    
    def test_approved_tasks_file(self) -> bool:
        """Test if approved tasks file exists and is readable"""
        try:
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    tasks = json.load(f)
                task_count = len(tasks)
                self.log_test_result("Approved tasks file", True, f"Found {task_count} approved tasks")
                return True
            else:
                # Create empty approved tasks file for testing
                with open(self.approved_tasks_file, 'w') as f:
                    json.dump([], f)
                self.log_test_result("Approved tasks file", True, "Created empty approved tasks file")
                return True
                
        except Exception as e:
            self.log_test_result("Approved tasks file", False, f"Error with approved tasks file: {e}")
            return False
    
    def test_dry_run_execution(self) -> bool:
        """Test dry-run execution"""
        try:
            # Create a test task if none exist
            test_task = {
                "task_id": "test_task_" + datetime.now().strftime("%Y%m%d_%H%M%S"),
                "action": "restock 10 units",
                "reasoning": "Test task for system verification",
                "confidence": "High",
                "expected_roi": "100%",
                "approved_at": datetime.now().isoformat(),
                "executed": False
            }
            
            # Read existing tasks
            tasks = []
            if os.path.exists(self.approved_tasks_file):
                with open(self.approved_tasks_file, 'r') as f:
                    tasks = json.load(f)
            
            # Add test task
            tasks.append(test_task)
            
            # Write back
            with open(self.approved_tasks_file, 'w') as f:
                json.dump(tasks, f, indent=2)
            
            # Run dry-run
            import subprocess
            import sys
            
            result = subprocess.run([sys.executable, 'quickbooks_executor.py', '--dry-run'], 
                                  capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                self.log_test_result("Dry-run execution", True, "Dry-run completed successfully")
                return True
            else:
                self.log_test_result("Dry-run execution", False, f"Dry-run failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log_test_result("Dry-run execution", False, "Dry-run timed out")
            return False
        except Exception as e:
            self.log_test_result("Dry-run execution", False, f"Error testing dry-run: {e}")
            return False
    
    def test_dependencies_installed(self) -> bool:
        """Test if required dependencies are installed"""
        try:
            dependencies = ['requests', 'python-quickbooks']
            missing_deps = []
            
            for dep in dependencies:
                try:
                    if dep == 'python-quickbooks':
                        import quickbooks
                    else:
                        __import__(dep)
                except ImportError:
                    missing_deps.append(dep)
            
            if missing_deps:
                self.log_test_result("Dependencies installed", False, f"Missing: {', '.join(missing_deps)}")
                return False
            else:
                self.log_test_result("Dependencies installed", True, "All required dependencies available")
                return True
                
        except Exception as e:
            self.log_test_result("Dependencies installed", False, f"Error checking dependencies: {e}")
            return False
    
    def run_all_tests(self) -> Dict:
        """Run all tests and return results"""
        print("🧪 **QuickBooks Integration System Test Suite**")
        print("=" * 60)
        
        # Run all tests
        tests = [
            self.test_config_file_exists,
            self.test_dependencies_installed,
            self.test_required_config_fields,
            self.test_refresh_token_available,
            self.test_approved_tasks_file,
            self.test_token_refresh_functionality,
            self.test_quickbooks_connection,
            self.test_dry_run_execution,
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed_tests += 1
            except Exception as e:
                logger.error(f"Test {test.__name__} failed with exception: {e}")
        
        # Print summary
        print(f"\n📊 **Test Results Summary**")
        print(f"   Tests Passed: {passed_tests}/{total_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("\n🎉 **All tests passed! Your QuickBooks integration is ready.**")
            status = "ready"
        elif passed_tests >= total_tests * 0.7:
            print("\n⚠️ **Most tests passed, but some issues need attention.**")
            status = "partial"
        else:
            print("\n❌ **Multiple tests failed. System needs configuration.**")
            status = "failed"
        
        return {
            'status': status,
            'passed': passed_tests,
            'total': total_tests,
            'results': self.test_results
        }
    
    def generate_recommendations(self) -> None:
        """Generate recommendations based on test results"""
        print("\n🔧 **Recommendations:**")
        
        failed_tests = [r for r in self.test_results if not r['passed']]
        
        if not failed_tests:
            print("   ✅ No issues found - system is ready for production use!")
            return
        
        for result in failed_tests:
            test_name = result['test']
            message = result['message']
            
            if "Config file" in test_name:
                print("   1. Create quickbooks_config.json with your credentials")
                print("      Run: python3 get_quickbooks_tokens.py")
            
            elif "Required config fields" in test_name:
                print("   2. Complete OAuth flow to get valid tokens")
                print("      Run: python3 get_quickbooks_tokens.py")
            
            elif "Refresh token" in test_name:
                print("   3. Get a valid refresh token through OAuth")
                print("      Run: python3 get_quickbooks_tokens.py")
            
            elif "Dependencies" in test_name:
                print("   4. Install missing dependencies")
                print("      Run: pip3 install -r requirements_quickbooks.txt")
            
            elif "Token refresh" in test_name:
                print("   5. Fix token refresh issues")
                print("      Check your client credentials and refresh token")
            
            elif "QuickBooks connection" in test_name:
                print("   6. Verify QuickBooks API connection")
                print("      Check your access token and company ID")
            
            elif "Dry-run execution" in test_name:
                print("   7. Fix task execution issues")
                print("      Check task parsing and API integration")


def main():
    """Main function to run the test suite"""
    tester = QuickBooksSystemTester()
    
    try:
        results = tester.run_all_tests()
        tester.generate_recommendations()
        
        # Save results to file
        with open('test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 **Detailed results saved to test_results.json**")
        
        # Exit with appropriate code
        if results['status'] == 'ready':
            sys.exit(0)
        elif results['status'] == 'partial':
            sys.exit(1)
        else:
            sys.exit(2)
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Test suite cancelled by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 