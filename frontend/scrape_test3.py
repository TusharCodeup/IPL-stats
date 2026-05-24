import requests
from bs4 import BeautifulSoup
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0'
}
r = requests.get('https://www.iplt20.com/stats/2026', headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

scripts = soup.find_all('script')
for s in scripts:
    if s.string and 'stats' in s.string.lower() and 'api' in s.string.lower():
        print("Found API reference:", s.string[:500])

# Just dump all unique URLs found in scripts
urls = re.findall(r'https?://[^\s\"\']+(?:api|v1|v2|stats)[^\s\"\']+', r.text)
print("Found URLs:", list(set(urls))[:20])

