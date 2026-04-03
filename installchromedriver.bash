#!/usr/bin/env bash
set -euo pipefail

TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

echod() { printf "[installchromedriver] %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echod "Missing required command: $1. Please install it (e.g. sudo apt install $1) and re-run.";
    exit 2
  fi
}

echod "Starting Chromedriver install..."

require_cmd curl
require_cmd unzip
require_cmd awk

# Find a Chrome-like browser binary
CHROME_CMD=""
for c in google-chrome google-chrome-stable chromium-browser chromium; do
  if command -v "$c" >/dev/null 2>&1; then
    CHROME_CMD="$c"
    break
  fi
done

if [[ -z "$CHROME_CMD" ]]; then
  echod "Google Chrome not found. Please install Google Chrome first and re-run this script.";
  exit 2
fi

CHROME_VERSION_FULL=$($CHROME_CMD --version 2>/dev/null | awk '{print $3}')
if [[ -z "$CHROME_VERSION_FULL" ]]; then
  echod "Could not determine Chrome version from $CHROME_CMD";
  exit 2
fi

CHROME_MAJOR=${CHROME_VERSION_FULL%%.*}
echod "Detected Chrome version: ${CHROME_VERSION_FULL} (major: ${CHROME_MAJOR})"

# Prefer the chromedriver.storage.googleapis.com LATEST_RELEASE mapping by major version
echod "Querying matching Chromedriver version for Chrome major ${CHROME_MAJOR}..."
CHROMEDRIVER_VERSION=$(curl -fsS "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR}" || true)

if [[ -z "$CHROMEDRIVER_VERSION" ]]; then
  echod "No direct mapping found for major ${CHROME_MAJOR}. Trying chrome-for-testing JSON for a compatible driver..."
  if command -v jq >/dev/null 2>&1; then
    JSON_URL="https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"
    DOWNLOAD_URL=$(curl -fsS "$JSON_URL" | jq -r --arg major "$CHROME_MAJOR" '.channels[] .downloads.chromedriver[] | select(.platform=="linux64") | select(.version | startswith($major+".")) | .url' 2>/dev/null || true)
    if [[ -n "$DOWNLOAD_URL" ]]; then
      echod "Found chrome-for-testing URL for Chrome major ${CHROME_MAJOR}, downloading..."
      if command -v wget >/dev/null 2>&1; then
        wget -q -O "$TMPDIR/chromedriver.zip" "$DOWNLOAD_URL"
      else
        curl -fsS -o "$TMPDIR/chromedriver.zip" "$DOWNLOAD_URL"
      fi
      unzip -q "$TMPDIR/chromedriver.zip" -d "$TMPDIR"
      sudo mv "$TMPDIR"/chromedriver /usr/local/bin/chromedriver
      sudo chmod +x /usr/local/bin/chromedriver
      echod "Installed chromedriver from chrome-for-testing URL. Verifying..."
      chromedriver --version || true
      echod "Done."
      exit 0
    else
      echod "No matching chrome-for-testing entry found for major ${CHROME_MAJOR}."
    fi
  else
    echod "jq not installed; install jq to enable chrome-for-testing lookups (sudo apt install jq)."
  fi

  echod "Falling back to latest chromedriver from storage.googleapis.com..."
  CHROMEDRIVER_VERSION=$(curl -fsS "https://chromedriver.storage.googleapis.com/LATEST_RELEASE" || true)
fi

echod "Resolved Chromedriver version: ${CHROMEDRIVER_VERSION}"
DOWNLOAD_URL="https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
echod "Downloading: ${DOWNLOAD_URL}"
if command -v wget >/dev/null 2>&1; then
  wget -q -O "$TMPDIR/chromedriver.zip" "$DOWNLOAD_URL"
else
  curl -fsS -o "$TMPDIR/chromedriver.zip" "$DOWNLOAD_URL"
fi

echod "Unpacking..."
unzip -q "$TMPDIR/chromedriver.zip" -d "$TMPDIR"

if [[ ! -f "$TMPDIR/chromedriver" ]]; then
  echod "Chromedriver binary not found inside archive. Aborting.";
  exit 4
fi

echod "Moving chromedriver to /usr/local/bin (sudo may be required)"
sudo mv "$TMPDIR/chromedriver" /usr/local/bin/chromedriver
sudo chmod +x /usr/local/bin/chromedriver

echod "Verifying chromedriver installation..."
chromedriver --version || { echod "chromedriver not found in PATH after install."; exit 5; }

echod "Chromedriver installation complete."
exit 0
