'use client'

import { useState } from 'react'

interface OEMData {
  // OEM Information
  oemManufacturerName: string
  hqCountry: string
  primaryDoorTypeFocus: string
  automationFocus: string
  materialFocus: string
  keyEndUseFocus: string
  // Channel & Support
  goToMarketChannels: string
  serviceAftermarketStrength: string
  typicalPositioning: string
  keyDistributorIntegratorApproach: string
  // CMI Insights
  keyInsights: string
}

interface DistributorData {
  // Partner Profile
  distributorName: string
  parentGroupHoldingCompany: string
  hqCountry: string
  countriesCovered: string
  keyOEMBrandsCarried: string
  channelType: string
  keyDoorTypesCovered: string
  automationCapability: string
  endUseFocus: string
  // Contact Details
  keyContactPerson: string
  designation: string
  email: string
  phoneWhatsApp: string
  linkedIn: string
  website: string
  // Fit & Opportunity
  competitiveStrengths: string
  gapsWeaknesses: string
}

// Sample data for Industrial Door OEMs
const oemData: OEMData[] = [
  {
    oemManufacturerName: 'Hörmann',
    hqCountry: 'Germany',
    primaryDoorTypeFocus: 'Industrial Sectional, High-Speed, Loading Bay',
    automationFocus: 'Full Automation, Smart Controls',
    materialFocus: 'Steel, Aluminum, Insulated Panels',
    keyEndUseFocus: 'Manufacturing, Logistics, Automotive',
    goToMarketChannels: 'Direct Sales, Authorized Dealers',
    serviceAftermarketStrength: 'Strong - Pan-India Service Network',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Exclusive Distributors, System Integrators',
    keyInsights: 'Market leader in premium segment, strong brand recall'
  },
  {
    oemManufacturerName: 'ASSA ABLOY (Entrematic)',
    hqCountry: 'Sweden',
    primaryDoorTypeFocus: 'High-Speed, Sectional, Dock Equipment',
    automationFocus: 'Advanced Automation, IoT Integration',
    materialFocus: 'Steel, PVC, Composite',
    keyEndUseFocus: 'Logistics, Cold Chain, Food & Beverage',
    goToMarketChannels: 'Direct Sales, Channel Partners',
    serviceAftermarketStrength: 'Strong - Global Service Standards',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Regional Distributors, EPC Partners',
    keyInsights: 'Strong in cold chain, expanding logistics focus'
  },
  {
    oemManufacturerName: 'Gandhi Automations',
    hqCountry: 'India',
    primaryDoorTypeFocus: 'High-Speed, Sectional, Rolling Shutters',
    automationFocus: 'Semi to Full Automation',
    materialFocus: 'Steel, Aluminum, PVC',
    keyEndUseFocus: 'Manufacturing, Pharma, Automotive',
    goToMarketChannels: 'Direct Sales, Dealer Network',
    serviceAftermarketStrength: 'Strong - Extensive Local Network',
    typicalPositioning: 'Mid to Premium',
    keyDistributorIntegratorApproach: 'Multi-tier Distribution, Direct Key Accounts',
    keyInsights: 'Leading Indian player, strong service network'
  },
  {
    oemManufacturerName: 'Dynaco (ASSA ABLOY)',
    hqCountry: 'Belgium',
    primaryDoorTypeFocus: 'High-Speed Doors',
    automationFocus: 'Full Automation, Self-Repair',
    materialFocus: 'PVC, Fabric',
    keyEndUseFocus: 'Food, Pharma, Clean Rooms',
    goToMarketChannels: 'Direct Sales, Specialized Dealers',
    serviceAftermarketStrength: 'Moderate - Partner Dependent',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Specialized Partners, OEM Tie-ups',
    keyInsights: 'Niche player in hygienic high-speed doors'
  },
  {
    oemManufacturerName: 'Rytec Corporation',
    hqCountry: 'USA',
    primaryDoorTypeFocus: 'High-Speed, Rubber Doors',
    automationFocus: 'Full Automation, High Cycle',
    materialFocus: 'Rubber, PVC, Steel',
    keyEndUseFocus: 'Manufacturing, Automotive, Logistics',
    goToMarketChannels: 'Direct Sales, Authorized Distributors',
    serviceAftermarketStrength: 'Moderate - Select Cities',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Technical Distributors, Direct Sales',
    keyInsights: 'Known for durability and crash-proof design'
  },
  {
    oemManufacturerName: 'Infraca',
    hqCountry: 'India',
    primaryDoorTypeFocus: 'Industrial Doors, Dock Equipment',
    automationFocus: 'Semi to Full Automation',
    materialFocus: 'Steel, Insulated Panels',
    keyEndUseFocus: 'Logistics, Cold Chain, Manufacturing',
    goToMarketChannels: 'Direct Sales, Regional Dealers',
    serviceAftermarketStrength: 'Growing - Regional Focus',
    typicalPositioning: 'Value to Mid',
    keyDistributorIntegratorApproach: 'Regional Dealers, Direct Sales',
    keyInsights: 'Growing player in value segment'
  },
  {
    oemManufacturerName: 'Kopron',
    hqCountry: 'Italy',
    primaryDoorTypeFocus: 'Sectional, Dock Equipment, Loading Systems',
    automationFocus: 'Full Automation',
    materialFocus: 'Steel, Aluminum',
    keyEndUseFocus: 'Logistics, Manufacturing',
    goToMarketChannels: 'Direct Sales, EPC Partners',
    serviceAftermarketStrength: 'Moderate - Limited Network',
    typicalPositioning: 'Mid to Premium',
    keyDistributorIntegratorApproach: 'EPC Partners, Project Sales',
    keyInsights: 'Strong in loading bay solutions'
  },
  {
    oemManufacturerName: 'Efaflex',
    hqCountry: 'Germany',
    primaryDoorTypeFocus: 'High-Speed Doors',
    automationFocus: 'Full Automation, Smart Controls',
    materialFocus: 'Aluminum, PVC, Steel',
    keyEndUseFocus: 'Automotive, Clean Rooms, Pharma',
    goToMarketChannels: 'Direct Sales, Technical Partners',
    serviceAftermarketStrength: 'Strong - Specialized Service',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Technical Partners, OEM Integration',
    keyInsights: 'Technology leader in high-speed segment'
  }
]

// Sample data for Distributors
const distributorData: DistributorData[] = [
  {
    distributorName: 'Kelley Material Handling India',
    parentGroupHoldingCompany: '4Front Engineered Solutions',
    hqCountry: 'USA',
    countriesCovered: 'India, South Asia',
    keyOEMBrandsCarried: 'Kelley, Serco, APS Resource',
    channelType: 'Exclusive Distributor',
    keyDoorTypesCovered: 'Dock Equipment, Sectional Doors',
    automationCapability: 'Full Automation',
    endUseFocus: 'Logistics, E-commerce, Manufacturing',
    keyContactPerson: 'Vikram Mehta',
    designation: 'Country Manager',
    email: 'v.mehta@kelleyindia.com',
    phoneWhatsApp: '+91 98765 11111',
    linkedIn: 'linkedin.com/in/vikrammehta',
    website: 'www.kelleyindia.com',
    competitiveStrengths: 'Service reach, Fast response, OEM backing',
    gapsWeaknesses: 'Limited cold-chain references'
  },
  {
    distributorName: 'Techno Doors Pvt Ltd',
    parentGroupHoldingCompany: 'Independent',
    hqCountry: 'India',
    countriesCovered: 'India',
    keyOEMBrandsCarried: 'Gandhi Automations, Hormann, Local',
    channelType: 'Multi-brand Dealer',
    keyDoorTypesCovered: 'High-Speed, Rolling Shutters, Sectional',
    automationCapability: 'Semi to Full',
    endUseFocus: 'Manufacturing, Pharma, Food Processing',
    keyContactPerson: 'Ramesh Agarwal',
    designation: 'Managing Director',
    email: 'ramesh@technodoors.in',
    phoneWhatsApp: '+91 98234 22222',
    linkedIn: 'linkedin.com/in/rameshagarwal',
    website: 'www.technodoors.in',
    competitiveStrengths: 'Local presence, Competitive pricing, Quick installation',
    gapsWeaknesses: 'Limited premium segment experience'
  },
  {
    distributorName: 'Cold Chain Solutions India',
    parentGroupHoldingCompany: 'CCS Group',
    hqCountry: 'India',
    countriesCovered: 'India, Bangladesh, Nepal',
    keyOEMBrandsCarried: 'ASSA ABLOY, Dynaco, Infraca',
    channelType: 'EPC Contractor',
    keyDoorTypesCovered: 'Cold Room Doors, High-Speed, Strip Curtains',
    automationCapability: 'Full Automation',
    endUseFocus: 'Cold Chain, Pharma, Food & Beverage',
    keyContactPerson: 'Anjali Sharma',
    designation: 'Business Head',
    email: 'anjali@coldchainsolutions.in',
    phoneWhatsApp: '+91 99887 33333',
    linkedIn: 'linkedin.com/in/anjalisharma-ccs',
    website: 'www.coldchainsolutions.in',
    competitiveStrengths: 'Cold chain expertise, Turnkey solutions, Strong references',
    gapsWeaknesses: 'Limited manufacturing sector presence'
  },
  {
    distributorName: 'Industrial Access Systems',
    parentGroupHoldingCompany: 'IAS Holdings',
    hqCountry: 'India',
    countriesCovered: 'India, Middle East',
    keyOEMBrandsCarried: 'Rytec, Efaflex, Gandhi',
    channelType: 'Authorized Distributor',
    keyDoorTypesCovered: 'High-Speed, Crash Doors, Sectional',
    automationCapability: 'Full Automation',
    endUseFocus: 'Automotive, Manufacturing, Logistics',
    keyContactPerson: 'Sunil Kapoor',
    designation: 'Director - Sales',
    email: 'sunil@iasystems.co.in',
    phoneWhatsApp: '+91 98102 44444',
    linkedIn: 'linkedin.com/in/sunilkapoor-ias',
    website: 'www.iasystems.co.in',
    competitiveStrengths: 'Technical expertise, OEM trained, Pan-India service',
    gapsWeaknesses: 'Higher pricing vs local players'
  },
  {
    distributorName: 'BuildTech Doors & Automation',
    parentGroupHoldingCompany: 'BuildTech Group',
    hqCountry: 'India',
    countriesCovered: 'India',
    keyOEMBrandsCarried: 'Kopron, Local Manufacturers',
    channelType: 'Retailer / Dealer',
    keyDoorTypesCovered: 'Sectional, Rolling, Dock Equipment',
    automationCapability: 'Semi Automation',
    endUseFocus: 'SME Manufacturing, Warehouses',
    keyContactPerson: 'Pradeep Jain',
    designation: 'Proprietor',
    email: 'pradeep@buildtechdoors.com',
    phoneWhatsApp: '+91 97654 55555',
    linkedIn: 'linkedin.com/in/pradeepjain-bt',
    website: 'www.buildtechdoors.com',
    competitiveStrengths: 'Value pricing, Quick delivery, Local support',
    gapsWeaknesses: 'Limited automation expertise, No premium brands'
  },
  {
    distributorName: 'SafeEntry Solutions',
    parentGroupHoldingCompany: 'Independent',
    hqCountry: 'India',
    countriesCovered: 'India',
    keyOEMBrandsCarried: 'Hormann, ASSA ABLOY',
    channelType: 'Authorized Dealer',
    keyDoorTypesCovered: 'High-Speed, Fire Doors, Sectional',
    automationCapability: 'Full Automation',
    endUseFocus: 'Pharma, Clean Rooms, Data Centers',
    keyContactPerson: 'Neha Gupta',
    designation: 'CEO',
    email: 'neha@safeentry.in',
    phoneWhatsApp: '+91 98765 66666',
    linkedIn: 'linkedin.com/in/nehagupta-se',
    website: 'www.safeentry.in',
    competitiveStrengths: 'Compliance expertise, Premium positioning, Strong references',
    gapsWeaknesses: 'Limited geographic coverage'
  }
]

interface CompetitiveIntelligenceProps {
  height?: number
}

export function CompetitiveIntelligence({ height }: CompetitiveIntelligenceProps) {
  const [activeTable, setActiveTable] = useState<'oem' | 'distributor'>('oem')

  const renderOEMTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={6} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              OEM Information
            </th>
            <th colSpan={4} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Channel & Support
            </th>
            <th colSpan={1} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              CMI Insights
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* OEM Information */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              OEM / Manufacturer Name
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">
              HQ Country
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Primary Door Type Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Automation Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Material Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Key End-use Focus
            </th>
            {/* Channel & Support */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Go-to-Market Channels
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Service / Aftermarket Strength
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              <div>Typical Positioning</div>
              <div className="font-normal text-[10px] text-gray-600">(Value/Mid/Premium)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              Key Distributor/Integrator Approach
            </th>
            {/* CMI Insights */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              Key Insights
            </th>
          </tr>
        </thead>
        <tbody>
          {oemData.map((oem, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* OEM Information */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black font-medium">{oem.oemManufacturerName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.hqCountry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.primaryDoorTypeFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.automationFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.materialFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyEndUseFocus}</td>
              {/* Channel & Support */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.goToMarketChannels}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.serviceAftermarketStrength}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.typicalPositioning}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyDistributorIntegratorApproach}</td>
              {/* CMI Insights */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyInsights}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderDistributorTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={9} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Partner Profile
            </th>
            <th colSpan={6} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Contact Details
            </th>
            <th colSpan={2} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Fit & Opportunity
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* Partner Profile */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Distributor / Channel Partner Name
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Parent Group / Holding Company
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">
              HQ Country
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Countries Covered
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Key OEM Brands Carried
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              <div>Channel Type</div>
              <div className="font-normal text-[10px] text-gray-600">(Retailers/EPC Contractor/Others)</div>
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Key Door Types Covered
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Automation Capability
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              End-use Focus
            </th>
            {/* Contact Details */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Key Contact Person
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Designation / Department
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Email
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Phone / WhatsApp
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              LinkedIn
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Website
            </th>
            {/* Fit & Opportunity */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Competitive Strengths
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Gaps / Weaknesses
            </th>
          </tr>
        </thead>
        <tbody>
          {distributorData.map((distributor, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Partner Profile */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black font-medium">{distributor.distributorName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.parentGroupHoldingCompany}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.hqCountry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.countriesCovered}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyOEMBrandsCarried}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.channelType}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyDoorTypesCovered}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.automationCapability}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.endUseFocus}</td>
              {/* Contact Details */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyContactPerson}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.designation}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`mailto:${distributor.email}`}>{distributor.email}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.phoneWhatsApp}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${distributor.linkedIn}`} target="_blank" rel="noopener noreferrer">{distributor.linkedIn}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${distributor.website}`} target="_blank" rel="noopener noreferrer">{distributor.website}</a>
              </td>
              {/* Fit & Opportunity */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.competitiveStrengths}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.gapsWeaknesses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-black mb-4">
        {activeTable === 'oem' ? 'OEM Intelligence' : 'Distributor Intelligence'}
      </h2>

      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTable('oem')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTable === 'oem'
              ? 'bg-[#4A90A4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          OEM Intelligence
        </button>
        <button
          onClick={() => setActiveTable('distributor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTable === 'distributor'
              ? 'bg-[#4A90A4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Distributor Intelligence
        </button>
      </div>

      {/* Render Active Table */}
      {activeTable === 'oem' ? renderOEMTable() : renderDistributorTable()}
    </div>
  )
}

export default CompetitiveIntelligence
