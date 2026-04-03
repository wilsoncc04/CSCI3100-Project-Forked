# Cucumber BDD Testing with React.js (Chrome Setup)

To run the Cucumber tests (BDD) that involve JavaScript/React, you need **Google Chrome** and a matching **Chromedriver** installed on your system.

These instructions target Ubuntu (including WSL) and provide a small helper script included in this repository to install Chromedriver.

## Quick install (recommended)
Run the included installer from the repository root. It will detect your installed Chrome major version and install a matching Chromedriver into `/usr/local/bin`.

```bash
# from the repo root
./installchromedriver.bash
# if you see permission errors, re-run with sudo to allow moving the binary to /usr/local/bin
sudo ./installchromedriver.bash
```

The script requires `curl` and `unzip` (and `jq` only for a fallback path). If they're missing, install them via:

```bash
sudo apt update && sudo apt install -y curl unzip wget
# jq is optional but useful for a fallback JSON lookup
sudo apt install -y jq
```

## Manual install (if you prefer)
If you want to install manually, the script uses the standard ChromeDriver storage mapping by Chrome major version. The equivalent manual steps are:

```bash
# find Chrome major version
google-chrome --version
CHROME_MAJOR=$(google-chrome --version | cut -d' ' -f3 | cut -d'.' -f1)
# get a matching ChromeDriver version
CHROMEDRIVER_VERSION=$(curl -sS "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR}")
curl -sS -o /tmp/chromedriver.zip "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
unzip /tmp/chromedriver.zip -d /tmp
sudo mv /tmp/chromedriver /usr/local/bin/chromedriver
sudo chmod +x /usr/local/bin/chromedriver
chromedriver --version
```

## Running Cucumber Tests
Once Chrome and Chromedriver are installed, run the cucumber features that need JavaScript:

```bash
bundle exec cucumber features/react_works.feature
bundle exec cucumber features/search_and_filter.feature
```

## Troubleshooting
- **Chrome not found**: Install Google Chrome first and re-run `installchromedriver.bash`.
- **Permission issues**: The script moves the binary to `/usr/local/bin` with `sudo`. Re-run using `sudo` if needed.
- **Missing tools**: If `curl`/`unzip`/`jq` are missing, install them with `sudo apt install -y curl unzip jq`.
- **Headless**: The project uses `selenium_chrome_headless` for CI/WSL environments without a display.

If you want me to run the installer locally and verify it here, tell me and I'll execute it and report results.
