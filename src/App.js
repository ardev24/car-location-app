// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css'; // Keep this import as it might be needed even without MapContainer
import L from 'leaflet';
import { saveLocation } from './firebase'; // Import saveLocation

// (leaflet marker fix - keep it in case other components use leaflet in future, minimal overhead)
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
        	timeout: 10000,
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
	const [sendLocationFlag, setSendLocationFlag] = useState(false);
	const [message, setMessage] = useState(null); // State for auto-dismissing message

	// useEffect for sending location (same as before)
	useEffect(() => {
    	if (sendLocationFlag && location && !isSending) {
        	const sendLocationData = async () => {
            	setIsSending(true);
            	try {
                	console.log("Sending location:", location);
                	await saveLocation(location);
                	setMessage({ text: 'Location fetched and sent successfully!', type: 'success' }); // Set success message
            	} catch (sendError) {
                	console.error('Error sending location:', sendError);
                	setMessage({ text: `Failed to send location: ${sendError.message}`, type: 'error' }); // Set error message
            	} finally {
                	setIsSending(false);
                	setSendLocationFlag(false);
            	}
        	};
        	sendLocationData();
    	}
	}, [sendLocationFlag, location, isSending, saveLocation]);

	// useEffect to auto-dismiss message after 3 seconds
	useEffect(() => {
    	if (message) {
        	const timer = setTimeout(() => {
            	setMessage(null); // Clear message after timeout
        	}, 3000); // 3 seconds
        	return () => clearTimeout(timer); // Cleanup on unmount or message change
    	}
	}, [message]);


	const handleGetAndSendLocation = () => {
    	if (!isSending) {
        	getLocation();
        	setSendLocationFlag(true);
    	}
	};


	return (
    	<div style={{
        	display: 'flex',
        	flexDirection: 'column',
        	alignItems: 'center', // Center horizontally
        	justifyContent: 'flex-start', // Align items to the top
        	height: '100vh', // Make the container take full viewport height
        	padding: '20px',
        	fontFamily: 'sans-serif'
    	}}>
        	<h1>Student Drop-off</h1>

        	<button
            	onClick={handleGetAndSendLocation}
            	disabled={isLoading || isSending}
            	style={{
                	padding: '15px 30px',
                	fontSize: '1.2em',
                	fontWeight: 'bold',
                	backgroundColor: '#4CAF50', // Green color
                	color: 'white',
                	border: 'none',
                	borderRadius: '8px',
                	cursor: 'pointer',
                	marginBottom: '20px', // Add some space below the button
            	}}
        	>
            	{isLoading ? 'Getting Location...' : (isSending ? 'Sending Location...' : 'Mark Drop-off Location')}
        	</button>

        	{error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}

        	{message && (
            	<div
                	style={{
                    	backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    	color: message.type === 'success' ? '#155724' : '#721c24',
                    	borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
                    	padding: '10px 15px',
                    	marginBottom: '10px',
                    	borderRadius: '4px',
                    	border: '1px solid',
                	}}
            	>
                	{message.text}
            	</div>
        	)}

        	{location && (
            	<div>
                	{/* Removed MapContainer */}
                	<p>Location Recorded!</p>
                	<p style={{ fontSize: '0.8em', color: '#777' }}>
                    	Latitude: {location.latitude}, Longitude: {location.longitude} <br />
                    	Accuracy: {location.accuracy} meters, Timestamp: {new Date(location.timestamp).toLocaleString()}
                	</p>
            	</div>
        	)}
    	</div>
	);
}

export default App;