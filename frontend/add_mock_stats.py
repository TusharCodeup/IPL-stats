import re
import random
import json

with open("src/data/iplSquads.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract the array part
match = re.search(r'export const iplSquads = (\[.*?\]);', content, re.DOTALL)
if not match:
    print("Could not find iplSquads array")
    exit(1)

# we can't easily json.loads because it has unquoted keys, e.g. { name: 'MS Dhoni', ... }
# but wait! We can just use a regex to replace each dictionary.
# A simpler way is to just generate the string line by line.

lines = content.split('\n')
new_lines = []

roles = ['Batsman', 'Bowler', 'All-rounder', 'WK-Batsman']

for line in lines:
    if "name:" in line and "team:" in line:
        # Determine a random role
        # If WK or known players, maybe assign based on name? 
        # Random is fine for mock.
        role = random.choice(roles)
        matches = random.randint(5, 150)
        
        if role == 'Batsman' or role == 'WK-Batsman':
            runs = random.randint(500, 5000)
            wickets = random.randint(0, 5)
            sixes = random.randint(10, 200)
            fifties = random.randint(2, 40)
            hundreds = random.randint(0, 5)
            highest = random.randint(50, 120)
            best_bowl = "0/0"
        elif role == 'Bowler':
            runs = random.randint(20, 400)
            wickets = random.randint(30, 150)
            sixes = random.randint(0, 10)
            fifties = random.randint(0, 1)
            hundreds = 0
            highest = random.randint(10, 45)
            best_bowl = f"{random.randint(3,5)}/{random.randint(15,40)}"
        else: # All-rounder
            runs = random.randint(400, 2500)
            wickets = random.randint(20, 100)
            sixes = random.randint(20, 100)
            fifties = random.randint(2, 15)
            hundreds = random.randint(0, 1)
            highest = random.randint(40, 90)
            best_bowl = f"{random.randint(2,4)}/{random.randint(15,35)}"
            
        # remove the trailing " },"
        line = line.replace(" },", "")
        # add the stats
        stats = f", role: '{role}', matches: {matches}, runs: {runs}, wickets: {wickets}, sixes: {sixes}, fifties: {fifties}, hundreds: {hundreds}, highest_score: {highest}, best_bowling: '{best_bowl}' }},"
        new_lines.append(line + stats)
    else:
        new_lines.append(line)

with open("src/data/iplSquads.js", "w", encoding="utf-8") as f:
    f.write('\n'.join(new_lines))

print("Added mock stats!")
