from playwright.sync_api import sync_playwright
import sys
import os

def run_smoke_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # We need to set geolocation in new_context
        context = browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 48.8566, 'longitude': 2.3522},
            viewport={'width': 390, 'height': 844}, # iPhone-like for mobile-first
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()
        
        # Capture console logs
        page.on("console", lambda msg: print(f"🖥️ Browser console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"💥 Browser error: {exc}"))

        port = os.environ.get('PORT', '3123')
        url = f'http://localhost:{port}'
        
        try:
            print(f"🚀 Navigating to {url}...")
            page.goto(url)
            
            print("⏳ Waiting for domcontentloaded...")
            page.wait_for_load_state('domcontentloaded')
            
            # Check for loading screen
            loading_text = "text=Chargement..."
            if page.locator(loading_text).is_visible():
                print("⏳ Loading screen is visible.")
                
            # Wait for map to appear - it could take time
            print("⏳ Waiting for .leaflet-container (timeout 60s)...")
            try:
                page.wait_for_selector('.leaflet-container', timeout=60000)
                print("✅ Map container (Leaflet) found!")
            except Exception as e:
                print(f"❌ Leaflet container NOT found after 60s.")
                # Try to take a screenshot to see what's on screen
                page.screenshot(path='debug-screen.png')
                sys.exit(1)

            # Check for specific UI elements
            print("⏳ Final checks...")
            page.wait_for_timeout(2000)
            
            if "LVL 12" in page.content():
                print("✅ LVL 12 found!")
            else:
                print("❌ LVL 12 not found.")
                
            if page.locator('button.bg-red-500').is_visible():
                print("✅ Pokéball found!")
            else:
                print("❌ Pokéball not visible.")
                sys.exit(1)

            print("🎉 Smoke test passed!")
            
        except Exception as e:
            print(f"💥 Exception in script: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_smoke_test()
