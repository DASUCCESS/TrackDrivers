import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { Card, Container, Row, Col, Table } from 'react-bootstrap';
import axios from "axios";


const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
mapboxgl.accessToken = MAPBOX_API_KEY;


const TripMap = ({ tripData }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !tripData || !tripData.trip) return;

    // console.log("TripMap Loaded:", tripData);
    

    const {
      current_location = "",
      pickup_location = "",
      dropoff_location = "",
      route_geometry
    } = tripData.trip || {};

    if (!current_location || !pickup_location || !dropoff_location) {
      console.warn("TripMap: One or more location values are missing.", {
        current_location,
        pickup_location,
        dropoff_location
      });
      return;
    }

    const parseCoordinates = (location) => {
      if (!location || typeof location !== "string") return null;
      const parts = location.split(",").map(Number);
      return parts.length === 2 && parts.every((num) => !isNaN(num)) ? parts : null;
    };

    let coordinates = {
      start: parseCoordinates(current_location),
      pickup: parseCoordinates(pickup_location),
      dropoff: parseCoordinates(dropoff_location),
      fuelStops: [],
      restStops: []
    };

    const geocodeLocation = async (address, type, index) => {
    //   console.log(`Geocoding ${type} ${index + 1}:`, address);
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_API_KEY}`
        );
        const feature = response.data.features[0];
        if (feature) {
        //   console.log(`${type} ${index + 1} Coordinates:`, feature.center);
          return feature.center;
        }
      } catch (error) {
        console.error(`Geocoding error for ${type} ${index + 1}:`, error);
      }
      return null;
    };

    const loadGeocodedStops = async () => {
    //   console.log("Fetching geocoded locations for fuel & rest stops...");
      
      const fuelStopCoords = await Promise.all(
        (tripData.stops?.fuel_stop_locations || []).map((loc, index) => 
          geocodeLocation(loc, "Fuel Stop", index)
        )
      );
      
      const restStopCoords = await Promise.all(
        (tripData.stops?.rest_stop_locations || []).map((loc, index) => 
          geocodeLocation(loc, "Rest Stop", index)
        )
      );

      coordinates.fuelStops = fuelStopCoords.filter(Boolean);
      coordinates.restStops = restStopCoords.filter(Boolean);
      
    //   console.log("Final Fuel Stops Coordinates:", coordinates.fuelStops);
    //   console.log("Final Rest Stops Coordinates:", coordinates.restStops);
      
      placeMarkers();
    };

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: coordinates.start || [0, 0],
        zoom: 6
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      const directions = new MapboxDirections({
        accessToken: MAPBOX_API_KEY,
        unit: "metric",
        profile: "mapbox/driving",
        alternatives: false,
        geometries: "geojson",
        controls: { instructions: true }
      });

      map.current.addControl(directions, "top-left");
      directions.setOrigin(coordinates.start);
      directions.addWaypoint(0, coordinates.pickup);
      directions.setDestination(coordinates.dropoff);
    }

    const addMarker = (coord, label, color = "red") => {
      if (Array.isArray(coord) && coord.length === 2 && coord.every(Number.isFinite)) {
        // console.log(`Adding Marker: ${label} at`, coord);
        new mapboxgl.Marker({ color })
          .setLngLat(coord)
          .setPopup(new mapboxgl.Popup().setText(label))
          .addTo(map.current);
      } else {
        console.warn(`Invalid coordinates for: ${label}`, coord);
      }
    };

    const placeMarkers = () => {
    //   console.log("Placing all markers...");
      
      addMarker(coordinates.start, "Start Location");
      addMarker(coordinates.pickup, "Pickup Point", "green");
      addMarker(coordinates.dropoff, "Drop-off Point", "blue");

      coordinates.fuelStops.forEach((coord, index) => {
        addMarker(coord, `⛽ Fuel Stop ${index + 1}`, "orange");
      });

      coordinates.restStops.forEach((coord, index) => {
        addMarker(coord, `🛑 Rest Stop ${index + 1}`, "blue");
      });

    //   console.log("All markers placed!");
    };

    loadGeocodedStops();
    // console.log("Trip Logs:", tripData.logs); 
    if (route_geometry) {
      map.current.on("load", () => {
        if (!map.current.getSource("route")) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: route_geometry
            }
          });

          map.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#1DA1F2", "line-width": 5 }
          });

        //   console.log("Route added to the map!");
        }
      });
    }
  }, [tripData]);

  return (
    <Container className="my-4">
      <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '10px' }} className="shadow mb-4" />
       {/* Trip Details Section */}
            {tripData?.route_info && (
              <Card className="shadow p-3">
                <Card.Body>
                  <h4 className="fw-bold text-center mb-3">Trip Summary</h4>
      
                  <Row>
                    {/* Trip Summary */}
                    <Col md={12} sm={12} className="mb-3">
                      <Card className="border-0 shadow">
                        <Card.Body>
                          <Card.Title className="text-primary">Route Info</Card.Title>
                          <p><strong>Distance:</strong> {tripData.route_info.distance}</p>
                          <p><strong>Duration:</strong> {tripData.route_info.duration}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    </Row>
      
                      {/* Stops Section */}
                      <Col className="mb-3">
                      <Card className="border-0 shadow-sm">
                          <Card.Body>
                          <Row>
                              {/* Fuel Stops */}
                              <Col xs={12} md={6}>
                              <Card className="shadow border-0">
                                  <Card.Body>
                                  <Card.Title className="text-warning">⛽ Fuel Stops</Card.Title>
                                  <p><strong>Total:</strong> {tripData.stops?.fuel_stops || 0}</p>
                                  {tripData.stops?.fuel_stop_locations?.map((location, index) => (
                                      <p key={index}><strong>Stop {index + 1}:</strong> {location}</p>
                                  ))}
                                  </Card.Body>
                              </Card>
                              </Col>
      
                              {/* Rest Stops */}
                              <Col xs={12} md={6}>
                              <Card className="shadow border-0">
                                  <Card.Body>
                                  <Card.Title className="text-info">🛑 Rest Stops</Card.Title>
                                  <p><strong>Total:</strong> {tripData.stops?.rest_stops || 0}</p>
                                  {tripData.stops?.rest_stop_locations?.map((location, index) => (
                                      <p key={index}><strong>Stop {index + 1}:</strong> {location}</p>
                                  ))}
                                  </Card.Body>
                              </Card>
                              </Col>
                          </Row>
                          
                          </Card.Body>
                      </Card>
                      </Col>
      
                              
      
                  {/* Log Output Section */}
                  {tripData.logs?.length > 0 && (
                    <>
                      <h5 className="fw-bold text-center mt-4">Log Output</h5>
                      <Table responsive bordered hover className="mt-2">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Driving Hours</th>
                            <th>On Duty Hours</th>
                            <th>Off Duty Hours</th>
                            <th>Sleeper Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tripData.logs.map((log, index) => (
                            <tr key={index}>
                              <td>{log.date}</td>
                              <td>{log.driving_hours}</td>
                              <td>{log.on_duty_hours}</td>
                              <td>{log.off_duty_hours}</td>
                              <td>{log.sleeper_hours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Card.Body>
              </Card>
            )}
    </Container>
  );
};

export default TripMap;
