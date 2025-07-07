# SME Restocking RL Agent

A reinforcement learning agent that generates intelligent restocking recommendations for small and medium enterprises (SMEs) based on inventory levels, demand patterns, and business constraints.

## Overview

This RL agent uses **Proximal Policy Optimization (PPO)** to learn optimal restocking strategies by simulating business scenarios and maximizing profit while minimizing costs. The agent considers:

- Current inventory levels
- Demand trends and seasonality
- Storage costs and stockout penalties
- Expected return on investment (ROI)

## Features

- **Real RL Training**: Uses Stable-Baselines3 with PPO algorithm
- **Custom Business Environment**: Simulates realistic SME inventory scenarios
- **Actionable Recommendations**: Outputs concrete restocking decisions
- **ROI Calculations**: Provides expected return on investment
- **Modular Design**: Easy integration with existing systems
- **Performance Monitoring**: Tracks training progress and model performance

## Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify Installation**:
   ```bash
   python -c "import stable_baselines3; print('Installation successful!')"
   ```

## Quick Start

### 1. Train the Agent

```bash
# Basic training (50,000 timesteps)
python train.py

# Custom training duration
python train.py --timesteps 100000

# Demo the environment without training
python train.py --demo
```

### 2. Generate Recommendations

```bash
# Generate recommendations using trained model
python inference.py

# Generate with custom parameters
python inference.py --episodes 10 --output my_recommendations.json
```

### 3. Evaluate Performance

```bash
# Evaluate existing model
python train.py --eval
```

## File Structure

```
rl-agent/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── train.py                 # Main training script
├── inference.py             # Recommendation generation
├── rl_agent.py              # RL agent implementation
├── restocking_env.py        # Custom environment
├── models/                  # Trained models (created after training)
│   ├── restocking_agent.zip
│   └── best_model.zip
├── logs/                    # Training logs
├── tensorboard_logs/        # TensorBoard logs
├── recommendations.json     # Generated recommendations
└── training_results.json   # Training metrics
```

## Usage Examples

### Basic Training and Recommendation Generation

```python
from rl_agent import RestockingAgent

# Initialize and train agent
agent = RestockingAgent()
agent.create_environment()
agent.create_model()
agent.train(total_timesteps=50000)

# Generate recommendations
recommendations = agent.generate_recommendations(n_episodes=5)
print(f"Recommendation: {recommendations['action']} {recommendations['quantity']} units")
```

### Integration with Main Application

```python
import json
import os
from rl_agent.inference import get_current_recommendation

# Get current recommendation
recommendation = get_current_recommendation()

# Use in your application
if recommendation['action'] == 'restock':
    quantity = recommendation['quantity']
    expected_roi = recommendation['expected_roi']
    print(f"Suggested action: Restock {quantity} units (Expected ROI: {expected_roi})")
```

## Output Format

The agent generates recommendations in the following JSON format:

```json
{
  "action": "restock",
  "quantity": 60,
  "expected_roi": "15.2%",
  "confidence": "high",
  "reasoning": "Based on 5 simulation episodes with average profit of $245.30",
  "timestamp": "2024-01-15T10:30:00",
  "alternative_actions": [
    {
      "quantity": 40,
      "expected_roi": "12.8%"
    }
  ],
  "generated_at": "2024-01-15T10:30:00",
  "model_type": "PPO",
  "simulation_episodes": 5
}
```

## Environment Details

### State Space
- **Inventory Level**: Current stock (0-500 units)
- **Days Remaining**: Time left in episode (0-30 days)
- **Demand Trend**: Market demand multiplier (0.1-3.0)
- **Season Factor**: Seasonal adjustment (0.5-2.0)

### Action Space
- **0**: No restocking
- **1-10**: Restock 10-100 units (increments of 10)

### Reward Function
The agent maximizes daily profit considering:
- **Revenue**: Units sold × selling price ($20/unit)
- **Costs**: Restock cost ($10/unit) + storage cost ($0.50/unit/day)
- **Penalties**: Stockout penalty ($50 when out of stock)

## Training Parameters

Default PPO configuration:
- **Learning Rate**: 3e-4
- **Batch Size**: 64
- **Training Steps**: 2048 per update
- **Epochs**: 10 per update
- **Discount Factor**: 0.99
- **GAE Lambda**: 0.95

## Performance Monitoring

### TensorBoard
Monitor training progress:
```bash
tensorboard --logdir=tensorboard_logs
```

### Training Metrics
Check `training_results.json` for:
- Mean episode reward
- Profit statistics
- Training duration
- Model performance

## Integration Guide

### 1. Direct Integration
```python
# Add to your main application
import sys
sys.path.append('path/to/rl-agent')
from inference import get_current_recommendation

recommendation = get_current_recommendation()
```

### 2. API Integration
```python
# Create a simple API endpoint
from flask import Flask, jsonify
from inference import get_current_recommendation

app = Flask(__name__)

@app.route('/api/recommendations')
def get_recommendations():
    return jsonify(get_current_recommendation())
```

### 3. Scheduled Updates
```python
# Run recommendations on schedule
import schedule
import time
from inference import load_and_generate_recommendations

def update_recommendations():
    load_and_generate_recommendations(n_episodes=5)

schedule.every().hour.do(update_recommendations)

while True:
    schedule.run_pending()
    time.sleep(1)
```

## Customization

### Environment Parameters
Modify `restocking_env.py` to adjust:
- Maximum inventory capacity
- Cost structure
- Demand patterns
- Episode length

### Model Architecture
Modify `rl_agent.py` to customize:
- Neural network architecture
- Training hyperparameters
- Evaluation metrics

## Troubleshooting

### Common Issues

1. **Import Errors**:
   ```bash
   # Ensure all dependencies are installed
   pip install -r requirements.txt
   ```

2. **Training Slow**:
   ```bash
   # Reduce training timesteps for faster iteration
   python train.py --timesteps 10000
   ```

3. **No Model Found**:
   ```bash
   # Train model first
   python train.py
   ```

4. **Memory Issues**:
   - Reduce batch size in `rl_agent.py`
   - Use fewer parallel environments

### Performance Tips

- Use GPU acceleration if available (PyTorch with CUDA)
- Monitor training with TensorBoard
- Adjust hyperparameters based on your specific use case
- Use evaluation callbacks to save best models

## Next Steps

1. **Customize Environment**: Modify the environment to match your specific business constraints
2. **Hyperparameter Tuning**: Experiment with different learning rates and network architectures
3. **Multi-Product Support**: Extend to handle multiple product categories
4. **Real Data Integration**: Connect to actual inventory and sales data
5. **A/B Testing**: Compare RL recommendations against existing strategies

## License

This RL agent is part of the Ventry project and follows the same licensing terms.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review training logs in `logs/` directory
3. Examine TensorBoard metrics
4. Test with demo mode: `python train.py --demo` 