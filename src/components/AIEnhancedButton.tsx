
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Brain, FileSearch, Target, BookOpen, Zap } from 'lucide-react';

interface AIEnhancedButtonProps {
  onClick: () => void;
  variant?: 'floating' | 'header' | 'table' | 'document' | 'quick';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  mode?: 'consultant' | 'analyzer' | 'teacher' | 'advisor';
  withContext?: boolean;
}

const modeConfig = {
  consultant: { icon: Brain, color: 'from-blue-600 to-blue-700', label: 'Consultor' },
  analyzer: { icon: FileSearch, color: 'from-purple-600 to-purple-700', label: 'Analisador' },
  teacher: { icon: BookOpen, color: 'from-green-600 to-green-700', label: 'Professor' },
  advisor: { icon: Target, color: 'from-orange-600 to-orange-700', label: 'Conselheiro' }
};

export function AIEnhancedButton({ 
  onClick, 
  variant = 'quick', 
  size = 'sm', 
  className = '',
  mode = 'consultant',
  withContext = false
}: AIEnhancedButtonProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={onClick}
          size="lg"
          className={`rounded-full w-16 h-16 bg-gradient-to-r ${config.color} hover:scale-110 transform transition-all duration-200 shadow-2xl border-4 border-white ${className}`}
        >
          <Icon className="h-7 w-7 text-white" />
        </Button>
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -left-2 bg-white text-gray-800 border-2 border-gray-200 shadow-lg"
        >
          <Zap className="h-3 w-3 mr-1" />
          IA
        </Badge>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <Button
        onClick={onClick}
        size={size}
        className={`bg-gradient-to-r ${config.color} hover:from-opacity-90 hover:to-opacity-90 text-white shadow-lg border-0 px-6 ${className}`}
      >
        <Icon className="h-5 w-5 mr-2" />
        <span className="font-semibold">{config.label} IA</span>
        {withContext && (
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
            Pro
          </Badge>
        )}
      </Button>
    );
  }

  if (variant === 'table') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={`hover:bg-gradient-to-r hover:${config.color} hover:text-white transition-all duration-200 group ${className}`}
        title={`Analisar com ${config.label} IA`}
      >
        <Icon className="h-4 w-4 group-hover:animate-pulse" />
      </Button>
    );
  }

  if (variant === 'document') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onClick}
        className={`border-2 bg-gradient-to-r ${config.color} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${className}`}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Analisar com IA
        <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
          {config.label}
        </Badge>
      </Button>
    );
  }

  if (variant === 'quick') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className={`bg-gradient-to-r from-gray-50 to-blue-50 hover:${config.color} hover:text-white border-2 border-blue-200 transition-all duration-200 ${className}`}
      >
        <Bot className="h-4 w-4 mr-2" />
        IA
      </Button>
    );
  }

  // Fallback case - should not reach here but added for safety
  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      className={`bg-gradient-to-r ${config.color} text-white hover:shadow-lg transition-all duration-200 ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {config.label} IA
    </Button>
  );
}
