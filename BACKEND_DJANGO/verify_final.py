import requests

def check():
    base = 'http://127.0.0.1:8000/api'
    urls = [
        f'{base}/curriculum/schemes/',
        f'{base}/curriculum/2019/CS/S1/',
        f'{base}/resources/?scheme=2019&dept=CS&semester=S1&subject_name=LINEAR%20ALGEBRA%20AND%20CALCULUS'
    ]
    
    for url in urls:
        print(f"Testing {url}...")
        try:
            res = requests.get(url)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                print(f"Response: {res.json()[:2] if isinstance(res.json(), list) else res.json()}")
            else:
                print(f"Error: {res.text}")
        except Exception as e:
            print(f"Connection Failed: {e}")

if __name__ == '__main__':
    check()
