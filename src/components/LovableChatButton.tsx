
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, Bot, Sparkles } from 'lucide-react';

interface LovableChatButtonProps {
  onClick: () => void;
  variant?: 'default' | 'icon' | 'professional';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function LovableChatButton({ onClick, variant = 'professional', size = 'sm', className = '' }: LovableChatButtonProps) {
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={onClick}
        className={`hover:bg-blue-100 hover:text-blue-700 transition-colors ${className}`}
        title="Busca Inteligente MCP"
      >
        <Database className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'professional') {
    return (
      <Button
        variant="default"
        size={size}
        onClick={onClick}
        className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white shadow-lg ${className}`}
      >
        <Database className="h-4 w-4" />
        Busca Inteligente
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      className={`flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 shadow-sm ${className}`}
    >
      <Database className="h-4 w-4" />
      MCP Search
    </Button>
  );
}
