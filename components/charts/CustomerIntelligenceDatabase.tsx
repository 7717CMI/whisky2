'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CustomerData {
  // Customer Information
  sNo: number
  customerPlantOrganizationName: string
  parentGroupHoldingCompany: string
  country: string
  cityIndustrialCluster: string
  endUseIndustry: string
  facilityType: string
  // Product/Door Information
  primaryDoorType: string
  automationLevel: string
  material: string
  installedIndustrialDoorBase: string
  // Contact Details
  keyContactPerson: string
  designation: string
  emailAddress: string
  phoneNumber: string
  linkedInProfile: string
  websiteUrl: string
  // Needs & Pain Points
  primaryNeedFocus: string
  keyProductNeeds: string
  keyServiceNeeds: string
  // Purchasing Behaviour (for Proposition 3)
  decisionMakers: string
  currentSupplierSetup: string
  currentMaintenanceModel: string
  // Opportunity & Project Status (for Proposition 3)
  priorityLevel: string
  expectedOpportunitySize: string
  plannedProjects: string
  // CMI Insights (for Proposition 3)
  customerBenchmarkingSummary: string
}

// Sample data for Industrial Door Industry
const sampleCustomerData: CustomerData[] = [
  {
    sNo: 1,
    customerPlantOrganizationName: 'Tata Steel - Jamshedpur Plant',
    parentGroupHoldingCompany: 'Tata Group',
    country: 'India',
    cityIndustrialCluster: 'Jamshedpur Industrial Zone',
    endUseIndustry: 'Steel Manufacturing',
    facilityType: 'Manufacturing Plant',
    primaryDoorType: 'High-Speed Rolling Doors',
    automationLevel: 'Fully Automated',
    material: 'Steel with Insulated Panels',
    installedIndustrialDoorBase: '45 doors / 12 bays / 4m x 5m',
    keyContactPerson: 'Rajesh Kumar',
    designation: 'Plant Manager - Facilities',
    emailAddress: 'r.kumar@tatasteel.com',
    phoneNumber: '+91 98765 43210',
    linkedInProfile: 'linkedin.com/in/rajeshkumar-tata',
    websiteUrl: 'www.tatasteel.com',
    primaryNeedFocus: 'Products',
    keyProductNeeds: 'High-speed doors, insulation, safety sensors',
    keyServiceNeeds: 'Installation, AMC, emergency repair',
    decisionMakers: 'Plant Manager, Maintenance Head, Procurement',
    currentSupplierSetup: 'OEM / Multi-vendor',
    currentMaintenanceModel: 'Mixed',
    priorityLevel: 'High',
    expectedOpportunitySize: 'Large (₹50L+)',
    plannedProjects: 'Plant expansion, Safety compliance retrofit',
    customerBenchmarkingSummary: 'High potential - Strategic account'
  },
  {
    sNo: 2,
    customerPlantOrganizationName: 'Amazon Fulfillment Center',
    parentGroupHoldingCompany: 'Amazon Inc.',
    country: 'India',
    cityIndustrialCluster: 'Bhiwandi Logistics Hub',
    endUseIndustry: 'E-commerce & Logistics',
    facilityType: 'Warehouse / Distribution Center',
    primaryDoorType: 'Dock Levelers & Sectional Doors',
    automationLevel: 'Semi-Automated',
    material: 'Insulated Steel Panels',
    installedIndustrialDoorBase: '120 doors / 48 bays / 3m x 4m',
    keyContactPerson: 'Priya Sharma',
    designation: 'Operations Manager',
    emailAddress: 'p.sharma@amazon.com',
    phoneNumber: '+91 98234 56789',
    linkedInProfile: 'linkedin.com/in/priyasharma-amazon',
    websiteUrl: 'www.amazon.in',
    primaryNeedFocus: 'Both',
    keyProductNeeds: 'Dock doors, loading bay equipment, seals',
    keyServiceNeeds: 'Installation, maintenance, AMC, rapid repair',
    decisionMakers: 'Operations Manager, Facility Manager, Procurement',
    currentSupplierSetup: 'Multi-vendor / EPC',
    currentMaintenanceModel: 'Outsourced',
    priorityLevel: 'High',
    expectedOpportunitySize: 'Large (₹75L+)',
    plannedProjects: 'New fulfillment center, Automation upgrade',
    customerBenchmarkingSummary: 'High potential - Large fleet'
  },
  {
    sNo: 3,
    customerPlantOrganizationName: 'Nestle India - Nanjangud Factory',
    parentGroupHoldingCompany: 'Nestle S.A.',
    country: 'India',
    cityIndustrialCluster: 'Nanjangud Food Processing Zone',
    endUseIndustry: 'Food & Beverage',
    facilityType: 'Food Processing Plant',
    primaryDoorType: 'Hygienic High-Speed Doors',
    automationLevel: 'Fully Automated',
    material: 'Stainless Steel / PVC',
    installedIndustrialDoorBase: '65 doors / 20 bays / 2.5m x 3m',
    keyContactPerson: 'Amit Verma',
    designation: 'Engineering Head',
    emailAddress: 'a.verma@nestle.com',
    phoneNumber: '+91 99887 65432',
    linkedInProfile: 'linkedin.com/in/amitverma-nestle',
    websiteUrl: 'www.nestle.in',
    primaryNeedFocus: 'Products',
    keyProductNeeds: 'Hygienic doors, clean room doors, air curtains',
    keyServiceNeeds: 'Installation, scheduled maintenance, retrofit',
    decisionMakers: 'Engineering Head, Quality Manager, Procurement',
    currentSupplierSetup: 'OEM / Dealers',
    currentMaintenanceModel: 'In-house',
    priorityLevel: 'Medium',
    expectedOpportunitySize: 'Medium (₹25-50L)',
    plannedProjects: 'Compliance upgrade, Capacity expansion',
    customerBenchmarkingSummary: 'High potential - Premium segment'
  },
  {
    sNo: 4,
    customerPlantOrganizationName: 'Maruti Suzuki - Manesar Plant',
    parentGroupHoldingCompany: 'Suzuki Motor Corporation',
    country: 'India',
    cityIndustrialCluster: 'Manesar Automotive Hub',
    endUseIndustry: 'Automotive Manufacturing',
    facilityType: 'Assembly Plant',
    primaryDoorType: 'High-Speed & Sectional Doors',
    automationLevel: 'Fully Automated',
    material: 'Galvanized Steel',
    installedIndustrialDoorBase: '200 doors / 60 bays / Various sizes',
    keyContactPerson: 'Suresh Nair',
    designation: 'VP - Plant Engineering',
    emailAddress: 's.nair@maruti.co.in',
    phoneNumber: '+91 98102 34567',
    linkedInProfile: 'linkedin.com/in/sureshnair-maruti',
    websiteUrl: 'www.marutisuzuki.com',
    primaryNeedFocus: 'Both',
    keyProductNeeds: 'Paint booth doors, assembly line doors, safety doors',
    keyServiceNeeds: 'AMC, emergency repair, retrofit, installation',
    decisionMakers: 'VP Engineering, Maintenance Head, Central Procurement',
    currentSupplierSetup: 'OEM / Multi-vendor',
    currentMaintenanceModel: 'Mixed',
    priorityLevel: 'High',
    expectedOpportunitySize: 'Large (₹1Cr+)',
    plannedProjects: 'New model line, Automation upgrade',
    customerBenchmarkingSummary: 'High potential - Strategic'
  },
  {
    sNo: 5,
    customerPlantOrganizationName: 'DHL Supply Chain - Cold Storage',
    parentGroupHoldingCompany: 'Deutsche Post DHL Group',
    country: 'India',
    cityIndustrialCluster: 'Pune Logistics Park',
    endUseIndustry: 'Cold Chain Logistics',
    facilityType: 'Cold Storage Facility',
    primaryDoorType: 'Cold Room Doors & Air Curtains',
    automationLevel: 'Semi-Automated',
    material: 'Insulated Panels / PU Core',
    installedIndustrialDoorBase: '35 doors / 15 bays / 2m x 3m',
    keyContactPerson: 'Ankit Jain',
    designation: 'Facility Manager',
    emailAddress: 'a.jain@dhl.com',
    phoneNumber: '+91 97654 32109',
    linkedInProfile: 'linkedin.com/in/ankitjain-dhl',
    websiteUrl: 'www.dhl.com',
    primaryNeedFocus: 'Services',
    keyProductNeeds: 'Cold room doors, strip curtains, seals',
    keyServiceNeeds: 'Maintenance, emergency repair, AMC',
    decisionMakers: 'Facility Manager, Operations Head, Procurement',
    currentSupplierSetup: 'Dealers / EPC',
    currentMaintenanceModel: 'Outsourced',
    priorityLevel: 'Medium',
    expectedOpportunitySize: 'Medium (₹20-40L)',
    plannedProjects: 'Cold chain expansion, Retrofit',
    customerBenchmarkingSummary: 'High potential - Growing segment'
  }
]

interface PrepositionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Preposition({ title, isOpen, onToggle, children }: PrepositionProps) {
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span className="text-lg font-semibold text-black">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-2 pb-4 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  )
}

interface CustomerIntelligenceDatabaseProps {
  title?: string
  height?: number
}

export default function CustomerIntelligenceDatabase({ title }: CustomerIntelligenceDatabaseProps) {
  const [openPreposition, setOpenPreposition] = useState<number | null>(1)

  const togglePreposition = (num: number) => {
    setOpenPreposition(openPreposition === num ? null : num)
  }

  // Preposition 1 Table - Customer Information + Contact Details
  const renderPreposition1Table = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={7} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Customer Information
            </th>
            <th colSpan={6} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Contact Details
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* Customer Information */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[60px]">
              S.No.
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Customer / Plant / Organization Name
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Parent Group / Holding Company
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">
              Country
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              City / Industrial Cluster
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              End-use Industry
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Facility Type
            </th>
            {/* Contact Details */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Key Contact Person</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Designation / Department</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Email Address</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[140px]">Phone/ WhatsApp Number</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">LinkedIn Profile</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Website URL</th>
          </tr>
        </thead>
        <tbody>
          {sampleCustomerData.map((customer, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Customer Information */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black text-center">{customer.sNo}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.customerPlantOrganizationName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.parentGroupHoldingCompany}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.country}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.cityIndustrialCluster}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.endUseIndustry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.facilityType}</td>
              {/* Contact Details */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyContactPerson}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.designation}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`mailto:${customer.emailAddress}`}>{customer.emailAddress}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.phoneNumber}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.linkedInProfile}`} target="_blank" rel="noopener noreferrer">{customer.linkedInProfile}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.websiteUrl}`} target="_blank" rel="noopener noreferrer">{customer.websiteUrl}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Preposition 2 Table - Customer Information + Contact Details + Needs & Pain Points
  const renderPreposition2Table = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={7} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Customer Information
            </th>
            <th colSpan={6} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Contact Details
            </th>
            <th colSpan={3} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Needs & Pain Points
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* Customer Information */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[60px]">S.No.</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">Customer / Plant / Organization Name</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">Parent Group / Holding Company</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">Country</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">City / Industrial Cluster</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">End-use Industry</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">Facility Type</th>
            {/* Contact Details */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Key Contact Person</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Designation / Department</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Email Address</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[140px]">Phone/ WhatsApp Number</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">LinkedIn Profile</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Website URL</th>
            {/* Needs & Pain Points */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              <div>Primary Need Focus</div>
              <div className="font-normal text-[10px] text-gray-600">(Products / Services / Both)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Key Product Needs</div>
              <div className="font-normal text-[10px] text-gray-600">(doors, automation, safety, insulation, seals, etc.)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[220px]">
              <div>Key Service Needs</div>
              <div className="font-normal text-[10px] text-gray-600">(installation, maintenance, AMC, repair, retrofit, etc.)</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sampleCustomerData.map((customer, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Customer Information */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black text-center">{customer.sNo}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.customerPlantOrganizationName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.parentGroupHoldingCompany}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.country}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.cityIndustrialCluster}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.endUseIndustry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.facilityType}</td>
              {/* Contact Details */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyContactPerson}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.designation}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`mailto:${customer.emailAddress}`}>{customer.emailAddress}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.phoneNumber}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.linkedInProfile}`} target="_blank" rel="noopener noreferrer">{customer.linkedInProfile}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.websiteUrl}`} target="_blank" rel="noopener noreferrer">{customer.websiteUrl}</a>
              </td>
              {/* Needs & Pain Points */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.primaryNeedFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyProductNeeds}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyServiceNeeds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Preposition 3 Table - Customer Information + Contact Details + Needs & Pain Points + Purchasing Behaviour + Opportunity & Project Status + CMI Insights
  const renderPreposition3Table = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={7} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Customer Information
            </th>
            <th colSpan={6} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Contact Details
            </th>
            <th colSpan={3} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Needs & Pain Points
            </th>
            <th colSpan={3} className="bg-[#9370DB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-white">
              Purchasing Behaviour
            </th>
            <th colSpan={3} className="bg-[#D4A574] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Opportunity & Project Status
            </th>
            <th colSpan={1} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              CMI Insights
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* Customer Information */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[60px]">S.No.</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">Customer / Plant / Organization Name</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">Parent Group / Holding Company</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">Country</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">City / Industrial Cluster</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">End-use Industry</th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">Facility Type</th>
            {/* Contact Details */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Key Contact Person</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Designation / Department</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">Email Address</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[140px]">Phone/ WhatsApp Number</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[150px]">LinkedIn Profile</th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black whitespace-nowrap min-w-[130px]">Website URL</th>
            {/* Needs & Pain Points */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              <div>Primary Need Focus</div>
              <div className="font-normal text-[10px] text-gray-600">(Products / Services / Both)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Key Product Needs</div>
              <div className="font-normal text-[10px] text-gray-600">(doors, automation, safety, insulation, seals, etc.)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[220px]">
              <div>Key Service Needs</div>
              <div className="font-normal text-[10px] text-gray-600">(installation, maintenance, AMC, repair, retrofit, etc.)</div>
            </th>
            {/* Purchasing Behaviour */}
            <th className="bg-[#DDA0DD] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Decision Makers</div>
              <div className="font-normal text-[10px] text-gray-600">(facility manager, maintenance head, procurement, etc.)</div>
            </th>
            <th className="bg-[#DDA0DD] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Current Supplier Setup</div>
              <div className="font-normal text-[10px] text-gray-600">(OEM / dealers / EPC / multi-vendor / in-house)</div>
            </th>
            <th className="bg-[#DDA0DD] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Current Maintenance Model</div>
              <div className="font-normal text-[10px] text-gray-600">(in-house / outsourced / mixed)</div>
            </th>
            {/* Opportunity & Project Status */}
            <th className="bg-[#DEB887] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              <div>Priority Level for Door Upgrade / Service</div>
              <div className="font-normal text-[10px] text-gray-600">(Low / Medium / High)</div>
            </th>
            <th className="bg-[#DEB887] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              <div>Expected Opportunity Size</div>
              <div className="font-normal text-[10px] text-gray-600">(small / medium / large; or spend range)</div>
            </th>
            <th className="bg-[#DEB887] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[220px]">
              <div>Planned Projects / Triggers</div>
              <div className="font-normal text-[10px] text-gray-600">(expansion, retrofit, compliance, automation)</div>
            </th>
            {/* CMI Insights */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              <div>Customer Benchmarking Summary</div>
              <div className="font-normal text-[10px] text-gray-600">(Potential Customers / Peer Group)</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sampleCustomerData.map((customer, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Customer Information */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black text-center">{customer.sNo}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.customerPlantOrganizationName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.parentGroupHoldingCompany}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.country}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.cityIndustrialCluster}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.endUseIndustry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.facilityType}</td>
              {/* Contact Details */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyContactPerson}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.designation}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`mailto:${customer.emailAddress}`}>{customer.emailAddress}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.phoneNumber}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.linkedInProfile}`} target="_blank" rel="noopener noreferrer">{customer.linkedInProfile}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${customer.websiteUrl}`} target="_blank" rel="noopener noreferrer">{customer.websiteUrl}</a>
              </td>
              {/* Needs & Pain Points */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.primaryNeedFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyProductNeeds}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.keyServiceNeeds}</td>
              {/* Purchasing Behaviour */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.decisionMakers}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.currentSupplierSetup}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.currentMaintenanceModel}</td>
              {/* Opportunity & Project Status */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.priorityLevel}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.expectedOpportunitySize}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.plannedProjects}</td>
              {/* CMI Insights */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{customer.customerBenchmarkingSummary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-black mb-6">Customer Intelligence Database</h2>

      <Preposition
        title="Proposition 1 - Basic"
        isOpen={openPreposition === 1}
        onToggle={() => togglePreposition(1)}
      >
        {renderPreposition1Table()}
      </Preposition>

      <Preposition
        title="Proposition 2 - Advanced"
        isOpen={openPreposition === 2}
        onToggle={() => togglePreposition(2)}
      >
        {renderPreposition2Table()}
      </Preposition>

      <Preposition
        title="Proposition 3 - Premium"
        isOpen={openPreposition === 3}
        onToggle={() => togglePreposition(3)}
      >
        {renderPreposition3Table()}
      </Preposition>
    </div>
  )
}
