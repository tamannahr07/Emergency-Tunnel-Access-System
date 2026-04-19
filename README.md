# 🚨 Emergency Tunnel Access System (IoT)

A smart IoT-based access control system designed for secure and controlled entry in restricted environments like emergency tunnels or high-security zones.  
This system ensures that only authorized personnel can access the gate using multi-device verification.

---

## 🚀 Features

- 🔐 Secure Access using RFID authentication  
- 🔄 Dual Scanner System (Entry + Exit verification)  
- 🚪 Automated Gate Control using Servo Motor  
- 🔔 Buzzer Alert for invalid access attempts  
- 📺 Display Interface for real-time status  
- ⚡ Fast and reliable response using ESP32  

---

## 🛠️ Hardware Components

- ESP32 Microcontroller  
- RFID Module (RC522 or similar)  
- Servo Motor (for gate control)  
- Buzzer  
- Display (LCD/OLED)  
- Connecting Wires & Power Supply  

---

## ⚙️ Working Principle

1. User scans RFID card at entry scanner  
2. System verifies UID  
3. If valid:
   - Gate opens using servo motor  
   - Access granted message shown  
4. If invalid:
   - Buzzer alert triggers  
   - Access denied message displayed  
5. Exit scanner manages outgoing access similarly  

---

## 📂 Project Structure

```
/esp32-code     → Main ESP32 program (.ino)
/arduino-code   → Additional modules (if any)
/circuit-diagram → Connection diagrams / images
```

---

## 🔧 Setup Instructions

1. Install Arduino IDE  
2. Add ESP32 board support  
3. Open `.ino` file  
4. Connect hardware as per circuit diagram  
5. Select correct COM port & board  
6. Upload code to ESP32  

---

## 📡 Applications

- Emergency tunnel access systems  
- Military/security zones  
- Restricted industrial areas  
- Smart gate automation  

---

## 🔒 Future Improvements

- Biometric authentication (fingerprint)  
- Cloud-based logging system  
- Mobile app integration  
- Face recognition system  

---

## ⚖️ License

For educational and project demonstration purposes only.
