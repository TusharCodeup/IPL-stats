import os
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

def safe_replace(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out_lines = []
    for line in lines:
        new_line = line
        for player, img in copied_images.items():
            if player in new_line:
                if "image:" in new_line:
                    import re
                    new_line = re.sub(r'(image:\s*[\'"])[^\'"]+([\'"])', rf'\g<1>{img}\g<2>', new_line)
                elif new_line.strip().endswith("},"):
                    # Add image property
                    new_line = new_line.replace("},", f", image: '{img}' }},")
                elif new_line.strip().endswith("}"):
                    new_line = new_line.replace("}", f", image: '{img}' }}")
        out_lines.append(new_line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)
    print("Fixed", filepath)

safe_replace(r"src\data\iplLegends.js")
