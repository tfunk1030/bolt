'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Wind, ArrowRight } from 'lucide-react'

interface WindModelOutput {
  speed: number
  direction: number
  gust?: number
  confidence?: number
}

interface WindModelData {
  modelName: string
  output: WindModelOutput
}

// Mock data - replace with your actual model outputs
const modelOutputs: WindModelData[] = [
  {
    modelName: "Basic Model",
    output: {
      speed: 12.5,
      direction: 45,
      gust: 15.2,
      confidence: 0.85
    }
  },
  {
    modelName: "Enhanced Model",
    output: {
      speed: 13.1,
      direction: 48,
      gust: 16.0,
      confidence: 0.92
    }
  },
  // Add more models as needed
]

export function WindModelComparison() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Wind Model Comparison</h2>
      
      <div className="space-y-4">
        {modelOutputs.map((model, index) => (
          <div key={model.modelName} className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              {model.modelName}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Speed</div>
                  <div className="text-lg font-semibold">
                    {model.output.speed} mph
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                  style={{ 
                    transform: `rotate(${model.output.direction}deg)`
                  }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Direction</div>
                  <div className="text-lg font-semibold">
                    {model.output.direction}°
                  </div>
                </div>
              </div>

              {model.output.gust && (
                <div>
                  <div className="text-sm text-gray-400">Gusts</div>
                  <div className="text-lg font-semibold">
                    {model.output.gust} mph
                  </div>
                </div>
              )}

              {model.output.confidence && (
                <div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-lg font-semibold">
                    {(model.output.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {index < modelOutputs.length - 1 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Difference from next model:
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    Speed: {(modelOutputs[index + 1].output.speed - model.output.speed).toFixed(1)} mph
                  </div>
                  <div>
                    Direction: {(modelOutputs[index + 1].output.direction - model.output.direction).toFixed(1)}°
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
} 