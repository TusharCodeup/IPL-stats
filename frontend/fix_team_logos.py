import re

with open('src/data/iplTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

teams = ['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'RR', 'DC', 'PBKS', 'GT', 'LSG']

for short in teams:
    local_url = f"/assets/teams/{short}.svg"
    content = re.sub(
        r"(short:\s*'" + re.escape(short) + r"'.*?logo:\s*')[^']+'",
        r"\g<1>" + local_url + "'",
        content,
        flags=re.DOTALL
    )

with open('src/data/iplTeams.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated iplTeams.js")
