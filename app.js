import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = 4000;
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:19006",
  })
);
app.listen(PORT, () =>
  console.log(`Server is running on port: http://localhost:${PORT}`)
);




/* {
            "type": "amadeusOAuth2Token",
            "username": "finlay.mcfarlane@outlook.com",
            "application_name": "Flyto2",
            "client_id": "Spwjiyzn9BWErjnEMjue32rOHVRafv8c",
            "token_type": "Bearer",
            "access_token": "EBljUImVkMVKdy1suRmNFZ3KXeUC",
            "expires_in": 1799,
            "state": "approved",
            "scope": ""
        }



curl "https://test.api.amadeus.com/v1/security/oauth2/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials&client_id=Spwjiyzn9BWErjnEMjue32rOHVRafv8c&client_secret=Xzttv4kT3el5SIhD"






*/

import Amadeus from "amadeus";
const amadeus = new Amadeus({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});


const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "API key is missing" });
  }

  const validApiKey = process.env.API_KEY; // Replace with your actual API key

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};

app.get(`/city-and-airport-search/:parameter`, (req, res) => {
  const parameter = req.params.parameter;
  // Which cities or airports start with the parameter variable
  amadeus.referenceData.locations
    .get({
      keyword: parameter,
      subType: Amadeus.location.any,
    })
    .then(function (response) {
      res.send(response.result);
    })
    .catch(function (response) {
      res.send(response);
    });
});


app.get('/airport-route', verifyApiKey, (req, res) => {
  const departureAirportCode = req.query.departureAirportCode;

  // Your existing logic to fetch routes based on the departureAirportCode
  // and send the response


  amadeus.airport.directDestinations
    .get({
      departureAirportCode: departureAirportCode,
    })
    .then(function (response) {
      res.send(response.result);
    })
    .catch(function (response) {
      res.send(response);
    });

});




app.get(`/flight-search`, verifyApiKey, (req, res) => {
  const originCode = req.query.originCode;
  const destinationCode = req.query.destinationCode;
  const dateOfDeparture = req.query.dateOfDeparture;
  const returnDate = req.query.dateOfReturn;
  const children = req.query.children;
  const travelClass = req.query.travelClass;
  const adults = req.query.adults;
  const nonStop = false;

  // Find the cheapest flights
  amadeus.shopping.flightOffersSearch
    .get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: dateOfDeparture,
      returnDate: returnDate,
      adults: adults,
      children: children,
      travelClass: travelClass,
      nonStop: nonStop,
      max: 100,
    })
    .then(function (response) {
      res.send(response.result);
    })
    .catch(function (response) {
      res.send(response);
    });
});

app.post(`/flight-confirmation`, (req, res) => {
  const flight = req.body;
  // Confirm availability and price
  amadeus.shopping.flightOffers.pricing
    .post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flight],
        },
      })
    )
    .then(function (response) {
      res.send(response.result);
    })
    .catch(function (response) {
      res.send(response);
    });
});

app.post(`/flight-booking`, (req, res) => {
  // Book a flight
  const flight = req.body.flight;
  const name = req.body.name;
  amadeus.booking.flightOrders
    .post(
      JSON.stringify({
        data: {
          type: "flight-order",
          flightOffers: [flight],
          travelers: [
            {
              id: "1",
              dateOfBirth: "1982-01-16",
              name: {
                firstName: name.first,
                lastName: name.last,
              },
              gender: "MALE",
              contact: {
                emailAddress: "jorge.gonzales833@telefonica.es",
                phones: [
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: "34",
                    number: "480080076",
                  },
                ],
              },
              documents: [
                {
                  documentType: "PASSPORT",
                  birthPlace: "Madrid",
                  issuanceLocation: "Madrid",
                  issuanceDate: "2015-04-14",
                  number: "00000000",
                  expiryDate: "2025-04-14",
                  issuanceCountry: "ES",
                  validityCountry: "ES",
                  nationality: "ES",
                  holder: true,
                },
              ],
            },
          ],
        },
      })
    )
    .then(function (response) {
      res.send(response.result);
    })
    .catch(function (response) {
      res.send(response);
    });
});
