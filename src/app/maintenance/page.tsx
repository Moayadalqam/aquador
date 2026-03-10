import { Metadata } from 'next';
import MaintenancePage from './MaintenanceClient';

export const metadata: Metadata = {
  title: "Coming Soon | Aquad'or",
  description: "We are crafting a new digital experience. Follow us on Instagram for updates.",
};

export default function Maintenance() {
  return <MaintenancePage />;
}
