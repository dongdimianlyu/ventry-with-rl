import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const envVars = {
    // Slack variables
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID ? 'SET' : 'NOT SET',
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET ? 'SET' : 'NOT SET',
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? 'SET' : 'NOT SET',
    SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI || 'DEFAULT',
    
    // QuickBooks variables  
    QB_CLIENT_ID: process.env.QB_CLIENT_ID ? 'SET' : 'NOT SET',
    QB_CLIENT_SECRET: process.env.QB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    QB_REDIRECT_URI: process.env.QB_REDIRECT_URI || 'DEFAULT',
    QB_SANDBOX: process.env.QB_SANDBOX || 'DEFAULT',
    
    // Alternative naming
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID ? 'SET' : 'NOT SET',
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET ? 'SET' : 'NOT SET',
    
    // Next.js variables
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  }

  return NextResponse.json({
    message: 'Environment Variables Status',
    variables: envVars,
    timestamp: new Date().toISOString()
  })
} 