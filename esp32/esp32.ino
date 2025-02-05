#include <WiFi.h>
#include <WebServer.h>
#include "DHT.h"

#define DHTPIN 15
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "#";           
const char* password = "#"; 

const int pinoSensor = 34;
const int tempoRega = 2; 
const int RelePin = 13; 

float temperature = 0;
float umidadeAr;

int umidadeSolo;
int umidadePorcentagem;           
int limiarUmidade = 30;           
const int valorMaximoSeco = 4095;
const int valorMinimoMolhado = 0;

WebServer server(80); 

void setup() {
  Serial.begin(115200); 
  pinMode(RelePin, OUTPUT); 
  digitalWrite(RelePin, LOW); 
  pinMode(pinoSensor, INPUT);
  dht.begin(); 

  WiFi.begin(ssid, password);
  Serial.println("Conectando ao WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Tentando conectar...");
  }

  Serial.println("Conectado ao WiFi");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  server.on("/data", HTTP_GET, []() {
    temperature = dht.readTemperature();
    umidadeAr = dht.readHumidity();

    umidadeSolo = analogRead(pinoSensor);
    umidadePorcentagem = map(umidadeSolo, 4095, 737, 0, 100);
    umidadePorcentagem = constrain(umidadePorcentagem, 0, 100);

    if (isnan(temperature) || isnan(umidadeSolo) || isnan(umidadeAr)) {
      server.send(500, "application/json", "{\"error\":\"Erro ao ler os sensores\"}");
      return;
    } 

    String json = "{\"temperature\":" + String(temperature) + ",\"umidadeSolo\":" + String(umidadePorcentagem) + ",\"umidadeAr\":" + String(umidadeAr) + "}";
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200, "application/json", json);
  });

  server.begin();
}

void loop() {
  server.handleClient();

  umidadeSolo = analogRead(pinoSensor);
  umidadePorcentagem = map(umidadeSolo, valorMaximoSeco, valorMinimoMolhado, 0, 100);
  umidadePorcentagem = constrain(umidadePorcentagem, 0, 100);

  if (umidadePorcentagem < limiarUmidade) {
    digitalWrite(RelePin, HIGH); 
    Serial.println("Solo seco, ativando a rega");
    delay(tempoRega * 1000); 
    digitalWrite(RelePin, LOW);
  } else {
    Serial.println("Solo molhado, rega não necessária");
  }

  delay(5000); 
}
