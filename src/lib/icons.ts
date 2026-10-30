import { createElement } from "react";
import {
  Baby, BadgeHelp, Bell, BookHeart, BookOpen, Brush, CalendarDays, Camera, Church, Clock, Gamepad2, Gift, GraduationCap, Hand, HandHeart,
  Heart, Home, Images, Info, Mail, Map, MapPin, Megaphone, MessageCircle, Mic, Music, Newspaper, Phone, PlayCircle, School, Shield, ShieldCheck,
  Shirt, ShoppingBag, Smile, Sparkles, Star, Sun, Trophy, Users, Video, type LucideIcon,
} from "lucide-react";

/** Icons admins can choose for menu items and buttons in the CMS. */
export const ICONS: Record<string, LucideIcon> = {
  Home, Info, GraduationCap, School, BookOpen, BookHeart, CalendarDays, Clock, Newspaper, Megaphone, Images, Camera, Video, PlayCircle,
  Sparkles, Gamepad2, Trophy, Star, Shirt, ShoppingBag, Gift, MessageCircle, Mail, Phone, MapPin, Map, Users, Baby, Smile, Heart, HandHeart,
  Hand, Church, Music, Mic, Sun, Brush, Shield, ShieldCheck, Bell, BadgeHelp,
};
export const ICON_NAMES = Object.keys(ICONS);

export function iconFor(name?: string): LucideIcon {
  return (name && ICONS[name]) || Sparkles;
}

/** Renders an icon by its CMS name (without creating a component during render). */
export function IconByName({ name, className }: { name?: string; className?: string }) {
  return createElement(iconFor(name), { className, "aria-hidden": true });
}
