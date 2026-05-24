const fs = require('fs');
const path = require('path');
const https = require('https');

const iplPlayers = [
  { name: 'Virat Kohli', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Virat_Kohli_in_PMO_New_Delhi.jpg' },
  { name: 'MS Dhoni', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/MS_Dhoni.jpg' },
  { name: 'Rohit Sharma', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rohit_Gurunath_Sharma.jpg' },
  { name: 'Suresh Raina', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Suresh_Raina_IPL_2018.jpg' },
  { name: 'Jasprit Bumrah', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jasprit_Bumrah.jpg' },
  { name: 'AB de Villiers', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/AB_de_Villiers_at_practice.jpg' },
  { name: 'Chris Gayle', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Chris_Gayle_2.jpg' },
  { name: 'Ravindra Jadeja', image: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Ravindra_Jadeja_in_PMO_New_Delhi.jpg' },
  { name: 'David Warner', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/David_Warner_cropped.jpg' },
  { name: 'Andre Russell', image: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Andre_Russell_cropped.jpg' },
  { name: 'Sunil Narine', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Sunil_Narine_cropped.jpg' },
  { name: 'Shikhar Dhawan', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Shikhar_Dhawan_cropped.jpg' },
  { name: 'KL Rahul', image: 'https://upload.wikimedia.org/wikipedia/commons/d/df/KL_Rahul_Nov_2023.jpg' },
  { name: 'Yuzvendra Chahal', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Yuzvendra_Chahal_cropped.jpg' },
  { name: 'Jos Buttler', image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Jos_Buttler_Nov_2023.jpg' },
  { name: 'Rashid Khan', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rashid_Khan_cropped.jpg' },
  { name: 'Shubman Gill', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Shubman_Gill_2023_%28cropped%29.jpg' },
  { name: 'Ruturaj Gaikwad', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ruturaj_Gaikwad.jpeg' },
  { name: 'Travis Head', image: 'https://upload.wikimedia.org/wikipedia/commons/2/21/1_21_Travis_Head.jpg' },
  { name: 'Yashasvi Jaiswal', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Yashasvi_Jaiswal_in_PMO_New_Delhi.jpg' },
  { name: 'Pat Cummins', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Pat_Cummins.jpg' }
];

const iplTeams = [
  { short: 'CSK', logo: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg' },
  { short: 'MI', logo: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg' },
  { short: 'RCB', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d4/Royal_Challengers_Bengaluru_Logo.svg' },
  { short: 'KKR', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg' },
  { short: 'SRH', logo: 'https://upload.wikimedia.org/wikipedia/en/5/51/Sunrisers_Hyderabad_Logo.svg' },
  { short: 'RR', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg' },
  { short: 'DC', logo: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Delhi_Capitals.svg' },
  { short: 'PBKS', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg' },
  { short: 'GT', logo: 'https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg' },
  { short: 'LSG', logo: 'https://upload.wikimedia.org/wikipedia/en/3/34/Lucknow_Super_Giants_Logo.svg' }
];

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    if(!url) return resolve();
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        console.log(`Failed to download ${url}: ${res.statusCode}`);
        return resolve();
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`Error downloading ${url}: ${err.message}`);
      resolve();
    });
  });
};

const run = async () => {
  for (const player of iplPlayers) {
    const ext = player.image.split('.').pop();
    const dest = path.join(__dirname, 'public/assets/players', `${player.name.replace(/\s+/g, '_')}.${ext}`);
    await downloadImage(player.image, dest);
    await new Promise(r => setTimeout(r, 1000)); // Delay to avoid rate limit
  }
  for (const team of iplTeams) {
    const ext = team.logo.split('.').pop();
    const dest = path.join(__dirname, 'public/assets/teams', `${team.short}.${ext}`);
    await downloadImage(team.logo, dest);
    await new Promise(r => setTimeout(r, 1000));
  }
};

run();
