# DigitalOcean Droplet Setup Guide

## 1. Create a droplet
- Choose Ubuntu 22.04 LTS
- Select a Basic shared CPU plan (at least 2GB RAM/1 CPU)
- Choose your preferred datacenter region
- Add your SSH key or set a password

## 2. Set up DNS records
- Create an A record for 'rosterroyals.com' pointing to your droplet's IP
- Create an A record for 'www.rosterroyals.com' pointing to your droplet's IP

## 3. Initial server setup
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system packages
apt update && apt upgrade -y

# Install Docker and Docker Compose
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Clone repository
git clone -b deploy https://github.com/yourusername/roster-royals.git
cd roster-royals

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

## 4. Post-deployment checks
- Visit https://rosterroyals.com to verify the site is working
- Test user registration and login
- Check that the API endpoints are accessible
