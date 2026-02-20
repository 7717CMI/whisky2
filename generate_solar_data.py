"""
Convert Solar-sheet-og.csv (Excel) to JSON format for the dashboard.
Reads real Value and Volume data from the Excel file and produces:
  - public/data/value.json
  - public/data/volume.json
  - public/data/segmentation_analysis.json
"""

import json
import openpyxl

EXCEL_PATH = "c:/Users/vrashal/Desktop/Solar2/Solar-sheet-og.xlsx"
VALUE_JSON = "c:/Users/vrashal/Desktop/Solar2/public/data/value.json"
VOLUME_JSON = "c:/Users/vrashal/Desktop/Solar2/public/data/volume.json"
SEG_JSON = "c:/Users/vrashal/Desktop/Solar2/public/data/segmentation_analysis.json"

# Geographic hierarchy: region -> [countries]
GEO_HIERARCHY = {
    "North America": ["U.S.", "Canada"],
    "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia", "Rest of Europe"],
    "Asia Pacific": ["China", "India", "Japan", "South Korea", "ASEAN", "Australia", "Rest of Asia Pacific"],
    "Latin America": ["Brazil", "Argentina", "Mexico", "Rest of Latin America"],
    "Middle East & Africa": ["GCC", "South Africa", "Rest of Middle East & Africa"]
}

REGIONS = list(GEO_HIERARCHY.keys())
ALL_COUNTRIES = []
for countries in GEO_HIERARCHY.values():
    ALL_COUNTRIES.extend(countries)

# Segment types that have sub-segments (NOT "By Region" or "By Country")
DATA_SEGMENT_TYPES = ["By Technology", "By Power Rating", "By Provider", "By End-User"]


def read_excel():
    """Read Excel and split into Value and Volume sections."""
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb["Sheet1"]

    all_rows = []
    for row in ws.iter_rows(min_row=1, values_only=True):
        all_rows.append(list(row))

    # Find the header rows (row with "Region" in col A)
    header_indices = []
    volume_start = None
    for i, row in enumerate(all_rows):
        if row[0] == "Region" and row[1] == "Segment":
            header_indices.append(i)
        if row[0] == "Volume":
            volume_start = i

    print(f"Found {len(header_indices)} header rows at indices: {header_indices}")
    print(f"Volume section marker at index: {volume_start}")

    # Value header is first header, Volume header is second
    value_header_idx = header_indices[0]
    volume_header_idx = header_indices[1] if len(header_indices) > 1 else None

    # Extract years from header
    years = []
    header_row = all_rows[value_header_idx]
    for col_idx in range(3, len(header_row)):
        val = header_row[col_idx]
        if val is not None:
            years.append(str(int(float(val))))

    print(f"Years: {years}")

    # Parse data rows
    def parse_section(start_idx, end_idx):
        """Parse rows from start_idx+1 to end_idx into a list of dicts."""
        records = []
        for i in range(start_idx + 1, end_idx):
            row = all_rows[i]
            region = str(row[0]).strip() if row[0] else ""
            segment = str(row[1]).strip() if row[1] else ""
            subsegment = str(row[2]).strip() if row[2] else ""

            if not region or not segment or not subsegment:
                continue
            if region == "Region" or region == "Volume":
                continue

            values = {}
            for j, yr in enumerate(years):
                val = row[3 + j]
                if val is not None:
                    try:
                        values[yr] = float(val)
                    except (ValueError, TypeError):
                        pass

            if values:
                records.append({
                    "region": region,
                    "segment": segment,
                    "subsegment": subsegment,
                    "values": values
                })
        return records

    # Value section: from value header to volume marker (or second header)
    value_end = volume_start if volume_start else (volume_header_idx if volume_header_idx else len(all_rows))
    value_records = parse_section(value_header_idx, value_end)

    # Volume section: from volume header to end
    volume_records = []
    if volume_header_idx:
        volume_records = parse_section(volume_header_idx, len(all_rows))

    print(f"Value records: {len(value_records)}")
    print(f"Volume records: {len(volume_records)}")

    return value_records, volume_records, years


def build_json(records, years):
    """
    Build the hierarchical JSON structure from flat records.

    Structure:
    {
      "Global": {
        "By Technology": {
          "Single-Phase Micro Inverters": { "2019": val, ... },
          ...
        },
        "By Region": {
          "North America": { "2019": val, ... },
          ...
        }
      },
      "North America": {
        "By Technology": { ... },
        "By Country": {
          "U.S.": { "2019": val, ... },
          ...
        }
      },
      "U.S.": {
        "By Technology": { ... },
        ...
      }
    }
    """
    data = {}

    # Group records by region
    region_records = {}
    for rec in records:
        region = rec["region"]
        if region not in region_records:
            region_records[region] = []
        region_records[region].append(rec)

    # Build each geography entry
    all_geos = ["Global"] + REGIONS + ALL_COUNTRIES
    for geo in all_geos:
        if geo not in region_records:
            print(f"  WARNING: No records found for geography '{geo}'")
            continue

        data[geo] = {}
        geo_recs = region_records[geo]

        for rec in geo_recs:
            seg_type = rec["segment"]
            subseg = rec["subsegment"]

            # Skip "By Region" and "By Country" for now - handle separately
            if seg_type in ("By Region", "By Country"):
                continue

            if seg_type not in data[geo]:
                data[geo][seg_type] = {}

            # Round values appropriately
            rounded_values = {}
            for yr in years:
                if yr in rec["values"]:
                    rounded_values[yr] = round(rec["values"][yr], 1)

            data[geo][seg_type][subseg] = rounded_values

        # Add "By Region" for Global (region totals)
        if geo == "Global":
            by_region = {}
            for rec in geo_recs:
                if rec["segment"] == "By Region":
                    subseg = rec["subsegment"]
                    # Normalize: "Middle East and Africa" -> "Middle East & Africa"
                    if "middle east" in subseg.lower() and "africa" in subseg.lower():
                        subseg = "Middle East & Africa"
                    rounded_values = {}
                    for yr in years:
                        if yr in rec["values"]:
                            rounded_values[yr] = round(rec["values"][yr], 1)
                    by_region[subseg] = rounded_values
            if by_region:
                data["Global"]["By Region"] = by_region

        # Add "By Country" for regions
        if geo in REGIONS:
            by_country = {}
            for rec in geo_recs:
                if rec["segment"] == "By Country":
                    subseg = rec["subsegment"]
                    rounded_values = {}
                    for yr in years:
                        if yr in rec["values"]:
                            rounded_values[yr] = round(rec["values"][yr], 1)
                    by_country[subseg] = rounded_values
            if by_country:
                data[geo]["By Country"] = by_country

    return data


def build_volume_json(records, years):
    """Build volume JSON - same structure but values are integers (units)."""
    data = {}

    region_records = {}
    for rec in records:
        region = rec["region"]
        if region not in region_records:
            region_records[region] = []
        region_records[region].append(rec)

    all_geos = ["Global"] + REGIONS + ALL_COUNTRIES
    for geo in all_geos:
        if geo not in region_records:
            print(f"  WARNING (Volume): No records found for geography '{geo}'")
            continue

        data[geo] = {}
        geo_recs = region_records[geo]

        for rec in geo_recs:
            seg_type = rec["segment"]
            subseg = rec["subsegment"]

            if seg_type in ("By Region", "By Country"):
                continue

            if seg_type not in data[geo]:
                data[geo][seg_type] = {}

            rounded_values = {}
            for yr in years:
                if yr in rec["values"]:
                    rounded_values[yr] = round(rec["values"][yr])

            data[geo][seg_type][subseg] = rounded_values

        # Add "By Region" for Global
        if geo == "Global":
            by_region = {}
            for rec in geo_recs:
                if rec["segment"] == "By Region":
                    subseg = rec["subsegment"]
                    if "middle east" in subseg.lower() and "africa" in subseg.lower():
                        subseg = "Middle East & Africa"
                    rounded_values = {}
                    for yr in years:
                        if yr in rec["values"]:
                            rounded_values[yr] = round(rec["values"][yr])
                    by_region[subseg] = rounded_values
            if by_region:
                data["Global"]["By Region"] = by_region

        # Add "By Country" for regions
        if geo in REGIONS:
            by_country = {}
            for rec in geo_recs:
                if rec["segment"] == "By Country":
                    subseg = rec["subsegment"]
                    rounded_values = {}
                    for yr in years:
                        if yr in rec["values"]:
                            rounded_values[yr] = round(rec["values"][yr])
                    by_country[subseg] = rounded_values
            if by_country:
                data[geo]["By Country"] = by_country

    return data


def build_segmentation_analysis():
    """Build segmentation_analysis.json - hierarchy structure."""
    analysis = {"Global": {}}

    # Segment types with their sub-segments (from the Excel data)
    segment_subsegments = {
        "By Technology": [
            "Single-Phase Micro Inverters",
            "Three-Phase Micro Inverters"
        ],
        "By Power Rating": [
            "<250 W",
            "250 W - 500 W",
            ">500 W"
        ],
        "By Provider": [
            "Direct Sales through OEM",
            "Distributors and Wholesalers",
            "Retailers",
            "Solar Installers and Contractors"
        ],
        "By End-User": [
            "Residential",
            "Commercial and Industrial",
            "Utility-scale"
        ]
    }

    for seg_type, subsegments in segment_subsegments.items():
        analysis["Global"][seg_type] = {}
        for subseg in subsegments:
            analysis["Global"][seg_type][subseg] = {}

    # By Region
    analysis["Global"]["By Region"] = {}
    for region, countries in GEO_HIERARCHY.items():
        analysis["Global"]["By Region"][region] = {}
        for country in countries:
            analysis["Global"]["By Region"][region][country] = {}

    return analysis


def verify_data(value_data, years):
    """Verify data integrity - check for double counting."""
    print("\n=== DATA VERIFICATION ===")

    # For each geography, check that segment sub-segment values are reasonable
    for geo in ["Global"] + REGIONS:
        if geo not in value_data:
            continue

        # Sum of each segment type's sub-segments for a test year
        test_year = years[0]
        print(f"\n{geo} ({test_year}):")

        for seg_type in DATA_SEGMENT_TYPES:
            if seg_type not in value_data[geo]:
                print(f"  {seg_type}: MISSING")
                continue

            total = 0
            for subseg, vals in value_data[geo][seg_type].items():
                total += vals.get(test_year, 0)

            print(f"  {seg_type}: {total:.1f}")

        # Check By Region totals for Global
        if geo == "Global" and "By Region" in value_data["Global"]:
            region_total = sum(
                vals.get(test_year, 0)
                for vals in value_data["Global"]["By Region"].values()
            )
            print(f"  By Region total: {region_total:.1f}")


def main():
    print("Reading Excel data...")
    value_records, volume_records, years = read_excel()

    print("\nBuilding Value JSON...")
    value_data = build_json(value_records, years)

    print("\nBuilding Volume JSON...")
    volume_data = build_volume_json(volume_records, years)

    print("\nBuilding segmentation analysis...")
    seg_analysis = build_segmentation_analysis()

    # Verify
    verify_data(value_data, years)

    # Write files
    with open(VALUE_JSON, "w") as f:
        json.dump(value_data, f, indent=2)
    print(f"\nWritten: {VALUE_JSON}")

    with open(VOLUME_JSON, "w") as f:
        json.dump(volume_data, f, indent=2)
    print(f"Written: {VOLUME_JSON}")

    with open(SEG_JSON, "w") as f:
        json.dump(seg_analysis, f, indent=2)
    print(f"Written: {SEG_JSON}")

    # Summary
    print(f"\nGeographies in value.json: {list(value_data.keys())}")
    print(f"Geographies in volume.json: {list(volume_data.keys())}")
    print(f"Years: {years}")


if __name__ == "__main__":
    main()
