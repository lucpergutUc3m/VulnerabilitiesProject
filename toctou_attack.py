import requests
import threading
import time

# Your values
BASE_URL = "http://localhost:8080/api"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjowLCJ1c2VySWQiOjgsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJzdWIiOiJ1c2VyMUB1c2VyLmNvbSIsImp0aSI6IjE4MjViZjNiLTUwYTUtNDQ3Yi1iZTkxLWEzZTVjNzg1NmJjNCIsImlzcyI6IlZ1bG5lcmFibGVBcHAiLCJhdWQiOlsiVnVsbmVyYWJsZUFwcC1Vc2VycyJdLCJpYXQiOjE3NjI2MjI4NjgsImV4cCI6MTc2MjcwOTI2OH0.6_D8g9qorFT-st4sYGgKqDgQro9IQqNepOkTXwRYr_Q"  # Replace with your actual token
QUIZ_ID = 1
NUM_REQUESTS = 10

def send_rating():
    url = f"{BASE_URL}/tests/{QUIZ_ID}/rate"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"rating": 5}  # Rate with 5 stars

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    print(f"Sending {NUM_REQUESTS} concurrent rating requests...")
    start_time = time.time()

    # Create threads
    threads = []
    for _ in range(NUM_REQUESTS):
        thread = threading.Thread(target=send_rating)
        threads.append(thread)
        thread.start()

    # Wait for all to finish
    for thread in threads:
        thread.join()

    end_time = time.time()
    print(f"All requests completed in {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()