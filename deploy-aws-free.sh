#!/bin/bash

# RankBeacon SEO Exorcist - FREE AWS Deployment (EC2 Free Tier)
# Uses t2.micro (750 hours/month free for 12 months)

set -e

echo "👻 RankBeacon SEO Exorcist - FREE AWS Deployment"
echo "================================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Run: brew install awscli"
    exit 1
fi

# Check AWS config
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Run: aws configure"
    exit 1
fi

AWS_REGION=${AWS_REGION:-us-east-1}
KEY_NAME="rankbeacon-key"
SECURITY_GROUP_NAME="rankbeacon-sg"

echo "✅ AWS Region: $AWS_REGION"
echo ""

# Create key pair if doesn't exist
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $AWS_REGION &> /dev/null; then
    echo "🔑 Creating SSH key pair..."
    aws ec2 create-key-pair --key-name $KEY_NAME --region $AWS_REGION --query 'KeyMaterial' --output text > $KEY_NAME.pem
    chmod 400 $KEY_NAME.pem
    echo "✅ Key saved to $KEY_NAME.pem"
else
    echo "✅ Key pair already exists"
fi

# Get default VPC
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text)
echo "✅ Using VPC: $VPC_ID"

# Create security group if doesn't exist
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $AWS_REGION &> /dev/null 2>&1; then
    echo "🔒 Creating security group..."
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "RankBeacon SEO Exorcist" \
        --vpc-id $VPC_ID \
        --region $AWS_REGION \
        --query 'GroupId' \
        --output text)
    
    # Allow SSH
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION
    # Allow HTTP
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
    # Allow HTTPS
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION
    
    echo "✅ Security group created: $SG_ID"
else
    SG_ID=$(aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text)
    echo "✅ Security group exists: $SG_ID"
fi

# Get latest Ubuntu AMI (free tier eligible)
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
    --region $AWS_REGION \
    --output text)

echo "✅ Using AMI: $AMI_ID (Ubuntu 22.04)"
echo ""

# Create user data script
cat > user-data.sh << 'EOF'
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Install git
apt-get install -y git

# Clone repository (you'll need to update this URL)
cd /home/ubuntu
# git clone https://github.com/yourusername/rankbeacon-seo-exorcist.git
# cd rankbeacon-seo-exorcist

# For now, create a simple nginx page
apt-get install -y nginx
cat > /var/www/html/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head><title>RankBeacon SEO Exorcist</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>👻 RankBeacon SEO Exorcist</h1>
    <p>Server is running! SSH in to complete setup.</p>
    <p>Instance is ready for deployment.</p>
</body>
</html>
HTML

systemctl enable nginx
systemctl start nginx

echo "Setup complete!" > /home/ubuntu/setup-complete.txt
EOF

echo "🚀 Launching EC2 instance (t2.micro - FREE TIER)..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=RankBeacon-SEO-Exorcist}]" \
    --region $AWS_REGION \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "✅ Instance launched: $INSTANCE_ID"
echo ""
echo "⏳ Waiting for instance to be running..."

aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $AWS_REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo ""
echo "🎉 SUCCESS! Instance is running!"
echo "================================"
echo ""
echo "📋 Instance Details:"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IP: $PUBLIC_IP"
echo "   Type: t2.micro (FREE TIER)"
echo "   Region: $AWS_REGION"
echo ""
echo "🔗 Access:"
echo "   Web: http://$PUBLIC_IP"
echo "   SSH: ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
echo ""
echo "📝 Next Steps:"
echo "1. Wait 2-3 minutes for setup to complete"
echo "2. SSH into instance: ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
echo "3. Clone your repo: git clone https://github.com/yourusername/rankbeacon-seo-exorcist.git"
echo "4. Run: cd rankbeacon-seo-exorcist && docker compose up -d"
echo ""
echo "💡 To deploy your code:"
echo "   scp -i $KEY_NAME.pem -r . ubuntu@$PUBLIC_IP:~/rankbeacon/"
echo ""
echo "🛑 To stop instance (save costs):"
echo "   aws ec2 stop-instances --instance-ids $INSTANCE_ID --region $AWS_REGION"
echo ""
echo "🗑️  To terminate instance:"
echo "   aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $AWS_REGION"
echo ""
echo "Happy haunting! 👻"

# Cleanup
rm user-data.sh
