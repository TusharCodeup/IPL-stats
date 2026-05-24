import re
import os

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

teams = {
    'CSK': 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg',
    'MI': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg',
    'RCB': 'https://upload.wikimedia.org/wikipedia/en/d/d4/Royal_Challengers_Bengaluru_Logo.svg',
    'KKR': 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg',
    'SRH': 'https://upload.wikimedia.org/wikipedia/en/5/51/Sunrisers_Hyderabad_Logo.svg',
    'RR': 'https://upload.wikimedia.org/wikipedia/en/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg',
    'DC': 'https://upload.wikimedia.org/wikipedia/en/2/2f/Delhi_Capitals.svg',
    'PBKS': 'https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg',
    'GT': 'https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg',
    'LSG': 'https://upload.wikimedia.org/wikipedia/en/3/34/Lucknow_Super_Giants_Logo.svg'
}

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


# Process players
with open('src/data/iplLegends.js', 'r', encoding='utf-8') as f:
    content = f.read()

for p, url in players.items():
    thumb_url = to_thumb(url)
    
    if f"player: '{p}'" in content:
        # Check if image already exists
        if re.search(r"player:\s*'" + re.escape(p) + r"'.*?image:\s*'", content, re.DOTALL):
            content = re.sub(
                r"(player:\s*'" + re.escape(p) + r"'.*?image:\s*')[^']+'",
                r"\g<1>" + thumb_url + "'",
                content,
                flags=re.DOTALL
            )
        else:
            # add image
            content = re.sub(
                r"(player:\s*'" + re.escape(p) + r"'.*?emoji:\s*'[^']+'),?",
                r"\1, image: '" + thumb_url + "',",
                content,
                flags=re.DOTALL
            )

with open('src/data/iplLegends.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Process teams
with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

for short, url in teams.items():
    thumb_url = to_thumb(url, width=150)
    content = re.sub(
        r"(short:\s*'" + re.escape(short) + r"'.*?logo:\s*')[^']+'",
        r"\g<1>" + thumb_url + "'",
        content,
        flags=re.DOTALL
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated JS files with Wikipedia thumb URLs")
