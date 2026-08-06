# PostgreSQL backup and restore

`make backup` creates a custom-format logical dump and SHA-256 sidecar in the ignored `backups/` directory. `make restore BACKUP=/exact/path.dump` verifies that checksum, deploys a separate `postgres-restore` StatefulSet and PVC, restores into `reliability_restore`, and writes measured RTO, row counts, and deterministic table checksums to ignored raw results.

The restore never writes to the application database or its PVC. Remove the isolated target only after reviewing the report:

```bash
kubectl delete statefulset,service postgres-restore -n sre-lab
kubectl delete pvc data-postgres-restore-0 -n sre-lab
```

This is a logical, crash-consistent local snapshot. It does not provide point-in-time recovery, WAL archiving, encrypted off-site retention, automated rotation, or a production-grade RPO. The reported RPO is the age of the supplied dump; the reported RTO covers isolated target creation through verification.
