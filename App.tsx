/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  Upload, 
  ShieldCheck, 
  Users, 
  Ear, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons not appearing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { mockNeeds, mockVolunteers } from './mockData';
import { extractSurveyData } from './geminiService';
import { redactPII, redactName } from './utils/redaction';

export default function App() {
  const [zenithMode, setZenithMode] = useState(false);
  const [needs, setNeeds] = useState(mockNeeds);
  const [volunteers] = useState(mockVolunteers);
  const [selectedNeed, setSelectedNeed] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedVolunteers = selectedNeed 
    ? volunteers.filter(v => 
        v.skills.some(skill => 
          selectedNeed.category.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(selectedNeed.category.toLowerCase())
        )
      ).slice(0, 3)
    : [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setExtractionResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const result = await extractSurveyData(base64);
        setExtractionResult(result);
      } catch (error) {
        console.error("Extraction failed:", error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNeed = () => {
    if (!extractionResult) return;
    
    const newNeed = {
      ...extractionResult,
      id: `n${Date.now()}`,
      status: 'Open',
      location: { 
        lat: extractionResult.lat || 14.5995, 
        lng: extractionResult.lng || 120.9842 
      }
    };
    
    setNeeds(prev => [newNeed, ...prev]);
    setExtractionResult(null);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-all duration-300 ${zenithMode ? 'zenith-active' : ''}`}>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 ug-header ug-border ug-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm text-white font-bold ug-border">
            UG
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-dark-carob">
              UnityGrid <span className="text-olive">AI</span>
            </h1>
            <div className="mt-1 px-2 py-0.5 bg-olive text-white text-[10px] font-bold uppercase tracking-widest ug-border inline-block">
              Mission Control v1.5
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-carob">PrivacyMesh Status</span>
            <span className="text-xs text-green-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
              Active / Redacting PII
            </span>
          </div>
          <button 
            onClick={() => setZenithMode(!zenithMode)}
            className={`flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 font-bold uppercase text-xs hover:bg-zinc-800 transition-all ug-border ${zenithMode ? 'animate-pulse' : ''}`}
          >
            <Ear className="w-4 h-4" />
            <span>Zenith AI: {zenithMode ? 'Accessible' : 'Standard'} Mode</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px] overflow-hidden">
        
        {/* Left Column: Pipeline */}
        <section className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="ug-card p-4 ug-shadow flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
              <div className="w-2 h-2 bg-black flex-shrink-0" />
              <h2 className="font-bold uppercase tracking-widest text-xs">Vision-to-Data Pipeline</h2>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-shrink-0 w-full h-32 border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors group cursor-pointer"
              >
                <div className="bg-chai border-2 border-black p-2">
                  <Upload className="w-5 h-5 text-dark-carob" />
                </div>
                <span className="text-[10px] font-bold uppercase text-zinc-500">Upload Handwritten Survey</span>
              </button>

              <div className="flex-1 border-2 border-black bg-zinc-900 text-green-400 p-3 rounded-sm font-mono text-[10px] leading-tight overflow-auto">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] opacity-50 uppercase text-white">Extracted Payload (JSON)</span>
                   <ShieldCheck className="w-3 h-3 text-green-500" />
                </div>
                {extractionResult ? (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        need: extractionResult.category,
                        urgency: extractionResult.urgency,
                        user: redactName(extractionResult.requesterName),
                        phone: redactPII(extractionResult.requesterPhone),
                        gps: `${extractionResult.lat}, ${extractionResult.lng}`
                      }, null, 2)}
                    </pre>
                    <button 
                      onClick={handleAddNeed}
                      className="mt-2 w-full py-2 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest ug-border hover:bg-green-700"
                    >
                      Commit to Grid
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center italic opacity-30 text-white">
                    // Awaiting stream...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-chai ug-border ug-shadow p-4 rounded-sm flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-dark-carob tracking-tighter">Search Network Map</span>
              <MapPin className="w-3 h-3 text-dark-carob" />
            </div>
            <div className="bg-white ug-border h-8 flex items-center px-2 text-[10px] opacity-40">
              Enter target coordinates...
            </div>
          </div>
        </section>

        {/* Center Column: Map */}
        <section className="lg:col-span-6 bg-[#E5E7EB] ug-border ug-shadow relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 bg-white/90 ug-border px-3 py-1 z-[1000]">
            <span className="text-[10px] font-bold uppercase tracking-tight">Sector: Southeast Grid-4</span>
          </div>
          
          <div className="flex-1 relative">
            <MapContainer 
              center={[14.5995, 120.9842]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              className="z-[1]"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {needs.map((need: any) => {
                const colorClass = need.urgency === 'High' ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : need.urgency === 'Medium' ? 'bg-yellow-400 shadow-[0_0_10px_#FACC15]' : 'bg-green-900 shadow-[0_0_10px_#166534]';
                
                const customMarker = L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="w-4 h-4 rounded-full border-2 border-white animate-pulse ${colorClass}"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                });

                return (
                  <Marker 
                    key={need.id} 
                    position={[need.location.lat, need.location.lng]}
                    icon={customMarker}
                    eventHandlers={{
                      click: () => setSelectedNeed(need),
                    }}
                  >
                    <Popup className="ug-popup">
                      <div className="p-1 font-sans">
                        <span className="text-[10px] uppercase font-bold px-1 bg-black text-white">
                          {need.urgency}
                        </span>
                        <h4 className="font-bold text-sm mt-1">{need.category}</h4>
                        <p className="text-[10px] opacity-70 mt-1 italic">"{redactPII(need.description)}"</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2 z-[1000]">
            <div className="bg-white/90 ug-border px-2 py-1 text-[8px] font-bold uppercase flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> High
            </div>
            <div className="bg-white/90 ug-border px-2 py-1 text-[8px] font-bold uppercase flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span> Med
            </div>
            <div className="bg-white/90 ug-border px-2 py-1 text-[8px] font-bold uppercase flex items-center">
              <span className="w-2 h-2 bg-green-900 rounded-full mr-1"></span> Low
            </div>
          </div>
        </section>

        {/* Right Column: Dispatch */}
        <section className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="ug-card p-4 ug-shadow flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
              <div className="w-2 h-2 bg-black flex-shrink-0" />
              <h2 className="font-bold uppercase tracking-widest text-xs">Agentic Dispatch</h2>
            </div>
            
            <div className="flex-1 overflow-auto space-y-4">
              {selectedNeed ? (
                <div className="space-y-4">
                  <div className="p-3 border-l-8 border-red-500 bg-zinc-50 ug-border">
                    <div className="text-[10px] font-bold uppercase text-red-600 mb-1">Targeted: {selectedNeed.category}</div>
                    <p className="text-[11px] leading-tight opacity-70 italic">"{redactPII(selectedNeed.description)}"</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase mb-2 text-carob tracking-wider">Matched Personnel</h3>
                    {matchedVolunteers.length > 0 ? matchedVolunteers.map((v, idx) => (
                      <div key={v.id} className="flex items-center justify-between p-2 bg-zinc-50 ug-border text-[11px]">
                         <span className="font-bold">{v.name}</span>
                         <span className="text-[9px] bg-black text-white px-1 uppercase tracking-tighter">
                           {v.skills[0]}
                         </span>
                      </div>
                    )) : (
                      <div className="p-3 border-2 border-dashed border-zinc-200 text-center italic text-[10px] opacity-40">
                        No immediate matches...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4 py-12">
                  <Users className="w-10 h-10" />
                  <p className="text-[10px] uppercase font-bold">Select a sector point to coordinate response</p>
                </div>
              )}
            </div>
            
            <button className="w-full py-3 bg-black text-white font-bold uppercase text-xs mt-4 tracking-widest hover:bg-zinc-800 transition-colors">
              Deploy Responders
            </button>
          </div>

          <div className="h-32 ug-header ug-border ug-shadow p-4 rounded-sm">
            <div className="text-[10px] font-bold uppercase text-carob mb-2 tracking-widest">Active Intelligence</div>
            <div className="flex gap-2 h-12">
              <div className="flex-1 bg-zinc-200 ug-border flex flex-col items-center justify-center">
                <span className="text-xl font-bold leading-none">{needs.length}</span>
                <span className="text-[7px] uppercase font-bold">Nodes</span>
              </div>
              <div className="flex-1 bg-zinc-200 ug-border flex flex-col items-center justify-center">
                <span className="text-xl font-bold leading-none">99%</span>
                <span className="text-[7px] uppercase font-bold">Uptime</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase text-white/70">
        <div className="flex items-center gap-4">
          <span>System: Nominal</span>
          <span>●</span>
          <span>Uptime: 99.98%</span>
          <span>●</span>
          <span>Encrypted Node: #X99-24</span>
        </div>
        <div className="hidden sm:block">Built for Disaster Response Management</div>
      </footer>
    </div>
  );
}
