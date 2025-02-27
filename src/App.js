// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { saveLocation } from './firebase'; // Import saveLocation

// (leaflet marker fix - same as before)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// useGeolocation hook (same as before - refined error handling is good)
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
            	setError(null); // Clear errors on success
        	},
        	(error) => {
            	setIsLoading(false);
            	if (error.code === error.PERMISSION_DENIED) {
                	setError('Location permission denied by user.');
            	} else if (error.code === error.TIMEOUT) {
                	setError('Location request timed out. Please try again.');
            	} else {
                	setError(`Geolocation error: ${error.message}`);
            	}
        	},
        	options
    	);
	}, []);

	return { location, error, isLoading, getLocation };
}


function App() {
	const { location, error, isLoading, getLocation } = useGeolocation();
	const [isSending, setIsSending] = useState(false);
	const [sendLocationFlag, setSendLocationFlag] = useState(false); // NEW: Flag to trigger sending

	// useEffect to trigger sending location when sendLocationFlag is set to true
	useEffect(() => {
    	if (sendLocationFlag && location && !isSending) { // Check flag AND location AND not already sending
        	const sendLocationData = async () => {
            	setIsSending(true);
            	try {
                	console.log("Sending location:", location); // Log location being sent
                	await saveLocation(location);
                	alert('Location fetched and sent successfully!');
            	} catch (sendError) {
                	console.error('Error sending location:', sendError);
                	alert(`Failed to send location: ${sendError.message}`);
            	} finally {
                	setIsSending(false);
                	setSendLocationFlag(false); // Reset the flag after attempting to send
            	}
        	};
        	sendLocationData();
    	}
	}, [sendLocationFlag, location, isSending, saveLocation]); // Dependencies: flag, location, isSending, saveLocation


	const handleGetAndSendLocation = () => {
    	if (!isSending) {
        	getLocation(); // Fetch location
        	setSendLocationFlag(true); // SET THE FLAG to trigger sending in useEffect when location is updated
    	}
	};


	return (
    	<div style={{ padding: '20px' }}>
        	<h1>Geolocation App</h1>

        	<button
            	onClick={handleGetAndSendLocation}
            	disabled={isLoading || isSending}
        	>
            	{isLoading ? 'Getting Location...' : (isSending ? 'Sending Location...' : 'Get and Send Location')}
        	</button>

        	{error && <p style={{ color: 'red' }}>Error: {error}</p>}

        	{location && (
            	<div>
                	<p>Latitude: {location.latitude}</p>
                	<p>Longitude: {location.longitude}</p>
                	<p>Accuracy: {location.accuracy} meters</p>
                	<p>Timestamp: {new Date(location.timestamp).toLocaleString()}</p>

                	{/* Map Container (same as before) */}
                	<MapContainer
                    	center={[location.latitude, location.longitude]}
                    	zoom={13}
                    	style={{ height: '400px', width: '100%' }}
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
            	</div>
        	)}
    	</div>
	);
}

export default App;