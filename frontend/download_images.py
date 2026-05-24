import os
import time
import urllib.request

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

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

os.makedirs('public/assets/players', exist_ok=True)
os.makedirs('public/assets/teams', exist_ok=True)

for name, url in players.items():
    ext = url.split('.')[-1]
    dest = f"public/assets/players/{name.replace(' ', '_')}.{ext}"
    if os.path.exists(dest):
        continue
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {name}")
        time.sleep(1)
    except Exception as e:
        print(f"Failed {name}: {e}")

for name, url in teams.items():
    ext = url.split('.')[-1]
    dest = f"public/assets/teams/{name}.{ext}"
    if os.path.exists(dest):
        continue
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {name}")
        time.sleep(1)
    except Exception as e:
        print(f"Failed {name}: {e}")
