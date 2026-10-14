import { CLINIC_LOCATIONS } from "@/config/clinic";
export const registrationLocationIds = ["whitby", "oshawa", "courtice", "lansdowne-mall", "peterborough-pharmacy", "lynden-road", "colborne-east"] as const;
export type RegistrationLocationId = typeof registrationLocationIds[number];
export function registrationLocation(id: string) { return CLINIC_LOCATIONS.find(location => location.id === id); }
export const registrationSheetNames: Record<RegistrationLocationId, string> = {
  whitby: "Whitby", oshawa: "Oshawa", courtice: "Courtice", "lansdowne-mall": "Peterborough Mall", "peterborough-pharmacy": "Peterborough Pharmacy", "lynden-road": "Lynden", "colborne-east": "Colborne",
};
