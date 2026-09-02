import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Bookmark, Building2, Camera, Check, ChevronRight, FileText,
  Filter, MapPin, MessageCircle, MoreHorizontal, Package, Plus, Search, Settings,
  ShieldCheck, SlidersHorizontal, Star, Truck, Upload, Users, X, Factory,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, size } from '../theme';

/**
 * One icon family, stroke only, 1.75px. A filled icon means "active" and
 * nothing else — so we never mix filled and stroke arbitrarily.
 */
export const icons = {
  search: Search, plus: Plus, arrowRight: ArrowRight, arrowLeft: ArrowLeft,
  chevronRight: ChevronRight, filter: Filter, sliders: SlidersHorizontal,
  mapPin: MapPin, building: Building2, factory: Factory, package: Package,
  truck: Truck, users: Users, message: MessageCircle, bell: Bell,
  bookmark: Bookmark, close: X, check: Check, badgeCheck: BadgeCheck,
  shield: ShieldCheck, document: FileText, star: Star, more: MoreHorizontal,
  settings: Settings, camera: Camera, upload: Upload,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size: iconSize = size.icon,
  color = colors.text.secondary,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const Glyph = icons[name];
  return <Glyph size={iconSize} color={color} strokeWidth={1.75} />;
}
