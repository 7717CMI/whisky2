const fs = require('fs');
const path = require('path');

// Years: 2021-2033
const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

// Geographies with their region grouping
const regions = {
  "North America": ["U.S.", "Canada"],
  "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia", "Rest of Europe"],
  "Asia Pacific": ["China", "India", "Japan", "South Korea", "ASEAN", "Australia", "Rest of Asia Pacific"],
  "Latin America": ["Brazil", "Argentina", "Mexico", "Rest of Latin America"],
  "Middle East & Africa": ["GCC", "South Africa", "Rest of Middle East & Africa"]
};

// New segment definitions with market share splits (proportions within each segment type)
const segmentTypes = {
  "By Type": {
    "Sub-Normothermic Perfusion (20–34°C)": 0.55,
    "Warm or Normothermic Perfusion (35–37°C)": 0.45
  },
  "By Organ Type": {
    "Liver": 0.35,
    "Heart": 0.22,
    "Lung": 0.18,
    "Kidney": 0.15,
    "Others (Pancreas, Small bowel / Intestine, Composite Tissues / Limb Perfusion (emerging use cases))": 0.10
  },
  "Application / Use Case": {
    "Organ Preservation": 0.30,
    "Viability Assessment": 0.25,
    "Physiologic Transport": 0.20,
    "Reconditioning Marginal Organs": 0.15,
    "Others (Research Use / Protocol development)": 0.10
  },
  "By End User": {
    "Hospitals & Clinics": 0.40,
    "Specialty Clinic/Centers": 0.25,
    "Transplant Centers": 0.25,
    "Others (Research Institutes/Centers, Organ Procurement Organizations, etc.)": 0.10
  }
};

// Regional base values (USD Million) for 2021 - total market per region
// Global Normothermic Machine Perfusion market ~$300M in 2021, growing ~12% CAGR
const regionBaseValues = {
  "North America": 120,
  "Europe": 90,
  "Asia Pacific": 50,
  "Latin America": 20,
  "Middle East & Africa": 15
};

// Country share within region (must sum to ~1.0)
const countryShares = {
  "North America": { "U.S.": 0.82, "Canada": 0.18 },
  "Europe": { "U.K.": 0.18, "Germany": 0.22, "Italy": 0.12, "France": 0.16, "Spain": 0.10, "Russia": 0.08, "Rest of Europe": 0.14 },
  "Asia Pacific": { "China": 0.28, "India": 0.12, "Japan": 0.25, "South Korea": 0.12, "ASEAN": 0.10, "Australia": 0.07, "Rest of Asia Pacific": 0.06 },
  "Latin America": { "Brazil": 0.45, "Argentina": 0.15, "Mexico": 0.25, "Rest of Latin America": 0.15 },
  "Middle East & Africa": { "GCC": 0.45, "South Africa": 0.25, "Rest of Middle East & Africa": 0.30 }
};

// Growth rates (CAGR) per region - slightly different for variety
const regionGrowthRates = {
  "North America": 0.115,
  "Europe": 0.108,
  "Asia Pacific": 0.145,
  "Latin America": 0.125,
  "Middle East & Africa": 0.118
};

// Segment-specific growth multipliers (relative to regional base CAGR)
const segmentGrowthMultipliers = {
  "By Type": {
    "Sub-Normothermic Perfusion (20–34°C)": 0.95,
    "Warm or Normothermic Perfusion (35–37°C)": 1.07
  },
  "By Organ Type": {
    "Liver": 1.08,
    "Heart": 1.05,
    "Lung": 1.12,
    "Kidney": 0.95,
    "Others (Pancreas, Small bowel / Intestine, Composite Tissues / Limb Perfusion (emerging use cases))": 1.20
  },
  "Application / Use Case": {
    "Organ Preservation": 0.92,
    "Viability Assessment": 1.15,
    "Physiologic Transport": 1.05,
    "Reconditioning Marginal Organs": 1.18,
    "Others (Research Use / Protocol development)": 1.10
  },
  "By End User": {
    "Hospitals & Clinics": 0.98,
    "Specialty Clinic/Centers": 1.10,
    "Transplant Centers": 1.08,
    "Others (Research Institutes/Centers, Organ Procurement Organizations, etc.)": 1.05
  }
};

// Volume multiplier: units per USD Million (rough: ~500 units per $1M for perfusion devices)
const volumePerMillionUSD = 480;

// Seeded pseudo-random for reproducibility
let seed = 42;
function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function addNoise(value, noiseLevel = 0.03) {
  return value * (1 + (seededRandom() - 0.5) * 2 * noiseLevel);
}

function roundTo1(val) {
  return Math.round(val * 10) / 10;
}

function roundToInt(val) {
  return Math.round(val);
}

function generateTimeSeries(baseValue, growthRate, roundFn) {
  const series = {};
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const rawValue = baseValue * Math.pow(1 + growthRate, i);
    series[year] = roundFn(addNoise(rawValue));
  }
  return series;
}

function generateData(isVolume) {
  const data = {};
  const roundFn = isVolume ? roundToInt : roundTo1;
  const multiplier = isVolume ? volumePerMillionUSD : 1;

  // Generate data for each region and country
  for (const [regionName, countries] of Object.entries(regions)) {
    const regionBase = regionBaseValues[regionName] * multiplier;
    const regionGrowth = regionGrowthRates[regionName];

    // Region-level data
    data[regionName] = {};
    for (const [segType, segments] of Object.entries(segmentTypes)) {
      data[regionName][segType] = {};
      for (const [segName, share] of Object.entries(segments)) {
        const segGrowth = regionGrowth * segmentGrowthMultipliers[segType][segName];
        const segBase = regionBase * share;
        data[regionName][segType][segName] = generateTimeSeries(segBase, segGrowth, roundFn);
      }
    }

    // Add "By Country" for each region
    data[regionName]["By Country"] = {};
    for (const country of countries) {
      const cShare = countryShares[regionName][country];
      // Use a slight variation of region growth per country
      const countryGrowthVariation = 1 + (seededRandom() - 0.5) * 0.06;
      const countryBase = regionBase * cShare;
      const countryGrowth = regionGrowth * countryGrowthVariation;
      data[regionName]["By Country"][country] = generateTimeSeries(countryBase, countryGrowth, roundFn);
    }

    // Country-level data
    for (const country of countries) {
      const cShare = countryShares[regionName][country];
      const countryBase = regionBase * cShare;
      const countryGrowthVariation = 1 + (seededRandom() - 0.5) * 0.04;
      const countryGrowth = regionGrowth * countryGrowthVariation;

      data[country] = {};
      for (const [segType, segments] of Object.entries(segmentTypes)) {
        data[country][segType] = {};
        for (const [segName, share] of Object.entries(segments)) {
          const segGrowth = countryGrowth * segmentGrowthMultipliers[segType][segName];
          const segBase = countryBase * share;
          // Add slight country-specific variation to segment share
          const shareVariation = 1 + (seededRandom() - 0.5) * 0.1;
          data[country][segType][segName] = generateTimeSeries(segBase * shareVariation, segGrowth, roundFn);
        }
      }
    }
  }

  return data;
}

// Generate both datasets
seed = 42;
const valueData = generateData(false);
seed = 7777;
const volumeData = generateData(true);

// Write files
const outDir = path.join(__dirname, 'public', 'data');
fs.writeFileSync(path.join(outDir, 'value.json'), JSON.stringify(valueData, null, 2));
fs.writeFileSync(path.join(outDir, 'volume.json'), JSON.stringify(volumeData, null, 2));

console.log('Generated value.json and volume.json successfully');
console.log('Value geographies:', Object.keys(valueData).length);
console.log('Volume geographies:', Object.keys(volumeData).length);
console.log('Segment types:', Object.keys(valueData['North America']));
console.log('Sample - North America, By Type:', JSON.stringify(valueData['North America']['By Type'], null, 2));
