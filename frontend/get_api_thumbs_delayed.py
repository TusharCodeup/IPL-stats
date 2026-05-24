import urllib.request
import urllib.parse
import json
import re
import time

players = ['Andre Russell', 'Sunil Narine', 'Shikhar Dhawan', 'KL Rahul', 'Yuzvendra Chahal', 'Jos Buttler', 'Rashid Khan', 'Shubman Gill', 'Ruturaj Gaikwad', 'Travis Head', 'Yashasvi Jaiswal', 'Pat Cummins']
teams_names = {'CSK': 'Chennai Super Kings', 'MI': 'Mumbai Indians', 'RCB': 'Royal Challengers Bangalore', 'KKR': 'Kolkata Knight Riders', 'SRH': 'Sunrisers Hyderabad', 'RR': 'Rajasthan Royals', 'DC': 'Delhi Capitals', 'PBKS': 'Punjab Kings', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'}

player_urls = {}
team_urls = {}

def get_wiki_thumb(title, size=300):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize={size}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'IPLWinApp/2.0 (Bot)'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            for page_id in pages:
                if 'thumbnail' in pages[page_id]:
                    return pages[page_id]['thumbnail']['source']
    except Exception as e:
        print(f"Error fetching {title}: {e}")
    return None

for p in players:
    time.sleep(2)
    img = get_wiki_thumb(p)
    if not img:
        time.sleep(2)
        img = get_wiki_thumb(p + " (cricketer)")
    if img:
        player_urls[p] = img
        print(f"Found {p}: {img}")
    else:
        print(f"Missing {p}")

for short, full in teams_names.items():
    time.sleep(2)
    img = get_wiki_thumb(full, size=200)
    if img:
        team_urls[short] = img
        print(f"Found {short}: {img}")
    else:
        print(f"Missing {short}")

with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p, url in player_urls.items():
    if re.search(r"player:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + url + "',",
            content,
            flags=re.DOTALL
        )
        
    if re.search(r"name:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + url + "',",
            content,
            flags=re.DOTALL
        )

with open('src/data/iplLegends.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

for short, url in team_urls.items():
    content = re.sub(
        r"(short:\s*'" + re.escape(short) + r"'.*?logo:\s*')[^']+'",
        r"\g<1>" + url + "'",
        content,
        flags=re.DOTALL
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates finished!")
