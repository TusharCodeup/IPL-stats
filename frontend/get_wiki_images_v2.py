import wikipedia
import re

players = ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Suresh Raina', 'Jasprit Bumrah', 'AB de Villiers', 'Chris Gayle', 'Ravindra Jadeja', 'David Warner', 'Andre Russell', 'Sunil Narine', 'Shikhar Dhawan', 'KL Rahul', 'Yuzvendra Chahal', 'Jos Buttler', 'Rashid Khan', 'Shubman Gill', 'Ruturaj Gaikwad', 'Travis Head', 'Yashasvi Jaiswal', 'Pat Cummins']
teams_names = {'CSK': 'Chennai Super Kings', 'MI': 'Mumbai Indians', 'RCB': 'Royal Challengers Bangalore', 'KKR': 'Kolkata Knight Riders', 'SRH': 'Sunrisers Hyderabad', 'RR': 'Rajasthan Royals', 'DC': 'Delhi Capitals', 'PBKS': 'Punjab Kings', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'}

player_urls = {}
team_urls = {}

def get_page_image(title):
    try:
        page = wikipedia.page(title, auto_suggest=True)
        if page.images:
            for img in page.images:
                if img.endswith('.jpg') or img.endswith('.png') or img.endswith('.svg') or img.endswith('.jpeg'):
                    return img
    except Exception as e:
        pass
    return None

def to_thumb(url, width=300):
    if not url.startswith('https://upload.wikimedia.org/wikipedia/'): return url
    parts = url.split('/')
    filename = parts[-1]
    if filename.endswith('.svg'):
        thumb_filename = f"{width}px-{filename}.png"
    else:
        thumb_filename = f"{width}px-{filename}"
    domain_part = '/'.join(parts[:4])
    repo_part = parts[4]
    hash_part = '/'.join(parts[5:-1])
    return f"{domain_part}/{repo_part}/thumb/{hash_part}/{filename}/{thumb_filename}"


for p in players:
    img = get_page_image(p)
    if img:
        player_urls[p] = to_thumb(img)
        print("Found:", p)
    else:
        # fallback to get_page_image with 'cricketer'
        img = get_page_image(p + " cricketer")
        if img:
            player_urls[p] = to_thumb(img)
            print("Found (with suffix):", p)
        else:
            print("Missing:", p)

for short, full in teams_names.items():
    img = get_page_image(full)
    if img:
        team_urls[short] = to_thumb(img, width=150)
        print("Found team:", full)
    else:
        print("Missing team:", full)


with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p, thumb_url in player_urls.items():
    if re.search(r"player:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + thumb_url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + thumb_url + "',",
            content,
            flags=re.DOTALL
        )
        
    if re.search(r"name:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + thumb_url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(name:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + thumb_url + "',",
            content,
            flags=re.DOTALL
        )

with open('src/data/iplLegends.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

for short, thumb_url in team_urls.items():
    content = re.sub(
        r"(short:\s*'" + re.escape(short) + r"'.*?logo:\s*')[^']+'",
        r"\g<1>" + thumb_url + "'",
        content,
        flags=re.DOTALL
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated JS files")
