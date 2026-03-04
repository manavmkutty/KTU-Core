import requests
import sys

URLS = [
    'http://127.0.0.1:8000/api/curriculum/schemes/',
    'http://127.0.0.1:8000/api/curriculum/subjects_list/2019/CS/S1/'
]

def check():
    for url in URLS:
        print(f"Checking {url}...")
        try:
            res = requests.get(url)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                print(f"Data: {res.json()}")
            else:
                print(f"Error: {res.text}")
        except Exception as e:
            print(f"Failed to connect: {e}")

if __name__ == '__main__':
    check()
