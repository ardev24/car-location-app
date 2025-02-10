// src/App.js (Complete, updated code)
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function useGeolocation() {
	const [location, setLocation] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const getLocation = useCallback(() => {
    	setIsLoading(true);
    	setError(null);

    	const options = {
        	enableHighAccuracy: true,
        	timeout: 5000,
        	maximumAge: 0,
    	};

    	if (!navigator.geolocation) {
        	setError('Geolocation is not supported by your browser.');
        	setIsLoading(false);
        	return;
    	}

    	navigator.geolocation.getCurrentPosition(
        	(position) => {
            	setLocation({
                	latitude: position.coords.latitude,
                	longitude: position.coords.longitude,
                	accuracy: position.coords.accuracy,
                	timestamp: position.timestamp,
            	});
            	setIsLoading(false);
        	},
        	(error) => {
            	setError(error.message);
            	setIsLoading(false);
        	},
        	options
    	);
	}, []);

	useEffect(() => {
    	// Optional: Automatically get location on component mount
    	// getLocation();
	}, [getLocation]);

	return { location, error, isLoading, getLocation };
}

function App() {
  const { location, error, isLoading, getLocation } = useGeolocation();

  const handleSendLocation = async () => {
	if (!location) {
  	alert("Please get location first.");
  	return;
	}

	try {
  	const response = await fetch('/api/location', {
    	method: 'POST',
    	headers: {
      	'Content-Type': 'application/json',
    	},
    	body: JSON.stringify({
      	latitude: location.latitude,
      	longitude: location.longitude,
      	accuracy: location.accuracy,
      	timestamp: location.timestamp,
    	}),
  	});

  	if (!response.ok) {
    	const errorData = await response.json();
    	throw new Error(`Server error: ${response.status} - ${errorData.message}`);
  	}

  	alert('Location sent successfully!');
	} catch (err) {
  	console.error('Error sending location:', err);
  	alert(`Failed to send location: ${err.message}`);
	}
  };

  return (
	<div style={{ padding: '20px' }}>
  	<h1>Geolocation App</h1>

  	<button onClick={getLocation} disabled={isLoading}>
    	{isLoading ? 'Getting Location...' : 'Get Location'}
  	</button>

  	{error && <p style={{ color: 'red' }}>Error: {error}</p>}

  	{location && (
    	<div>
      	<p>Latitude: {location.latitude}</p>
      	<p>Longitude: {location.longitude}</p>
      	<p>Accuracy: {location.accuracy} meters</p>
      	<p>Timestamp: {new Date(location.timestamp).toLocaleString()}</p>

      	{/* Map Container */}
      	<MapContainer
        	center={[location.latitude, location.longitude]}
        	zoom={13} // Adjust zoom level as needed
        	style={{ height: '400px', width: '100%' }} // Set map dimensions
      	>
        	<TileLayer
          	attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        	/>
        	<Marker position={[location.latitude, location.longitude]}>
          	<Popup>
            	Your Location <br /> Accuracy: {location.accuracy} meters
          	</Popup>
        	</Marker>
      	</MapContainer>

      	<button onClick={handleSendLocation}>Send Location to Server</button>
    	</div>
  	)}
	</div>
  );
}

export default App;