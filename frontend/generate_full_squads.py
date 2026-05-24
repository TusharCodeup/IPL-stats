import time
import urllib.request
import urllib.parse
import json

squads = {
    "CSK": ["MS Dhoni", "Ruturaj Gaikwad", "Ravindra Jadeja", "Ajinkya Rahane", "Deepak Chahar", "Shivam Dube", "Moeen Ali", "Mitchell Santner", "Devon Conway", "Matheesha Pathirana", "Maheesh Theekshana", "Daryl Mitchell", "Rachin Ravindra", "Shardul Thakur", "Sameer Rizvi", "Mustafizur Rahman"],
    "DC": ["Rishabh Pant", "David Warner", "Prithvi Shaw", "Axar Patel", "Kuldeep Yadav", "Mitchell Marsh", "Anrich Nortje", "Ishant Sharma", "Mukesh Kumar", "Khaleel Ahmed", "Tristan Stubbs", "Jake Fraser-McGurk", "Abishek Porel", "Ricky Bhui", "Shai Hope", "Jhye Richardson"],
    "GT": ["Shubman Gill", "Rashid Khan", "David Miller", "Sai Sudharsan", "Rahul Tewatia", "Vijay Shankar", "Mohammed Shami", "Mohit Sharma", "Noor Ahmad", "Kane Williamson", "Wriddhiman Saha", "Umesh Yadav", "Spencer Johnson", "Shahrukh Khan", "Azmatullah Omarzai", "Sai Kishore"],
    "KKR": ["Shreyas Iyer", "Andre Russell", "Sunil Narine", "Rinku Singh", "Varun Chakaravarthy", "Venkatesh Iyer", "Nitish Rana", "Mitchell Starc", "Phil Salt", "Rahmanullah Gurbaz", "Harshit Rana", "Vaibhav Arora", "Manish Pandey", "Suyash Sharma", "Ramandeep Singh", "Chetan Sakariya"],
    "LSG": ["KL Rahul", "Quinton de Kock", "Nicholas Pooran", "Marcus Stoinis", "Krunal Pandya", "Ayush Badoni", "Deepak Hooda", "Ravi Bishnoi", "Naveen-ul-Haq", "Mohsin Khan", "Devdutt Padikkal", "Amit Mishra", "Shamar Joseph", "Mayank Yadav", "Yash Thakur", "Matt Henry"],
    "MI": ["Hardik Pandya", "Rohit Sharma", "Suryakumar Yadav", "Jasprit Bumrah", "Ishan Kishan", "Tim David", "Tilak Varma", "Piyush Chawla", "Romario Shepherd", "Gerald Coetzee", "Akash Madhwal", "Nuwan Thushara", "Mohammad Nabi", "Naman Dhir", "Shreyas Gopal", "Nehal Wadhera"],
    "PBKS": ["Shikhar Dhawan", "Jonny Bairstow", "Liam Livingstone", "Sam Curran", "Kagiso Rabada", "Arshdeep Singh", "Rahul Chahar", "Harshal Patel", "Prabhsimran Singh", "Jitesh Sharma", "Shashank Singh", "Ashutosh Sharma", "Harpreet Brar", "Sikandar Raza", "Rilee Rossouw", "Chris Woakes"],
    "RR": ["Sanju Samson", "Jos Buttler", "Yashasvi Jaiswal", "Ravichandran Ashwin", "Yuzvendra Chahal", "Trent Boult", "Shimron Hetmyer", "Riyan Parag", "Dhruv Jurel", "Sandeep Sharma", "Avesh Khan", "Rovman Powell", "Nandre Burger", "Navdeep Saini", "Donovan Ferreira", "Tom Kohler-Cadmore"],
    "RCB": ["Faf du Plessis", "Virat Kohli", "Glenn Maxwell", "Mohammed Siraj", "Cameron Green", "Dinesh Karthik", "Rajat Patidar", "Will Jacks", "Alzarri Joseph", "Lockie Ferguson", "Yash Dayal", "Karn Sharma", "Mahipal Lomror", "Reece Topley", "Vijaykumar Vyshak", "Swapnil Singh"],
    "SRH": ["Pat Cummins", "Aiden Markram", "Heinrich Klaasen", "Travis Head", "Abhishek Sharma", "Bhuvneshwar Kumar", "T. Natarajan", "Abdul Samad", "Washington Sundar", "Shahbaz Ahmed", "Mayank Agarwal", "Jaydev Unadkat", "Marco Jansen", "Rahul Tripathi", "Nitish Kumar Reddy", "Umran Malik"]
}

def get_wiki_thumb(player_name):
    query = urllib.parse.quote(player_name)
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={query}&prop=pageimages&format=json&pithumbsize=300"
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if page_id != "-1" and 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
    except Exception as e:
        pass

    # Try with " (cricketer)"
    query = urllib.parse.quote(player_name + " (cricketer)")
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={query}&prop=pageimages&format=json&pithumbsize=300"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if page_id != "-1" and 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
    except Exception as e:
        pass
        
    return None

js_output = "export const iplSquads = [\n"

print("Starting to fetch images...")
for team, players in squads.items():
    print(f"Fetching {team}...")
    for player in players:
        thumb = get_wiki_thumb(player)
        thumb_str = f"'{thumb}'" if thumb else "null"
        js_output += f"  {{ name: '{player}', team: '{team}', image: {thumb_str} }},\n"
        time.sleep(1) # Be gentle with Wikipedia API

js_output += "];\n"

with open("src/data/iplSquads.js", "w", encoding="utf-8") as f:
    f.write(js_output)

print("Finished generating src/data/iplSquads.js")
