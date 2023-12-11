// API endpoint for Central Park, New York (KNYC)
const apiUrl = "https://api.weather.gov/stations/KNYC/observations/latest";

// Make the GET request using the Fetch API
fetch(apiUrl)
  .then(response => {
    // Check if the request was successful (status code 200)
    if (!response.ok) {
      throw new Error(`Error: Unable to retrieve weather information. Status code: ${response.status}`);
    }
    // Parse the JSON data from the response
    return response.json();
  })
  .then(data => {
    // Extract relevant information (example: temperature)
    const temperature = data.properties.temperature.value;

    // Update the temperature in the HTML
    const temperatureDisplay = document.getElementById("temperature-display");
    temperatureDisplay.textContent = `${temperature} degrees Celsius`;
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch
    console.error(error.message);
  });