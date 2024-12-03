'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types
interface TradeRoute {
  id: string;
  name: string;
  period: string;
  description: string;
  color: string;
  path: LatLngTuple[];
}

interface Territory {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface Empire {
  name: string;
  period: string;
  description: string;
  color: string;
  borderColor: string;
  territories: Territory;
  population?: {
    year: number;
    amount: number;
  }[];
}

interface EmpireData {
  [key: string]: Empire;
}

interface TradeRouteData {
  [key: string]: TradeRoute;
}

const EmpireMapViewer: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(800);
  const [selectedEmpire, setSelectedEmpire] = useState<string | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [showTradeRoutes, setShowTradeRoutes] = useState<boolean>(true);

  // Sample trade routes data
  const tradeRouteData: TradeRouteData = {
    silkRoad: {
      id: 'silkRoad',
      name: 'Silk Road',
      period: '500-1500',
      description: 'Ancient network of trade routes connecting East and West',
      color: '#FF6B6B',
      path: [
        [35, 105], // Xi'an
        [40, 75], // Samarkand
        [35, 51], // Tehran
        [41, 28], // Constantinople
        [42, 12] // Rome
      ]
    },
    transSharian: {
      id: 'transSaharan',
      name: 'Trans-Saharan Trade Route',
      period: '500-1500',
      description: 'Trade route connecting North Africa with West Africa',
      color: '#4ECDC4',
      path: [
        [33, 6], // Sijilmasa
        [25, 0], // In-Salah
        [17, -3], // Timbuktu
        [12, -8] // Ghana Empire
      ]
    }
  };

  // Sample empire data
  const empireData: EmpireData = {
    Amazigh: {
      name: 'Amazigh Empire',
      period: '700-1000',
      description: 'A Berber empire that controlled much of North Africa',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-5, 35],
              [10, 35],
              [15, 30],
              [0, 25],
              [-5, 35]
            ]
          ]
        }
      },
      population: [
        { year: 700, amount: 1000000 },
        { year: 800, amount: 1500000 },
        { year: 900, amount: 2000000 }
      ]
    },
    Imuhar: {
      name: 'Imuhar Territory',
      period: '500-1200',
      description: 'Historical territory of the Tuareg people',
      color: 'rgba(180, 180, 180, 0.5)',
      borderColor: 'rgb(100, 100, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 25],
              [10, 25],
              [5, 15],
              [-5, 15],
              [0, 25]
            ]
          ]
        }
      }
    }
  };

  const initializeMap = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const L = (await import('leaflet')).default;

      if (!map) {
        const mapInstance = L.map('map').setView([25, 0], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        setMap(mapInstance);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [map]);

  useEffect(() => {
    initializeMap();

    return () => {
      map?.remove();
    };
  }, [initializeMap, map]);

  const drawTradeRoutes = useCallback(
    (L: typeof import('leaflet')) => {
      if (!map || !showTradeRoutes) return;

      Object.values(tradeRouteData).forEach((route) => {
        const [startYear, endYear] = route.period.split('-').map(Number);

        if (selectedYear >= startYear && selectedYear <= endYear) {
          const polyline = L.polyline(route.path, {
            color: route.color,
            weight: 3,
            dashArray: '10, 10',
            opacity: 0.7
          }).addTo(map);

          // Add animated markers along the route
          const marker = L.marker(route.path[0], {
            icon: L.divIcon({
              className: 'trade-route-marker',
              html: '🐪',
              iconSize: [20, 20]
            })
          }).addTo(map);

          let step = 0;
          const animate = () => {
            if (step < route.path.length - 1) {
              const start = route.path[step];
              const end = route.path[step + 1];
              const duration = 2000; // 2 seconds per segment

              const startTime = Date.now();
              const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                  const lat = start[0] + (end[0] - start[0]) * progress;
                  const lng = start[1] + (end[1] - start[1]) * progress;
                  marker.setLatLng([lat, lng]);
                  requestAnimationFrame(animate);
                } else {
                  step++;
                  if (step < route.path.length - 1) {
                    animate();
                  }
                }
              };

              requestAnimationFrame(animate);
            }
          };

          animate();
        }
      });
    },
    [map, selectedYear, showTradeRoutes]
  );

  useEffect(() => {
    const updateMap = async () => {
      if (!map) return;

      const L = (await import('leaflet')).default;

      // Clear existing layers
      map.eachLayer((layer) => {
        if (
          (layer as L.GeoJSON).feature ||
          layer instanceof L.Polyline ||
          layer instanceof L.Marker
        ) {
          map.removeLayer(layer);
        }
      });

      // Add empire territories
      Object.entries(empireData).forEach(([id, empire]) => {
        const [startYear, endYear] = empire.period.split('-').map(Number);

        if (selectedYear >= startYear && selectedYear <= endYear) {
          const layer = L.geoJSON(empire.territories, {
            style: {
              fillColor: empire.color,
              fillOpacity: 0.5,
              color: empire.borderColor,
              weight: selectedEmpire === id ? 3 : 1
            }
          }).addTo(map);

          layer.on({
            mouseover: (e) => {
              e.target.setStyle({
                weight: 3,
                fillOpacity: 0.7
              });
            },
            mouseout: (e) => {
              e.target.setStyle({
                weight: selectedEmpire === id ? 3 : 1,
                fillOpacity: 0.5
              });
            },
            click: () => setSelectedEmpire(id)
          });
        }
      });

      // Draw trade routes
      drawTradeRoutes(L);
    };

    updateMap();
  }, [map, selectedYear, selectedEmpire, drawTradeRoutes]);

  return (
    <div className="flex h-screen">
      <div className="flex-grow">
        <div id="map" className="w-full h-full">
          <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <input
                  type="range"
                  min="500"
                  max="2000"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-48"
                />
                <span className="font-medium">{selectedYear} CE</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showTradeRoutes}
                    onChange={(e) => setShowTradeRoutes(e.target.checked)}
                    className="rounded"
                  />
                  Show Trade Routes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="w-96 h-full rounded-none">
        <CardHeader>
          <CardTitle>Historical Empires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              Active empires in {selectedYear} CE
            </div>
          </div>

          {selectedEmpire ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                {empireData[selectedEmpire].name}
              </h2>
              <p className="text-sm text-gray-600">
                Period: {empireData[selectedEmpire].period}
              </p>
              <p>{empireData[selectedEmpire].description}</p>
              {empireData[selectedEmpire].population && (
                <div className="mt-4">
                  <h3 className="font-medium">Population History</h3>
                  <div className="space-y-1">
                    {empireData[selectedEmpire].population.map((pop) => (
                      <div key={pop.year} className="flex justify-between">
                        <span>{pop.year} CE</span>
                        <span>{pop.amount.toLocaleString()} people</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setSelectedEmpire(null)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to list
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(empireData)
                .filter(([_, empire]) => {
                  const [start, end] = empire.period.split('-').map(Number);
                  return selectedYear >= start && selectedYear <= end;
                })
                .map(([id, empire]) => (
                  <div
                    key={id}
                    onClick={() => setSelectedEmpire(id)}
                    className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                    style={{ borderLeft: `4px solid ${empire.borderColor}` }}
                  >
                    <h3 className="font-medium">{empire.name}</h3>
                    <p className="text-sm text-gray-600">{empire.period}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpireMapViewer;
