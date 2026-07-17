# 🧠 LifeOS - AI Personal Digital Brain

<div align="center">
  <h3>Your Ultimate Command Center for Productivity, Knowledge, and Personal Growth</h3>
  <p>A unified digital workspace containing a robust Spring Boot backend, a modern Vite+React frontend, and a productivity-enhancing Chrome extension clipper.</p>
</div>

---

## 🌟 Overview
**LifeOS** is an all-in-one AI-assisted personal digital brain and management dashboard designed to organize, track, and elevate every aspect of your daily life. From goal-setting (OKRs) and calendar time-blocking to finance tracking, learning paths, career development, and deep knowledge graph visualization, LifeOS connects your data points into a cohesive, interactive system.

---

## 🚀 Key Modules & Features

### 💻 1. Frontend Command Center (React, TS, Tailwind CSS)
*   **📊 Unified Dashboard:** Dynamic overview of your day, active tasks, goal progress, and key habits at a glance.
*   **📝 Notes & Rich Documents:** Create, edit, and organize notes. The backend integrates with Apache PDFBox to enable text extraction from uploaded PDF documents.
*   **📅 Calendar & Time-Blocking:** Drag-and-drop task planning and scheduling.
*   **✅ Tasks & Habits Tracker:** Keep track of recurring actions, daily check-ins, and complex project checklists.
*   **🎯 Multi-Horizon Goals:** Track your objectives and key results (OKRs) with visually engaging progress meters.
*   **📈 Finance Manager:** Record income, budget expenses, track savings, and project your future net worth.
*   **📚 Learning & Career Matrix:** Map your skillset, outline learning roadmaps, bookmark resources, and log career milestones.
*   **🕸️ Knowledge Graph:** Interactive visual node mapper illustrating connections between notes, tasks, ideas, and goals.
*   **✉️ Unified Email Inbox:** View and manage email logs dynamically within your personal workspace.
*   **📱 Mobile Simulator:** Test, view, and interact with the responsive layouts directly from the web browser.
*   **🎨 Dynamic Theming:** Sleek, tailored dark and light modes using Zustand state management.

### ⚙️ 2. High-Performance REST API (Spring Boot 3.3.2)
*   **🔒 Secure Authentication:** JWT token validation, user registration, forgot/reset password, and email verification.
*   **⚡ Optimized Performance:** Integrated Spring Boot caching to minimize database query latency.
*   **🤖 AI Brain Integration:** Pluggable AI capabilities with Groq and mock provider options.
*   **📄 Document Processing:** Direct text extraction from uploaded PDFs using Apache PDFBox.
*   **📧 Automated Mailing:** Spring Boot Mail integration for system alerts and verification processes.
*   **💾 Database Persistence:** Relational database mapping using MySQL with JPA/Hibernate.

### 🔌 3. Browser Companion (Chrome Extension)
*   **✂️ Brain Clipper:** Clip articles, text snippets, and web URLs directly from any browser tab into your LifeOS Digital Brain database via manifest v3 extension API.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Modern, blazing-fast single page application (SPA) |
| | Tailwind CSS | Sleek utility-first styling and custom gradients |
| | Zustand | High-performance, lightweight state management |
| | Lucide React, Framer Motion | Visual icons and micro-interactions/animations |
| **Backend** | Spring Boot 3.3.2, Java 17 | Enterprise-ready REST API |
| | JPA / Hibernate, MySQL | Database object-relational mapping and persistence |
| | Spring Security, JJWT | Security framework and secure JSON Web Tokens |
| | Apache PDFBox | High-quality PDF document parsing |
| **Extension** | Manifest V3 | Standard modern Chrome Extension API |

---

## 📂 Project Architecture & Directory Layout

```text
lifeos/
├── backend/                  # Spring Boot Maven Project
│   ├── .mvn/                 # Maven Wrapper directory
│   ├── src/                  # Java source code
│   │   ├── main/
│   │   │   ├── java/com/lifeos/api/  # Controllers, Services, Repositories, Configs
│   │   │   └── resources/            # Config properties & SQL migrations
│   │   └── test/             # Unit and integration tests
│   ├── pom.xml               # Maven dependencies configuration
│   └── mvnw/mvnw.cmd         # Maven executable wrapper scripts
│
├── frontend/                 # React TS + Vite Project
│   ├── public/               # Static public assets
│   ├── src/                  # TypeScript source files
│   │   ├── components/       # Layouts, navigation, UI elements
│   │   ├── pages/            # View pages (Dashboard, Goals, Finance, etc.)
│   │   ├── stores/           # Zustand state store hook hooks
│   │   └── App.tsx           # Route definitions & router guards
│   ├── package.json          # Node.js dependencies and scripts
│   ├── tailwind.config.js    # Tailwind layout utility customization
│   └── vite.config.ts        # Vite development environment setup
│
└── extension/                # Chrome Extension
    ├── manifest.json         # Extension permissions and background config
    ├── popup.html            # Clipper UI mockup
    └── popup.js              # Click action handling for page clipping
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
*   [Java JDK 17](https://www.oracle.com/java/technologies/downloads/)
*   [MySQL Server](https://dev.mysql.com/downloads/installer/)

---

### 1. Database Setup
1.  Open your MySQL shell or query editor and create a new schema named `lifeos`:
    ```sql
    CREATE DATABASE lifeos;
    ```
2.  Review/configure the database connection parameters in `backend/src/main/resources/application.properties`:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/lifeos?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    spring.datasource.username=root
    spring.datasource.password=YOUR_MYSQL_PASSWORD
    ```

---

### 2. Running the Backend API
1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies and build the application:
    ```bash
    ./mvnw clean install
    ```
3.  Run the Spring Boot application:
    ```bash
    ./mvnw spring-boot:run
    ```
    The API will boot up on port `8080` (or as configured).

---

### 3. Running the Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install standard packages and dependencies:
    ```bash
    npm install
    ```
3.  Launch the hot-reloading development server:
    ```bash
    npm run dev
    ```
    Open the server location (usually `http://localhost:5173/`) in your browser to view the application.

---

### 4. Loading the Chrome Extension
1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (toggle in the top-right corner).
3.  Click **Load unpacked** in the top-left corner.
4.  Select the `extension/` folder from this repository's directory.
5.  Pin the **LifeOS Brain Clipper** to your browser extension bar and begin clipping web details directly to your dashboard.

---

## 🔒 License
This project is proprietary and confidential. All rights reserved.
