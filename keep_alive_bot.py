import time
import urllib.request
from datetime import datetime

# ==========================================
# CUSTOM PYTHON BOT TO KEEP RENDER APP AWAKE
# ==========================================

# Replace with your actual Render URL
RENDER_URL = "https://qmexai-backend.onrender.com"
# Interval in seconds (14 minutes = 840 seconds)
INTERVAL = 14 * 60

def ping_app():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Pinging {RENDER_URL}...")
    try:
        # A simple GET request down to the URL
        response = urllib.request.urlopen(RENDER_URL)
        print(f"Success! Status Code: {response.getcode()}")
    except urllib.error.URLError as e:
        print(f"Failed to ping. Error: {e.reason}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print(f"Starting Keep-Alive Bot for {RENDER_URL}")
    print(f"The bot will ping the server every {INTERVAL // 60} minutes.")
    print("Press Ctrl+C to stop.")
    
    while True:
        ping_app()
        time.sleep(INTERVAL)
