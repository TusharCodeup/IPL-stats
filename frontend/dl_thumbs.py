import os
import urllib.request
import time
import re

players = {
    'Virat Kohli': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',
    'MS Dhoni': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/MS_Dhoni_in_2023.jpg',
    'Rohit Sharma': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Rohit_Sharma_November_2023.jpg',
    'Suresh Raina': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Suresh_Raina_IPL_2018.jpg',
    'Jasprit Bumrah': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jasprit_Bumrah.jpg',
    'AB de Villiers': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/AB_de_Villiers_at_practice.jpg',
    'Chris Gayle': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Chris_Gayle_2.jpg',
    'Ravindra Jadeja': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ravindra_Jadeja_in_PMO_New_Delhi.jpg',
    'David Warner': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/David_Warner_cropped.jpg',
    'Andre Russell': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Andre_Russell_cropped.jpg',
    'Sunil Narine': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Sunil_Narine_cropped.jpg',
    'Shikhar Dhawan': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Shikhar_Dhawan_cropped.jpg',
    'KL Rahul': 'https://upload.wikimedia.org/wikipedia/commons/d/df/KL_Rahul_Nov_2023.jpg',
    'Yuzvendra Chahal': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Yuzvendra_Chahal_cropped.jpg',
    'Jos Buttler': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Jos_Buttler_Nov_2023.jpg',
    'Rashid Khan': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rashid_Khan_cropped.jpg',
    'Shubman Gill': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Shubman_Gill_2023_%28cropped%29.jpg',
    'Ruturaj Gaikwad': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ruturaj_Gaikwad.jpeg',
    'Travis Head': 'https://upload.wikimedia.org/wikipedia/commons/2/21/1_21_Travis_Head.jpg',
    'Yashasvi Jaiswal': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Yashasvi_Jaiswal_in_PMO_New_Delhi.jpg',
    'Pat Cummins': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Pat_Cummins.jpg'
}

def to_thumb(url, width=320):
    if not url.startswith('https://upload.wikimedia.org/wikipedia/'): return url
    parts = url.split('/')
    filename = parts[-1]
    thumb_filename = f"{width}px-{filename}"
    domain_part = '/'.join(parts[:4])
    repo_part = parts[4]
    hash_part = '/'.join(parts[5:-1])
    return f"{domain_part}/{repo_part}/thumb/{hash_part}/{filename}/{thumb_filename}"

os.makedirs('public/assets/players', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}

success = []
for p, url in players.items():
    dest = f"public/assets/players/{p.replace(' ', '_')}.jpg"
    thumb_url = to_thumb(url, 320)
    try:
        req = urllib.request.Request(thumb_url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {p}")
        success.append(p)
    except Exception as e:
        print(f"Failed {p}: {e}")
    time.sleep(1)

# Update iplLegends.js
with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p in success:
    local_url = f"/assets/players/{p.replace(' ', '_')}.jpg"
    
    # Check if image already exists in the object. If so, replace it. If not, add it.
    if re.search(r"player:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
            r"\g<1>" + local_url + "'",
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r"(player:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
            r"\1, image: '" + local_url + "',",
            content,
            flags=re.DOTALL
        )
        
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
print("Finished updates.")
