# Kubernetes Deployment

In order to deploy the app, we'll need two things: a Kubernetes cluster
and a VPS for persistent data (MariaDB).

## Setting up the VPS

First set up the VPS used for MariaDB. Make sure you have a VPS where you
can log in using SSH.

### Update the VPS

```bash
sudo su -

apt update && apt upgrade -y
```

### Setup the firewall

```bash
# Enable firewall
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow OpenSSH

# Allow DB only from your k8s node
ufw allow from <k8s_node_ip> to any port 3306 proto tcp

ufw enable
ufw status
```

### Install MariaDB

```bash
sudo apt install mariadb-server -y
sudo vim /etc/mysql/mariadb.conf.d/50-server.cnf
# Update the bind address to `0.0.0.0`
sudo systemctl restart mariadb
sudo mysql_secure_installation
sudo mysql
```

Now add the database user for either staging or prod:

```mysql
CREATE DATABASE my_solid_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'my_solid_app'@'%' IDENTIFIED BY '<PASSWORD>';
GRANT ALL PRIVILEGES ON my_solid_app_db.* TO 'my_solid_app'@'%';
FLUSH PRIVILEGES;
EXIT;
```

For staging, do the same with a separate database:

```mysql
CREATE DATABASE my_solid_app_staging_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'my_solid_app_staging'@'%' IDENTIFIED BY '<PASSWORD>';
GRANT ALL PRIVILEGES ON my_solid_app_staging_db.* TO 'my_solid_app_staging'@'%';
FLUSH PRIVILEGES;
EXIT;
```

To load a backup, first dump from the old database:

```bash
docker exec my-solid-app-db-1 sh -c 'mariadb-dump -umy_solid_app -p"<password>" "my_solid_app_db"' > ./my_solid_app.sql
```

Then load it into the new database:

```bash
cp my_solid_app.sql my_solid_app.original.sql
sed -i 's/utf8mb4_uca1400_ai_ci/utf8mb4_unicode_ci/g' my_solid_app.sql
sudo mysql
```

```mysql
DROP DATABASE IF EXISTS my_solid_app_db;
CREATE DATABASE my_solid_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
mysql -u my_solid_app -p -D my_solid_app_db < my_solid_app.sql
```

## Setting up the Kubernetes cluster

### Create namespaces

Apply the namespace manifests once. This only creates the namespaces — it does **not** start any deployments:

```bash
kubectl apply -f config/k8s/my-solid-app-prod.yaml
kubectl apply -f config/k8s/my-solid-app-staging.yaml
```

The namespaces just need to exist before the first deploy. The actual deployments, services, and ingresses are applied by GitHub Actions (or manually via `kubectl apply -k config/k8s/overlays/staging`) as part of the normal deploy flow.

### Update the DB host and domains in kustomization overlays

Set the actual VPS IP address and your domain names in both overlays before deploying:

```yaml
# config/k8s/overlays/prod/kustomization.yaml
- MY_SOLID_APP_DB_HOST="<vps_ip>"
# Also replace app.my-solid-app.com and api.my-solid-app.com with your actual domains

# config/k8s/overlays/staging/kustomization.yaml
- MY_SOLID_APP_DB_HOST="<vps_ip>"
# Also replace staging.app.my-solid-app.com and staging.api.my-solid-app.com with your actual domains
```

Also replace `<dockerhub-namespace>` in `config/k8s/app/*.yaml` with your actual DockerHub namespace.

### Install cluster infrastructure (ingress-nginx, cert-manager, ClusterIssuer)

Run the setup script once per cluster. Skip if these are already installed (e.g. shared with another app on the same cluster):

```bash
chmod +x config/k8s/setup-infra.sh
./config/k8s/setup-infra.sh
```

This installs ingress-nginx and cert-manager via Helm and applies the Let's Encrypt ClusterIssuer.

### DNS

Point the following DNS records to your cluster's load balancer IP (`kubectl get services -n ingress-nginx`):

| Domain | Environment |
|---|---|
| `app.my-solid-app.com` | Production UI |
| `api.my-solid-app.com` | Production API |
| `staging.app.my-solid-app.com` | Staging UI |
| `staging.api.my-solid-app.com` | Staging API |

## Setting up GitHub Actions

### DockerHub secrets

```
DOCKERHUB_NAMESPACE=<namespace>
DOCKERHUB_USERNAME=<username>
DOCKERHUB_TOKEN=<token>
```

### Kubeconfig secrets

Export the kubeconfig for each cluster and add it as a secret:

```bash
cat ~/.kube/config | base64
```

```
KUBECONFIG_STAGING=<base64-encoded kubeconfig>
KUBECONFIG_PROD=<base64-encoded kubeconfig>
```

### Application secrets

**Production:**

```
MY_SOLID_APP_SECRET_KEY=<flask_secret_key>
MY_SOLID_APP_FERNET_SECRET_KEY=<fernet_secret_key>

MY_SOLID_APP_DB_USER=<db_user>
MY_SOLID_APP_DB_PASSWORD=<db_password>

MY_SOLID_APP_MAIL_SERVER=smtp.server.com
MY_SOLID_APP_MAIL_USERNAME=<mail_username>
MY_SOLID_APP_MAIL_PASSWORD=<mail_password>
MY_SOLID_APP_MAIL_DEFAULT_SENDER=<default_mail_address>
```

**Staging:**

```
MY_SOLID_APP_STAGING_SECRET_KEY=<flask_secret_key>
MY_SOLID_APP_STAGING_FERNET_SECRET_KEY=<fernet_secret_key>

MY_SOLID_APP_STAGING_DB_USER=<db_user>
MY_SOLID_APP_STAGING_DB_PASSWORD=<db_password>

MY_SOLID_APP_STAGING_MAIL_SERVER=smtp.server.com
MY_SOLID_APP_STAGING_MAIL_USERNAME=<mail_username>
MY_SOLID_APP_STAGING_MAIL_PASSWORD=<mail_password>
MY_SOLID_APP_STAGING_MAIL_DEFAULT_SENDER=<default_mail_address>
```
