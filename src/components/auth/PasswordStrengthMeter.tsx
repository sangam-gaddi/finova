'use client';
import { Check, X } from 'lucide-react';

interface Props { password: string; }

const criteria = (pass: string) => [
  { label: 'At least 8 characters', met: pass.length >= 8 },
  { label: 'Uppercase letter', met: /[A-Z]/.test(pass) },
  { label: 'Lowercase letter', met: /[a-z]/.test(pass) },
  { label: 'Number', met: /\d/.test(pass) },
  { label: 'Special character', met: /[^A-Za-z0-9]/.test(pass) },
];

function getStrength(pass: string) {
  let s = 0;
  if (pass.length >= 8) s++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s++;
  if (/\d/.test(pass)) s++;
  if (/[^a-zA-Z\d]/.test(pass)) s++;
  return s;
}

const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-emerald-500'];
const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function PasswordStrengthMeter({ password }: Props) {
  const strength = getStrength(password);

  return (
    <div className="mt-2 mb-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">Password strength</span>
        <span className="text-xs text-gray-400">{labels[strength]}</span>
      </div>
      <div className="flex gap-1 mb-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? colors[strength] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {criteria(password).map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.met ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-gray-500 shrink-0" />}
            <span className={c.met ? 'text-emerald-400' : 'text-gray-500'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
