# 🛒 OSI HARDWARE & SOFTWARE WISHLIST
**"Tools of the Trade"**

## 🟢 PHASE 1: THE BASICS (Start Here)

### 1. High-Power WiFi Adapter
**Recommendation:** Alfa AWUS036ACM / AWUS036ACH
**Why:** Built-in laptop cards cannot perform packet injection.
**Skill Learned:** WiFi Cracking (WPA2/WPA3), Evil Twin Attacks.
**Cost:** ~$60

### 2. Lock Pick Set (Transparent)
**Recommendation:** Any starter set with a clear padlock.
**Why:** Understanding physical security (tumblers, tension).
**Skill Learned:** Lock picking, Physical Bypass.
**Cost:** ~$25

### 3. Raspberry Pi 4/5 (You have one!)
**Use Case:** The "Dropbox".
**Configuration:** Install Kali Linux ARM.
**Tactic:** Plug it behind a TV or printer at a client site, leave it there, and connect to it remotely. It becomes your "man on the inside."

---

## 🟡 PHASE 2: THE "HAK5" GEAR (Intermediate)
*Hak5 is the gold standard for tactical pen-test hardware.*

### 1. USB Rubber Ducky 🦆
**What:** Looks like a USB drive. Acts like a keyboard.
**Attack:** Plug in -> Types malicious script in 1 second -> Exfiltrates data.
**Skill:** DuckyScript coding, Payload delivery.

### 2. WiFi Pineapple 🍍
**What:** A rogue access point in a box.
**Attack:** "Karma" attack. It pretends to be the WiFi network everyone's phone is looking for ("Starbucks", "Home-WiFi"). Phones connect to IT instead of the real one. You capture the traffic.
**Skill:** Man-in-the-Middle (MitM) attacks.

### 3. Bash Bunny 🐰
**What:** The Ducky's big brother. Can simulate Ethernet adapters, serial devices, and storage simultaneously.
**Attack:** Plug in -> Steal NTLM hashes (Windows Passwords) from locked computers.

---

## 🔴 PHASE 3: ADVANCED / SPECIALIZED

### 1. Flipper Zero 🐬
**The Multi-Tool.**
- **Sub-GHz Radio:** Open Tesla charge ports, garage doors.
- **RFID/NFC:** Clone hotel keys and office badges.
- **BadUSB:** Acts like a Rubber Ducky.
- **Infrared:** Turn off TVs in sports bars (prank, but shows capabilities).

### 2. Proxmark3
**The Specialist.**
- The most powerful RFID/NFC cloner. Far more capable than the Flipper for encrypted badges (HID iClass, etc.).

### 3. HackRF One (SDR)
**The Radio God.**
- Transmit and Receive on any frequency (1MHz to 6GHz).
- Replay attacks (unlock car doors).
- GPS Spoofing.

---

## 💻 SOFTWARE RECOMMENDATIONS

### 1. Nessus Essentials (Free)
- **What:** The scanner corporate auditors use.
- **Action:** Download it (needs an email registry). Scan your home network. It gives you a pretty PDF report of "Critical", "High", "Medium" risks.
- **OSI Integration:** You can export Nessus scans and import them into OSI Reports (eventually).

### 2. Burp Suite Community (Free)
- **What:** Web Proxy. It sits between your browser and the internet.
- **Action:** Pause a request to your bank login, modify the numbers, and forward it. (Don't actually rob banks).
- **Skill:** Web Application Hacking (OWASP Top 10).

### 3. Sliver (Free / Open Source)
- **What:** Command & Control (C2) Framework.
- **Action:** Create malware (agents), infecting a VM, and controlling it like a botnet.
- **Skill:** Red Teaming, Adversary Simulation.

---

## 📚 STRATEGY FOR ACQUISITION
1.  **Month 1:** Buy the **WiFi Adapter**. Master `aircrack-ng` and `wifite` (in Kali).
2.  **Month 2:** Buy a **Lockpick Set**. Fidget with it while watching training videos.
3.  **Month 3:** Buy a **Flipper Zero** (fun, practical, covers many bases).
4.  **Month 6:** Consider **Hak5** gear if you have physical access engagements.

**Rule of Thumb:** Don't buy the tool until you understand the *theory* of how it works. Otherwise, it's just an expensive paperweight.
