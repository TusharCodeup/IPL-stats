import os
import shutil
import json

src = r"D:\kaggkedata set\iplset\archive\Indian Cricketers Image"
dest = r"public\images\players"
os.makedirs(dest, exist_ok=True)

players = os.listdir(src)
copied_images = {}

for p in players:
    p_dir = os.path.join(src, p)
    if os.path.isdir(p_dir):
        # find the first image in the folder
        imgs = [i for i in os.listdir(p_dir) if i.lower().startswith("image_")]
        if imgs:
            # try to find image_1 if possible, otherwise use the first one
            best_img = next((i for i in imgs if i.lower().startswith("image_1.")), imgs[0])
            ext = os.path.splitext(best_img)[1]
            safe_name = p.replace(" ", "_")
            dest_file = safe_name + ext
            shutil.copy(os.path.join(p_dir, best_img), os.path.join(dest, dest_file))
            copied_images[p] = f"/images/players/{dest_file}"

print("Copied images mapping:")
print(json.dumps(copied_images, indent=2))
