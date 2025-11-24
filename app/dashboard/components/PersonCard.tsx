'use client';

import { User, Calendar, MapPin, Users } from 'lucide-react';
import { PersonDetails } from '../data';

interface PersonCardProps {
  title: string;
  person: PersonDetails | null;
  accentColor?: string;
}

export default function PersonCard({
  title,
  person,
  accentColor = 'bg-blue-500',
}: PersonCardProps) {
  if (!person) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>
        <p className="text-gray-400 text-sm">Keine Daten verfügbar</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>
      
      <div className="space-y-3">
        {/* Name and Age */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${accentColor} bg-opacity-10`}>
            <User className={`w-5 h-5 ${accentColor.replace('bg-', 'text-')}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-lg">{person.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{person.age} Jahre</p>
          </div>
        </div>

        {/* Birth Year */}
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Geboren {person.birthYear}</span>
        </div>

        {/* Birth Place */}
        {person.birthPlace && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{person.birthPlace}</span>
          </div>
        )}

        {/* Family Role */}
        {person.familyRole && (
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{person.familyRole}</span>
          </div>
        )}
      </div>
    </div>
  );
}

