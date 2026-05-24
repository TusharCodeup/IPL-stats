import os
import re
import time
import urllib.request
from duckduckgo_search import DDGS

players = ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Suresh Raina', 'Jasprit Bumrah', 'AB de Villiers', 'Chris Gayle', 'Ravindra Jadeja', 'David Warner', 'Andre Russell', 'Sunil Narine', 'Shikhar Dhawan', 'KL Rahul', 'Yuzvendra Chahal', 'Jos Buttler', 'Rashid Khan', 'Shubman Gill', 'Ruturaj Gaikwad', 'Travis Head', 'Yashasvi Jaiswal', 'Pat Cummins']
teams_names = {'CSK': 'Chennai Super Kings', 'MI': 'Mumbai Indians', 'RCB': 'Royal Challengers Bangalore', 'KKR': 'Kolkata Knight Riders', 'SRH': 'Sunrisers Hyderabad', 'RR': 'Rajasthan Royals', 'DC': 'Delhi Capitals', 'PBKS': 'Punjab Kings', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'}

os.makedirs('public/assets/players', exist_ok=True)
os.makedirs('public/assets/teams', exist_ok=True)

ddgs = DDGS()
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def download_image(query, dest):
    if os.path.exists(dest):
        return True
    try:
        results = list(ddgs.images(query, max_results=3))
        for res in results:
            img_url = res['image']
            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as response, open(dest, 'wb') as out_file:
                    out_file.write(response.read())
                return True
            except Exception as e:
                continue
    except Exception as e:
        print(f"Search failed for {query}: {e}")
    return False

player_success = []
for p in players:
    dest = f"public/assets/players/{p.replace(' ', '_')}.jpg"
    if download_image(f"{p} IPL profile picture", dest):
        player_success.append(p)
        print(f"Downloaded {p}")
    else:
        print(f"Failed to download {p}")
    time.sleep(1)

team_success = []
for short, full in teams_names.items():
    dest = f"public/assets/teams/{short}.png"
    if download_image(f"{full} logo PNG transparent", dest):
        team_success.append(short)
        print(f"Downloaded {full}")
    else:
        print(f"Failed to download {full}")
    time.sleep(1)

# Update iplLegends.js
with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p in player_success:
    local_url = f"/assets/players/{p.replace(' ', '_')}.jpg"
    # Update moment array
    content = re.sub(
        r"(player:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
        r"\1, image: '" + local_url + "',",
        content,
        flags=re.DOTALL
    )
    # Update stats array
    if re.search(r"name:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + local_url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + local_url + "',",
            content,
            flags=re.DOTALL
        )

with open('src/data/iplLegends.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Update iplTeams.js
with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

for short in team_success:
    local_url = f"/assets/teams/{short}.png"
    content = re.sub(
        r"(short:\s*'" + re.escape(short) + r"'.*?logo:\s*')[^']+'",
        r"\g<1>" + local_url + "'",
        content,
        flags=re.DOTALL
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("All done!")
