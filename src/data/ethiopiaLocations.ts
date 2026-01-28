// Bale Zone locations data
// Updated to focus specifically on Bale Zone locations

export interface EthiopiaLocation {
  region: string;
  regionAmharic: string;
  zones: {
    name: string;
    nameAmharic: string;
    cities: string[];
  }[];
}

export const ethiopiaLocations: EthiopiaLocation[] = [
  {
    region: "Oromia",
    regionAmharic: "ኦሮሚያ",
    zones: [
      {
        name: "Bale Zone",
        nameAmharic: "ባሌ ዞን",
        cities: [
          "Robe Town",
          "Goba Town", 
          "Sinana",
          "Agarfa",
          "Goba",
          "Dinsho",
          "Gasera",
          "Goro",
          "Ginir",
          "Gololcha",
          "Berbere",
          "Dawe Kachen",
          "Dawe Serar",
          "Delo Menna",
          "Guradamole",
          "Legehida",
          "Rayitu",
          "Seweyna"
        ]
      }
    ]
  }
];

// Flat list of all locations for dropdowns
export const getAllLocations = (): string[] => {
  const locations: string[] = [];
  ethiopiaLocations.forEach(region => {
    region.zones.forEach(zone => {
      zone.cities.forEach(city => {
        if (!locations.includes(city)) {
          locations.push(city);
        }
      });
    });
  });
  return locations.sort();
};

// Get locations by region
export const getLocationsByRegion = (regionName: string): string[] => {
  const region = ethiopiaLocations.find(r => r.region === regionName);
  if (!region) return [];
  
  const cities: string[] = [];
  region.zones.forEach(zone => {
    zone.cities.forEach(city => {
      if (!cities.includes(city)) {
        cities.push(city);
      }
    });
  });
  return cities.sort();
};

// Get all regions
export const getRegions = (): { name: string; nameAmharic: string }[] => {
  return ethiopiaLocations.map(r => ({
    name: r.region,
    nameAmharic: r.regionAmharic
  }));
};

// Get zones by region
export const getZonesByRegion = (regionName: string) => {
  const region = ethiopiaLocations.find(r => r.region === regionName);
  return region?.zones || [];
};