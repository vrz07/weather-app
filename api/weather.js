export default async function handler(req, res) {

    const {
        city,
        lat,
        lon,
        units = "metric"
    } = req.query;


    try {

        let apiUrl;


        if (city) {

            apiUrl =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=${units}`;

        }


        else if (lat && lon) {

            apiUrl =
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=${units}`;

        }


        else {

            return res.status(400).json({

                error:
                "City or location coordinates are required"

            });

        }


        const response =
        await fetch(
            apiUrl
        );


        const data =
        await response.json();


        if(
            !response.ok
        ){

            return res.status(
                response.status
            ).json(
                data
            );

        }


        res.status(
            200
        ).json(
            data
        );

    }


    catch(error){

        res.status(
            500
        ).json({

            error:
            "Unable to fetch weather data"

        });

    }

}
