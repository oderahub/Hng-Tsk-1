import express from "express";
import requestIP from "request-ip";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.set("trust proxy", true);
app.use(cors());
app.use(requestIP.mw());

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";
  let clientIp = req.clientIp;

  // Handle IPv6 localhost and IPv4 localhost
  if (clientIp === "::1" || clientIp === "127.0.0.1") {
    clientIp = "41.76.192.41"; // Use a public IP for testing purposes locally
  }

  const apiKey = process.env.WEATHER_API_KEY;

  console.log(`Client IP: ${clientIp}`);

  try {
    // Get location data using IP
    const locationResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
    if (!locationResponse.ok) {
      throw new Error(
        `Failed to fetch location data: ${locationResponse.statusText}`
      );
    }

    const locationData = await locationResponse.json();
    if (locationData.error) {
      throw new Error(`Failed to fetch location data: ${locationData.reason}`);
    }

    const city = locationData.city || "Unknown";

    console.log(`Location Data: ${JSON.stringify(locationData)}`);

    // Get weather data using city
    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
    );

    console.log(`Weather API Response Status: ${weatherResponse.status}`);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error(
        `Failed to fetch weather data. Status: ${weatherResponse.status}, Error: ${errorText}`
      );
      throw new Error("Failed to fetch weather data.");
    }

    const weatherData = await weatherResponse.json();

    const temperature = weatherData.current.temp_c;
    const location = weatherData.location.name;

    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: greeting,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Failed to fetch weather data.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
