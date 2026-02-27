/**
 * Transform data files from old market segments to Scottish Whisky Cask Market segments
 *
 * New Segments:
 * - By Underlying Whisky Type: Single Malt, Single Grain, Blended Malt, Blended Scotch
 * - By Distillery Status: Operating Distillery Casks, Silent / Closed Distillery Casks
 * - By Cask Size & Format: Barrel, Hogshead, Butt, Puncheon, Small-Format / Octave Casks
 * - By Maturation Stage: Early Stage, Mid-Maturity, Late-Maturity, Fully Mature / Legacy
 * - By Ownership & Capital Structure: Private Cask Ownership, Portfolio / Pooled Ownership, Institutional / Fund-Held Casks
 * - By Buyer Type: Independent Bottlers, Brand Owners / Distilleries, UHNW Private Collectors, Institutional Buyers
 *
 * New Geographies (with countries):
 * - Global (sum of all regions)
 * - North America: U.S., Canada
 * - Europe: U.K., Germany, France, Switzerland, Rest of Europe
 * - Asia Pacific: China, Japan, South Korea, Singapore, Australia, Rest of Asia Pacific
 * - Latin America: Brazil, Mexico, Rest of Latin America
 * - Middle East & Africa: UAE, South Africa, Rest of Middle East & Africa
 */

const fs = require('fs');
const path = require('path');

const years = [];
for (let y = 2000; y <= 2033; y++) years.push(y);

// Define new segment structure with proportional splits
const segmentDefinitions = {
  "By Underlying Whisky Type": {
    "Single Malt": 0.42,
    "Single Grain": 0.13,
    "Blended Malt": 0.18,
    "Blended Scotch": 0.27
  },
  "By Distillery Status": {
    "Operating Distillery Casks": 0.72,
    "Silent / Closed Distillery Casks": 0.28
  },
  "By Cask Size & Format": {
    "Barrel (≈180–200L)": 0.22,
    "Hogshead (≈225–250L)": 0.35,
    "Butt (≈480–520L)": 0.20,
    "Puncheon (≈450–550L)": 0.12,
    "Small-Format / Octave Casks": 0.11
  },
  "By Maturation Stage": {
    "Early Stage (0–5 Years)": 0.30,
    "Mid-Maturity (6–12 Years)": 0.35,
    "Late-Maturity (13–20 Years)": 0.22,
    "Fully Mature / Legacy (21+ Years)": 0.13
  },
  "By Ownership & Capital Structure": {
    "Private Cask Ownership": 0.48,
    "Portfolio / Pooled Ownership": 0.32,
    "Institutional / Fund-Held Casks": 0.20
  },
  "By Buyer Type": {
    "Independent Bottlers": 0.34,
    "Brand Owners / Distilleries": 0.30,
    "UHNW Private Collectors": 0.22,
    "Institutional Buyers": 0.14
  }
};

// Geography hierarchy with proportional splits for regional distribution
const geographyHierarchy = {
  "North America": {
    share: 0.18,
    countries: { "U.S.": 0.78, "Canada": 0.22 }
  },
  "Europe": {
    share: 0.52,
    countries: { "U.K.": 0.38, "Germany": 0.12, "Italy": 0.08, "France": 0.10, "Spain": 0.07, "Russia": 0.06, "Switzerland": 0.08, "Rest of Europe": 0.11 }
  },
  "Asia Pacific": {
    share: 0.17,
    countries: { "China": 0.20, "India": 0.12, "Japan": 0.25, "South Korea": 0.12, "ASEAN": 0.13, "Australia": 0.10, "Rest of Asia Pacific": 0.08 }
  },
  "Latin America": {
    share: 0.06,
    countries: { "Brazil": 0.38, "Mexico": 0.28, "Chile": 0.14, "Rest of Latin America": 0.20 }
  },
  "Middle East": {
    share: 0.04,
    countries: { "GCC": 0.50, "Israel": 0.22, "Rest of Middle East": 0.28 }
  },
  "Africa": {
    share: 0.03,
    countries: { "North Africa": 0.30, "Central Africa": 0.25, "South Africa": 0.45 }
  }
};

// Global market value totals (in USD Million) - Scottish Whisky Cask Market
const globalValueTotals = {
  2000: 920, 2001: 960, 2002: 1005, 2003: 1050, 2004: 1100,
  2005: 1160, 2006: 1230, 2007: 1310, 2008: 1350, 2009: 1320,
  2010: 1400, 2011: 1500, 2012: 1620, 2013: 1750, 2014: 1890,
  2015: 2050, 2016: 2200, 2017: 2380, 2018: 2590, 2019: 2830,
  2020: 2720, 2021: 3850, 2022: 4120, 2023: 4410, 2024: 4750,
  2025: 5150, 2026: 5620, 2027: 6180, 2028: 6820,
  2029: 7550, 2030: 8380, 2031: 9320, 2032: 10380, 2033: 11570
};

// Global market volume totals (in Units/Casks)
const globalVolumeTotals = {
  2000: 85000, 2001: 88000, 2002: 91000, 2003: 95000, 2004: 99000,
  2005: 104000, 2006: 110000, 2007: 117000, 2008: 120000, 2009: 115000,
  2010: 122000, 2011: 130000, 2012: 140000, 2013: 152000, 2014: 165000,
  2015: 178000, 2016: 192000, 2017: 208000, 2018: 225000, 2019: 244000,
  2020: 235000, 2021: 285000, 2022: 298000, 2023: 312000, 2024: 330000,
  2025: 350000, 2026: 374000, 2027: 401000, 2028: 432000,
  2029: 466000, 2030: 505000, 2031: 548000, 2032: 596000, 2033: 650000
};

// Add slight random variation to make data look realistic
function addVariation(baseValue, variationPercent = 0.05) {
  const factor = 1 + (Math.random() * 2 - 1) * variationPercent;
  return baseValue * factor;
}

// Round to 1 decimal for value, whole numbers for volume
function roundValue(val) {
  return Math.round(val * 10) / 10;
}

function roundVolume(val) {
  return Math.round(val);
}

// Generate year data for a segment at a specific geography level
function generateYearData(totalsByYear, proportion, rounder, growthVariation = 0.03) {
  const data = {};
  // Use a consistent slight variation for each segment-geography combo
  const baseVariation = 1 + (Math.random() * 2 - 1) * 0.02;

  years.forEach(year => {
    const yearVariation = 1 + (Math.random() * 2 - 1) * growthVariation;
    data[year.toString()] = rounder(totalsByYear[year] * proportion * baseVariation * yearVariation);
  });
  return data;
}

// Build the "By Country" segment for regional geographies
function buildByCountry(regionName, regionConfig, totalsByYear, rounder) {
  const byCountry = {};
  const countryEntries = Object.entries(regionConfig.countries);

  // Create a container with the region name, then list countries inside
  byCountry[regionName] = {};
  countryEntries.forEach(([countryName, countryShare]) => {
    byCountry[regionName][countryName] = {};
    // Countries don't get year data directly in "By Country" - they're just structure
  });

  return byCountry;
}

// Generate full data structure
function generateDataFile(totalsByYear, rounder) {
  const data = {};

  // 1. Generate Global data
  data["Global"] = {};
  Object.entries(segmentDefinitions).forEach(([segType, segments]) => {
    data["Global"][segType] = {};
    Object.entries(segments).forEach(([segName, proportion]) => {
      data["Global"][segType][segName] = generateYearData(totalsByYear, proportion, rounder);
    });
  });

  // 2. Generate Region data
  Object.entries(geographyHierarchy).forEach(([regionName, regionConfig]) => {
    data[regionName] = {};

    // Segment data for region
    Object.entries(segmentDefinitions).forEach(([segType, segments]) => {
      data[regionName][segType] = {};
      Object.entries(segments).forEach(([segName, segProportion]) => {
        const regionProportion = segProportion * regionConfig.share;
        data[regionName][segType][segName] = generateYearData(totalsByYear, regionProportion, rounder);
      });
    });

    // By Country for the region
    data[regionName]["By Country"] = {};
    Object.entries(regionConfig.countries).forEach(([countryName, countryShare]) => {
      data[regionName]["By Country"][countryName] = generateYearData(
        totalsByYear,
        regionConfig.share * countryShare,
        rounder
      );
    });
  });

  // 3. Generate Country-level data
  Object.entries(geographyHierarchy).forEach(([regionName, regionConfig]) => {
    Object.entries(regionConfig.countries).forEach(([countryName, countryShare]) => {
      data[countryName] = {};
      const countryProportion = regionConfig.share * countryShare;

      Object.entries(segmentDefinitions).forEach(([segType, segments]) => {
        data[countryName][segType] = {};
        Object.entries(segments).forEach(([segName, segProportion]) => {
          const finalProportion = segProportion * countryProportion;
          data[countryName][segType][segName] = generateYearData(totalsByYear, finalProportion, rounder);
        });
      });
    });
  });

  return data;
}

// Set a fixed seed for reproducibility
Math.seedrandom = null; // We'll use a simple approach

// Use deterministic pseudo-random for consistency
let seed = 42;
const originalRandom = Math.random;
Math.random = function() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Generate both files
console.log('Generating value.json...');
const valueData = generateDataFile(globalValueTotals, roundValue);

console.log('Generating volume.json...');
// Reset seed for volume data
seed = 123;
const volumeData = generateDataFile(globalVolumeTotals, roundVolume);

// Write files
const dataDir = path.join(__dirname, 'public', 'data');

fs.writeFileSync(
  path.join(dataDir, 'value.json'),
  JSON.stringify(valueData, null, 2),
  'utf8'
);
console.log('✅ value.json written');

fs.writeFileSync(
  path.join(dataDir, 'volume.json'),
  JSON.stringify(volumeData, null, 2),
  'utf8'
);
console.log('✅ volume.json written');

// Restore Math.random
Math.random = originalRandom;

// Verify structure
console.log('\n--- Verification ---');
console.log('Value.json geographies:', Object.keys(valueData));
console.log('Value.json Global segments:', Object.keys(valueData["Global"]));
console.log('Value.json North America segments:', Object.keys(valueData["North America"]));
console.log('Value.json U.S. segments:', Object.keys(valueData["U.S."]));
console.log('\nSample Global -> By Underlying Whisky Type -> Single Malt:');
console.log(valueData["Global"]["By Underlying Whisky Type"]["Single Malt"]);
console.log('\nSample North America -> By Buyer Type -> Independent Bottlers:');
console.log(valueData["North America"]["By Buyer Type"]["Independent Bottlers"]);
