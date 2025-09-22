import * as Lucide from 'lucide-react';

export const Icon = ({ name, ...props }) => {
    const LucideIcon = Lucide[name];
    return LucideIcon ? <LucideIcon {...props} /> : null;
};

