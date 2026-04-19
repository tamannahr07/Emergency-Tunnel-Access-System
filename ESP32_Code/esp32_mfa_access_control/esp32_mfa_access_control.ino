#include <WiFi.h>
#include <WebServer.h>
#include <MFRC522.h>
#include <SPI.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <TOTP.h>
#include <time.h>

// WIFI
const char* ssid = "NO INTERNET";
const char* password = "Bche Bche";

WebServer server(80);

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// RFID PINS
#define SS1 5
#define RST1 27

#define SS2 16
#define RST2 17

MFRC522 rfid1(SS1, RST1);
MFRC522 rfid2(SS2, RST2);

// SERVO
Servo servo;
#define SERVO_PIN 4
#define BUZZER_PIN 2 

// ---------- USER DATABASE ----------

// USER 1
String uid1 = "51F2D26";
String id1  = "13257062";
String pass1 = "tanusaini";

// USER 2
String uid2 = "A780D46";
String id2  = "13257035";
String pass2 = "sonakshi12";

// SESSION
bool rfidOK = false;
bool loginOK = false;
String currentUID = "";

// RFID2 DISPLAY CONTROL
bool showingRFID2 = false;
unsigned long rfid2DisplayTime = 0;

// TOTP
String base32Secret = "JBSWY3DPEHPK3PXP";
byte hmacKey[20];
int keyLength = 0;
TOTP* totp;

// ---------- FUNCTIONS ----------

int base32Decode(String input, byte* output) {
  const char* alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  int buffer = 0, bitsLeft = 0, count = 0;

  for (int i = 0; i < input.length(); i++) {
    char ch = toupper(input[i]);
    const char* ptr = strchr(alphabet, ch);
    if (!ptr) continue;

    buffer <<= 5;
    buffer |= (ptr - alphabet);
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      output[count++] = (buffer >> (bitsLeft - 8)) & 0xFF;
      bitsLeft -= 8;
    }
  }
  return count;
}

String getUID(MFRC522 &rfid) {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void beepBuzzer(int times = 2) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}

void resetSystem() {
  rfidOK = false;
  loginOK = false;
  currentUID = "";
  lcd.clear();
  lcd.print("Scan RFID");
}

void unauthorized() {
  beepBuzzer(3);   // 🔥 ADD THIS LINE

  lcd.clear();
  lcd.print("UNAUTHORIZED");
  delay(2000);
  resetSystem();
}

// ---------- WEB PAGES ----------

String loginPage = R"====(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  font-family: 'Segoe UI';
  background: #f9fafb;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
}
.container {
  width:300px;
}
.card {
  background:white;
  padding:25px;
  border-radius:12px;
  box-shadow:0 10px 25px rgba(0,0,0,0.1);
}
h2 {
  text-align:center;
  margin-bottom:10px;
}
p {
  text-align:center;
  color:#666;
  font-size:14px;
}
input {
  width:100%;
  padding:10px;
  margin:8px 0;
  border:1px solid #ddd;
  border-radius:6px;
}
button {
  width:100%;
  padding:10px;
  background:#2563eb;
  color:white;
  border:none;
  border-radius:6px;
  cursor:pointer;
}
button:hover {
  background:#1d4ed8;
}
.error {
  background:#fee2e2;
  color:#b91c1c;
  padding:8px;
  border-radius:6px;
  margin-bottom:10px;
}
</style>
</head>

<body>
<div class="container">
<div class="card">

<h2>Sign In</h2>
<p>Enter your credentials</p>

<form action="/login" method="POST">
<input name="u" placeholder="Roll No" required>
<input name="p" type="password" placeholder="Password" required>
<button type="submit">Login</button>
</form>

</div>
</div>
</body>
</html>
)====";

String otpPage = R"====(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  font-family:'Segoe UI';
  background:linear-gradient(135deg,#667eea,#764ba2);
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  color:white;
}
.box {
  background:rgba(255,255,255,0.1);
  padding:30px;
  border-radius:15px;
  text-align:center;
}
input {
  padding:12px;
  font-size:20px;
  border:none;
  border-radius:8px;
  text-align:center;
  margin:10px;
}
button {
  padding:10px 20px;
  border:none;
  border-radius:8px;
  background:black;
  color:white;
  cursor:pointer;
}
</style>
</head>

<body>
<div class="box">
<h2>Enter OTP</h2>

<form action="/verify" method="POST">
<input name="otp" maxlength="6" placeholder="------" required>
<br>
<button>Verify</button>
</form>

</div>
</body>
</html>
)====";

// ---------- ROUTES ----------

void handleRoot() {
  if (!rfidOK) {

    server.send(200, "text/html", R"====(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  font-family:'Segoe UI';
  background:linear-gradient(135deg,#0f2027,#2c5364);
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  margin:0;
  color:white;
}
.card {
  background:rgba(255,255,255,0.1);
  backdrop-filter:blur(10px);
  padding:30px;
  border-radius:20px;
  text-align:center;
  box-shadow:0 10px 30px rgba(0,0,0,0.3);
  width:320px;
  animation: fade 0.5s ease;
}
@keyframes fade {
  from {opacity:0; transform:translateY(20px);}
  to {opacity:1; transform:translateY(0);}
}
.icon {
  font-size:50px;
  margin-bottom:10px;
}
h2 {
  margin-bottom:10px;
}
p {
  font-size:14px;
  color:#ddd;
}
.loader {
  margin:20px auto;
  border:4px solid rgba(255,255,255,0.2);
  border-top:4px solid white;
  border-radius:50%;
  width:30px;
  height:30px;
  animation:spin 1s linear infinite;
}
@keyframes spin {
  0% {transform:rotate(0deg);}
  100% {transform:rotate(360deg);}
}
</style>
</head>

<body>
<div class="card">
  <h2>Waiting for RFID Card</h2>
  <p>Please scan your RFID card to continue</p>

  <div class="loader"></div>
</div>
<script>
setInterval(function() {
  fetch('/status')
    .then(res => res.text())
    .then(data => {
      if (data === "1") {
        window.location.href = "/";
      }
    });
}, 2000);
</script>
<script>
setInterval(function() {
  fetch('/status')
    .then(res => res.text())
    .then(data => {
      if (data === "1") {
        window.location.href = "/";
      }
    });
}, 2000);
</script>
</body>
</html>
)====");

    return;
  }

  server.send(200, "text/html", loginPage);
}

void handleLogin() {
  String u = server.arg("u");
  String p = server.arg("p");

  bool valid = false;

  if (currentUID == uid1 && u == id1 && p == pass1) valid = true;
  if (currentUID == uid2 && u == id2 && p == pass2) valid = true;

  if (valid) {
    loginOK = true;

    lcd.clear();
    lcd.print("LOGIN OK");

    server.send(200, "text/html", otpPage);
  } else {

    // ✅ BEAUTIFUL ERROR PAGE (NO MORE BLACK SCREEN)
    server.send(200, "text/html", R"====(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  font-family:'Segoe UI';
  background:linear-gradient(135deg,#ff416c,#ff4b2b);
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  margin:0;
}
.card {
  background:white;
  padding:30px;
  border-radius:20px;
  text-align:center;
  box-shadow:0 20px 40px rgba(0,0,0,0.3);
  width:320px;
  animation: pop 0.4s ease;
}
@keyframes pop {
  from {transform:scale(0.8); opacity:0;}
  to {transform:scale(1); opacity:1;}
}
h1 {
  color:#dc2626;
  margin-bottom:10px;
}
p {
  color:#555;
  font-size:14px;
}
button {
  margin-top:20px;
  padding:12px;
  width:100%;
  border:none;
  border-radius:10px;
  background:#2563eb;
  color:white;
  font-size:16px;
  cursor:pointer;
}
button:hover {
  background:#1d4ed8;
}
</style>
</head>

<body>
<div class="card">
  <h1>Login Failed</h1>
  <p>Incorrect ID and Password</p>

  <form action="/" method="GET">
    <button>Try Again</button>
  </form>
</div>
</body>
</html>
)====");

    unauthorized(); // 🔊 buzzer + lcd
  }
}

void handleVerify() {
  if (!loginOK) return;

  String userOTP = server.arg("otp");
  time_t now = time(nullptr);

  String otp1 = totp->getCode(now);
  String otp2 = totp->getCode(now - 30);
  String otp3 = totp->getCode(now + 30);

  if (userOTP == otp1 || userOTP == otp2 || userOTP == otp3) {

    lcd.clear();
    lcd.print("AUTHORIZED");

    servo.write(90);
    delay(3000);
    servo.write(0);

    // ✅ AUTHORIZED PAGE
    server.send(200, "text/html", R"====(
    <html>
    <head>
    <style>
    body {
      font-family: Arial;
      background:#ecfdf5;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
    }
    .box {
      background:white;
      padding:30px;
      border-radius:12px;
      text-align:center;
      box-shadow:0 10px 20px rgba(0,0,0,0.1);
    }
    h1 { color:green; }
    </style>
    </head>
    <body>
      <div class="box">
        <h1>AUTHORIZED</h1>
        <p>Access Granted</p>
      </div>
      <script>
      setTimeout(function(){
        window.location.href = "/";
      }, 3000); // 3 seconds
      </script>
    </body>
    </html>
    )====");

    delay(2000);
    resetSystem();

  } else {

    // ❌ UNAUTHORIZED PAGE
    server.send(200, "text/html", R"====(
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  body {
    font-family:'Segoe UI';
    background:linear-gradient(135deg,#ff4e50,#f9d423);
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    margin:0;
  }
  .card {
    background:white;
    padding:30px;
    border-radius:15px;
    text-align:center;
    box-shadow:0 15px 30px rgba(0,0,0,0.2);
    width:300px;
  }
  h1 {
    color:#dc2626;
    margin-bottom:10px;
  }
  p {
    color:#555;
  }
  button {
    margin-top:15px;
    padding:10px 20px;
    border:none;
    border-radius:8px;
    background:#2563eb;
    color:white;
    cursor:pointer;
  }
  button:hover {
    background:#1d4ed8;
  }
  </style>
  </head>

  <body>
  <div class="card">
    <h1>Login Failed</h1>
    <p>Invalid Roll No or Password</p>

    <form action="/" method="GET">
      <button>Try Again</button>
    </form>
  </div>
  <script>
  setTimeout(function(){
    window.location.href = "/";
  }, 3000);
  </script>
  </body>
  </html>
  )====");
  }
}
// ---------- SETUP ----------

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  lcd.init();
  lcd.backlight();
  lcd.print("Connecting WiFi");
  server.on("/status", []() {
  if (rfidOK) {
    server.send(200, "text/plain", "1");
  } else {
    server.send(200, "text/plain", "0");
  }
  });

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  lcd.clear();
  lcd.print("Scan RFID");

  SPI.begin(18, 19, 23);

  pinMode(SS1, OUTPUT);
  pinMode(SS2, OUTPUT);
  pinMode(RST1, OUTPUT);
  pinMode(RST2, OUTPUT);

  digitalWrite(SS1, HIGH);
  digitalWrite(SS2, HIGH);
  digitalWrite(RST1, HIGH);
  digitalWrite(RST2, HIGH);

  rfid1.PCD_Init();
  delay(100);
  rfid2.PCD_Init();
  delay(100);

  servo.attach(SERVO_PIN);

  configTime(0, 0, "pool.ntp.org");

  time_t now = time(nullptr);
  while (now < 100000) {
    delay(500);
    now = time(nullptr);
  }

  keyLength = base32Decode(base32Secret, hmacKey);
  totp = new TOTP(hmacKey, keyLength);

  server.on("/", handleRoot);
  server.on("/login", HTTP_POST, handleLogin);
  server.on("/verify", HTTP_POST, handleVerify);

  server.begin();
}

// ---------- LOOP ----------

void loop() {

  server.handleClient();

  // RFID2 HOLD
  if (showingRFID2) {
    if (millis() - rfid2DisplayTime > 3000) {
      showingRFID2 = false;
      lcd.clear();
      lcd.print("Scan RFID");
    }
    return;
  }

  // RFID1 AUTH
  digitalWrite(SS2, HIGH);
  digitalWrite(SS1, LOW);
  delay(5);

  if (rfid1.PICC_IsNewCardPresent() && rfid1.PICC_ReadCardSerial()) {
    String id = getUID(rfid1);

    if (id == uid1 || id == uid2) {
      rfidOK = true;
      currentUID = id;

      lcd.clear();
      lcd.print("RFID OK");
      lcd.setCursor(0,1);
      lcd.print(WiFi.localIP());
    } else {
      unauthorized();
    }

    rfid1.PICC_HaltA();
    rfid1.PCD_StopCrypto1();
  }

  delay(20);

  // RFID2 DISPLAY
  digitalWrite(SS1, HIGH);
  digitalWrite(SS2, LOW);
  delay(5);

  if (rfid2.PICC_IsNewCardPresent() && rfid2.PICC_ReadCardSerial()) {
    String id2 = getUID(rfid2);

    lcd.clear();
    lcd.print("RFID2 UID:");
    lcd.setCursor(0,1);
    lcd.print(id2);

    showingRFID2 = true;
    rfid2DisplayTime = millis();

    rfid2.PICC_HaltA();
    rfid2.PCD_StopCrypto1();
  }

  delay(20);
}