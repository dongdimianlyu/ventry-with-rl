#!/usr/bin/env python3
"""
Test Enhanced Training System

Tests the enhanced training system without requiring full RL library installation.
Validates configurations, curriculum stages, and training pipeline.
"""

import sys
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Test imports
try:
    from enhanced_training import (
        TrainingConfig, CurriculumStage, TrainingMetrics,
        EnhancedTrainingSystem
    )
    ENHANCED_TRAINING_AVAILABLE = True
except ImportError as e:
    print(f"Enhanced training not available: {e}")
    ENHANCED_TRAINING_AVAILABLE = False

try:
    from enhanced_business_env import EnhancedBusinessEnv
    ENHANCED_ENV_AVAILABLE = True
except ImportError as e:
    print(f"Enhanced environment not available: {e}")
    ENHANCED_ENV_AVAILABLE = False

def test_training_config():
    """Test training configuration"""
    print("Testing Training Configuration...")
    
    # Default config
    config = TrainingConfig()
    assert config.algorithm == "PPO"
    assert config.total_timesteps == 1000000
    assert config.use_curriculum == True
    print("✅ Default configuration valid")
    
    # Custom config
    custom_config = TrainingConfig(
        algorithm="SAC",
        total_timesteps=500000,
        learning_rate=1e-4,
        use_curriculum=False
    )
    assert custom_config.algorithm == "SAC"
    assert custom_config.total_timesteps == 500000
    assert custom_config.learning_rate == 1e-4
    assert custom_config.use_curriculum == False
    print("✅ Custom configuration valid")

def test_curriculum_stages():
    """Test curriculum learning stages"""
    print("\nTesting Curriculum Stages...")
    
    if not ENHANCED_TRAINING_AVAILABLE:
        print("❌ Enhanced training not available")
        return
    
    config = TrainingConfig()
    trainer = EnhancedTrainingSystem(config)
    stages = trainer.create_curriculum_stages()
    
    assert len(stages) == 4
    print(f"✅ Created {len(stages)} curriculum stages")
    
    # Test stage progression
    for i, stage in enumerate(stages):
        assert 0.0 <= stage.business_complexity <= 1.0
        assert 0.0 <= stage.market_volatility <= 1.0
        assert 0.0 <= stage.demand_uncertainty <= 1.0
        assert 0.0 <= stage.supplier_reliability <= 1.0
        assert 0.0 <= stage.cash_flow_pressure <= 1.0
        
        if i > 0:
            # Later stages should generally be more complex
            prev_stage = stages[i-1]
            assert stage.business_complexity >= prev_stage.business_complexity
            
        print(f"  Stage {i+1}: {stage.name}")
        print(f"    Complexity: {stage.business_complexity:.1f}")
        print(f"    Volatility: {stage.market_volatility:.1f}")
        print(f"    Description: {stage.description}")
    
    print("✅ Curriculum stages progression valid")

def test_environment_creation():
    """Test environment creation with curriculum stages"""
    print("\nTesting Environment Creation...")
    
    if not ENHANCED_TRAINING_AVAILABLE or not ENHANCED_ENV_AVAILABLE:
        print("❌ Enhanced training or environment not available")
        return
    
    config = TrainingConfig()
    trainer = EnhancedTrainingSystem(config)
    
    # Test basic environment
    env = trainer.create_environment()
    assert hasattr(env, 'reset')
    assert hasattr(env, 'step')
    assert hasattr(env, 'action_space')
    assert hasattr(env, 'observation_space')
    print("✅ Basic environment creation successful")
    
    # Test with curriculum stage
    stages = trainer.create_curriculum_stages()
    stage_env = trainer.create_environment(stages[0])
    assert hasattr(stage_env, 'reset')
    print("✅ Curriculum stage environment creation successful")

def test_training_metrics():
    """Test training metrics structure"""
    print("\nTesting Training Metrics...")
    
    metrics = TrainingMetrics(
        episode=1,
        timestep=1000,
        mean_reward=150.5,
        std_reward=25.3,
        episode_length=90.0,
        learning_rate=3e-4,
        policy_loss=0.05,
        value_loss=0.02,
        entropy_loss=0.01,
        success_rate=0.85,
        business_metrics={"profit": 1250.0, "inventory_turnover": 4.2}
    )
    
    assert metrics.episode == 1
    assert metrics.mean_reward == 150.5
    assert "profit" in metrics.business_metrics
    print("✅ Training metrics structure valid")

def test_configuration_validation():
    """Test configuration validation and edge cases"""
    print("\nTesting Configuration Validation...")
    
    # Test valid configurations
    configs = [
        TrainingConfig(algorithm="PPO"),
        TrainingConfig(algorithm="SAC"),
        TrainingConfig(algorithm="A2C"),
        TrainingConfig(use_curriculum=True),
        TrainingConfig(use_curriculum=False),
        TrainingConfig(total_timesteps=100000),
        TrainingConfig(total_timesteps=2000000)
    ]
    
    for config in configs:
        assert config.algorithm in ["PPO", "SAC", "A2C"]
        assert config.total_timesteps > 0
        assert 0.0 <= config.gamma <= 1.0
        assert 0.0 <= config.gae_lambda <= 1.0
    
    print("✅ Configuration validation successful")

def test_curriculum_learning_logic():
    """Test curriculum learning logic and progression"""
    print("\nTesting Curriculum Learning Logic...")
    
    if not ENHANCED_TRAINING_AVAILABLE:
        print("❌ Enhanced training not available")
        return
    
    config = TrainingConfig(use_curriculum=True, total_timesteps=400000)
    trainer = EnhancedTrainingSystem(config)
    stages = trainer.create_curriculum_stages()
    
    # Test timestep allocation
    total_timesteps = sum(stage.timesteps for stage in stages)
    assert total_timesteps == config.total_timesteps
    print(f"✅ Timestep allocation correct: {total_timesteps}")
    
    # Test complexity progression
    complexities = [stage.business_complexity for stage in stages]
    assert all(complexities[i] <= complexities[i+1] for i in range(len(complexities)-1))
    print("✅ Complexity progression valid")
    
    # Test stage descriptions
    for stage in stages:
        assert len(stage.description) > 10  # Meaningful descriptions
        assert stage.name != ""
    print("✅ Stage descriptions valid")

def benchmark_environment_performance():
    """Benchmark environment performance"""
    print("\nBenchmarking Environment Performance...")
    
    if not ENHANCED_ENV_AVAILABLE:
        print("❌ Enhanced environment not available")
        return
    
    import time
    
    # Create environment
    env = EnhancedBusinessEnv()
    
    # Benchmark reset and step operations
    start_time = time.time()
    n_operations = 1000
    
    for i in range(n_operations):
        if i % 100 == 0:
            obs, info = env.reset()
        else:
            # Random action
            action = env.action_space.sample()
            obs, reward, done, truncated, info = env.step(action)
            if done or truncated:
                obs, info = env.reset()
    
    duration = time.time() - start_time
    ops_per_second = n_operations / duration
    
    print(f"✅ Environment performance: {ops_per_second:.1f} operations/second")
    return ops_per_second

def generate_test_report():
    """Generate comprehensive test report"""
    print("\n" + "="*50)
    print("ENHANCED TRAINING SYSTEM TEST REPORT")
    print("="*50)
    
    report = {
        "test_timestamp": datetime.now().isoformat(),
        "system_status": {
            "enhanced_training_available": ENHANCED_TRAINING_AVAILABLE,
            "enhanced_environment_available": ENHANCED_ENV_AVAILABLE,
            "python_version": sys.version
        },
        "test_results": {}
    }
    
    # Run all tests
    tests = [
        ("Configuration", test_training_config),
        ("Curriculum Stages", test_curriculum_stages),
        ("Environment Creation", test_environment_creation),
        ("Training Metrics", test_training_metrics),
        ("Configuration Validation", test_configuration_validation),
        ("Curriculum Logic", test_curriculum_learning_logic)
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
            report["test_results"][test_name] = "PASSED"
        except Exception as e:
            print(f"❌ {test_name} failed: {e}")
            report["test_results"][test_name] = f"FAILED: {str(e)}"
    
    # Performance benchmark
    try:
        ops_per_sec = benchmark_environment_performance()
        report["performance_benchmark"] = {"operations_per_second": ops_per_sec}
    except Exception as e:
        print(f"❌ Performance benchmark failed: {e}")
        report["performance_benchmark"] = {"error": str(e)}
    
    # System recommendations
    recommendations = []
    
    if not ENHANCED_TRAINING_AVAILABLE:
        recommendations.append("Install enhanced training dependencies")
    
    if not ENHANCED_ENV_AVAILABLE:
        recommendations.append("Ensure enhanced environment module is available")
    
    if len(report["test_results"]) > 0:
        passed_tests = sum(1 for result in report["test_results"].values() if result == "PASSED")
        total_tests = len(report["test_results"])
        success_rate = passed_tests / total_tests
        
        if success_rate < 1.0:
            recommendations.append(f"Fix failing tests ({passed_tests}/{total_tests} passed)")
        else:
            recommendations.append("All tests passed - system ready for training")
    
    report["recommendations"] = recommendations
    
    # Save report
    with open("test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print(f"\n📊 Test Summary:")
    print(f"   Enhanced Training Available: {'✅' if ENHANCED_TRAINING_AVAILABLE else '❌'}")
    print(f"   Enhanced Environment Available: {'✅' if ENHANCED_ENV_AVAILABLE else '❌'}")
    
    if report["test_results"]:
        passed = sum(1 for r in report["test_results"].values() if r == "PASSED")
        total = len(report["test_results"])
        print(f"   Tests Passed: {passed}/{total}")
        
        if passed == total:
            print("   🎉 All tests passed! System ready for enhanced training.")
        else:
            print("   ⚠️  Some tests failed. Check individual results above.")
    
    if recommendations:
        print(f"\n💡 Recommendations:")
        for rec in recommendations:
            print(f"   - {rec}")
    
    print(f"\n📄 Detailed report saved to: test_report.json")
    
    return report

def main():
    """Main test function"""
    print("Enhanced RL Training System - Validation Tests")
    print("Testing system components and configurations...\n")
    
    # Generate comprehensive test report
    report = generate_test_report()
    
    # Success indication
    if ENHANCED_TRAINING_AVAILABLE and ENHANCED_ENV_AVAILABLE:
        print("\n🚀 System validation complete - ready for enhanced training!")
    else:
        print("\n⚠️  System validation complete - some components need attention")
    
    return report

if __name__ == "__main__":
    main() 