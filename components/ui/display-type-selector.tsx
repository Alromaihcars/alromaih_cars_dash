'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface DisplayTypeOption {
  value: string
  label: string
  description: string
  icon: string
}

interface DisplayTypeSelectorProps {
  value?: string
  onChange: (value: string) => void
  options: DisplayTypeOption[]
  label?: string
  helpText?: string
  disabled?: boolean
}

export function DisplayTypeSelector({
  value,
  onChange,
  options,
  label = "Display Type",
  helpText = "How this attribute should be displayed in forms",
  disabled = false
}: DisplayTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value
          
          return (
            <TooltipProvider key={option.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => !disabled && onChange(option.value)}
                    disabled={disabled}
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all
                      min-w-[140px] text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Radio circle indicator */}
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-primary' : 'border-muted-foreground'}
                    `}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className="text-lg">{option.icon}</div>
                    
                    {/* Label */}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs">{option.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

// Default options for Odoo-compatible display types
export const DEFAULT_DISPLAY_TYPE_OPTIONS: DisplayTypeOption[] = [
  {
    value: 'radio',
    label: 'Radio',
    description: 'Single selection with radio buttons',
    icon: '⚪'
  },
  {
    value: 'pills',
    label: 'Pills',
    description: 'Single selection with pill-style buttons',
    icon: '💊'
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Dropdown selection menu',
    icon: '📋'
  },
  {
    value: 'color',
    label: 'Color',
    description: 'Color picker with swatches',
    icon: '🎨'
  },
  {
    value: 'multi',
    label: 'Multi-checkbox',
    description: 'Multiple selection with checkboxes',
    icon: '☑️'
  }
]

// Default options for filter display types
export const DEFAULT_FILTER_DISPLAY_TYPE_OPTIONS: DisplayTypeOption[] = [
  {
    value: 'dropdown',
    label: 'Dropdown',
    description: 'Dropdown selection filter',
    icon: '📝'
  },
  {
    value: 'checkbox',
    label: 'Checkboxes',
    description: 'Multiple selection with checkboxes',
    icon: '☑️'
  },
  {
    value: 'radio',
    label: 'Radio Buttons',
    description: 'Single selection with radio buttons',
    icon: '⚪'
  },
  {
    value: 'range',
    label: 'Range Slider',
    description: 'Range slider for numeric values',
    icon: '🎚️'
  },
  {
    value: 'color',
    label: 'Color Swatches',
    description: 'Visual color picker interface',
    icon: '🎨'
  }
] 