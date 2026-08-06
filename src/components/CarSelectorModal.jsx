import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CAR_MODELS } from '../data/products';
import { X, Car, CheckCircle } from 'lucide-react';

export const CarSelectorModal = () => {
  const { isCarSelectorOpen, setIsCarSelectorOpen, selectedCar, setSelectedCar, addToast } = useShop();

  const [make, setMake] = useState(selectedCar.make);
  const [model, setModel] = useState(selectedCar.model);
  const [year, setYear] = useState(selectedCar.year);

  if (!isCarSelectorOpen) return null;

  const currentModels = CAR_MODELS.find(c => c.make === make)?.models || [];

  const handleSave = () => {
    setSelectedCar({ make, model, year });
    setIsCarSelectorOpen(false);
    addToast(`Car set to ${make} ${model} (${year})`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-gray-200 text-gray-900 text-xs">
        
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-[#3B429F]" />
            <h3 className="font-bold text-gray-900 text-sm">Select Your Vehicle</h3>
          </div>
          <button onClick={() => setIsCarSelectorOpen(false)} className="p-1 text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-gray-700 font-bold block mb-1">MAKE</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CAR_MODELS.map(c => (
                <button
                  key={c.make}
                  type="button"
                  onClick={() => {
                    setMake(c.make);
                    setModel(c.models[0]);
                  }}
                  className={`p-2 rounded border text-center font-semibold ${
                    make === c.make ? 'bg-[#3B429F] text-white border-[#3B429F]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {c.make}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-700 font-bold block mb-1">MODEL</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
            >
              {currentModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-700 font-bold block mb-1">YEAR</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
            >
              {['2024', '2023', '2022', '2021', '2020', '2019', '2018'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleSave} className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
          <CheckCircle className="w-4 h-4" /> Save Vehicle Profile
        </button>

      </div>
    </div>
  );
};
