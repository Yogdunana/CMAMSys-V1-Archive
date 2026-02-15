#!/bin/bash

# MailDev Start Script
# 本地邮件服务器启动脚本

echo "📧 Starting MailDev for local email testing..."

# Check if maildev is installed
if ! command -v maildev &> /dev/null
then
    echo "❌ MailDev is not installed. Installing..."
    npx maildev &
else
    echo "✅ MailDev found"
    maildev &
fi

echo "✅ MailDev started on http://localhost:1080"
echo "📧 SMTP server listening on port 1025"
echo ""
echo "View emails at: http://localhost:1080"
