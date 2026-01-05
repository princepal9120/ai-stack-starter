
// WEATHER
export async function getWeather(location: string) {
    if (!process.env.OPENWEATHER_API_KEY) return "Weather API key missing";
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        return {
            temp: data.main?.temp,
            condition: data.weather?.[0]?.description,
            city: data.name
        };
    } catch (e) { return "Failed to fetch weather"; }
}

// AVIATION
export async function getFlightInfo(flightNumber: string) {
    if (!process.env.AVIATION_STACK_KEY) return "Aviation API key missing";
    try {
        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_STACK_KEY}&flight_iata=${flightNumber}`
        );
        const data = await response.json();
        return data.data?.[0] || "Flight not found";
    } catch (e) { return "Failed to fetch flight info"; }
}

// TMDB
export async function searchMovies(query: string) {
    if (!process.env.TMDB_API_KEY) return "TMDB API key missing";
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`
        );
        const data = await response.json();
        return data.results?.slice(0, 5).map((m: any) => ({
            title: m.title,
            release_date: m.release_date,
            overview: m.overview
        })) || [];
    } catch (e) { return "Failed to search movies"; }
}

// DAYTONA (Code Execution)
export async function executeCode(code: string, language: string = 'python') {
    if (!process.env.DAYTONA_API_KEY) return "Daytona API key missing";
    try {
        const response = await fetch('https://api.daytona.io/workspaces/execute', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DAYTONA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, language }),
        });
        const result = await response.json();
        return { output: result.stdout, error: result.stderr };
    } catch (e) { return "Failed to execute code"; }
}
