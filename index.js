import express from "express";
import requestIP from "request-ip";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", true);

app.use(express.json());
app.use(requestIP.mw());

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name;
  const clientIp = req.clientIp;
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${clientIp}`
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
    console.log(`Weather Data: ${JSON.stringify(weatherData)}`);

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
