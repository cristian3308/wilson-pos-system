'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Building2, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { getDualDB, BusinessConfig } from '../lib/dualDatabase';
import DateRangeFilter, { DateRange } from './DateRangeFilter';
import { useHistoryData } from '../hooks/useHistoryData';

interface BusinessConfigurationPanelProps {
  onConfigurationChange?: (config: any) => void;
}

const BusinessConfigurationPanel: React.FC<BusinessConfigurationPanelProps> = ({ 
  onConfigurationChange 
}) => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Estado de conexión simplificado (siempre local)
  const [connectionStatus] = useState({
    isOnline: true,
    firebaseConnected: false, // Siempre false ahora
  });

  // Hook para datos del historial con filtros
  const {
    parkingRecords,
    carwashRecords,
    dailySummary,
    loading: historyLoading,
    loadData,
    deleteParkingRecord,
    deleteCarwashRecord,
    updateParkingRecord
  } = useHistoryData();

  // Estados para modales de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editType, setEditType] = useState<'parking' | 'carwash'>('parking');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const dualDB = getDualDB();
      const businessConfig = await dualDB.getBusinessConfig();
      
      if (businessConfig) {
        setConfig(businessConfig);
      } else {
        // Configuración por defecto
        const defaultConfig: BusinessConfig = {
          id: 'business_config_001',
          businessName: 'Mi Parqueadero Local',
          businessAddress: 'Dirección del negocio',
          businessPhone: '3001234567',
          carParkingRate: 3000,
          motorcycleParkingRate: 2000,
          truckParkingRate: 4000,
          carwashEnabled: true,
          parkingEnabled: true,
          ticketData: {
            companyName: 'WILSON CARS & WASH',
            companySubtitle: 'PARKING PROFESSIONAL',
            nit: '19.475.534-7',
            address: 'Calle 123 #45-67, Bogotá D.C.',
            phone: '+57 (1) 234-5678',
            email: 'info@wilsoncarwash.com',
            website: 'www.wilsoncarwash.com',
            footerMessage: '¡Gracias por confiar en nosotros!',
            footerInfo: 'Horario: 24/7 | Servicio completo de parqueadero'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setConfig(defaultConfig);
        await dualDB.saveBusinessConfig(defaultConfig);
      }
      
      setMessage('Configuración cargada correctamente');
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;

    setLoading(true);
    try {
      const dualDB = getDualDB();
      const updatedConfig = {
        ...config,
        updatedAt: new Date()
      };
      
      await dualDB.saveBusinessConfig(updatedConfig);
      setConfig(updatedConfig);
      setMessage('✅ Configuración guardada correctamente');
      
      // Notificar cambio si hay callback
      if (onConfigurationChange) {
        onConfigurationChange(updatedConfig);
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setMessage('❌ Error guardando configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (field: keyof BusinessConfig, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [field]: value
    });
  };

  const updateTicketData = (field: string, value: string) => {
    if (!config) return;
    
    const ticketData = config.ticketData || {
      companyName: '',
      companySubtitle: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      footerMessage: '',
      footerInfo: ''
    };
    
    setConfig({
      ...config,
      ticketData: {
        ...ticketData,
        [field]: value
      }
    });
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header principal */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuración del Sistema</h1>
                <p className="text-gray-600 mt-1">Administra la configuración de tu negocio</p>
              </div>
            </div>
            
            {/* Estado de conexión mejorado */}
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Sistema Local Activo</span>
              </div>
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-600">Firebase Deshabilitado</span>
              </div>
            </div>
          </div>

          {/* Mensaje de estado mejorado */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center space-x-3 ${
              message.includes('✅') ? 'bg-green-50 border border-green-200' : 
              message.includes('❌') ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                message.includes('✅') ? 'bg-green-500' : 
                message.includes('❌') ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                message.includes('✅') ? 'text-green-700' : 
                message.includes('❌') ? 'text-red-700' : 'text-blue-700'
              }`}>
                {message}
              </span>
            </div>
          )}
        </div>

        {/* Grid de configuraciones */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del negocio */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Información del Negocio</h2>
              </div>
              <p className="text-blue-100 mt-2">Configura los datos principales de tu empresa</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => updateConfig('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ej: Wilson Cars & Wash"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={config.businessPhone}
                  onChange={(e) => updateConfig('businessPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ej: +57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección del Negocio
                </label>
                <input
                  type="text"
                  value={config.businessAddress}
                  onChange={(e) => updateConfig('businessAddress', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ej: Calle 123 #45-67, Bogotá"
                />
              </div>
            </div>
          </div>

          {/* Configuración Detallada de Parqueadero */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚗</span>
                <h2 className="text-xl font-bold text-white">Configuración de Parqueadero</h2>
              </div>
              <p className="text-blue-100 mt-2">Tarifas y configuración del sistema de parking</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-800 mb-2">
                    🚗 Tarifa Carro (por hora)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={config.carParkingRate}
                      onChange={(e) => updateConfig('carParkingRate', parseInt(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="3000"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Precio por hora para vehículos tipo carro</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <label className="block text-sm font-semibold text-orange-800 mb-2">
                    🏍️ Tarifa Moto (por hora)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={config.motorcycleParkingRate}
                      onChange={(e) => updateConfig('motorcycleParkingRate', parseInt(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="2000"
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-2">Precio por hora para motocicletas</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <label className="block text-sm font-semibold text-purple-800 mb-2">
                    🚛 Tarifa Camión (por hora)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={config.truckParkingRate}
                      onChange={(e) => updateConfig('truckParkingRate', parseInt(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="4000"
                    />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Precio por hora para camiones y vehículos grandes</p>
                </div>

                {/* Configuraciones adicionales del parqueadero */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">⚙️ Configuraciones Adicionales</h4>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.parkingEnabled}
                        onChange={(e) => updateConfig('parkingEnabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">Sistema de Parqueadero Activo</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-7">Habilita o deshabilita el módulo de parqueadero</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración Detallada de Lavadero */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧽</span>
                <h2 className="text-xl font-bold text-white">Configuración de Lavadero</h2>
              </div>
              <p className="text-cyan-100 mt-2">Servicios y precios del carwash profesional</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-cyan-800 mb-3">💧 Servicios Disponibles</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">🚗 Lavado Básico Carro</span>
                      <span className="text-green-600 font-bold">$8,000</span>
                    </div>
                    <p className="text-xs text-gray-500">Lavado exterior básico</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">🏍️ Lavado Básico Moto</span>
                      <span className="text-green-600 font-bold">$5,000</span>
                    </div>
                    <p className="text-xs text-gray-500">Lavado completo motocicleta</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">🚛 Lavado Básico Camión</span>
                      <span className="text-green-600 font-bold">$25,000</span>
                    </div>
                    <p className="text-xs text-gray-500">Lavado exterior vehículo grande</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">⚙️ Configuraciones del Lavadero</h4>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.carwashEnabled}
                      onChange={(e) => updateConfig('carwashEnabled', e.target.checked)}
                      className="w-4 h-4 text-cyan-600 border-2 border-gray-300 rounded focus:ring-cyan-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Sistema de Lavadero Activo</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-7">Habilita o deshabilita el módulo de carwash</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de datos del ticket */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎫</span>
                <h2 className="text-xl font-bold text-white">Configuración de Tickets</h2>
              </div>
              <p className="text-green-100 mt-2">Personaliza la información que aparece en los tickets impresos</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={config.ticketData?.companyName || ''}
                    onChange={(e) => updateTicketData('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="WILSON CARS & WASH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtítulo de la Empresa
                  </label>
                  <input
                    type="text"
                    value={config.ticketData?.companySubtitle || ''}
                    onChange={(e) => updateTicketData('companySubtitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="PARKING PROFESSIONAL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIT o Documento
                  </label>
                  <input
                    type="text"
                    value={config.ticketData?.nit || ''}
                    onChange={(e) => updateTicketData('nit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="19.475.534-7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={config.ticketData?.phone || ''}
                    onChange={(e) => updateTicketData('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="+57 (1) 234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.ticketData?.email || ''}
                    onChange={(e) => updateTicketData('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="info@wilsoncarwash.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    value={config.ticketData?.website || ''}
                    onChange={(e) => updateTicketData('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="www.wilsoncarwash.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={config.ticketData?.address || ''}
                  onChange={(e) => updateTicketData('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Calle 123 #45-67, Bogotá D.C."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje de Pie de Página
                </label>
                <input
                  type="text"
                  value={config.ticketData?.footerMessage || ''}
                  onChange={(e) => updateTicketData('footerMessage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="¡Gracias por confiar en nosotros!"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Información Adicional
                </label>
                <textarea
                  value={config.ticketData?.footerInfo || ''}
                  onChange={(e) => updateTicketData('footerInfo', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Horario: 24/7 | Servicio completo de parqueadero"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Servicios habilitados y acciones */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Servicios y Configuración Avanzada</span>
            </h2>
            <p className="text-indigo-100 mt-2">Habilita o deshabilita servicios del sistema</p>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Servicios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios Disponibles</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.parkingEnabled}
                        onChange={(e) => updateConfig('parkingEnabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 mr-4"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🚗</span>
                        <div>
                          <span className="text-sm font-semibold text-blue-800">Sistema de Parqueadero</span>
                          <p className="text-xs text-blue-600">Gestión completa de vehículos</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.carwashEnabled}
                        onChange={(e) => updateConfig('carwashEnabled', e.target.checked)}
                        className="w-5 h-5 text-cyan-600 border-2 border-gray-300 rounded focus:ring-cyan-500 mr-4"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🧽</span>
                        <div>
                          <span className="text-sm font-semibold text-cyan-800">Sistema de Lavadero</span>
                          <p className="text-xs text-cyan-600">Servicios de lavado profesional</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setMessage('🗄️ Funcionalidad de respaldo en desarrollo')}
                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-4 text-left transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">💾</span>
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Hacer Respaldo</span>
                        <p className="text-xs text-gray-500">Crear copia de seguridad</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setMessage('📊 Panel de reportes en desarrollo')}
                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-4 text-left transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📊</span>
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Ver Reportes</span>
                        <p className="text-xs text-gray-500">Análisis de datos</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de guardar mejorado */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={saveConfiguration}
                disabled={loading}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Guardando Configuración...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Historial Detallado de Entradas y Salidas con Filtros */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <span>Historial Detallado de Operaciones</span>
            </h2>
            <p className="text-emerald-100 mt-2">Registro completo de entradas, salidas y servicios con filtros avanzados</p>
          </div>
          
          <div className="p-6">
            {/* Componente de filtros */}
            <DateRangeFilter 
              onFilterChange={loadData}
              className="mb-6"
            />

            <div className="grid md:grid-cols-2 gap-8">
              {/* Historial de Parqueadero */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚗</span>
                    <span>Historial de Parqueadero</span>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {parkingRecords.length} registros
                  </span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2">Cargando datos...</p>
                    </div>
                  ) : parkingRecords.length > 0 ? (
                    <div className="space-y-3">
                      {parkingRecords.map((record) => (
                        <div key={record.id} className={`bg-white p-4 rounded border ${
                          record.status === 'active' ? 'border-yellow-300' : 'border-gray-200'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-blue-700">{record.placa}</span>
                              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {record.vehicleType === 'car' ? '🚗 Carro' :
                                 record.vehicleType === 'motorcycle' ? '🏍️ Moto' : '🚛 Camión'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {record.status === 'completed' && (
                                <span className="text-sm font-semibold text-green-600">
                                  ${record.totalAmount?.toLocaleString()}
                                </span>
                              )}
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingRecord(record);
                                    setEditType('parking');
                                    setEditModalOpen(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('¿Está seguro de eliminar este registro?')) {
                                      const result = await deleteParkingRecord(record.id);
                                      setMessage(result.success ? '✅ ' + result.message : '❌ ' + result.message);
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>� Entrada:</span>
                              <span>{record.entryTime.toLocaleString('es-CO')}</span>
                            </div>
                            {record.exitTime && (
                              <div className="flex justify-between">
                                <span>📤 Salida:</span>
                                <span>{record.exitTime.toLocaleString('es-CO')}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold">
                              <span>⏱️ Tiempo:</span>
                              <span>
                                {record.totalMinutes ? `${Math.floor(record.totalMinutes / 60)}h ${record.totalMinutes % 60}m` : 'En curso'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>💳 Estado:</span>
                              <span className={record.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                                {record.status === 'completed' ? '✅ Completado' : 
                                 record.status === 'active' ? '🔄 Activo' : '❌ Cancelado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <span className="text-4xl">🚗</span>
                      <p className="mt-2">No hay registros de parqueadero en este período</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historial de Lavadero */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🧽</span>
                    <span>Historial de Lavadero</span>
                  </div>
                  <span className="text-sm bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                    {carwashRecords.length} registros
                  </span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                      <p className="mt-2">Cargando datos...</p>
                    </div>
                  ) : carwashRecords.length > 0 ? (
                    <div className="space-y-3">
                      {carwashRecords.map((record) => (
                        <div key={record.id} className={`bg-white p-4 rounded border ${
                          record.status === 'in_progress' ? 'border-blue-300' : 'border-gray-200'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-cyan-700">{record.placa}</span>
                              <span className="ml-2 text-sm bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                                {record.vehicleType === 'car' ? '🚗 Carro' :
                                 record.vehicleType === 'motorcycle' ? '🏍️ Moto' : '🚛 Camión'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {record.status === 'completed' && (
                                <span className="text-sm font-semibold text-green-600">
                                  ${record.basePrice.toLocaleString()}
                                </span>
                              )}
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingRecord(record);
                                    setEditType('carwash');
                                    setEditModalOpen(true);
                                  }}
                                  className="p-1 text-cyan-600 hover:bg-cyan-100 rounded"
                                  title="Ver detalles"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('¿Está seguro de eliminar este registro?')) {
                                      const result = await deleteCarwashRecord(record.id);
                                      setMessage(result.success ? '✅ ' + result.message : '❌ ' + result.message);
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>🧽 Servicio:</span>
                              <span>{record.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>👨‍🔧 Trabajador:</span>
                              <span>{record.workerName} ({record.workerPercentage}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>📅 Inicio:</span>
                              <span>{record.startTime.toLocaleString('es-CO')}</span>
                            </div>
                            {record.endTime && (
                              <div className="flex justify-between">
                                <span>✅ Finalizado:</span>
                                <span>{record.endTime.toLocaleString('es-CO')}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold">
                              <span>💰 Comisión trabajador:</span>
                              <span className="text-blue-600">${record.workerCommission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>🏢 Ganancia empresa:</span>
                              <span className="text-green-600">${record.companyEarning.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>📊 Estado:</span>
                              <span className={
                                record.status === 'completed' ? 'text-green-600' : 
                                record.status === 'in_progress' ? 'text-blue-600' : 
                                'text-yellow-600'
                              }>
                                {record.status === 'completed' ? '✅ Completado' : 
                                 record.status === 'in_progress' ? '🔄 En progreso' :
                                 record.status === 'pending' ? '⏳ Pendiente' : '❌ Cancelado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <span className="text-4xl">🧽</span>
                      <p className="mt-2">No hay registros de lavadero en este período</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de ingresos dinámico */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <span className="text-xl">💰</span>
                <span>Resumen de Ingresos del Período</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800">🚗 Parqueadero</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ${dailySummary.parkingRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-600">{dailySummary.parkingTransactions} vehículos</p>
                    </div>
                    <span className="text-3xl text-blue-500">🚗</span>
                  </div>
                </div>
                
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-cyan-800">🧽 Lavadero</h4>
                      <p className="text-2xl font-bold text-cyan-600">
                        ${dailySummary.carwashRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-cyan-600">{dailySummary.carwashTransactions} servicios</p>
                    </div>
                    <span className="text-3xl text-cyan-500">🧽</span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">💰 Total</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${dailySummary.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">{dailySummary.totalTransactions} operaciones</p>
                    </div>
                    <span className="text-3xl text-green-500">💰</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {editModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editType === 'parking' ? '🚗 Editar Registro de Parqueadero' : '🧽 Detalles de Servicio de Lavado'}
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {editType === 'parking' ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                      <input
                        type="text"
                        value={editingRecord.placa}
                        onChange={(e) => setEditingRecord({...editingRecord, placa: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
                      <select
                        value={editingRecord.vehicleType}
                        onChange={(e) => setEditingRecord({...editingRecord, vehicleType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="car">🚗 Carro</option>
                        <option value="motorcycle">🏍️ Moto</option>
                        <option value="truck">🚛 Camión</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        value={editingRecord.status}
                        onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">🔄 Activo</option>
                        <option value="completed">✅ Completado</option>
                        <option value="cancelled">❌ Cancelado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monto Total</label>
                      <input
                        type="number"
                        value={editingRecord.totalAmount || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, totalAmount: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Entrada</label>
                      <input
                        type="datetime-local"
                        value={editingRecord.entryTime ? new Date(editingRecord.entryTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditingRecord({...editingRecord, entryTime: new Date(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Salida</label>
                      <input
                        type="datetime-local"
                        value={editingRecord.exitTime ? new Date(editingRecord.exitTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditingRecord({...editingRecord, exitTime: e.target.value ? new Date(e.target.value) : null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRecord.isPaid}
                        onChange={(e) => setEditingRecord({...editingRecord, isPaid: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">¿Está pagado?</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        const result = await updateParkingRecord(editingRecord.id, editingRecord);
                        setMessage(result.success ? '✅ ' + result.message : '❌ ' + result.message);
                        setEditModalOpen(false);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Información del Servicio</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Placa:</span>
                        <span className="ml-2 font-semibold">{editingRecord.placa}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Vehículo:</span>
                        <span className="ml-2">
                          {editingRecord.vehicleType === 'car' ? '🚗 Carro' :
                           editingRecord.vehicleType === 'motorcycle' ? '🏍️ Moto' : '🚛 Camión'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Servicio:</span>
                        <span className="ml-2">{editingRecord.serviceName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Precio:</span>
                        <span className="ml-2 font-semibold text-green-600">${editingRecord.basePrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Trabajador:</span>
                        <span className="ml-2">{editingRecord.workerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Comisión:</span>
                        <span className="ml-2">{editingRecord.workerPercentage}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Inicio:</span>
                        <span className="ml-2">{editingRecord.startTime.toLocaleString('es-CO')}</span>
                      </div>
                      {editingRecord.endTime && (
                        <div>
                          <span className="font-medium text-gray-600">Finalizado:</span>
                          <span className="ml-2">{editingRecord.endTime.toLocaleString('es-CO')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Distribución de Ganancias</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Comisión Trabajador</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${editingRecord.workerCommission.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Ganancia Empresa</p>
                        <p className="text-xl font-bold text-green-600">
                          ${editingRecord.companyEarning.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessConfigurationPanel;