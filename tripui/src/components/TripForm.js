import React, { useState } from "react";
import { Container, Form, Button, Alert, Card, Spinner, Row, Col} from "react-bootstrap";
import LocationSearch from "./LocationSearch";
import TripMap from "./TripMap";
import { createTrip } from "../utils/Api";

const TripForm = () => {
  const [formData, setFormData] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_hours: ""
  });

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTripData(null);

    try {
      const data = await createTrip(formData);
      setTripData(data);
    } catch (err) {
      setError("Failed to process the trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-4 mb-4" style={{ minHeight: "100vh" }}>
      <Card className="p-4 shadow-lg" style={{ width: "80rem", borderRadius: "10px" }}>
        <h2 className="mb-4 text-center">Plan Your Trip</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <LocationSearch label="Current Location" onSelect={(value) => handleLocationSelect("current_location", value)} />
          </Form.Group>

          <Form.Group className="mt-3">
            <LocationSearch label="Pickup Location" onSelect={(value) => handleLocationSelect("pickup_location", value)} />
          </Form.Group>

          <Form.Group className="mt-3">
            <LocationSearch label="Dropoff Location" onSelect={(value) => handleLocationSelect("dropoff_location", value)} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Current Cycle Used (Hours)</Form.Label>
            <Form.Control
              type="number"
              name="cycle_hours"
              value={formData.cycle_hours}
              onChange={handleChange}
              placeholder="Enter hours already worked"
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-4 w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Submit Trip"}
          </Button>
        </Form>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        {tripData && (
          <Row className="mt-4">
            <h4>Trip Details:</h4>
            <Row>
            {/* Distance & Duration Card */}
            <Col md={6} sm={12} className="mb-3">
                <Card className="shadow-sm p-3">
                <Card.Body>
                    <Card.Title className="text-primary">Route Info</Card.Title>
                    <p><strong>Distance:</strong> {tripData.route_info?.distance || "Not available"}</p>
                    <p><strong>Duration:</strong> {tripData.route_info?.duration || "Not available"}</p>
                </Card.Body>
                </Card>
            </Col>

            {/* Stops Card */}
            <Col md={6} sm={12} className="mb-3">
                <Card className="shadow-sm p-3">
                <Card.Body>
                    <Card.Title className="text-success">Stops</Card.Title>
                    <p><strong>Fuel Stops:</strong> {tripData.stops?.fuel_stops || 0}</p>
                    <p><strong>Rest Stops:</strong> {tripData.stops?.rest_stops || 0}</p>
                </Card.Body>
                </Card>
            </Col>
            </Row>
            {/* Display the Map */}
            <TripMap tripData={tripData} />
          </Row>
        )}
      </Card>
    </Container>
  );
};

export default TripForm;
