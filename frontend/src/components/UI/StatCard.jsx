import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-red-500',
    pink: 'from-pink-500 to-rose-600',
    teal: 'from-teal-500 to-cyan-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card 
      hover={!!onClick} 
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`text-sm font-medium ${trendColors[trend]} flex items-center mt-2`}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full transform translate-x-6 -translate-y-6`} />
    </Card>
  );
};

export default StatCard;