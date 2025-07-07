import os
import json
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.callbacks import EvalCallback
from stable_baselines3.common.monitor import Monitor
from restocking_env import RestockingEnv


class RestockingAgent:
    """
    Reinforcement Learning agent for SME restocking decisions using PPO.
    """
    
    def __init__(self, model_path: str = "models/restocking_agent.zip"):
        self.model_path = model_path
        self.model = None
        self.env = None
        self.training_stats = {
            "episodes_trained": 0,
            "total_timesteps": 0,
            "best_reward": -float('inf'),
            "training_history": []
        }
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
    def create_environment(self, n_envs: int = 1) -> None:
        """Create the training environment"""
        if n_envs == 1:
            self.env = Monitor(RestockingEnv())
        else:
            self.env = make_vec_env(RestockingEnv, n_envs=n_envs)
    
    def create_model(self, learning_rate: float = 3e-4, verbose: int = 1) -> None:
        """Create a new PPO model"""
        if self.env is None:
            self.create_environment()
        
        self.model = PPO(
            "MlpPolicy",
            self.env,
            learning_rate=learning_rate,
            n_steps=2048,
            batch_size=64,
            n_epochs=10,
            gamma=0.99,
            gae_lambda=0.95,
            clip_range=0.2,
            verbose=verbose,
            tensorboard_log="./tensorboard_logs/"
        )
    
    def train(self, total_timesteps: int = 50000, save_freq: int = 10000) -> None:
        """Train the agent"""
        if self.model is None:
            self.create_model()
        
        print(f"Starting training for {total_timesteps} timesteps...")
        
        # Create evaluation environment
        eval_env = Monitor(RestockingEnv())
        eval_callback = EvalCallback(
            eval_env,
            best_model_save_path="./models/",
            log_path="./logs/",
            eval_freq=save_freq,
            deterministic=True,
            render=False
        )
        
        # Train the model
        self.model.learn(
            total_timesteps=total_timesteps,
            callback=eval_callback,
            progress_bar=False  # Disable progress bar to avoid dependency issues
        )
        
        # Save the final model
        self.save_model()
        
        # Update training stats
        self.training_stats["total_timesteps"] += total_timesteps
        self.training_stats["episodes_trained"] += total_timesteps // 30  # Approximate episodes
        
        print(f"Training completed! Model saved to {self.model_path}")
    
    def load_model(self) -> bool:
        """Load a pre-trained model"""
        try:
            if os.path.exists(self.model_path):
                self.model = PPO.load(self.model_path)
                print(f"Model loaded from {self.model_path}")
                return True
            else:
                print(f"No model found at {self.model_path}")
                return False
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def save_model(self) -> None:
        """Save the current model"""
        if self.model is not None:
            self.model.save(self.model_path)
            print(f"Model saved to {self.model_path}")
    
    def predict(self, observation: np.ndarray, deterministic: bool = True) -> int:
        """Make a prediction given an observation"""
        if self.model is None:
            raise ValueError("Model not loaded or trained. Call load_model() or train() first.")
        
        action, _ = self.model.predict(observation, deterministic=deterministic)
        return int(action)
    
    def generate_recommendations(self, n_episodes: int = 5) -> Dict[str, Any]:
        """Generate business recommendations by running the trained agent"""
        if self.model is None:
            if not self.load_model():
                raise ValueError("No trained model available. Train the model first.")
        
        # Create a single environment for inference
        test_env = RestockingEnv()
        
        all_recommendations = []
        total_profits = []
        
        print(f"Generating recommendations from {n_episodes} episodes...")
        
        for episode in range(n_episodes):
            obs, info = test_env.reset()
            episode_profit = 0
            episode_actions = []
            
            for step in range(30):  # 30 days per episode
                action = self.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = test_env.step(action)
                
                episode_profit += info.get("daily_profit", 0)
                
                if info.get("restock_quantity", 0) > 0:
                    episode_actions.append({
                        "day": step + 1,
                        "action": "restock",
                        "quantity": info["restock_quantity"],
                        "expected_roi": f"{((info['units_sold'] * 20 - info['restock_quantity'] * 10) / max(info['restock_quantity'] * 10, 1)) * 100:.1f}%",
                        "inventory_level": info["current_inventory"],
                        "daily_demand": info["daily_demand"]
                    })
                
                if terminated or truncated:
                    break
            
            total_profits.append(episode_profit)
            all_recommendations.extend(episode_actions)
        
        # Calculate summary statistics
        avg_profit = np.mean(total_profits)
        best_actions = sorted(all_recommendations, key=lambda x: float(x["expected_roi"].replace('%', '')), reverse=True)[:3]
        
        # Generate final recommendation
        if best_actions:
            best_action = best_actions[0]
            recommendation = {
                "action": best_action["action"],
                "quantity": best_action["quantity"],
                "expected_roi": best_action["expected_roi"],
                "confidence": "high" if len(best_actions) >= 3 else "medium",
                "reasoning": f"Based on {n_episodes} simulation episodes with average profit of ${avg_profit:.2f}",
                "timestamp": datetime.now().isoformat(),
                "alternative_actions": best_actions[1:3] if len(best_actions) > 1 else []
            }
        else:
            recommendation = {
                "action": "monitor",
                "quantity": 0,
                "expected_roi": "0%",
                "confidence": "low",
                "reasoning": "No profitable restocking opportunities identified",
                "timestamp": datetime.now().isoformat(),
                "alternative_actions": []
            }
        
        return recommendation
    
    def evaluate_performance(self, n_episodes: int = 10) -> Dict[str, float]:
        """Evaluate the agent's performance"""
        if self.model is None:
            if not self.load_model():
                raise ValueError("No trained model available.")
        
        test_env = RestockingEnv()
        episode_rewards = []
        episode_profits = []
        
        for _ in range(n_episodes):
            obs, info = test_env.reset()
            episode_reward = 0
            
            for _ in range(30):
                action = self.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = test_env.step(action)
                episode_reward += reward
                
                if terminated or truncated:
                    break
            
            episode_rewards.append(episode_reward)
            episode_profits.append(info["total_profit"])
        
        return {
            "mean_reward": np.mean(episode_rewards),
            "std_reward": np.std(episode_rewards),
            "mean_profit": np.mean(episode_profits),
            "std_profit": np.std(episode_profits),
            "max_profit": np.max(episode_profits),
            "min_profit": np.min(episode_profits)
        } 