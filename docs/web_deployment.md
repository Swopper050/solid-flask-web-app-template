# Web Deployment

In order to dpeloy the web app, you need a VPS which you can log into using ssh.
The server we use has Ubuntu 24.04 installed with OpenSSH.
Next, add an .ssh/ directory with a file named `authorized_keys` in which you put your own
_public_ ssh key.

### What happens during deployment for staging and production

##### Staging
When merging to develop, a new deploy pipeline is automatically started for staging. The steps are:
 1. build new `ui` and `api` docker images
 2. tag these with the current version and `latest`
 3. use `scp` to copy the newest `docker-compose.staging.yml` and `nginx.staging.conf` to the staging server
 4. use `ssh` to log onto the server to stop, pull and bring up all images.
 5. run all pending database migrations
 6. pls work


##### Production
On a version tag (i.e. v0.0.1) on the `main` branch, Github Actions runs a pipeline that will:
 1. build new `ui` and `api` docker images
 2. tag these with the current version and `stable`
 3. use `scp` to copy the newest `docker-compose.prod.yml` and `nginx.prod.conf` to the server
 4. use `ssh` to log onto the server to stop, pull and bring up all images.
 5. run all pending database migrations
 6. pls work


### Server requirements/configuration
We host the application (production and staging) on one VPS with separate users for staging and production. The following describes how to setup
one VPS with all these requirements.

1. Add a production user with root privileges to the server:
```bash
sudo adduser mysolidapp
sudo usermod -aG sudo mysolidapp
su - mysolidapp
cd ~
mkdir .ssh
touch .ssh/authorized_keys
# Add your public ssh key to the authorized keys
```

2. Add a staging user with root privileges to the server:
```bash
sudo adduser mysolidapp-staging
sudo usermod -aG sudo mysolidapp-staging
su - mysolidapp-staging
cd ~
mkdir .ssh
touch .ssh/authorized_keys
# Add your public ssh key to the authorized keys
```

3. [Install docker with docker compose](https://docs.docker.com/engine/install/ubuntu/). Make sure you can run docker without sudo (both your production and staging user), it is enabled as service and you are logged in (`docker login`).

4. Setup firewall (sometimes you might need to also allow mail ports!):
```bash
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 8080
sudo ufw allow 8443
sudo ufw enable
```

### SSL certificates

#### Initial Setup
1. Install certbot:
```bash
sudo apt install certbot
```

2. Generate initial certificates using standalone mode and fix permissions:

For production (as production user):
```bash
sudo certbot certonly --standalone --preferred-challenges http \
  -d my-solid-app.nl -d www.my-solid-app.nl
```

For staging (as staging user):
```bash
sudo certbot certonly --standalone --preferred-challenges http \
  -d staging.my-solid-app.nl -d www.staging.my-solid-app.nl
```

#### Certificate Renewal
- **Production**: Certificates are automatically renewed by the certbot container included in the docker-compose.prod.yml file. Certificates are stored in the default location at `/etc/letsencrypt/`.
- **Staging**: Certificates **might** automatically be renewed when running on 1 VPS, but only because of the certbot container of production. If you are running the staging application on a different VPS the certificate is not automatically renewed. 


### Allow Github Actions to push and pull docker images
Add the following secrets (Github Actions uses these) to your Github repository:
```bash
DOCKERHUB_NAMESPACE=<namespace>
DOCKERHUB_USERNAME=<username>
DOCKERHUB_TOKEN=<token>
```


### Allow Github Actions to log into the server with ssh
1. Generate a new production ssh key for your project:
```bash
ssh-keygen -t ed25519 -a 200 -C "b.dewit@applyai.nl"
```
2. Save the keys in an external password manager.
3. Add the public ssh key to the `~/.ssh/authorized_keys` file for your production user on the VPS.
4. Add the following secrets to your Github repository:
```bash
MY_SOLID_APP_VPS_HOST=<ip4_address>
MY_SOLID_APP_VPS_USER=<vps_user>
MY_SOLID_APP_VPS_PORT=22  # Unless otherwise configured on the VPS.
MY_SOLID_APP_VPS_SSH_KEY=<private_production_ssh_key>
```
5. Now we can use `appleboy/scp-action@v0.1.7` and `appleboy/ssh-action@1.0.3` in Github Actions for the production user.
6. Generate also a new staging ssh key for your project and add them to the `~/.ssh/authorized_keys` file for your staging user on the VPS.
7. Add the following secrets to your Github repository:
```bash
MY_SOLID_APP_STAGING_VPS_HOST=<ip4_address>
MY_SOLID_APP_STAGING_VPS_USER=<staging_vps_user>
MY_SOLID_APP_STAGING_VPS_PORT=22  # Unless otherwise configured on the VPS.
MY_SOLID_APP_STAGING_VPS_SSH_KEY=<private_staging_ssh_key>
```


### Make sure all secrets required in the deployment action are configured:
```bash
MYSQL_ROOT_PASSWORD=<db_root_password>
MY_SOLID_APP_DB_NAME=<db_name>
MY_SOLID_APP_DB_USER=<db_user>
MY_SOLID_APP_DB_PASSWORD=<db_password>

MY_SOLID_APP_SECRET_KEY=<flask_secret_key>
MY_SOLID_APP_FERNET_SECRET_KEY=<fernet_secret_key>

MY_SOLID_APP_MAIL_SERVER=smtp.server.com
MY_SOLID_APP_MAIL_PORT=465
MY_SOLID_APP_MAIL_USERNAME=<mail_username>
MY_SOLID_APP_MAIL_PASSWORD=<mail_password>
MY_SOLID_APP_MAIL_DEFAULT_SENDER=<default_mail_address>


MYSQL_ROOT_PASSWORD_STAGING=<db_root_password>
MY_SOLID_APP_STAGING_DB_NAME=<db_name>
MY_SOLID_APP_STAGING_DB_USER=<db_user>
MY_SOLID_APP_STAGING_DB_PASSWORD=<db_password>

MY_SOLID_APP_STAGING_SECRET_KEY=<flask_secret_key>
MY_SOLID_APP_STAGING_FERNET_SECRET_KEY=<fernet_secret_key>

MY_SOLID_APP_STAGING_MAIL_SERVER=smtp.server.com
MY_SOLID_APP_STAGING_MAIL_PORT=465
MY_SOLID_APP_STAGING_MAIL_USERNAME=<mail_username>
MY_SOLID_APP_STAGING_MAIL_PASSWORD=<mail_password>
MY_SOLID_APP_STAGING_MAIL_DEFAULT_SENDER=<default_mail_address>
```
