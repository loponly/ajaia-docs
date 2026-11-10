# Teardown

> **Warning — check other usage first.** The Artifact Registry repo `cloud-run-source-deploy`,
> the `(default)` Firestore database and the Cloud Build buckets are shared by *every*
> `gcloud run deploy --source` service in the project. Before deleting any of them, list what
> else uses them. If anything else does, delete only the Ajaia Docs pieces (steps 1, 2a, 3a).

```bash
PROJECT=em4it-461907 REGION=us-central1
gcloud config set project $PROJECT

# 1. Cloud Run service
gcloud run services delete ajaia-docs --region $REGION --quiet

# 2a. Only this app's images
gcloud artifacts docker images delete \
  $REGION-docker.pkg.dev/$PROJECT/cloud-run-source-deploy/ajaia-docs --delete-tags --quiet
# 2b. The whole repo — ONLY if no other service deploys from source
gcloud run services list                      # check first
gcloud artifacts repositories delete cloud-run-source-deploy --location $REGION --quiet

# 3a. Only this app's data: delete the `docs` collection (Firestore console, or:)
gcloud firestore bulk-delete --collection-ids=docs --quiet
# 3b. The whole (default) database — ONLY if nothing else in the project uses it
gcloud firestore databases delete --database='(default)' --quiet

# 4. Source-upload / Cloud Build buckets (check contents and other users first)
gcloud storage buckets list --format='value(name)' | grep -E '^run-sources-|_cloudbuild$'
gcloud storage rm --recursive gs://<bucket-name>
```
