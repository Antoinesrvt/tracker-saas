"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Layers, Map as MapIcon, CircleDot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import type { LatLngTuple, Map as LeafletMap, Layer, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './page.css';

// Types
interface Resource {
  id: string;
  name: string;
  type: 'gold' | 'silver' | 'spices' | 'silk' | 'grain' | 'salt';
  location: LatLngTuple;
  period: string;
  icon: string;
  empireId: string;
}

interface City {
  id: string;
  name: string;
  location: LatLngTuple;
  population: number;
  type: 'capital' | 'major' | 'trading';
  period: string;
  empireId: string;
}

interface MapLayers {
  empires: boolean;
  tradeRoutes: boolean;
  cities: boolean;
  resources: boolean;
}

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

// Constants
const CITY_ICONS = {
  capital: '🏰',
  major: '🏘️',
  trading: '🏪'
};

const RESOURCE_ICONS = {
  gold: '💰',
  silver: '⚪',
  spices: '🌶️',
  silk: '🧵',
  grain: '🌾',
  salt: '🧂'
};

const createTooltipContent = (data: any) => `
<div class="map-tooltip">
  <style>
    .map-tooltip {
      font-family: Inter, system-ui, sans-serif;
      padding: 12px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-width: 200px;
      backdrop-filter: blur(8px);
    }
    .tooltip-title { 
      font-size: 16px; 
      font-weight: 600; 
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 8px;
    }
    .tooltip-content {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.5;
    }
    .tooltip-stat {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tooltip-stat:last-child {
      border-bottom: none;
    }
  </style>
  <div class="tooltip-title">${data.title}</div>
  <div class="tooltip-content">
    ${data.content}
  </div>
</div>
`;

const MockedCitiesData: City[] = [
      {
        id: 'carthage',
        name: 'Carthage',
        location: [36.8, 10.2],
        population: 500000,
        type: 'major',
        period: '500-1000',
        empireId: 'Amazigh'
      },
      {
        id: 'sijilmasa',
        name: 'Sijilmasa',
        location: [31.28, -4.26],
        population: 100000,
        type: 'trading',
        period: '757-1400',
        empireId: 'Amazigh'
      }
];

const MockedResourcesData: Resource[] = [
      {
        id: 'gold1',
        name: 'Bambuk Gold Fields',
        type: 'gold',
        location: [13.13, -11.32],
        period: '500-1500',
        icon: RESOURCE_ICONS.gold,
        empireId: 'Imuhar'
      },
      {
        id: 'salt1',
        name: 'Taghaza Salt Mines',
        type: 'salt',
        location: [23.33, -5.77],
        period: '500-1500',
        icon: RESOURCE_ICONS.salt,
        empireId: 'Imuhar'
      }
    ]

const MockedTradeRouteData: Record<string, TradeRoute> = {
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
    // ... other trade routes
  };

  const MockedEmpireData: Record<string, Empire> = {
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
      name: 'Imuhar Empire',
      period: '500-1500',
      description: 'An empire that controlled much of West Africa',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-5, 35], [10, 35], [15, 30], [0, 25], [-5, 35]]]
        }
      }
    },
    Mali: {
      name: 'Mali Empire',
      period: '1232-1650',
      description: 'A powerful empire that controlled much of West Africa',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-5, 35], [10, 35], [15, 30], [0, 25], [-5, 35]]]
        }
      }
    },
    Rome: {
      name: 'Roman Empire',
      period: '753-476',
      description: 'A powerful empire that controlled much of Europe',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-5, 35], [10, 35], [15, 30], [0, 25], [-5, 35]]]
        }
      }
    },
    France: {
      name: 'French Empire',
      period: '1492-1960',
      description: 'A powerful empire that controlled much of Europe',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-5, 35], [10, 35], [15, 30], [0, 25], [-5, 35]]]
        }
      }
    },
    China: {
      name: 'Chinese Empire',
      period: '221-1912',
      description: 'A powerful empire that controlled much of Asia',
      color: 'rgba(200, 230, 200, 0.5)',
      borderColor: 'rgb(100, 160, 100)',
      territories: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-5, 35], [10, 35], [15, 30], [0, 25], [-5, 35]]]
        }
      }
    }
  };


// Component
const EmpireMapViewer: React.FC = () => {
  // State
  const [selectedYear, setSelectedYear] = useState<number>(800);
  const [selectedEmpire, setSelectedEmpire] = useState<string | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [layers, setLayers] = useState<MapLayers>({
    empires: true,
    tradeRoutes: true,
    cities: true,
    resources: true
  });

  // Sample cities data
  const citiesData = MockedCitiesData;


  // Sample resources data
  const resourcesData = MockedResourcesData;

  // Add the sample data
  const tradeRouteData = MockedTradeRouteData;

  const empireData = MockedEmpireData;

  // Helpers
  const isTimeActive = useCallback(
    (period: string): boolean => {
      const [start, end] = period.split('-').map(Number);
      return selectedYear >= start && selectedYear <= end;
    },
    [selectedYear]
  );

  const createCustomIcon = useCallback((html: string) => {
    if (typeof window === 'undefined') return null;
    const L = window.L;
    return L.divIcon({
      className: 'custom-div-icon',
      html,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }, []);

  // Map initialization
  const initializeMap = useCallback(async () => {
    if (typeof window === 'undefined' || map) return;

    try {
      const L = (await import('leaflet')).default;
      const mapInstance = L.map('map', {
        maxBounds: [
          [-90, -180],
          [90, 180]
        ],
        minZoom: 2,
        maxZoom: 8
      }).setView([25, 0], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        noWrap: true
      }).addTo(mapInstance);

      setMap(mapInstance);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [map]);

  // Layer management
  const drawTradeRoutes = useCallback(
    async (L: typeof import('leaflet')) => {
      if (!map || !layers.tradeRoutes) return;

      Object.values(tradeRouteData).forEach((route) => {
        if (isTimeActive(route.period)) {
          const polyline = L.polyline(route.path, {
            color: route.color,
            weight: 3,
            dashArray: '10, 10',
            opacity: 0.7
          }).addTo(map);

          // Add animated markers
          const marker = L.marker(route.path[0], {
            icon: L.divIcon({
              className: 'trade-route-marker',
              html: '🐪',
              iconSize: [20, 20]
            })
          }).addTo(map);

          // Animation logic
          let step = 0;
          const animate = () => {
            if (step < route.path.length - 1) {
              const start = route.path[step];
              const end = route.path[step + 1];
              const duration = 2000;

              const startTime = Date.now();
              const animateFrame = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                  const lat = start[0] + (end[0] - start[0]) * progress;
                  const lng = start[1] + (end[1] - start[1]) * progress;
                  marker.setLatLng([lat, lng]);
                  requestAnimationFrame(animateFrame);
                } else {
                  step++;
                  if (step < route.path.length - 1) {
                    animate();
                  }
                }
              };

              requestAnimationFrame(animateFrame);
            }
          };

          animate();
        }
      });
    },
    [map, layers.tradeRoutes, isTimeActive]
  );

 const updateLayers = useCallback(async () => {
   if (!map) return;

   const L = (await import('leaflet')).default;

   // Clear existing layers
   map.eachLayer((layer: Layer) => {
     if (
       layer instanceof L.Marker ||
       layer instanceof L.Polyline ||
       layer instanceof L.GeoJSON ||
       layer instanceof L.FeatureGroup
     ) {
       map.removeLayer(layer);
     }
   });

   // Create layer groups for better organization
   const empireLayers = L.featureGroup().addTo(map);
   const cityLayers = L.featureGroup().addTo(map);
   const resourceLayers = L.featureGroup().addTo(map);
   const tradeLayers = L.featureGroup().addTo(map);

   // Add empire territories with enhanced styling
   if (layers.empires) {
     Object.entries(empireData).forEach(([id, empire]) => {
       if (isTimeActive(empire.period)) {
         const layer = L.geoJSON(empire.territories, {
           style: {
             fillColor: empire.color,
             fillOpacity: 0.5,
             color: empire.borderColor,
             weight: selectedEmpire === id ? 3 : 1,
             dashArray: selectedEmpire === id ? '' : '5, 5'
           }
         }).addTo(empireLayers);

         // Enhanced territory interaction
         layer.on({
           mouseover: (e) => {
             e.target.setStyle({
               weight: 3,
               fillOpacity: 0.7,
               dashArray: ''
             });

             const tooltipContent = createTooltipContent({
               title: empire.name,
               content: `
                <div class="tooltip-stat">
                  <span>Period:</span>
                  <span>${empire.period}</span>
                </div>
                ${
                  empire.population
                    ? `
                <div class="tooltip-stat">
                  <span>Population:</span>
                  <span>${empire.population[empire.population.length - 1].amount.toLocaleString()}</span>
                </div>
                `
                    : ''
                }
                <div class="tooltip-stat">
                  <span>Territory Size:</span>
                  <span>${Math.floor(Math.random() * 1000000)} km²</span>
                </div>
              `
             });

             layer
               .bindTooltip(tooltipContent, {
                 direction: 'top',
                 offset: L.point(0, -10),
                 opacity: 1
               })
               .openTooltip();
           },
           mouseout: (e) => {
             e.target.setStyle({
               weight: selectedEmpire === id ? 3 : 1,
               fillOpacity: 0.5,
               dashArray: selectedEmpire === id ? '' : '5, 5'
             });
           },
           click: () => setSelectedEmpire(id)
         });
       }
     });
   }

   // Enhanced city visualization
   if (layers.cities) {
     citiesData.forEach((city) => {
       if (isTimeActive(city.period)) {
         // Create city influence radius
         const influenceRadius = Math.sqrt(city.population) * 100;
         L.circle(city.location, {
           radius: influenceRadius,
           color: 'rgba(255, 255, 255, 0.2)',
           fillColor: 'rgba(255, 255, 255, 0.1)',
           fillOpacity: 0.3,
           weight: 1,
           dashArray: '4, 4'
         }).addTo(cityLayers);

         // Enhanced city marker
         const icon = L.divIcon({
           className: 'custom-div-icon',
           html: `
            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(4px);
              border-radius: 50%;
              border: 2px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            ">
              ${CITY_ICONS[city.type]}
            </div>
          `,
           iconSize: [40, 40],
           iconAnchor: [20, 20]
         });

         const marker = L.marker(city.location, { icon }).addTo(cityLayers);

         // Enhanced city tooltip
         const tooltipContent = createTooltipContent({
           title: city.name,
           content: `
            <div class="tooltip-stat">
              <span>Type:</span>
              <span>${city.type}</span>
            </div>
            <div class="tooltip-stat">
              <span>Population:</span>
              <span>${city.population.toLocaleString()}</span>
            </div>
            <div class="tooltip-stat">
              <span>Influence:</span>
              <span>${Math.round(influenceRadius / 1000)} km</span>
            </div>
          `
         });

         marker.bindTooltip(tooltipContent, {
           direction: 'top',
           offset: L.point(0, -20),
           opacity: 1
         });

         if (selectedEmpire === city.empireId) {
           marker.setZIndexOffset(1000);
         }
       }
     });
   }

   // Enhanced trade routes
   if (layers.tradeRoutes) {
     Object.values(tradeRouteData).forEach((route) => {
       if (isTimeActive(route.period)) {
         // Create trade route path with animated flow
         const pathLayer = L.polyline(route.path, {
           color: route.color,
           weight: 3,
           opacity: 0.7
         }).addTo(tradeLayers);

         // Add animated markers along the route
         route.path.forEach((point, index) => {
           if (index < route.path.length - 1) {
             const icon = L.divIcon({
               className: 'trade-route-marker',
               html: `
                <div style="
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  animation: bounce 1s infinite;
                ">
                  🐪
                </div>
              `,
               iconSize: [24, 24]
             });

             const marker = L.marker(point, { icon }).addTo(tradeLayers);

             // Animate marker along the path
             const animate = () => {
               const nextPoint = route.path[index + 1];
               const latDiff = nextPoint[0] - point[0];
               const lngDiff = nextPoint[1] - point[1];
               const steps = 100;
               let currentStep = 0;

               const animation = setInterval(() => {
                 currentStep++;
                 const progress = currentStep / steps;
                 const newLat = point[0] + latDiff * progress;
                 const newLng = point[1] + lngDiff * progress;
                 marker.setLatLng([newLat, newLng]);

                 if (currentStep === steps) {
                   clearInterval(animation);
                   marker.remove();
                 }
               }, 50);
             };

             animate();
           }
         });

         // Enhanced trade route tooltip
         const tooltipContent = createTooltipContent({
           title: route.name,
           content: `
            <div class="tooltip-stat">
              <span>Period:</span>
              <span>${route.period}</span>
            </div>
            <div class="tooltip-stat">
              <span>Length:</span>
              <span>${Math.floor(Math.random() * 5000 + 1000)} km</span>
            </div>
            <div class="tooltip-stat">
              <span>Trade Volume:</span>
              <span>High</span>
            </div>
          `
         });

         pathLayer.bindTooltip(tooltipContent, {
           direction: 'top',
           offset: L.point(0, -10),
           opacity: 1
         });
       }
     });
   }

   // Enhanced resource visualization
   if (layers.resources) {
     resourcesData.forEach((resource) => {
       if (isTimeActive(resource.period)) {
         // Create resource influence area
         L.circle(resource.location, {
           radius: 50000,
           color: 'rgba(255, 215, 0, 0.3)',
           fillColor: 'rgba(255, 215, 0, 0.1)',
           fillOpacity: 0.3,
           weight: 1
         }).addTo(resourceLayers);

         const icon = L.divIcon({
           className: 'custom-div-icon',
           html: `
            <div style="
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              background: rgba(255, 215, 0, 0.1);
              backdrop-filter: blur(4px);
              border-radius: 50%;
              border: 2px solid rgba(255, 215, 0, 0.3);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              animation: pulse 2s infinite;
            ">
              ${resource.icon}
            </div>
          `,
           iconSize: [32, 32],
           iconAnchor: [16, 16]
         });

         const marker = L.marker(resource.location, { icon }).addTo(
           resourceLayers
         );

         // Enhanced resource tooltip
         const tooltipContent = createTooltipContent({
           title: resource.name,
           content: `
            <div class="tooltip-stat">
              <span>Type:</span>
              <span>${resource.type}</span>
            </div>
            <div class="tooltip-stat">
              <span>Production:</span>
              <span>${Math.floor(Math.random() * 1000 + 100)} units/year</span>
            </div>
            <div class="tooltip-stat">
              <span>Value:</span>
              <span>High</span>
            </div>
          `
         });

         marker.bindTooltip(tooltipContent, {
           direction: 'top',
           offset: L.point(0, -16),
           opacity: 1
         });
       }
     });
   }
 }, [
   map,
   layers,
   selectedYear,
   selectedEmpire,
   citiesData,
   resourcesData,
   isTimeActive
 ]);

  // Effects
  useEffect(() => {
    initializeMap();
    return () => {
      map?.remove();
      return undefined; // or just remove this line
    };
  }, [initializeMap, map]);

  useEffect(() => {
    updateLayers();
  }, [updateLayers]);

return (
  <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <div className="flex-grow relative">
      <div id="map" className="w-full h-full">
        {/* Controls Panel */}
        <div className="absolute top-4 left-4 z-[1000] glass rounded-xl p-6 space-y-6 transition-all duration-300 hover:shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/90 mb-2">
              <span className="text-sm font-medium">Timeline</span>
              <span className="text-2xl font-bold">{selectedYear} CE</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="text-white/80 hover:text-white transition-colors"
                onClick={() =>
                  setSelectedYear((prev) => Math.max(500, prev - 50))
                }
              >
                <Calendar className="w-5 h-5" />
              </button>
              <input
                type="range"
                min="500"
                max="2000"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-64"
              />
              <button
                className="text-white/80 hover:text-white transition-colors"
                onClick={() =>
                  setSelectedYear((prev) => Math.min(2000, prev + 50))
                }
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-white/90">
              Map Layers
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={layers.empires}
                onPressedChange={(pressed) =>
                  setLayers((prev) => ({ ...prev, empires: pressed }))
                }
                className="glass-hover data-[state=on]:bg-white/20"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Empires
              </Toggle>

              <Toggle
                pressed={layers.tradeRoutes}
                onPressedChange={(pressed) =>
                  setLayers((prev) => ({ ...prev, tradeRoutes: pressed }))
                }
                className="glass-hover data-[state=on]:bg-white/20"
              >
                <Layers className="w-4 h-4 mr-2" />
                Trade Routes
              </Toggle>

              <Toggle
                pressed={layers.cities}
                onPressedChange={(pressed) =>
                  setLayers((prev) => ({ ...prev, cities: pressed }))
                }
                className="glass-hover data-[state=on]:bg-white/20"
              >
                <CircleDot className="w-4 h-4 mr-2" />
                Cities
              </Toggle>

              <Toggle
                pressed={layers.resources}
                onPressedChange={(pressed) =>
                  setLayers((prev) => ({ ...prev, resources: pressed }))
                }
                className="glass-hover data-[state=on]:bg-white/20"
              >
                <CircleDot className="w-4 h-4 mr-2" />
                Resources
              </Toggle>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Card className="w-96 h-full glass border-none rounded-none overflow-auto">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white/90">Historical Data</CardTitle>
          <TabsList className="glass">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white/20"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="cities"
              className="data-[state=active]:bg-white/20"
            >
              Cities
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-white/20"
            >
              Resources
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="flex-grow overflow-auto">
          <TabsContent value="overview" className="mt-0 h-full">
            {selectedEmpire ? (
              <div className="space-y-6 p-4 fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white/90">
                    {empireData[selectedEmpire].name}
                  </h2>
                  <p className="text-sm text-white/60">
                    Period: {empireData[selectedEmpire].period}
                  </p>
                </div>

                <p className="text-white/80 leading-relaxed">
                  {empireData[selectedEmpire].description}
                </p>

                {empireData[selectedEmpire].population && (
                  <div className="space-y-3 glass rounded-lg p-4">
                    <h3 className="font-medium text-white/90">
                      Population History
                    </h3>
                    <div className="space-y-2">
                      {empireData[selectedEmpire].population.map((pop) => (
                        <div
                          key={pop.year}
                          className="flex justify-between text-white/70 hover:text-white/90 transition-colors"
                        >
                          <span>{pop.year} CE</span>
                          <span>{pop.amount.toLocaleString()} people</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedEmpire(null)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Back to list
                </button>
              </div>
            ) : (
              <div className="grid gap-3 p-4">
                {Object.entries(empireData)
                  .filter(([_, empire]) => isTimeActive(empire.period))
                  .map(([id, empire]) => (
                    <div
                      key={id}
                      onClick={() => setSelectedEmpire(id)}
                      className="glass glass-hover p-4 rounded-lg cursor-pointer transition-all duration-300"
                      style={{ borderLeft: `4px solid ${empire.borderColor}` }}
                    >
                      <h3 className="font-medium text-white/90">
                        {empire.name}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {empire.period}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cities" className="mt-0 h-full">
            <div className="grid gap-3 p-4">
              {citiesData
                .filter((city) => isTimeActive(city.period))
                .map((city) => (
                  <div
                    key={city.id}
                    className="glass glass-hover p-4 rounded-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{CITY_ICONS[city.type]}</span>
                      <div>
                        <h3 className="font-medium text-white/90">
                          {city.name}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          Population: {city.population.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-0 h-full">
            <div className="grid gap-3 p-4">
              {resourcesData
                .filter((resource) => isTimeActive(resource.period))
                .map((resource) => (
                  <div
                    key={resource.id}
                    className="glass glass-hover p-4 rounded-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{resource.icon}</span>
                      <div>
                        <h3 className="font-medium text-white/90">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          Type: {resource.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  </div>
);
};

export default EmpireMapViewer;
