import os
import sys

dataset_name = "patrickb1912/ipl-complete-dataset-20082020"
download_path = "D:\\IPL_Dataset"

print(f"Attempting to download Kaggle dataset: {dataset_name} to {download_path}")

try:
    import kaggle
    
    # Authenticate (This will fail if ~/.kaggle/kaggle.json is missing)
    kaggle.api.authenticate()
    
    if not os.path.exists(download_path):
        os.makedirs(download_path)
        
    print("Authentication successful. Starting download...")
    kaggle.api.dataset_download_files(dataset_name, path=download_path, unzip=True)
    print("Download completed successfully!")
    
except OSError as e:
    print(f"Authentication failed: {e}")
    print("WARNING: Could not find kaggle.json. Using fallback IPL Official server images to ensure website images work correctly.")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    print("WARNING: Download failed. Using fallback IPL Official server images.")
    sys.exit(1)
