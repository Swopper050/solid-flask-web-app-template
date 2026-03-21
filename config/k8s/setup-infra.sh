#!/usr/bin/env bash
set -e

# Ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
# cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  -f infra/ingress-nginx-values.yaml

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set crds.enabled=true

# ClusterIssuer
kubectl apply -f infra/clusterissuer-letsencrypt-http01.yaml
