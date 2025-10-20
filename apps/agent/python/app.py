from datetime import datetime

def run():
    print(f"[agent] online @ {datetime.utcnow().isoformat()}Z")

if __name__ == "__main__":
    run()
