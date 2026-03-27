#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your remote API backend URL once deployed on Render/Railway
const char* serverName = "http://YOUR_BACKEND_URL/api/data";

// Sensor Pins (Example Definition)
#define PH_PIN 34
#define TDS_PIN 35
#define TURBIDITY_PIN 32
#define TEMP_PIN 33

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Read sensors (In a real scenario, you'd apply calibration formulas here to the analogRead)
    // For MVP demonstration, we mock real-world variations around standard safe values
    float pH = 7.0 + ((random(-5, 5)) / 10.0); // 6.5 - 7.5
    float tds = 300 + random(-20, 20);         // 280 - 320 ppm
    float turbidity = 2.0 + random(-10, 10) / 10.0; // 1.0 - 3.0 NTU
    float temperature = 25.0 + random(-10, 10) / 10.0; // 24.0 - 26.0 C

    // JSON payload Construction
    String httpRequestData = "{\"pH\":" + String(pH) + 
                             ",\"tds\":" + String(tds) + 
                             ",\"turbidity\":" + String(turbidity) + 
                             ",\"temperature\":" + String(temperature) + "}";           

    Serial.print("Sending Data to Backend: ");
    Serial.println(httpRequestData);

    int httpResponseCode = http.POST(httpRequestData);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.print("Error sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Waiting for reconnection...");
  }
  
  // Send data every 3 seconds for Real-Time monitoring demonstration
  delay(3000);
}
