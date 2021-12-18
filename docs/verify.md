# Verify Releases

To verify the release, you can check @wbobeirne's signature against the sha256 manifest file. First import the public key:

```sh
curl https://raw.githubusercontent.com/joule-labs/joule-extension/master/keys/wbobeirne.asc | gpg --import
```

Download the manifest and sig file and verify it:

```sh
gpg --verify manifest-[version].wbobeirne.sig manifest-[version].txt
```

Now that we have a verified manifest, we'll verify the contents of the zip file. Download and unzip the zip file, and run `sha256sum -c` against the manifest.

```sh
cd joule-[version]
sha256sum -c ../manifest-[version].txt --ignore-missing
```

You should see a series of files and `OK` next to them if the hashes match.

## Build & verify with docker

You can also build your own release and manifest with `yarn build:docker`, then verify the sha256sums using the `manifest.txt` file in `docker-dist/manifest.txt`
