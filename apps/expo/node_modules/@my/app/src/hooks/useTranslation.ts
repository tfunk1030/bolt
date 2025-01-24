import { useState, useEffect } from 'react'
import * as Localization from 'expo-localization'
import { I18n } from 'i18n-js'

const translations = {
  en: {
    shot: {
      calculator: 'Shot Calculator',
      analysis: 'Shot Analysis',
      selectClub: 'Select Club',
      conditions: 'Conditions',
      temperature: 'Temperature',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      windDirection: 'Wind Direction',
      altitude: 'Altitude',
      slope: 'Slope',
      calculate: 'Calculate Shot',
      result: 'Shot Result',
      distance: 'Distance',
      club: 'Club',
      noHistory: 'No shot history yet',
    },
    nav: {
      shotCalculator: 'Shot Calculator',
      shotAnalysis: 'Shot Analysis',
      settings: 'Settings',
    },
    settings: {
      clearHistory: 'Clear Shot History',
    },
  },
  es: {
    shot: {
      calculator: 'Calculadora de Tiro',
      analysis: 'Análisis de Tiro',
      selectClub: 'Seleccionar Palo',
      conditions: 'Condiciones',
      temperature: 'Temperatura',
      humidity: 'Humedad',
      windSpeed: 'Velocidad del Viento',
      windDirection: 'Dirección del Viento',
      altitude: 'Altitud',
      slope: 'Pendiente',
      calculate: 'Calcular Tiro',
      result: 'Resultado del Tiro',
      distance: 'Distancia',
      club: 'Palo',
      noHistory: 'Sin historial de tiros',
    },
    nav: {
      shotCalculator: 'Calculadora',
      shotAnalysis: 'Análisis',
      settings: 'Ajustes',
    },
    settings: {
      clearHistory: 'Borrar Historial',
    },
  },
}

const i18n = new I18n(translations)

export function useTranslation() {
  const [locale, setLocale] = useState(Localization.locale)

  useEffect(() => {
    i18n.locale = locale.split('-')[0]
  }, [locale])

  return {
    t: (key: string, params = {}) => i18n.t(key, params),
    locale,
    setLocale,
  }
} 