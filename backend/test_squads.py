import urllib.request
import json
import re
from bs4 import BeautifulSoup

def get_squads():
    req = urllib.request.Request(
        'https://en.wikipedia.org/w/api.php?action=parse&page=2024_Indian_Premier_League_squads&format=json', 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    res = urllib.request.urlopen(req).read().decode('utf-8')
    data = json.loads(res)
    html = data['parse']['text']['*']
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Find all h3 tags (which contain the team names)
    teams = {}
    for h3 in soup.find_all('h3'):
        span = h3.find('span', class_='mw-headline')
        if not span: continue
        team_name = span.text.strip()
        
        # The next sibling that is a table should be the squad table
        table = h3.find_next_sibling('table')
        if not table or 'vte' in table.get('class', []): continue
        
        players = []
        for tr in table.find_all('tr')[1:]: # Skip header
            tds = tr.find_all(['td', 'th'])
            if len(tds) >= 2:
                # the player name is usually the second or third column depending on if there's a flag
                # Name is usually in a th tag or td tag with an a href
                name_tag = tr.find('th')
                if not name_tag:
                    name_tag = tds[1]
                
                a_tag = name_tag.find('a')
                if a_tag:
                    player_name = a_tag.text.strip()
                    # skip citations like [1]
                    player_name = re.sub(r'\[\d+\]', '', player_name)
                    players.append(player_name)
        
        if players:
            teams[team_name] = players

    for t, p in teams.items():
        print(f"{t}: {len(p)} players")

get_squads()
