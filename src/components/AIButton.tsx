
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, FileText } from 'lucide-react';

interface AIButtonProps {
  onClick: () => void;
  variant?: 'default' | 'icon' | 'summary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AIButton({ onClick, variant = 'default', size = 'sm', className = '' }: AIButtonProps) {
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={onClick}
        className={`hover:bg-blue-100 hover:text-blue-700 transition-colors ${className}`}
        title="Perguntar à IA"
      >
        <Bot className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'summary') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onClick}
        className={`flex items-center gap-2 ${className}`}
      >
        <FileText className="h-4 w-4" />
        Resumir com IA
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      className={`flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 ${className}`}
    >
      <Bot className="h-4 w-4" />
      Assistente IA
    </Button>
  );
}
