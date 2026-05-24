import requests
import re
from bs4 import BeautifulSoup
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
r = requests.get('https://www.iplt20.com/photos', headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

images = []
for img in soup.find_all('img'):
    src = img.get('src')
    if src and ('photos' in src or 'images' in src):
        images.append(src)

print(f"Found {len(images)} images.")
for img in images[:10]:
    print(img)

# The actual photos might be fetched via an API call from the page
print("Looking for API calls in script tags...")
scripts = soup.find_all('script')
for s in scripts:
    if s.string and 'photos' in s.string.lower():
        print("Found possible data array!")
