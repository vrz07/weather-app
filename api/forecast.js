export default async function handler(req, res) {

    const {
        lat,
        lon,
        units = "metric"
    } = req.query;

    if (!lat || !lon) {

        return res.status(400).json({
            error: "Latitude and longitude are required"
        });

    }

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=${units}`
        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json(data);

        }

        res.status(200).json(data);

    }

    catch (error) {

        res.status(500).json({
            error: "Unable to fetch forecast data"
        });

    }

}
