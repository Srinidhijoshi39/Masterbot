# trading_bot.py - For PC3
import requests
import time
import json

# PC2 Master Bot API URL (replace with your master bot server IP)
MASTER_BOT_URL = "http://localhost:5000"  # Update with your master bot server IP
BOT_ID = "BA0001"  # Get this from registration

def verify_bot():
    """Verify bot with PC2 Master Bot"""
    try:
        response = requests.post(f"{MASTER_BOT_URL}/verify", 
                               json={"bot_id": BOT_ID})
        return response.json().get('authorized', False)
    except Exception as e:
        print(f"Verification failed: {e}")
        return False

def start_trading():
    """Main trading function"""
    print(f"PC3 Trading Bot starting...")
    print(f"Connecting to PC2 Master Bot at: {MASTER_BOT_URL}")
    
    if verify_bot():
        print("✅ Bot authorized by PC2 Master Bot")
        print("🚀 Starting trading operations...")
        
        # Trading loop
        trade_count = 0
        while True:
            try:
                trade_count += 1
                print(f"Trade #{trade_count} - Bot ID: {BOT_ID}")
                
                # Your trading logic here
                # Example: place orders, check positions, etc.
                
                time.sleep(5)  # Wait 5 seconds between trades
                
            except KeyboardInterrupt:
                print("\n⏹️ Trading stopped by user")
                break
            except Exception as e:
                print(f"Trading error: {e}")
                time.sleep(10)
    else:
        print("❌ Bot not authorized by PC2 Master Bot")
        print("Please register first or check bot status")

if __name__ == "__main__":
    start_trading()