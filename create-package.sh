#!/bin/bash

# Extract version from package.json
VERSION=$(cat package.json | grep -oP '"version": "\K(\d+\.\d+.\d+)(?=")')

echo "Creating zip package for v$VERSION"
cd dist-prod

# Normalize timestamp to get reproducible zip file
find . -exec touch -t 200810310000 {} +

# Create zip file
zip -r ../joule-v$VERSION.zip *
cd ..

SHA=$(sha512sum -b joule-v$VERSION.zip)
echo "Created joule-v$VERSION.zip (SHA512: $SHA)"
