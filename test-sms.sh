#!/bin/bash

# Test SMS Notification Endpoint
# Replace YOUR_DOMAIN with your actual Vercel deployment URL

DOMAIN="${1:-https://civie.vercel.app}"

echo "Testing SMS endpoint at: $DOMAIN/api/send-sms"
echo ""

# Test the send-sms endpoint with test mode
response=$(curl -s -w "\n%{http_code}" -X POST "$DOMAIN/api/send-sms?test=true" \
  -H "Content-Type: application/json")

# Split response and status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

