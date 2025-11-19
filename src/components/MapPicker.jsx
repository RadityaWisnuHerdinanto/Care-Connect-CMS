import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setSearchQuery, setLocationSelected }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      console.log("🗺️ Map clicked at:", { lat, lng });
      
      // Set temporary name with coordinates
      const coordName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setSearchQuery(coordName);
      setLocationSelected(true);
      
      // Reverse geocode to get proper location name
      axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.0.0 Mobile Safari/537.36'
          },
          params: {
            email: 'radityawisnu071@gmail.com'
          }
        }
      )
        .then(res => {
          if (res.data && res.data.display_name) {
            console.log("🗺️ Reverse geocode result:", res.data.display_name);
            setSearchQuery(res.data.display_name);
          }
        })
        .catch(err => {
          console.error('Reverse geocoding error:', err);
          // Keep the coordinate-based name if reverse geocoding fails
        });
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ location, onLocationChange, onClose }) {
  const [position, setPosition] = useState(
    location.lat && location.lng ? [location.lat, location.lng] : [-6.2088, 106.8456]
  );
  const [searchQuery, setSearchQuery] = useState(location.name || '');
  const [searching, setSearching] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const mapRef = useRef(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
        setPosition(newPos);
        setSearchQuery(result.display_name);
        setLocationSelected(true);
        
        // Fly to location
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 13);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    console.log("💾 Saving location:", {
      name: searchQuery,
      lat: position[0],
      lng: position[1]
    });
    onLocationChange({
      name: searchQuery,
      lat: position[0],
      lng: position[1]
    });
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Pick Location</h3>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location or edit the name manually"
            style={styles.searchInput}
          />
          <button onClick={handleSearch} disabled={searching} style={styles.searchButton}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <p style={styles.instruction}>
          💡 Search for a location or click on the map, then edit the name if needed
        </p>

        <div style={styles.mapWrapper}>
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position} 
              setPosition={setPosition}
              setSearchQuery={setSearchQuery}
              setLocationSelected={setLocationSelected}
            />
          </MapContainer>
        </div>

        <div style={styles.coords}>
          📍 Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>

        {locationSelected && (
          <div style={styles.selectedNotice}>
            ✅ Location selected! Click "Save Location" to confirm.
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            style={{
              ...styles.saveButton,
              backgroundColor: locationSelected ? '#047857' : '#9ca3af',
              cursor: locationSelected ? 'pointer' : 'not-allowed',
            }}
            disabled={!locationSelected}
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
    padding: '20px 24px 0',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#047857',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  instruction: {
    padding: '12px 24px',
    margin: 0,
    fontSize: '13px',
    color: '#6B7280',
  },
  mapWrapper: {
    padding: '0 24px',
    marginBottom: '16px',
  },
  coords: {
    padding: '0 24px 16px',
    fontSize: '14px',
    color: '#047857',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #E5E7EB',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#047857',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  selectedNotice: {
    padding: '12px',
    backgroundColor: '#d1fae5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#047857',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
  },
};

