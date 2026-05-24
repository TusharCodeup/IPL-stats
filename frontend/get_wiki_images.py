import urllib.request
import json
import re

players = ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Suresh Raina', 'Jasprit Bumrah', 'AB de Villiers', 'Chris Gayle', 'Ravindra Jadeja', 'David Warner', 'Andre Russell', 'Sunil Narine', 'Shikhar Dhawan', 'KL Rahul', 'Yuzvendra Chahal', 'Jos Buttler', 'Rashid Khan', 'Shubman Gill', 'Ruturaj Gaikwad', 'Travis Head', 'Yashasvi Jaiswal', 'Pat Cummins']
teams_names = {'CSK': 'Chennai Super Kings', 'MI': 'Mumbai Indians', 'RCB': 'Royal Challengers Bangalore', 'KKR': 'Kolkata Knight Riders', 'SRH': 'Sunrisers Hyderabad', 'RR': 'Rajasthan Royals', 'DC': 'Delhi Capitals', 'PBKS': 'Punjab Kings', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'}

player_urls = {}
team_urls = {}

def get_wiki_image(title, width=400):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize={width}"
    req = urllib.request.Request(url, headers={'User-Agent': 'IPLAppBot/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            pages = data['query']['pages']
            for page_id in pages:
                if 'thumbnail' in pages[page_id]:
                    return pages[page_id]['thumbnail']['source']
    except:
        pass
    return None

for p in players:
    img = get_wiki_image(p)
    if img:
        player_urls[p] = img
    else:
        print("Missing:", p)

for short, full in teams_names.items():
    img = get_wiki_image(full)
    if img:
        team_urls[short] = img
    else:
        print("Missing:", full)

with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p in players:
    if p in player_urls:
        # Re-add image to player objects that have emoji
        # format: emoji: '...' } -> emoji: '...', image: 'url' }
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+')(\s*\})",
            r"\1, image: '" + player_urls[p] + r"'\2",
            content
        )

with open('src/data/iplLegends.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

for short, url in team_urls.items():
    # Replace ui-avatars with real team logo
    content = re.sub(
        r"logo:\s*'https://ui-avatars\.com/api/\?name=" + short + r"[^']*'",
        f"logo: '{url}'",
        content
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated JS files with real image URLs")
