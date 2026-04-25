import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../services/supabase";
import {
  updateDeliveryLocation,
  markOrderDelivered,
  getOrderDetails,
  getDeliveryLocation,
} from "../../services/order.service";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const STEP_LAT = 0.0001;
const STEP_LNG = 0.0001;

// Distance is now calculated in the backend using PostGIS ST_DWithin

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export const DeliveryTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [deliveryPos, setDeliveryPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [destinationPos, setDestinationPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [distance, setDistance] = useState<number | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deliveryPosRef = useRef(deliveryPos);
  deliveryPosRef.current = deliveryPos;

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelReadyRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;

    const loadData = async () => {
      try {
        const order = await getOrderDetails(orderId);
        setDestinationPos({
          lat: order.delivery_latitude,
          lng: order.delivery_longitude,
        });

        try {
          const loc = await getDeliveryLocation(orderId);
          setDeliveryPos({ lat: loc.latitude, lng: loc.longitude });
        } catch {
          const startLat = order.delivery_latitude + 0.005;
          const startLng = order.delivery_longitude + 0.005;
          setDeliveryPos({ lat: startLat, lng: startLng });

          await updateDeliveryLocation(orderId, startLat, startLng);
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Failed to load tracking data",
        );
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase.channel(`delivery-tracking-${orderId}`);
    channel.subscribe((status) => {
      channelReadyRef.current = status === "SUBSCRIBED";
    });
    channelRef.current = channel;

    return () => {
      channelReadyRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const broadcastPosition = useCallback(async (lat: number, lng: number) => {
    if (channelRef.current) {
      try {
        await channelRef.current.send({
          type: "broadcast",
          event: "location-update",
          payload: { latitude: lat, longitude: lng },
        });
      } catch (err) {
        console.warn("Broadcast failed:", err);
      }
    }
  }, []);

// Distance tracking relies on the backend

  const handleDeliver = async () => {
    if (!orderId || delivered) return;
    try {
      await markOrderDelivered(orderId);
      setDelivered(true);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "order-delivered",
          payload: { orderId },
        });
      }
    } catch (err: any) {
      console.error("Failed to mark as delivered:", err);
    }
  };

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (delivered || !orderId) return;
      const current = deliveryPosRef.current;
      if (!current) return;

      let newLat = current.lat;
      let newLng = current.lng;

      switch (e.key) {
        case "ArrowUp":
          newLat += STEP_LAT;
          break;
        case "ArrowDown":
          newLat -= STEP_LAT;
          break;
        case "ArrowLeft":
          newLng -= STEP_LNG;
          break;
        case "ArrowRight":
          newLng += STEP_LNG;
          break;
        default:
          return;
      }

      e.preventDefault();

      setDeliveryPos({ lat: newLat, lng: newLng });

      try {
        const update = await updateDeliveryLocation(orderId, newLat, newLng);
        await broadcastPosition(newLat, newLng);

        if (update.distance !== undefined && update.distance !== null) {
          setDistance(update.distance);
        }
        if (update.isNear && !delivered) {
          handleDeliver();
        }
      } catch (err) {
        console.error("Failed to update location:", err);
      }
    },
    [orderId, delivered, broadcastPosition],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-error mb-4">Error</h2>
          <p className="text-base-content/70 mb-6">{error}</p>
          <Link to="/delivery/my-deliveries" className="btn btn-primary">
            ← Back to deliveries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="bg-base-100 shadow-md px-6 py-4 flex items-center justify-between z-[1000] relative">
        <div className="flex items-center gap-4">
          <Link
            to="/delivery/my-deliveries"
            className="btn btn-outline btn-sm"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              🗺️ Delivery Tracking
            </h1>
            <p className="text-sm text-base-content/60">
              Order: {orderId?.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {distance !== null && (
            <div className="badge badge-lg badge-outline gap-2">
              📏 {distance < 1000 ? `${distance.toFixed(1)} m` : `${(distance / 1000).toFixed(2)} km`}
            </div>
          )}
          {delivered ? (
            <div className="badge badge-lg badge-success gap-2">
              ✅ Delivered
            </div>
          ) : (
            <div className="badge badge-lg badge-warning gap-2">
              🚴 En route
            </div>
          )}
        </div>
      </div>

      {!delivered && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-base-300 px-6 py-3 z-[1000] relative">
          <div className="max-w-3xl mx-auto flex items-center gap-6 text-sm">
            <span className="font-semibold text-base-content/80">
              Use arrow keys to move:
            </span>
            <div className="flex gap-2">
              <kbd className="kbd kbd-sm">↑</kbd>
              <kbd className="kbd kbd-sm">↓</kbd>
              <kbd className="kbd kbd-sm">←</kbd>
              <kbd className="kbd kbd-sm">→</kbd>
            </div>
            <span className="text-base-content/60">
              Get within 5m of the store to complete delivery
            </span>
          </div>
        </div>
      )}

      {delivered && (
        <div className="bg-success/20 border-b border-success/30 px-6 py-4 z-[1000] relative">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-bold text-lg text-success">
                  Order delivered successfully!
                </p>
                <p className="text-sm text-base-content/60">
                  The customer has been notified.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/delivery/my-deliveries")}
              className="btn btn-success"
            >
              Back to deliveries
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative" style={{ minHeight: "500px" }}>
        {deliveryPos && destinationPos && (
          <MapContainer
            center={[deliveryPos.lat, deliveryPos.lng]}
            zoom={16}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter lat={deliveryPos.lat} lng={deliveryPos.lng} />

            <Marker
              position={[deliveryPos.lat, deliveryPos.lng]}
              icon={deliveryIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>🚴 You (Delivery)</strong>
                  <br />
                  <span className="text-xs text-gray-500">
                    {deliveryPos.lat.toFixed(6)}, {deliveryPos.lng.toFixed(6)}
                  </span>
                </div>
              </Popup>
            </Marker>

            <Marker
              position={[destinationPos.lat, destinationPos.lng]}
              icon={destinationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>📍 Destino de entrega</strong>
                  <br />
                  <span className="text-xs text-gray-500">
                    {destinationPos.lat.toFixed(6)}, {destinationPos.lng.toFixed(6)}
                  </span>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};
