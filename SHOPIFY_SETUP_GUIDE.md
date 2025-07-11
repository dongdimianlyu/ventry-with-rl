# Shopify Integration Setup Guide

This guide will help you set up the complete Shopify integration for Ventry, including OAuth authentication, business intelligence analysis, and task generation enhancement.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000

# Shopify Integration Configuration
SHOPIFY_CLIENT_ID=your_shopify_app_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_app_client_secret
SHOPIFY_REDIRECT_URI=fhttp://localhost:3000/api/shopify/callback
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
```

### 2. Create a Shopify App

1. **Go to Shopify Partners Dashboard**
   - Visit [partners.shopify.com](https://partners.shopify.com)
   - Create a partner account if you don't have one
   - Click "Create app" → "Create app manually"

2. **Configure App Settings**
   - **App name**: Ventry Task Generator
   - **App URL**: `http://localhost:3000` (for development)
   - **Allowed redirection URL(s)**: `http://localhost:3000/api/shopify/callback`

3. **Set App Permissions**
   - `read_orders` - View order history and sales data
   - `read_products` - Access product information and inventory
   - `read_customers` - View customer profiles and metrics
   - `read_inventory` - Monitor stock levels
   - `read_analytics` - Access sales reports and metrics
   - `read_reports` - Generate business intelligence

4. **Get App Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Add them to your `.env.local` file

### 3. Configure Webhooks (Optional)

For real-time updates, configure webhooks in your Shopify app:

1. **Webhook Endpoints**:
   - `http://localhost:3000/api/shopify/webhooks`
   - Format: JSON
   - Events: `orders/create`, `orders/updated`, `products/create`, `products/update`, `customers/create`

2. **Generate Webhook Secret**:
   ```bash
   openssl rand -base64 32
   ```
   Add this to your `.env.local` as `SHOPIFY_WEBHOOK_SECRET`

## 🏗️ Integration Architecture

### Components Overview

```
src/
├── types/index.ts                 # TypeScript definitions
├── lib/
│   ├── shopify.ts                # Core Shopify API client
│   ├── shopify-insights.ts       # Business intelligence engine
│   ├── shopify-task-integration.ts # Task generation integration
│   └── shopify-privacy.ts        # Data privacy controls
├── components/shopify/
│   └── ShopifyConnectionModal.tsx # Connection UI
└── app/api/shopify/
    ├── connect/route.ts          # OAuth initiation
    ├── callback/route.ts         # OAuth callback
    ├── sync/route.ts             # Data synchronization
    ├── disconnect/route.ts       # Connection removal
    └── webhooks/route.ts         # Webhook handling
```

### Data Flow

1. **Connection**: User connects via OAuth → Store access token
2. **Sync**: Fetch data from Shopify API → Generate insights
3. **Integration**: Include insights in task generation prompts
4. **Updates**: Webhooks trigger real-time data updates

## 🧪 Testing the Integration

### 1. Basic Connection Test

```bash
# Start the development server
npm run dev

# Navigate to settings page
open http://localhost:3000/dashboard/settings

# Click "Connect Shopify Store"
# Enter a test store domain (e.g., "test-store")
```

### 2. API Endpoints Test

Test each API endpoint individually:

```bash
# Test OAuth initiation
curl -X POST http://localhost:3000/api/shopify/connect \
  -H "Content-Type: application/json" \
  -d '{"shopDomain": "test-store", "userId": "test-user"}'

# Test connection status
curl http://localhost:3000/api/shopify/sync?userId=test-user

# Test disconnection
curl -X POST http://localhost:3000/api/shopify/disconnect \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

### 3. Task Generation Test

1. Connect a Shopify store with some data
2. Generate tasks from the dashboard
3. Verify that Shopify insights are included in the context
4. Check that tasks are more business-specific

### 4. Demo Mode (No Real Store Required)

The integration includes demo data for testing without a real Shopify store:

```typescript
// In your component or API route
import { generateMockShopifyData } from '@/lib/shopify-insights'

const demoData = generateMockShopifyData()
// Use this data to test the UI and business logic
```

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for production
- Rotate secrets regularly

### 2. OAuth Security
- State parameter prevents CSRF attacks
- Tokens are stored securely (localStorage for demo, database for production)
- Webhook signatures are verified

### 3. Data Privacy
- Only request minimum required permissions
- Implement data retention policies
- Provide user data export/deletion

## 🚀 Production Deployment

### 1. Environment Setup

For production deployment (e.g., Vercel):

```env
NEXTAUTH_URL=https://your-domain.com
SHOPIFY_REDIRECT_URI=https://your-domain.com/api/shopify/callback
SHOPIFY_APP_URL=https://your-domain.com
```

### 2. Database Migration

The current implementation uses localStorage for demo purposes. For production:

1. **Replace localStorage with database**:
   - User connections
   - Business insights
   - Privacy settings
   - Usage logs

2. **Recommended schema**:
   ```sql
   CREATE TABLE shopify_connections (
     id UUID PRIMARY KEY,
     user_id UUID NOT NULL,
     shop_domain VARCHAR(255) NOT NULL,
     access_token TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE shopify_insights (
     id UUID PRIMARY KEY,
     user_id UUID NOT NULL,
     insights_data JSONB NOT NULL,
     generated_at TIMESTAMP DEFAULT NOW()
   );
   ```

### 3. Monitoring and Logging

Add monitoring for:
- API rate limits
- Connection health
- Task generation performance
- User engagement metrics

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Ensure `SHOPIFY_REDIRECT_URI` matches your app settings
   - Check that the URL is accessible from the internet

2. **API Rate Limiting**
   - Monitor the rate limit headers
   - Implement exponential backoff
   - Use webhooks instead of polling

3. **Webhook Verification Failed**
   - Verify `SHOPIFY_WEBHOOK_SECRET` is correct
   - Check webhook signature calculation
   - Ensure webhook URL is accessible

4. **Task Generation Not Enhanced**
   - Verify Shopify data is being fetched
   - Check that insights are being generated
   - Ensure task generation includes Shopify context

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
DEBUG=shopify:*
NODE_ENV=development
```

## 📊 Business Intelligence Features

### Generated Insights

1. **Sales Performance**
   - Revenue trends and growth rates
   - Order volume and average order value
   - Seasonal patterns and forecasts

2. **Customer Analytics**
   - Customer lifetime value
   - Repeat purchase rates
   - Churn analysis and retention

3. **Product Performance**
   - Top-selling products by revenue/units
   - Inventory turnover rates
   - Low stock alerts

4. **Operational Metrics**
   - Fulfillment performance
   - Geographic sales distribution
   - Channel performance analysis

### Task Generation Enhancement

The integration enhances task generation with:

- **Business Context**: Current performance metrics
- **Urgent Alerts**: Inventory issues, fulfillment delays
- **Growth Opportunities**: Underperforming products, market trends
- **Operational Tasks**: Inventory management, customer service

## 🔄 Maintenance and Updates

### Regular Tasks

1. **Monitor API Usage**: Stay within Shopify's rate limits
2. **Update Insights**: Refresh business intelligence data
3. **Review Permissions**: Ensure minimal required access
4. **Security Audits**: Regular review of access tokens and webhooks

### Shopify API Updates

- Monitor Shopify's API changelog
- Test new API versions before upgrading
- Update type definitions as needed

## 📞 Support

For issues with the Shopify integration:

1. Check the troubleshooting section above
2. Review Shopify's API documentation
3. Test with demo data first
4. Check browser console for errors

## 🎯 Next Steps

Once the integration is working:

1. **Collect User Feedback**: How are the enhanced tasks performing?
2. **Optimize Insights**: Refine business intelligence algorithms
3. **Expand Integrations**: Consider other e-commerce platforms
4. **Advanced Features**: Predictive analytics, automated task scheduling

---

*This integration transforms Ventry from a generic task generator into a business-intelligent assistant that understands your e-commerce operations and provides contextually relevant, actionable recommendations.* 