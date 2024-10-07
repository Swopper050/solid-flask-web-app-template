# Web Deployment

In order to dpeloy the web app, you need a VPS which you can log into using ssh.
The server we use has Ubuntu 24.04 installed with OpenSSH.
Next, add an .ssh/ directory with a file named `authorized_keys` in which you put your own
_public_ ssh key.

### What happens during deployment
On a version tag (i.e. v0.0.1) on the `main` branch, Github Actions runs a pipeline that will:
 1. build new `ui` and `api` docker images
 2. tag these with the current version and `latest`
 3. use `scp` to copy the newest `docker-compose.prod.yml` to the server
 4. use `ssh` to log onto the server to stop, pull and bring up all images.
 5. run all pending database migrations
 6. pls work


### Server requirements/configuration
1. [Install docker with docker-compose](https://docs.docker.com/engine/install/ubuntu/).
2. Setup firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```
3. Install certbot:
```bash
sudo apt install certbot 
```
4. Make sure the SSL certificates are renewed automatically by adding this to crontab:
```bash
0 1 * * * sudo certbet renew --standalone
```


### Allow Github Actions to push and pull docker images
Add the following secrets (Github Actions uses these) to your Github repository:
```bash
DOCKERHUB_NAMESPACE=<namespace>
DOCKERHUB_USERNAME=<username>
DOCKERHUB_TOKEN=<token>
```


### Allow Github Actions to log into the server with ssh
1. Generate a new ssh key for your project:
```bash
ssh-keygen -t ed25519 -a 200 -C "b.dewit@applyai.nl"
```
2. Save the keys in an external password manager.
3. Add the public ssh key to the `~/.ssh/authorized_keys` file on the VPS.
4. Add the following secrets to your Github repository:
```bash
MY_SOLID_APP_VPS_HOST=<ip4_address>
MY_SOLID_APP_VPS_USER=<vps_user>
MY_SOLID_APP_VPS_PORT=22  # Unless otherwise configured on the VPS.
MY_SOLID_APP_VPS_SSH_KEY=<private_ssh_key>
```
5. Now we can use `appleboy/scp-action@v0.1.7` and `appleboy/ssh-action@1.0.3` in Github Actions.


### Make sure all secrets required in the deployment action are configured:
```bash
MY_SOLID_APP_DB_NAME=<db_name>
MY_SOLID_APP_DB_USER=<db_user>
MY_SOLID_APP_DB_PASSWORD=<db_password>
MY_SOLID_APP_SECRET_KEY=<flask_secret_key>
MYSQL_ROOT_PASSWORD=<db_root_password>
```
