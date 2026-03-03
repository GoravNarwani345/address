import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import type { PropertyData } from '../services/api';

// Fix for default marker icon issue in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
    properties: PropertyData[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    onMarkerClick?: (property: PropertyData) => void;
}

// Helper to auto-center the map when property list changes
const AutoCenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({
    properties,
    center = [25.3960, 68.3578],
    zoom = 13,
    height = '500px'
}) => {
    const displayCenter = properties.length === 1 && properties[0].coordinates
        ? [properties[0].coordinates.lat, properties[0].coordinates.lng] as [number, number]
        : center;

    return (
        <div style={{ height, width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }} className="shadow-2xl border border-white/10 glass">
            <MapContainer
                center={displayCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AutoCenter center={displayCenter} />
                {properties.map((property) => (
                    property.coordinates && (
                        <Marker
                            key={property.id || (property as any)._id}
                            position={[property.coordinates.lat, property.coordinates.lng]}
                        >
                            <Popup className="property-popup">
                                <div className="p-2 min-w-[200px]">
                                    <img
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="w-full h-24 object-cover rounded-lg mb-2"
                                    />
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{property.title}</h4>
                                    <p className="text-primary font-black text-xs mb-2">PKR {(Number(property.price) / 1000000).toFixed(1)}M</p>
                                    <Link
                                        to={`/listing/${property.id || (property as any)._id}`}
                                        className="block w-full py-2 bg-primary text-white text-center text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default PropertyMap;
