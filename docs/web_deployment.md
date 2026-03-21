# Web Deployment

The app is deployed to Kubernetes using kubectl and Kustomize. See [setup_k8s.md](setup_k8s.md)
for one-time cluster and VPS setup.

## Deploy flow

### Staging

When pushing to the `develop` branch, GitHub Actions automatically:

1. Builds `ui`, `api`, and `tasks` Docker images tagged with the commit SHA
2. Pushes the images to DockerHub
3. Creates/updates the image pull secret in the cluster
4. Runs `envsubst` on the staging kustomization to inject secrets
5. Sets the image tags to the commit SHA via `kustomize edit set image`
6. Applies the staging overlay with `kubectl apply -k`
7. Waits for rollouts to complete
8. Runs pending database migrations via `kubectl exec`

### Production

On a version tag (e.g. `v1.2.3`), GitHub Actions automatically:

1. Builds `ui`, `api`, and `tasks` Docker images tagged with the version tag
2. Pushes the images to DockerHub
3. Creates/updates the image pull secret in the cluster
4. Runs `envsubst` on the prod kustomization to inject secrets
5. Sets the image tags to the version tag via `kustomize edit set image`
6. Applies the prod overlay with `kubectl apply -k`
7. Waits for rollouts to complete
8. Runs pending database migrations via `kubectl exec`

## Manual deploy

To deploy manually from your local machine:

```bash
# Make sure kubectl is pointed at the right cluster
kubectl config use-context <context>

export MY_SOLID_APP_SECRET_KEY=...
export MY_SOLID_APP_FERNET_SECRET_KEY=...
export MY_SOLID_APP_DB_USER=...
export MY_SOLID_APP_DB_PASSWORD=...
export MY_SOLID_APP_MAIL_SERVER=...
export MY_SOLID_APP_MAIL_USERNAME=...
export MY_SOLID_APP_MAIL_PASSWORD=...
export MY_SOLID_APP_MAIL_DEFAULT_SENDER=...

cd config/k8s/overlays/prod   # or staging

envsubst < kustomization.yaml > kustomization.tmp.yaml
mv kustomization.tmp.yaml kustomization.yaml

kustomize edit set image <dockerhub-namespace>/my-solid-app-api=<dockerhub-namespace>/my-solid-app-api:<tag>
kustomize edit set image <dockerhub-namespace>/my-solid-app-tasks=<dockerhub-namespace>/my-solid-app-tasks:<tag>
kustomize edit set image <dockerhub-namespace>/my-solid-app-ui=<dockerhub-namespace>/my-solid-app-ui:<tag>

kubectl apply -k .
```

## Running DB migrations manually

```bash
kubectl exec deploy/my-solid-app-api -n my-solid-app-prod -- make db_upgrade
# or for staging:
kubectl exec deploy/my-solid-app-api -n my-solid-app-staging -- make db_upgrade
```
