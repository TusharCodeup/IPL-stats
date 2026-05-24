import os
import re
import json

copied_images = {
  "Ajinkya Rahane": "/images/players/Ajinkya_Rahane.jpg",
  "Anil Kumble": "/images/players/Anil_Kumble.jpg",
  "Ashish Nehra": "/images/players/Ashish_Nehra.jpg",
  "Bhuvneshwar Kumar": "/images/players/Bhuvneshwar_Kumar.jpg",
  "Cheteshwar Pujara": "/images/players/Cheteshwar_Pujara.jpg",
  "Dinesh Karthik": "/images/players/Dinesh_Karthik.jpg",
  "Gautam Gambhir": "/images/players/Gautam_Gambhir.jpg",
  "Harbhajan Singh": "/images/players/Harbhajan_Singh.jpg",
  "Hardik Pandya": "/images/players/Hardik_Pandya.jpg",
  "Ishant Sharma": "/images/players/Ishant_Sharma.jpg",
  "Mayank Agarwal": "/images/players/Mayank_Agarwal.jpg",
  "MS Dhoni": "/images/players/MS_Dhoni.jpg",
  "Piyush Chawla": "/images/players/Piyush_Chawla.jpg",
  "Rahul Dravid": "/images/players/Rahul_Dravid.jpg",
  "Ravichandran Ashwin": "/images/players/Ravichandran_Ashwin.jpg",
  "Ravindra Jadeja": "/images/players/Ravindra_Jadeja.jpg",
  "Rishabh Pant": "/images/players/Rishabh_Pant.jpg",
  "Rohit Sharma": "/images/players/Rohit_Sharma.jpg",
  "Sachin Tendulkar": "/images/players/Sachin_Tendulkar.jpeg",
  "Shikhar Dhawan": "/images/players/Shikhar_Dhawan.jpg",
  "Sourav Ganguly": "/images/players/Sourav_Ganguly.jpg",
  "Suresh Raina": "/images/players/Suresh_Raina.jpg",
  "Vinod Kambli": "/images/players/Vinod_Kambli.jpg",
  "Virat Kohli": "/images/players/Virat_Kohli.JPG",
  "Virender Sehwag": "/images/players/Virender_Sehwag.png",
  "Yuvraj Singh": "/images/players/Yuvraj_Singh.jpg",
  "Zaheer Khan": "/images/players/Zaheer_Khan.jpg"
}

files_to_update = [
    r"src\data\iplLegends.js",
    r"src\data\iplStats.js",
    r"src\components\BattingLeaders.jsx",
    r"src\components\BowlingLeaders.jsx"
]

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    for player, img_path in copied_images.items():
        # This regex looks for `name: 'Player Name', ... image: 'old_url'` and replaces `old_url`.
        # It's a bit complex because the image property might be before or after the name property, 
        # or it might be in an array.
        # Let's use a simpler approach: just find `name: 'Player Name'` and then replace the very next `image: '...'`
        # OR we can just do line by line.
        
        # Let's try line by line for files where name and image are on the same line (like iplLegends.js and iplStats.js)
        # For multiline (like BattingLeaders.jsx), it's trickier.
        pass

    # A better approach: 
    # For each player, if player name is in the content, replace their image.
    for player, img_path in copied_images.items():
        # Match pattern where name is near the image
        # iplLegends.js: { name: 'Virat Kohli', ..., image: '...' }
        pattern1 = re.compile(rf"(name:\s*['\"]{player}['\"].*?image:\s*['\"])([^'\"]+)(['\"])", re.DOTALL)
        content, count1 = pattern1.subn(r"\g<1>" + img_path + r"\g<3>", content)
        
        # BattingLeaders.jsx / BowlingLeaders.jsx:
        # name: 'Virat Kohli',
        # value: '...',
        # label: '...',
        # image: '...'
        # Let's just use the same regex with DOTALL, it should work for both if image comes AFTER name.
        
        # What if image comes before name? In our code, name is always before image.
        
        # Wait, BattingLeaders has:
        # name: 'Virat Kohli',
        # ...
        # image: '...',
        # ...
        # realImg: '...'
        
        pattern2 = re.compile(rf"(name:\s*['\"]{player}['\"].*?realImg:\s*['\"])([^'\"]+)(['\"])", re.DOTALL)
        content, count2 = pattern2.subn(r"\g<1>" + img_path + r"\g<3>", content)
        
        # In iplStats.js:
        # player: "Virat Kohli", ... image: "..."
        pattern3 = re.compile(rf"(player:\s*['\"]{player}['\"].*?image:\s*['\"])([^'\"]+)(['\"])", re.DOTALL)
        content, count3 = pattern3.subn(r"\g<1>" + img_path + r"\g<3>", content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

for f in files_to_update:
    update_file(f)

