# 🛰️ DIY GPS Tracker Build Guide - CIMCO Equipment Monitoring

## Hardware Bill of Materials (Per Tracker)

### Core Components (~$25-35 per unit)

| Component | Purpose | Cost | Link |
|-----------|---------|------|------|
| **ESP32-C3** | WiFi/BLE, low power | $4 | AliExpress/Amazon |
| **NEO-6M GPS Module** | Location tracking | $8 | Amazon |
| **MPU6050 Accelerometer** | Vibration detection | $3 | AliExpress |
| **18650 Battery + Holder** | Power (2600mAh) | $5 | Amazon |
| **TP4056 Charger Module** | USB charging | $2 | AliExpress |
| **Waterproof Case** | Outdoor protection | $5 | Amazon (IP67) |
| **Antenna (optional)** | Better GPS signal | $3 | Amazon |

**Total per tracker**: **$30-35**  
**Bulk order (10 units)**: **$250-300**

Compare to commercial: $80-150 per tracker

---

## Smart Features with Accelerometer

### Vibration Detection Logic
```rust
// Detect when equipment is running vs stationary
if vibration_magnitude > threshold {
    status = "RUNNING"
    log_runtime_hours()
} else {
    status = "IDLE"
}

// Detect harsh operation
if vibration_spike > danger_threshold {
    alert = "POTENTIAL DAMAGE - CHECK EQUIPMENT"
}
```

### What You Can Track
1. **Runtime Hours**: Real operating time (not engine hours)
2. **Idle Time**: Equipment on but not working (waste fuel)
3. **Shock Events**: Drops, collisions, rough handling
4. **Maintenance Triggers**: "Oil change after 50 actual hours"

---

## Wiring Diagram

```
ESP32-C3 Connections:
┌─────────────┐
│   ESP32-C3  │
├─────────────┤
│ 3.3V ──────────┐
│ GND ───────────┼──── Common Ground
│ GPIO4 (TX) ────┼──── GPS RX
│ GPIO5 (RX) ────┼──── GPS TX  
│ GPIO21 (SDA) ──┼──── MPU6050 SDA
│ GPIO22 (SCL) ──┼──── MPU6050 SCL
│ 5V ────────────┼──── Battery (via TP4056)
└─────────────┘

Battery Setup:
18650 → TP4056 Charger → ESP32 5V Pin
         ↓
      USB-C Port (for charging)
```

---

## Firmware Code (Rust / Arduino C++)

### Option 1: ESP-RS (Rust on ESP32)
```rust
// main.rs
use esp_idf_hal::prelude::*;
use esp_idf_svc::wifi::*;
use esp_idf_sys as _;

struct TrackerData {
    device_id: String,
    latitude: f64,
    longitude: f64,
    vibration_level: f32,
    is_running: bool,
    battery_percent: u8,
}

fn main() {
    // Initialize peripherals
    let peripherals = Peripherals::take().unwrap();
    let mut gps = init_gps(peripherals.uart1);
    let mut imu = init_mpu6050(peripherals.i2c0);
    
    loop {
        // Read GPS
        let location = gps.read_location();
        
        // Read accelerometer
        let accel = imu.read_acceleration();
        let vibration = calculate_vibration(accel);
        
        // Detect running state
        let is_running = vibration > 0.3; // Threshold in g-force
        
        // Send data to CIMCO backend
        let data = TrackerData {
            device_id: "CIMCO-TRACKER-001".to_string(),
            latitude: location.lat,
            longitude: location.lon,
            vibration_level: vibration,
            is_running,
            battery_percent: read_battery(),
        };
        
        send_to_server(data);
        
        // Sleep to save battery (wake on motion)
        deep_sleep_with_motion_wakeup(60); // 60 seconds
    }
}
```

### Option 2: Arduino C++ (Easier for prototyping)
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <MPU6050.h>

TinyGPSPlus gps;
MPU6050 mpu;

const char* ssid = "SCRAPYARD_WIFI";
const char* password = "your_password";
const char* serverUrl = "http://your-server.com/api/v1/tracker/update";

void setup() {
    Serial.begin(115200);
    Serial2.begin(9600); // GPS
    
    Wire.begin(21, 22); // SDA, SCL
    mpu.initialize();
    
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
}

void loop() {
    // Read GPS
    while (Serial2.available() > 0) {
        gps.encode(Serial2.read());
    }
    
    // Read accelerometer
    int16_t ax, ay, az;
    mpu.getAcceleration(&ax, &ay, &az);
    
    // Calculate vibration magnitude
    float vibration = sqrt(ax*ax + ay*ay + az*az) / 16384.0;
    bool isRunning = vibration > 0.3;
    
    // Send to server
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        String json = "{";
        json += "\"device_id\":\"TRACKER-001\",";
        json += "\"latitude\":" + String(gps.location.lat(), 6) + ",";
        json += "\"longitude\":" + String(gps.location.lng(), 6) + ",";
        json += "\"vibration\":" + String(vibration) + ",";
        json += "\"is_running\":" + String(isRunning ? "true" : "false");
        json += "}";
        
        http.POST(json);
        http.end();
    }
    
    delay(30000); // Update every 30 seconds
}
```

---

## CIMCO Backend Integration

### New API Endpoint (backend-rs)
```rust
// backend-rs/src/models.rs
#[derive(Serialize, Deserialize)]
pub struct TrackerUpdate {
    pub device_id: String,
    pub latitude: f64,
    pub longitude: f64,
    pub vibration: f32,
    pub is_running: bool,
    pub battery_percent: Option<u8>,
    pub timestamp: i64,
}

// backend-rs/src/handlers.rs
pub async fn receive_tracker_data(
    State(state): State<AppState>,
    Json(data): Json<TrackerUpdate>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Save to database
    sqlx::query!(
        "INSERT INTO tracker_logs (device_id, lat, lon, vibration, is_running, battery, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        data.device_id,
        data.latitude,
        data.longitude,
        data.vibration,
        data.is_running,
        data.battery_percent,
        data.timestamp
    )
    .execute(&state.pool)
    .await?;
    
    // Update equipment status
    if data.is_running {
        sqlx::query!(
            "UPDATE equipment SET last_active = ?, location_lat = ?, location_lon = ?
             WHERE tracker_id = ?",
            data.timestamp,
            data.latitude,
            data.longitude,
            data.device_id
        )
        .execute(&state.pool)
        .await?;
    }
    
    Ok(Json(json!({"status": "ok"})))
}
```

### Add Route
```rust
// backend-rs/src/main.rs
let v1_routes = Router::new()
    // ... existing routes
    .route("/tracker/update", post(handlers::receive_tracker_data));
```

---

## Assembly Instructions

### Step 1: Test Components
1. Flash ESP32 with test firmware
2. Verify GPS gets satellite lock (outdoors)
3. Check accelerometer readings in Serial Monitor
4. Test WiFi connection

### Step 2: Solder Connections
- Use solid core wire for durability
- Add heat shrink tubing
- Double-check polarity (GPS is 3.3V!)

### Step 3: Waterproofing
1. Apply hot glue around wire entry points
2. Seal USB port with rubber plug when not charging
3. Test in water bucket before deployment

### Step 4: Mounting
- Use industrial Velcro or zip ties
- Mount on flat surface away from heat
- Antenna pointing up for best GPS signal

---

## Power Optimization

### Battery Life Strategies
```cpp
// Deep sleep between readings
esp_sleep_enable_timer_wakeup(30 * 1000000); // 30 seconds
esp_sleep_enable_ext0_wakeup(GPIO_NUM_4, 1); // Wake on motion

// Only send data when equipment moves
if (vibration > 0.1 || location_changed) {
    send_to_server();
} else {
    skip_transmission(); // Save power
}
```

**Expected Battery Life**:
- Active tracking: 24-48 hours
- Sleep mode: 7-14 days
- With solar panel: Indefinite

### Solar Upgrade (+$8)
- Add 5V solar panel
- Connect to TP4056 IN+/IN-
- Infinite runtime for outdoor equipment

---

## Cost Analysis

### DIY vs Commercial

| Solution | Cost per Unit | Monthly Fee | Year 1 Total (10 units) |
|----------|---------------|-------------|-------------------------|
| **DIY Trackers** | $30 | $0 | **$300** |
| Commercial GPS | $80 | $10/mo | $2,000 |
| Enterprise IoT | $150 | $20/mo | $3,900 |

**DIY Savings**: $1,700 - $3,600 first year!

---

## Build Timeline

### Prototype (1 tracker)
- **Day 1**: Order components
- **Day 7-10**: Components arrive
- **Day 11**: Assemble & test
- **Day 12**: Flash firmware
- **Day 13**: Deploy & monitor

### Production (10 trackers)
- **Week 1**: Order bulk components
- **Week 2**: Assembly line setup
- **Week 3**: Build & test all units
- **Week 4**: Deploy on equipment

---

## Shopping List Links

### Amazon Prime (Fast but pricier)
```
ESP32-C3: Search "ESP32-C3 DevKit"
GPS Module: "NEO-6M GPS Module"
Accelerometer: "MPU6050 GY-521"
Battery: "18650 2600mAh Protected"
Case: "IP67 Waterproof Junction Box 100x68x50mm"
```

### AliExpress (Bulk savings)
```
ESP32-C3: $2.50 each (10+ units)
GPS: $5 each (10+ units)
MPU6050: $1.50 each (10+ units)
Total: ~$20 per tracker in bulk
```

---

## Troubleshooting

### GPS Not Getting Lock
- Go outdoors (won't work indoors usually)
- Wait 2-5 minutes for cold start
- Check antenna connection
- Verify 3.3V power (NOT 5V!)

### Accelerometer Reading Zero
- Check I2C address (0x68 or 0x69)
- Verify SDA/SCL connections
- Enable pull-up resistors in code

### Won't Connect to WiFi
- Check SSID/password
- Verify 2.4GHz network (ESP32 doesn't do 5GHz)
- Move closer to router for testing

---

## Next Steps

1. **Order 1-2 prototypes** first
2. **Test on actual equipment** for 1 week
3. **Refine vibration thresholds** for different machines
4. **Build 10 production units**
5. **Deploy on high-value equipment**

Want me to:
- Generate the full ESP32 firmware code?
- Create the database schema for tracker logs?
- Design a CIMCO dashboard page for tracking?
- Make a parts order spreadsheet?

**This is your competitive advantage** - $30 trackers vs $150 commercial! 🚀
