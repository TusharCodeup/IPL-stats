# 🏏 IPL Legends & Stats Dashboard

![IPL Dashboard Banner](frontend/public/assets/images/banner.png) <!-- Feel free to replace with an actual screenshot of the app! -->

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)

Welcome to the **IPL Legends & Stats Dashboard**! This is a modern, responsive, and highly interactive React application designed to celebrate the greatest moments, legendary players, and all-time records of the Indian Premier League (IPL).

## ✨ Features

* **🏆 Greatest IPL Moments:** Relive the most iconic finals, super overs, and last-ball thrillers.
* **👑 Player Spotlight:** Dive deep into the legendary careers of players like Virat Kohli, MS Dhoni, and Chris Gayle with a beautifully designed player grid and role-based filtering.
* **📈 Stats Leaderboards:** Check out the all-time batting and bowling leaders, featuring the Orange Cap and Purple Cap holders across the years.
* **⚔️ 1v1 Comparisons:** Select two players to view a head-to-head comparison of their lifetime IPL stats in a stunning UI modal.
* **📸 Kaggle Dataset Integration:** Directly fetches and maps high-quality player images and data from the official Kaggle IPL dataset.
* **🎨 Modern UI/UX:** Built with Tailwind CSS and Framer Motion for incredibly smooth micro-animations, glassmorphism, and dynamic layout transitions.
* **🌗 Dark Mode Ready:** Fully configured for both light and dark aesthetic preferences.

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* `npm` or `yarn` package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TusharCodeup/IPL-stats.git
   cd IPL-stats/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5174/` to see the app in action!

## 📂 Project Structure

```text
IPL-stats/
├── frontend/
│   ├── public/             # Static assets, local player images, team logos
│   ├── src/
│   │   ├── components/     # Reusable UI components (Nav, Modals, Cards, Leaderboards)
│   │   ├── data/           # Core datasets (iplLegends.js, iplStats.js)
│   │   ├── pages/          # Main application views (Home, Spotlight, Legends)
│   │   ├── App.jsx         # Main application router and root layout
│   │   └── index.css       # Global styling and Tailwind directives
│   ├── package.json        # Project dependencies and scripts
│   └── vite.config.js      # Vite build configuration
└── backend/                # Optional backend/API configurations
```

## 🛠️ Built With

* **[React 18](https://react.dev/)** - The web framework used
* **[Tailwind CSS](https://tailwindcss.com/)** - For rapid and highly customizable styling
* **[Framer Motion](https://www.framer.com/motion/)** - To power the buttery-smooth animations and page transitions
* **[Lucide React](https://lucide.dev/)** - For clean, beautiful iconography
* **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/TusharCodeup/IPL-stats/issues).

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
