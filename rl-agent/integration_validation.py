#!/usr/bin/env python3
"""
RL Agent Intelligence Enhancement - Integration Validation

Comprehensive validation that all enhanced components work together:
- Enhanced business environment
- Enhanced RL agent capabilities
- Enhanced training system
- Business scenario generator
- Mock data integration
- Existing Ventry system compatibility
"""

import os
import sys
import json
import time
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional

# Component imports
try:
    from enhanced_business_env import EnhancedBusinessEnv
    ENHANCED_ENV_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Enhanced environment not available: {e}")
    ENHANCED_ENV_AVAILABLE = False

try:
    from enhanced_rl_agent import EnhancedRLAgent
    ENHANCED_AGENT_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Enhanced agent not available: {e}")
    ENHANCED_AGENT_AVAILABLE = False

try:
    from business_scenario_generator import BusinessScenarioGenerator, ScenarioType
    SCENARIO_GEN_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Scenario generator not available: {e}")
    SCENARIO_GEN_AVAILABLE = False

try:
    from enhanced_training import TrainingConfig, EnhancedTrainingSystem
    ENHANCED_TRAINING_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Enhanced training not available: {e}")
    ENHANCED_TRAINING_AVAILABLE = False

class IntegrationValidator:
    """Comprehensive integration testing for enhanced RL system"""
    
    def __init__(self):
        self.test_results = {}
        self.performance_metrics = {}
        self.compatibility_checks = {}
        self.recommendations = []
        
    def test_environment_functionality(self) -> Dict[str, Any]:
        """Test enhanced business environment functionality"""
        print("\n🧪 Testing Enhanced Business Environment...")
        
        if not ENHANCED_ENV_AVAILABLE:
            return {"status": "FAILED", "error": "Environment not available"}
        
        try:
            # Create environment
            env = EnhancedBusinessEnv()
            
            # Test basic operations
            obs, info = env.reset()
            assert obs is not None
            assert isinstance(obs, np.ndarray)
            print("   ✅ Environment reset successful")
            
            # Test step function
            action = env.action_space.sample()
            obs, reward, done, truncated, info = env.step(action)
            assert isinstance(reward, (int, float))
            assert isinstance(done, bool)
            print("   ✅ Environment step function working")
            
            # Test observation space
            assert env.observation_space.contains(obs)
            print("   ✅ Observation space valid")
            
            # Test action space
            assert env.action_space.contains(action)
            print("   ✅ Action space valid")
            
            # Performance test
            start_time = time.time()
            for _ in range(1000):
                action = env.action_space.sample()
                obs, reward, done, truncated, info = env.step(action)
                if done or truncated:
                    obs, info = env.reset()
            duration = time.time() - start_time
            ops_per_sec = 1000 / duration
            
            print(f"   ✅ Performance: {ops_per_sec:.1f} operations/second")
            
            return {
                "status": "PASSED",
                "performance": ops_per_sec,
                "observation_shape": obs.shape,
                "action_space_size": env.action_space.nvec.tolist(),
                "episode_length": env.max_days
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def test_scenario_generation(self) -> Dict[str, Any]:
        """Test business scenario generator"""
        print("\n🎯 Testing Business Scenario Generator...")
        
        if not SCENARIO_GEN_AVAILABLE:
            return {"status": "FAILED", "error": "Scenario generator not available"}
        
        try:
            generator = BusinessScenarioGenerator()
            
            # Test different scenario types
            scenario_types = [
                ScenarioType.MARKET_VOLATILITY,
                ScenarioType.SUPPLY_DISRUPTION,
                ScenarioType.DEMAND_SHOCK,
                ScenarioType.CASH_FLOW_CRISIS,
                ScenarioType.SEASONAL_PATTERN,
                ScenarioType.COMPETITIVE_PRESSURE
            ]
            
            generated_scenarios = []
            for scenario_type in scenario_types:
                scenario = generator.generate_random_scenario(scenario_type, 0.5)
                assert scenario.name is not None
                assert len(scenario.events) > 0
                assert scenario.duration_days > 0
                generated_scenarios.append(scenario)
                print(f"   ✅ {scenario_type.value} scenario generated")
            
            # Test scenario set generation
            scenario_set = generator.generate_scenario_set(6, balanced_difficulty=True)
            assert len(scenario_set) == 6
            print("   ✅ Scenario set generation working")
            
            # Test save/load functionality
            test_scenario = generated_scenarios[0]
            generator.save_scenario(test_scenario, "test_scenario.json")
            loaded_scenario = generator.load_scenario("test_scenario.json")
            assert loaded_scenario.name == test_scenario.name
            print("   ✅ Scenario save/load working")
            
            return {
                "status": "PASSED",
                "scenario_types_tested": len(scenario_types),
                "scenarios_generated": len(generated_scenarios),
                "average_events_per_scenario": np.mean([len(s.events) for s in generated_scenarios])
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def test_agent_functionality(self) -> Dict[str, Any]:
        """Test enhanced RL agent functionality"""
        print("\n🤖 Testing Enhanced RL Agent...")
        
        if not ENHANCED_AGENT_AVAILABLE:
            return {"status": "FAILED", "error": "Enhanced agent not available"}
        
        try:
            # Test agent initialization
            agent = EnhancedRLAgent()
            print("   ✅ Agent initialization successful")
            
            # Test recommendation generation
            mock_state = {
                'inventory_levels': [100, 50, 200, 75, 30],
                'cash_flow': 50000,
                'days_remaining': 45,
                'market_conditions': [0.8, 1.2, 0.9, 0.95, 1.0],
                'demand_trends': [1.1, 0.9, 1.2, 1.0, 0.8],
                'customer_satisfaction': 0.92
            }
            
            recommendations = agent.get_recommendations(mock_state)
            assert isinstance(recommendations, dict)
            assert 'recommendations' in recommendations
            print("   ✅ Recommendation generation working")
            
            # Test action interpretation
            mock_actions = np.array([1, 2, 0, 3, 1])  # Sample actions
            interpreted_actions = agent.interpret_actions(mock_actions, mock_state)
            assert isinstance(interpreted_actions, list)
            print("   ✅ Action interpretation working")
            
            return {
                "status": "PASSED",
                "recommendation_keys": list(recommendations.keys()),
                "action_interpretation_count": len(interpreted_actions)
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def test_training_system(self) -> Dict[str, Any]:
        """Test enhanced training system"""
        print("\n📚 Testing Enhanced Training System...")
        
        if not ENHANCED_TRAINING_AVAILABLE:
            return {"status": "FAILED", "error": "Enhanced training not available"}
        
        try:
            # Test training configuration
            config = TrainingConfig(
                algorithm="PPO",
                total_timesteps=1000,  # Small for testing
                use_curriculum=True
            )
            
            trainer = EnhancedTrainingSystem(config)
            print("   ✅ Training system initialization successful")
            
            # Test curriculum stages
            stages = trainer.create_curriculum_stages()
            assert len(stages) == 4
            assert all(0 <= stage.business_complexity <= 1.0 for stage in stages)
            print("   ✅ Curriculum stage generation working")
            
            # Test environment creation
            if ENHANCED_ENV_AVAILABLE:
                env = trainer.create_environment()
                assert hasattr(env, 'reset')
                assert hasattr(env, 'step')
                print("   ✅ Training environment creation working")
            
            return {
                "status": "PASSED",
                "curriculum_stages": len(stages),
                "training_algorithm": config.algorithm,
                "total_timesteps": config.total_timesteps
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def test_mock_data_integration(self) -> Dict[str, Any]:
        """Test mock data integration"""
        print("\n📊 Testing Mock Data Integration...")
        
        try:
            # Test QuickBooks data
            qb_data_exists = os.path.exists("../enhanced_quickbooks_data.json")
            if qb_data_exists:
                with open("../enhanced_quickbooks_data.json", "r") as f:
                    qb_data = json.load(f)
                
                assert "accounts" in qb_data
                assert "customers" in qb_data
                assert "invoices" in qb_data
                assert len(qb_data["customers"]) > 1000  # Professional dataset
                print("   ✅ Enhanced QuickBooks data available and valid")
            
            # Test Shopify data
            shopify_data_exists = os.path.exists("../src/lib/enhanced-shopify-data.ts")
            if shopify_data_exists:
                with open("../src/lib/enhanced-shopify-data.ts", "r") as f:
                    content = f.read()
                
                assert "TST-PRO-WHT-001" in content  # Professional SKU
                assert "segment:" in content  # Customer segmentation
                print("   ✅ Enhanced Shopify data available and valid")
            
            return {
                "status": "PASSED",
                "quickbooks_data": qb_data_exists,
                "shopify_data": shopify_data_exists,
                "customer_count": len(qb_data["customers"]) if qb_data_exists else 0
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def test_ventry_compatibility(self) -> Dict[str, Any]:
        """Test compatibility with existing Ventry systems"""
        print("\n🔗 Testing Ventry System Compatibility...")
        
        try:
            # Check for existing RL agent
            original_agent_exists = os.path.exists("rl_agent.py")
            
            # Check for Slack integration
            slack_integration_exists = os.path.exists("../src/lib/slack.ts")
            
            # Check for QuickBooks integration  
            qb_integration_exists = os.path.exists("../src/lib/quickbooks.ts")
            
            # Check for task cards
            task_cards_exist = os.path.exists("../src/components/TaskCard.tsx")
            
            compatibility_score = sum([
                original_agent_exists,
                slack_integration_exists,
                qb_integration_exists,
                task_cards_exist
            ]) / 4
            
            print(f"   ✅ Original RL agent: {'Found' if original_agent_exists else 'Not found'}")
            print(f"   ✅ Slack integration: {'Found' if slack_integration_exists else 'Not found'}")
            print(f"   ✅ QuickBooks integration: {'Found' if qb_integration_exists else 'Not found'}")
            print(f"   ✅ Task cards: {'Found' if task_cards_exist else 'Not found'}")
            print(f"   📊 Compatibility score: {compatibility_score:.0%}")
            
            return {
                "status": "PASSED",
                "original_agent": original_agent_exists,
                "slack_integration": slack_integration_exists,
                "quickbooks_integration": qb_integration_exists,
                "task_cards": task_cards_exist,
                "compatibility_score": compatibility_score
            }
            
        except Exception as e:
            return {"status": "FAILED", "error": str(e)}
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests"""
        print("🚀 Starting Comprehensive RL Agent Enhancement Validation")
        print("=" * 60)
        
        # Run all tests
        self.test_results = {
            "environment": self.test_environment_functionality(),
            "scenarios": self.test_scenario_generation(),
            "agent": self.test_agent_functionality(),
            "training": self.test_training_system(),
            "mock_data": self.test_mock_data_integration(),
            "compatibility": self.test_ventry_compatibility()
        }
        
        # Calculate overall status
        passed_tests = sum(1 for result in self.test_results.values() 
                          if result.get("status") == "PASSED")
        total_tests = len(self.test_results)
        success_rate = passed_tests / total_tests
        
        # Generate recommendations
        self._generate_recommendations()
        
        # Create comprehensive report
        report = {
            "validation_timestamp": datetime.now().isoformat(),
            "test_results": self.test_results,
            "summary": {
                "tests_passed": passed_tests,
                "total_tests": total_tests,
                "success_rate": success_rate,
                "overall_status": "PASSED" if success_rate >= 0.8 else "NEEDS_ATTENTION"
            },
            "recommendations": self.recommendations,
            "system_readiness": self._assess_system_readiness()
        }
        
        return report
    
    def _generate_recommendations(self):
        """Generate recommendations based on test results"""
        self.recommendations = []
        
        if self.test_results["environment"]["status"] != "PASSED":
            self.recommendations.append("Fix enhanced business environment issues")
        
        if self.test_results["agent"]["status"] != "PASSED":
            self.recommendations.append("Resolve enhanced RL agent functionality issues")
        
        if self.test_results["training"]["status"] != "PASSED":
            self.recommendations.append("Address enhanced training system issues")
        
        if self.test_results["scenarios"]["status"] != "PASSED":
            self.recommendations.append("Fix business scenario generator")
        
        if not self.test_results["mock_data"].get("quickbooks_data", False):
            self.recommendations.append("Ensure enhanced QuickBooks data is available")
        
        if not self.test_results["mock_data"].get("shopify_data", False):
            self.recommendations.append("Ensure enhanced Shopify data is available")
        
        compatibility_score = self.test_results["compatibility"].get("compatibility_score", 0)
        if compatibility_score < 0.8:
            self.recommendations.append("Verify integration with existing Ventry components")
        
        if not self.recommendations:
            self.recommendations.append("System is ready for enhanced RL agent deployment!")
    
    def _assess_system_readiness(self) -> str:
        """Assess overall system readiness for deployment"""
        critical_components = ["environment", "agent", "scenarios"]
        critical_passed = all(
            self.test_results[comp]["status"] == "PASSED" 
            for comp in critical_components
        )
        
        if critical_passed:
            compatibility_score = self.test_results["compatibility"].get("compatibility_score", 0)
            if compatibility_score >= 0.8:
                return "READY_FOR_DEPLOYMENT"
            else:
                return "READY_FOR_TESTING"
        else:
            return "NEEDS_DEVELOPMENT"
    
    def print_validation_summary(self, report: Dict[str, Any]):
        """Print validation summary"""
        print(f"\n📋 Validation Summary")
        print("=" * 30)
        
        summary = report["summary"]
        print(f"Tests Passed: {summary['tests_passed']}/{summary['total_tests']}")
        print(f"Success Rate: {summary['success_rate']:.0%}")
        print(f"Overall Status: {summary['overall_status']}")
        print(f"System Readiness: {report['system_readiness']}")
        
        print(f"\n🔍 Component Status:")
        for component, result in report["test_results"].items():
            status_emoji = "✅" if result["status"] == "PASSED" else "❌"
            print(f"   {status_emoji} {component.title()}: {result['status']}")
        
        if report["recommendations"]:
            print(f"\n💡 Recommendations:")
            for rec in report["recommendations"]:
                print(f"   - {rec}")
        
        print(f"\n📄 Detailed report saved to: integration_validation_report.json")

def main():
    """Main validation function"""
    validator = IntegrationValidator()
    
    # Run comprehensive validation
    report = validator.run_comprehensive_validation()
    
    # Save detailed report
    with open("integration_validation_report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    # Print summary
    validator.print_validation_summary(report)
    
    # Final status
    if report["system_readiness"] == "READY_FOR_DEPLOYMENT":
        print(f"\n🎉 System validation complete - Enhanced RL agent ready for deployment!")
    elif report["system_readiness"] == "READY_FOR_TESTING":
        print(f"\n🧪 System validation complete - Ready for integration testing!")
    else:
        print(f"\n⚠️  System validation complete - Additional development needed")
    
    return report

if __name__ == "__main__":
    main() 