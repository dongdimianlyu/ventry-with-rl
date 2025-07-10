#!/usr/bin/env python3
"""
Enhanced RL Agent Training System

Implements advanced training techniques for the Ventry RL agent:
- Curriculum learning with progressive difficulty
- Multiple RL algorithms (PPO, SAC, A2C)
- Advanced hyperparameter optimization
- Training analytics and monitoring
- Model versioning and comparison
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

# RL Libraries
try:
    from stable_baselines3 import PPO, SAC, A2C
    from stable_baselines3.common.env_util import make_vec_env
    from stable_baselines3.common.vec_env import VecNormalize, SubprocVecEnv
    from stable_baselines3.common.callbacks import BaseCallback, EvalCallback, StopTrainingOnRewardThreshold
    from stable_baselines3.common.logger import configure
    from stable_baselines3.common.evaluation import evaluate_policy
    from stable_baselines3.common.monitor import Monitor
    import torch
    SB3_AVAILABLE = True
except ImportError:
    SB3_AVAILABLE = False
    print("Warning: stable-baselines3 not available. Install with: pip install stable-baselines3[extra]")

from enhanced_business_env import EnhancedBusinessEnv
from enhanced_rl_agent import EnhancedRLAgent

@dataclass
class TrainingConfig:
    """Training configuration with hyperparameters"""
    algorithm: str = "PPO"  # PPO, SAC, A2C
    total_timesteps: int = 1000000
    learning_rate: float = 3e-4
    batch_size: int = 256
    n_steps: int = 2048
    n_epochs: int = 10
    gamma: float = 0.99
    gae_lambda: float = 0.95
    clip_range: float = 0.2
    entropy_coef: float = 0.01
    value_function_coef: float = 0.5
    target_kl: Optional[float] = 0.01
    normalize_advantage: bool = True
    use_curriculum: bool = True
    curriculum_stages: int = 4
    eval_freq: int = 10000
    save_freq: int = 50000
    n_eval_episodes: int = 20
    deterministic_eval: bool = True

@dataclass
class CurriculumStage:
    """Curriculum learning stage configuration"""
    name: str
    timesteps: int
    business_complexity: float  # 0.0 to 1.0
    market_volatility: float   # 0.0 to 1.0
    demand_uncertainty: float  # 0.0 to 1.0
    supplier_reliability: float # 0.0 to 1.0
    cash_flow_pressure: float  # 0.0 to 1.0
    description: str

@dataclass
class TrainingMetrics:
    """Training metrics and statistics"""
    episode: int
    timestep: int
    mean_reward: float
    std_reward: float
    episode_length: float
    learning_rate: float
    policy_loss: float
    value_loss: float
    entropy_loss: float
    success_rate: float
    business_metrics: Dict[str, float]

class TrainingCallback(BaseCallback):
    """Custom callback for training monitoring and logging"""
    
    def __init__(self, eval_env, eval_freq=10000, n_eval_episodes=10, verbose=1):
        super().__init__(verbose)
        self.eval_env = eval_env
        self.eval_freq = eval_freq
        self.n_eval_episodes = n_eval_episodes
        self.training_metrics = []
        self.best_mean_reward = -np.inf
        
    def _on_step(self) -> bool:
        if self.n_calls % self.eval_freq == 0:
            # Evaluate current policy
            mean_reward, std_reward = evaluate_policy(
                self.model, 
                self.eval_env,
                n_eval_episodes=self.n_eval_episodes,
                deterministic=True
            )
            
            # Log metrics
            metrics = TrainingMetrics(
                episode=self.n_calls // self.eval_freq,
                timestep=self.n_calls,
                mean_reward=mean_reward,
                std_reward=std_reward,
                episode_length=self.locals.get('episode_length_mean', 0),
                learning_rate=self.model.learning_rate,
                policy_loss=self.locals.get('policy_loss', 0),
                value_loss=self.locals.get('value_loss', 0),
                entropy_loss=self.locals.get('entropy_loss', 0),
                success_rate=0.0,  # Will be calculated from environment
                business_metrics={}  # Will be filled with business KPIs
            )
            
            self.training_metrics.append(metrics)
            
            # Save best model
            if mean_reward > self.best_mean_reward:
                self.best_mean_reward = mean_reward
                self.model.save(f"models/best_model_{self.n_calls}")
                
            if self.verbose > 0:
                print(f"Eval {len(self.training_metrics)}: Mean reward: {mean_reward:.2f} ± {std_reward:.2f}")
                
        return True

class EnhancedTrainingSystem:
    """Advanced training system for RL agents"""
    
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.training_history = []
        self.models = {}
        self.best_model = None
        self.best_score = -np.inf
        
        # Setup logging
        self.setup_logging()
        
        # Create directories
        os.makedirs("models", exist_ok=True)
        os.makedirs("logs", exist_ok=True)
        os.makedirs("results", exist_ok=True)
        
    def setup_logging(self):
        """Setup training logging"""
        log_format = '%(asctime)s - %(levelname)s - %(message)s'
        logging.basicConfig(level=logging.INFO, format=log_format)
        
        # File handler
        file_handler = logging.FileHandler(f'logs/training_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
        file_handler.setFormatter(logging.Formatter(log_format))
        logging.getLogger().addHandler(file_handler)
        
        self.logger = logging.getLogger(__name__)
        
    def create_curriculum_stages(self) -> List[CurriculumStage]:
        """Create curriculum learning stages"""
        stages = [
            CurriculumStage(
                name="Basic Operations",
                timesteps=self.config.total_timesteps // 4,
                business_complexity=0.3,
                market_volatility=0.2,
                demand_uncertainty=0.2,
                supplier_reliability=0.9,
                cash_flow_pressure=0.2,
                description="Basic inventory management with stable conditions"
            ),
            CurriculumStage(
                name="Market Dynamics",
                timesteps=self.config.total_timesteps // 4,
                business_complexity=0.5,
                market_volatility=0.5,
                demand_uncertainty=0.4,
                supplier_reliability=0.8,
                cash_flow_pressure=0.4,
                description="Introduce market volatility and demand fluctuations"
            ),
            CurriculumStage(
                name="Supply Chain Challenges",
                timesteps=self.config.total_timesteps // 4,
                business_complexity=0.7,
                market_volatility=0.6,
                demand_uncertainty=0.6,
                supplier_reliability=0.6,
                cash_flow_pressure=0.6,
                description="Add supplier delays and cash flow constraints"
            ),
            CurriculumStage(
                name="Advanced Business Operations", 
                timesteps=self.config.total_timesteps // 4,
                business_complexity=1.0,
                market_volatility=0.8,
                demand_uncertainty=0.8,
                supplier_reliability=0.5,
                cash_flow_pressure=0.8,
                description="Full complexity with all business challenges"
            )
        ]
        
        return stages
    
    def create_environment(self, stage: Optional[CurriculumStage] = None) -> EnhancedBusinessEnv:
        """Create training environment with optional curriculum stage"""
        env_config = {
            "num_products": 5,
            "episode_length": 90,
            "initial_cash": 100000,
            "target_service_level": 0.95
        }
        
        if stage:
            env_config.update({
                "business_complexity": stage.business_complexity,
                "market_volatility": stage.market_volatility,
                "demand_uncertainty": stage.demand_uncertainty,
                "supplier_reliability": stage.supplier_reliability,
                "cash_flow_pressure": stage.cash_flow_pressure
            })
            
        return EnhancedBusinessEnv()
    
    def create_vectorized_env(self, stage: Optional[CurriculumStage] = None, n_envs: int = 8):
        """Create vectorized environment for parallel training"""
        def make_env():
            env = self.create_environment(stage)
            return Monitor(env)
        
        if n_envs == 1:
            env = make_env()
        else:
            env = SubprocVecEnv([make_env for _ in range(n_envs)])
            
        # Normalize observations and rewards
        env = VecNormalize(env, norm_obs=True, norm_reward=True, gamma=self.config.gamma)
        
        return env
    
    def create_model(self, env, algorithm: str = None):
        """Create RL model with optimized hyperparameters"""
        algorithm = algorithm or self.config.algorithm
        
        # Common policy kwargs
        policy_kwargs = {
            "net_arch": [512, 512, 256],  # Larger networks
            "activation_fn": torch.nn.ReLU
        }
        
        if algorithm == "PPO":
            model = PPO(
                "MlpPolicy",
                env,
                learning_rate=self.config.learning_rate,
                n_steps=self.config.n_steps,
                batch_size=self.config.batch_size,
                n_epochs=self.config.n_epochs,
                gamma=self.config.gamma,
                gae_lambda=self.config.gae_lambda,
                clip_range=self.config.clip_range,
                ent_coef=self.config.entropy_coef,
                vf_coef=self.config.value_function_coef,
                target_kl=self.config.target_kl,
                normalize_advantage=self.config.normalize_advantage,
                policy_kwargs=policy_kwargs,
                verbose=1,
                tensorboard_log="./logs/tensorboard/"
            )
        elif algorithm == "SAC":
            model = SAC(
                "MlpPolicy",
                env,
                learning_rate=self.config.learning_rate,
                batch_size=self.config.batch_size,
                gamma=self.config.gamma,
                tau=0.005,
                ent_coef='auto',
                target_update_interval=1,
                train_freq=1,
                gradient_steps=1,
                policy_kwargs=policy_kwargs,
                verbose=1,
                tensorboard_log="./logs/tensorboard/"
            )
        elif algorithm == "A2C":
            model = A2C(
                "MlpPolicy",
                env,
                learning_rate=self.config.learning_rate,
                n_steps=self.config.n_steps,
                gamma=self.config.gamma,
                gae_lambda=self.config.gae_lambda,
                ent_coef=self.config.entropy_coef,
                vf_coef=self.config.value_function_coef,
                normalize_advantage=self.config.normalize_advantage,
                policy_kwargs=policy_kwargs,
                verbose=1,
                tensorboard_log="./logs/tensorboard/"
            )
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
            
        return model
    
    def train_curriculum_stage(self, stage: CurriculumStage, model=None):
        """Train model on a specific curriculum stage"""
        self.logger.info(f"Training stage: {stage.name}")
        self.logger.info(f"Description: {stage.description}")
        
        # Create environments
        train_env = self.create_vectorized_env(stage, n_envs=8)
        eval_env = self.create_vectorized_env(stage, n_envs=1)
        
        # Create or update model
        if model is None:
            model = self.create_model(train_env)
        else:
            # Update environment for existing model
            model.set_env(train_env)
        
        # Setup callbacks
        callback = TrainingCallback(
            eval_env=eval_env,
            eval_freq=self.config.eval_freq,
            n_eval_episodes=self.config.n_eval_episodes
        )
        
        # Train model
        model.learn(
            total_timesteps=stage.timesteps,
            callback=callback,
            reset_num_timesteps=False
        )
        
        # Save stage model
        model_path = f"models/{stage.name.lower().replace(' ', '_')}_model"
        model.save(model_path)
        
        # Evaluate final performance
        mean_reward, std_reward = evaluate_policy(
            model, eval_env, n_eval_episodes=50, deterministic=True
        )
        
        self.logger.info(f"Stage {stage.name} completed - Mean reward: {mean_reward:.2f} ± {std_reward:.2f}")
        
        return model, callback.training_metrics
    
    def train_with_curriculum(self):
        """Train with curriculum learning"""
        if not self.config.use_curriculum:
            return self.train_single_stage()
        
        self.logger.info("Starting curriculum learning training")
        stages = self.create_curriculum_stages()
        
        model = None
        all_metrics = []
        
        for i, stage in enumerate(stages):
            self.logger.info(f"=== Curriculum Stage {i+1}/{len(stages)}: {stage.name} ===")
            
            model, stage_metrics = self.train_curriculum_stage(stage, model)
            all_metrics.extend(stage_metrics)
            
            # Evaluate and potentially save best model
            if stage_metrics:
                latest_reward = stage_metrics[-1].mean_reward
                if latest_reward > self.best_score:
                    self.best_score = latest_reward
                    self.best_model = model
                    model.save("models/best_curriculum_model")
                    self.logger.info(f"New best model saved with reward: {latest_reward:.2f}")
        
        self.training_history = all_metrics
        return model
    
    def train_single_stage(self):
        """Train without curriculum learning"""
        self.logger.info("Starting single-stage training")
        
        # Create full complexity environment
        stage = CurriculumStage(
            name="Full Complexity",
            timesteps=self.config.total_timesteps,
            business_complexity=1.0,
            market_volatility=0.8,
            demand_uncertainty=0.8,
            supplier_reliability=0.5,
            cash_flow_pressure=0.8,
            description="Full business complexity from start"
        )
        
        model, metrics = self.train_curriculum_stage(stage)
        self.training_history = metrics
        return model
    
    def compare_algorithms(self, algorithms: List[str] = None):
        """Compare different RL algorithms"""
        algorithms = algorithms or ["PPO", "SAC", "A2C"]
        self.logger.info(f"Comparing algorithms: {algorithms}")
        
        results = {}
        
        for algo in algorithms:
            if not SB3_AVAILABLE:
                self.logger.warning(f"Cannot test {algo} - stable-baselines3 not available")
                continue
                
            self.logger.info(f"Training with {algo}")
            
            # Create test config
            test_config = TrainingConfig(
                algorithm=algo,
                total_timesteps=100000,  # Shorter for comparison
                use_curriculum=False
            )
            
            # Train model
            trainer = EnhancedTrainingSystem(test_config)
            model = trainer.train_single_stage()
            
            # Evaluate
            eval_env = self.create_vectorized_env(n_envs=1)
            mean_reward, std_reward = evaluate_policy(
                model, eval_env, n_eval_episodes=20, deterministic=True
            )
            
            results[algo] = {
                "mean_reward": mean_reward,
                "std_reward": std_reward,
                "model": model,
                "metrics": trainer.training_history
            }
            
            self.logger.info(f"{algo} results: {mean_reward:.2f} ± {std_reward:.2f}")
        
        # Save comparison results
        with open("results/algorithm_comparison.json", "w") as f:
            comparison_data = {
                algo: {
                    "mean_reward": results[algo]["mean_reward"],
                    "std_reward": results[algo]["std_reward"]
                }
                for algo in results
            }
            json.dump(comparison_data, f, indent=2)
        
        return results
    
    def generate_training_report(self):
        """Generate comprehensive training report"""
        if not self.training_history:
            self.logger.warning("No training history available for report")
            return
        
        # Create plots
        self.plot_training_progress()
        
        # Generate summary statistics
        final_metrics = self.training_history[-1]
        
        report = {
            "training_config": asdict(self.config),
            "training_summary": {
                "total_episodes": len(self.training_history),
                "final_mean_reward": final_metrics.mean_reward,
                "final_std_reward": final_metrics.std_reward,
                "best_reward": self.best_score,
                "training_completed": datetime.now().isoformat()
            },
            "performance_metrics": [asdict(m) for m in self.training_history[-10:]]  # Last 10 evaluations
        }
        
        # Save report
        report_path = f"results/training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2, default=str)
        
        self.logger.info(f"Training report saved to {report_path}")
        
        return report
    
    def plot_training_progress(self):
        """Plot training progress and metrics"""
        if not self.training_history:
            return
        
        metrics_df = pd.DataFrame([asdict(m) for m in self.training_history])
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('RL Agent Training Progress', fontsize=16)
        
        # Mean reward over time
        axes[0, 0].plot(metrics_df['timestep'], metrics_df['mean_reward'])
        axes[0, 0].fill_between(
            metrics_df['timestep'],
            metrics_df['mean_reward'] - metrics_df['std_reward'],
            metrics_df['mean_reward'] + metrics_df['std_reward'],
            alpha=0.3
        )
        axes[0, 0].set_title('Mean Reward Over Time')
        axes[0, 0].set_xlabel('Timesteps')
        axes[0, 0].set_ylabel('Reward')
        axes[0, 0].grid(True)
        
        # Episode length
        axes[0, 1].plot(metrics_df['timestep'], metrics_df['episode_length'])
        axes[0, 1].set_title('Episode Length Over Time')
        axes[0, 1].set_xlabel('Timesteps')
        axes[0, 1].set_ylabel('Episode Length')
        axes[0, 1].grid(True)
        
        # Loss functions
        axes[1, 0].plot(metrics_df['timestep'], metrics_df['policy_loss'], label='Policy Loss')
        axes[1, 0].plot(metrics_df['timestep'], metrics_df['value_loss'], label='Value Loss')
        axes[1, 0].plot(metrics_df['timestep'], metrics_df['entropy_loss'], label='Entropy Loss')
        axes[1, 0].set_title('Training Losses')
        axes[1, 0].set_xlabel('Timesteps')
        axes[1, 0].set_ylabel('Loss')
        axes[1, 0].legend()
        axes[1, 0].grid(True)
        
        # Learning rate
        axes[1, 1].plot(metrics_df['timestep'], metrics_df['learning_rate'])
        axes[1, 1].set_title('Learning Rate Schedule')
        axes[1, 1].set_xlabel('Timesteps')
        axes[1, 1].set_ylabel('Learning Rate')
        axes[1, 1].grid(True)
        
        plt.tight_layout()
        plt.savefig(f'results/training_progress_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        self.logger.info("Training progress plots saved")

def main():
    """Main training function"""
    print("Enhanced RL Agent Training System")
    print("=" * 50)
    
    if not SB3_AVAILABLE:
        print("Error: stable-baselines3 not installed!")
        print("Install with: pip install stable-baselines3[extra]")
        return
    
    # Training configuration
    config = TrainingConfig(
        algorithm="PPO",
        total_timesteps=500000,
        use_curriculum=True,
        eval_freq=5000,
        save_freq=25000
    )
    
    # Create training system
    trainer = EnhancedTrainingSystem(config)
    
    # Train with curriculum learning
    print("Starting enhanced training with curriculum learning...")
    model = trainer.train_with_curriculum()
    
    # Generate comprehensive report
    trainer.generate_training_report()
    
    # Optional: Compare algorithms
    if input("Run algorithm comparison? (y/n): ").lower() == 'y':
        trainer.compare_algorithms()
    
    print("\n" + "=" * 50)
    print("Enhanced training completed!")
    print(f"Best model reward: {trainer.best_score:.2f}")
    print("Check 'results/' directory for detailed reports and plots")

if __name__ == "__main__":
    main() 