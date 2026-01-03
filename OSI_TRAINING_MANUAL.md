# 🕵️ OSI FIELD TRAINING MANUAL
**"Train Like You Fight."**

Welcome, Commander. You have successfully deployed the **OSI Intelligence Platform v2.0**.
This manual will guide you from "Newbie" to "Operator" using the tools we just built.

---

## 🔐 STEP 1: LOGIN TO MISSION CONTROL
Your Gateway is the Web Dashboard running on your Linux machine.

1.  **On your Gaming Rig**, open Chrome/Edge.
2.  Navigate to: `http://<LINUX_IP>:8501` (Replace `<LINUX_IP>` with your Linux machine's actual IP, e.g., `192.168.1.X`).
3.  **Security Clearance:** Enter `osi2025`.

### 🕹️ Drill 1: The "CEO" Check
- Go to the **Master Orchestrator** tab.
- Look at "Active Deals" (It should be empty or have test data).
- Go to **Sales Pipeline** and create a *Fake Lead* (e.g., "Wayne Enterprises", Value: $10,000, Stage: Discovery).
- Move that lead to "Won". Watch it disappear from Leads and appear in **Client Manager**.
- **Goal:** Understand how money flows through your system.

---

## 🥋 STEP 2: THE RUST DOJO (Basic Training)
Before using live tools, learn the syntax in the simulator.

1.  **On Linux Terminal:** Run `./launch_osi.sh`.
2.  Select **[10] OSI DOJO**.
3.  **Drill 2: Reconnaissance**
    - Select "Reconnaissance".
    - It will ask you to type the `nmap` command.
    - Type it exactly as shown. Muscle memory matters.
    - **Goal:** Memorize `nmap -sS` (Stealth Scan) and `nmap -sV` (Version Scan).

---

## 🎯 STEP 3: LIVE FIRE (Safe Targets)
Now we use the real scanner. **WARNING:** Never scan a URL/IP you do not own or have permission for.

### 🟢 Target A: The Nmap Practice Server
The creators of Nmap proide a server specifically for testing scanners.
*   **Host:** `scanme.nmap.org`

**Drill 3: The First Scan**
1.  Go to **Mission Control** -> **Network Scanner**.
2.  Target: `scanme.nmap.org`
3.  Mode: `Quick (Syn)`
4.  Click **INITIATE SCAN**.
5.  **Watch the Logs:** You will see open "Ports" (like 80/http, 22/ssh).
6.  *Analysis:* If Port 80 is open, they have a Website. If Port 22 is open, they have a Server Login.

### 🟡 Target B: Internal Audit (Your House)
Scan your own Wi-Fi network to see what devices are chatting.

**Drill 4: Home Map**
1.  Find your subnet (usually `192.168.1.0/24` or `10.0.0.0/24`).
2.  Target: `192.168.1.0/24` (Replace with your actual range).
3.  Mode: `Quick (Syn)`.
4.  **Result:** You will see your Phone, your TV, your Gaming Rig, and maybe that weird IOT Lightbulb.
5.  *Insight:* Attackers do this first to find the weakest link (usually the Printer or IoT device).

---

## 👁️ STEP 4: VISION SYSTEMS (Cameras)
We built an AI that remembers what it sees.

**Drill 5: The Memory Test**
1.  Go to **Mission Control** -> **Vision Systems**.
2.  Click **Start Headless Recorder** (Ensure a webcam is USB connected to Linux, or use a file).
3.  Walk in front of the camera. Hold up a coffee cup.
4.  Wait 10 seconds.
5.  Click **Stop** (or kill process).
6.  Go to **Visual Search** tab.
7.  Type: "Person" or "Cup".
8.  **Goal:** See if the AI "remembered" you.

---

## 🏗️ STEP 5: EXTERNAL TRAINING GROUNDS (The Gym)
To get good, you need practice targets that *allow* you to break them.

### 1. TryHackMe (Recommended First)
*   **Why:** Gamified, guided labs. Runs in browser.
*   **Start with:** "Pre-Security" and "Jr Penetration Tester" paths.
*   **Link:** [tryhackme.com](https://tryhackme.com)

### 2. HackTheBox (Intermediate)
*   **Why:** Harder, less hand-holding. "Pwn" real boxes.
*   **Start with:** "Starting Point" (Tier 0 machines).
*   **Link:** [hackthebox.com](https://hackthebox.com)

### 3. OWASP Juice Shop
*   **Why:** It's a broken website you run specifically to hack it.
*   **How:** `docker run -p 3000:3000 bkimminich/juice-shop`
*   **Goal:** Learn SQL Injection and XSS using **OSI Scout** (Nikto).

---

## 📅 YOUR DAILY ROUTINE
To transition from Maintenance to Cyber:

1.  **Morning:** Check **Mission Control**. Review "Fake Clients" or plan your learning.
2.  **Lunch:** Do 1 Room on **TryHackMe**.
3.  **Evening:** Run **OSI Scout** against a VM (like Metasploitable) to see what finding vulnerabilities looks like in your own tool.

**Good hunting, Ryan.**
