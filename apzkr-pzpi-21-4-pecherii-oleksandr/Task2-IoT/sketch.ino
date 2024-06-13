#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* server = "http://localhost:8000/update_dive_computer_data";
const char* dive_computer_id = "1";  

HX711 scale;

// Константи для розрахунків глибини
const float atmosphericPressure = 101325; // Атмосферний тиск в Па
const float waterDensity = 1025; // Щільність води в кг/м^3
const float gravity = 9.81; // Прискорення вільного падіння в м/с^2

unsigned long diveStartTime;
bool isDiving = false;

void setup() {
  Serial.begin(9600);
  Serial.println("Dive Computer Prototype");

  scale.begin(16, 17);
  scale.set_scale(30.f);
  scale.tare();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected to Wi-Fi");

  Serial.println("Depth sensor initialized. Ready to dive!");
}

void loop() {
  float rawReading = scale.get_units(5);

  rawReading = max(rawReading, 0.0f);
  
 // Обчислення тиску та глибини
  float pressure = rawReading * 1000 + atmosphericPressure;
  float depth = (pressure - atmosphericPressure) / (waterDensity * gravity);

  if (rawReading < 1.0) {
    depth = 0.0;
  }

  Serial.print("Depth: ");
  Serial.print(depth, 2);
  Serial.println(" meters");

  if (depth > 1 && !isDiving) {
    isDiving = true;
    diveStartTime = millis();
  }

  unsigned long diveTime = 0;
  if (isDiving) {
    diveTime = (millis() - diveStartTime) / 1000;
  }

  Serial.print("Dive Time: ");
  Serial.print(diveTime);
  Serial.println(" seconds");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.setTimeout(5000); 
    Serial.println("Starting POST request");
    http.begin(server);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String postData = "id=" + String(dive_computer_id) + "&depth=" + String(depth, 2) + "&diveTime=" + String(diveTime);
    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }

  delay(1000);
}
