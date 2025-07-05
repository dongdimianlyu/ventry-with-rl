# Shopify Integration Testing Guide

This guide provides comprehensive testing procedures for the Shopify integration in Ventry.

## 🎯 Testing Overview

### Test Categories

1. **Connection Flow Testing** - OAuth, authentication, and setup
2. **Data Synchronization Testing** - API calls, data fetching, and insights generation
3. **UI/UX Testing** - User interface components and interactions
4. **Task Generation Testing** - Enhanced task generation with Shopify context
5. **Error Handling Testing** - Edge cases and error scenarios
6. **Performance Testing** - API rate limits and response times

## 🧪 Test Environment Setup

### Prerequisites

1. **Development Environment**
   ```bash
   npm run dev
   ```

2. **Environment Variables** (create `.env.local`)
   ```env
   OPENAI_API_KEY=your_openai_api_key
   NEXTAUTH_URL=http://localhost:3000
   SHOPIFY_CLIENT_ID=your_shopify_client_id
   SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
   SHOPIFY_REDIRECT_URI=http://localhost:3000/api/shopify/callback
   SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
   ```

3. **Demo Data** (for testing without real Shopify store)
   ```javascript
   // In browser console
   import { storeDemoData } from '@/lib/shopify-demo-data-simple'
   storeDemoData('test-user-id')
   ```

## 📋 Test Cases

### 1. Connection Flow Testing

#### Test 1.1: Basic Connection Flow
**Objective**: Verify complete OAuth connection process

**Steps**:
1. Navigate to `/dashboard/settings`
2. Click "Connect Shopify Store"
3. Verify modal opens with 3 steps (intro, permissions, connect)
4. Navigate through each step
5. Enter valid shop domain (e.g., "demo-store")
6. Verify OAuth URL generation

**Expected Results**:
- Modal displays correctly with proper styling
- Step navigation works smoothly
- Domain validation works (rejects invalid domains)
- OAuth URL is generated correctly
- User is redirected to Shopify (or shows demo success)

**Test Data**:
- Valid domains: "test-store", "demo-shop", "my-store-123"
- Invalid domains: "invalid!", "toolong-domain-name-that-exceeds-limits", "a"

#### Test 1.2: Connection Status Display
**Objective**: Verify connection status is displayed correctly

**Steps**:
1. Connect a demo store (use demo data)
2. Refresh the settings page
3. Verify connection status shows

**Expected Results**:
- Connection shows as "healthy"
- Store name and domain display correctly
- Last sync time is shown
- API usage metrics are displayed
- Webhook status is shown

#### Test 1.3: Disconnection Flow
**Objective**: Verify disconnection works properly

**Steps**:
1. With an active connection, click "Disconnect"
2. Confirm disconnection
3. Verify connection is removed

**Expected Results**:
- Confirmation dialog appears
- Connection is removed from storage
- UI returns to "not connected" state
- All related data is cleaned up

### 2. Data Synchronization Testing

#### Test 2.1: Demo Data Loading
**Objective**: Verify demo data can be loaded and displayed

**Steps**:
1. Open browser console
2. Run demo data setup:
   ```javascript
   // Import and use the simple demo data
   import { storeDemoData } from '@/lib/shopify-demo-data-simple'
   storeDemoData('test-user')
   ```
3. Refresh settings page
4. Verify connection appears

**Expected Results**:
- Demo connection appears in settings
- Connection status shows as healthy
- Demo insights are available

#### Test 2.2: API Endpoint Testing
**Objective**: Verify API endpoints respond correctly

**Steps**:
1. Test connection endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/shopify/connect \
     -H "Content-Type: application/json" \
     -d '{"shopDomain": "demo-store", "userId": "test-user"}'
   ```

2. Test sync endpoint:
   ```bash
   curl http://localhost:3000/api/shopify/sync?userId=test-user
   ```

3. Test disconnect endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/shopify/disconnect \
     -H "Content-Type: application/json" \
     -d '{"userId": "test-user"}'
   ```

**Expected Results**:
- Connect endpoint returns OAuth URL
- Sync endpoint returns connection status and insights
- Disconnect endpoint successfully removes connection

#### Test 2.3: Data Freshness Check
**Objective**: Verify data freshness is tracked correctly

**Steps**:
1. Create connection with demo data
2. Check data freshness status
3. Modify stored data timestamp to be 7+ hours old
4. Refresh and check status

**Expected Results**:
- Fresh data shows as "fresh"
- Stale data shows as "stale"
- Very old data shows as "very_stale"

### 3. UI/UX Testing

#### Test 3.1: Connection Modal UX
**Objective**: Verify modal provides good user experience

**Steps**:
1. Open connection modal
2. Test each step navigation
3. Test form validation
4. Test responsive design

**Expected Results**:
- Modal is centered and properly sized
- Step indicators work correctly
- Form validation provides clear feedback
- Modal is responsive on mobile devices
- Loading states are shown during connection

#### Test 3.2: Connection Status Display
**Objective**: Verify status display is informative and actionable

**Steps**:
1. View connected status
2. Check all displayed metrics
3. Test refresh functionality
4. Test disconnect functionality

**Expected Results**:
- All metrics are clearly labeled
- Status indicators use appropriate colors
- Refresh button works and shows loading state
- Disconnect button requires confirmation

#### Test 3.3: Error State Display
**Objective**: Verify errors are displayed helpfully

**Steps**:
1. Simulate connection errors
2. Simulate API errors
3. Simulate network errors

**Expected Results**:
- Error messages are clear and actionable
- Error states don't break the UI
- Users can recover from errors
- Retry mechanisms work

### 4. Task Generation Testing

#### Test 4.1: Enhanced Task Generation
**Objective**: Verify Shopify data enhances task generation

**Steps**:
1. Connect demo Shopify store
2. Generate tasks from dashboard
3. Compare tasks with and without Shopify data

**Expected Results**:
- Tasks include business-specific context
- Shopify insights are mentioned in task descriptions
- Task priorities reflect business urgency
- Tasks are more actionable and specific

#### Test 4.2: Business Context Integration
**Objective**: Verify business insights are integrated into tasks

**Steps**:
1. Review generated tasks with Shopify connection
2. Check for mentions of:
   - Sales performance
   - Inventory issues
   - Customer metrics
   - Growth opportunities

**Expected Results**:
- Tasks reference specific business metrics
- Inventory alerts generate relevant tasks
- Customer insights drive marketing tasks
- Sales data influences growth tasks

#### Test 4.3: Task Relevance and Quality
**Objective**: Verify enhanced tasks are relevant and high-quality

**Steps**:
1. Generate multiple sets of tasks
2. Evaluate task relevance to business
3. Check task specificity and actionability

**Expected Results**:
- Tasks are specific to the business situation
- Tasks include relevant metrics and context
- Tasks are actionable with clear next steps
- Tasks align with business priorities

### 5. Error Handling Testing

#### Test 5.1: Invalid Shop Domain
**Objective**: Verify proper handling of invalid domains

**Test Data**:
- Empty string
- Special characters: "test@shop", "test.shop!"
- Too long: "a-very-long-domain-name-that-exceeds-shopify-limits"
- Too short: "a"

**Expected Results**:
- Clear error messages for each invalid case
- UI remains functional
- User can correct and retry

#### Test 5.2: Network Errors
**Objective**: Verify handling of network issues

**Steps**:
1. Disconnect from internet
2. Attempt connection
3. Attempt data sync
4. Reconnect and retry

**Expected Results**:
- Network errors are caught and displayed
- UI shows appropriate loading/error states
- Retry mechanisms work when connection restored

#### Test 5.3: API Rate Limiting
**Objective**: Verify proper handling of rate limits

**Steps**:
1. Simulate high API usage
2. Trigger rate limit responses
3. Verify backoff and retry logic

**Expected Results**:
- Rate limit errors are handled gracefully
- Exponential backoff is implemented
- User is informed about rate limiting

### 6. Performance Testing

#### Test 6.1: API Response Times
**Objective**: Verify API endpoints respond within acceptable time

**Steps**:
1. Measure response times for each endpoint
2. Test with various data sizes
3. Monitor performance over time

**Expected Results**:
- Connection endpoint: < 2 seconds
- Sync endpoint: < 5 seconds
- Disconnect endpoint: < 1 second

#### Test 6.2: UI Performance
**Objective**: Verify UI remains responsive

**Steps**:
1. Test modal opening/closing
2. Test large data sets display
3. Test rapid interactions

**Expected Results**:
- Modal opens/closes smoothly
- Large data sets render without lag
- UI remains responsive during operations

#### Test 6.3: Memory Usage
**Objective**: Verify no memory leaks

**Steps**:
1. Monitor memory usage during extended testing
2. Connect/disconnect multiple times
3. Generate many tasks

**Expected Results**:
- Memory usage remains stable
- No memory leaks detected
- Performance doesn't degrade over time

## 🔍 Validation Criteria

### Functional Requirements
- ✅ OAuth connection works end-to-end
- ✅ Data synchronization retrieves business insights
- ✅ Task generation includes Shopify context
- ✅ UI components are responsive and accessible
- ✅ Error handling is comprehensive and user-friendly

### Non-Functional Requirements
- ✅ Performance: API responses < 5 seconds
- ✅ Reliability: 99%+ uptime for core features
- ✅ Security: OAuth tokens handled securely
- ✅ Usability: Clear user flows and feedback
- ✅ Scalability: Handles multiple concurrent users

### Business Requirements
- ✅ Tasks are more business-relevant with Shopify data
- ✅ Users can easily connect and disconnect
- ✅ Business insights are actionable and clear
- ✅ Integration enhances overall Ventry value proposition

## 📊 Test Results Template

### Test Execution Summary
- **Test Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Development/Staging/Production]
- **Browser**: [Chrome/Firefox/Safari/Edge]

### Results
| Test Case | Status | Notes |
|-----------|--------|-------|
| Connection Flow | ✅/❌ | [Details] |
| Data Sync | ✅/❌ | [Details] |
| UI/UX | ✅/❌ | [Details] |
| Task Generation | ✅/❌ | [Details] |
| Error Handling | ✅/❌ | [Details] |
| Performance | ✅/❌ | [Details] |

### Issues Found
1. **Issue**: [Description]
   - **Severity**: High/Medium/Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

## 🚀 Automated Testing (Future)

### Unit Tests
```bash
# When test framework is added
npm test -- --testPathPattern=shopify
```

### Integration Tests
```bash
# API endpoint tests
npm run test:integration -- --grep "shopify"
```

### E2E Tests
```bash
# Full user flow tests
npm run test:e2e -- --spec "shopify-integration.spec.ts"
```

## 📝 Test Checklist

### Pre-Testing
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Demo data available
- [ ] Browser dev tools open

### During Testing
- [ ] Document all steps taken
- [ ] Screenshot any issues
- [ ] Note performance observations
- [ ] Test edge cases

### Post-Testing
- [ ] Clean up test data
- [ ] Document results
- [ ] File any issues found
- [ ] Update test procedures if needed

---

*This testing guide ensures the Shopify integration meets all functional and non-functional requirements while providing a great user experience.* 