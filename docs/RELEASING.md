# Release process

PatchPulse releases are created from version tags. The release workflow verifies the project, attaches the npm archive to a GitHub Release, and publishes to npm when the `NPM_TOKEN` repository secret is configured.

## One-time npm setup

1. Confirm that the `patchpulse-tui` package name is available on npm.
2. Create an npm automation or granular access token with permission to publish the package.
3. Add it to the GitHub repository as an Actions secret named `NPM_TOKEN`.

Without that secret, the GitHub Release is still created and the npm publishing step is skipped.

## Create a release

1. Update the version in `package.json` and describe the release in `CHANGELOG.md`.
2. Refresh the lockfile with `npm install --package-lock-only` when package metadata or dependencies change.
3. Run the full verification:

   ```bash
   npm ci
   npm run check
   npm pack --dry-run
   ```

4. Commit the release preparation.
5. Create and push a tag that exactly matches the package version:

   ```bash
   git tag v2.2.0
   git push origin main
   git push origin v2.2.0
   ```

The workflow rejects a tag whose version does not match `package.json`, preventing mislabeled releases.
