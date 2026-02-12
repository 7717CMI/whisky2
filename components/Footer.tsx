'use client'

import Image from 'next/image'
import { Phone, Mail, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <>
      {/* Contact Us Strip */}
      <div className="bg-gray-200 border-b border-gray-300">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="font-semibold text-black">Contact Us</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black" />
                <span className="text-black">United States: <strong>+1-252-477-1362</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black" />
                <span className="text-black">United Kingdom: <strong>+44-203-957-8553 / +44-203-949-5508</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black" />
                <span className="text-black">Australia: <strong>+61-8-7924-7805</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black" />
                <span className="text-black">India: <strong>+91-848-285-0837</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Left Column - Contact and Office Information */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">For Business Enquiry :</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:sales@coherentmarketinsights.com" className="text-gray-300 hover:text-white">
                    sales@coherentmarketinsights.com
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-white font-semibold mb-2">Sales Office (U.S.) :</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Coherent Market Insights Pvt Ltd, 533 Airport Boulevard, Suite 400, Burlingame, CA 94010, United States
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-white font-semibold mb-2">Asia Pacific Intelligence Center (India) :</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Coherent Market Insights Pvt Ltd, 401-402, Bremen Business Center, University Road, Aundh, Pune - 411007, India.
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Menu</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Industries</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Reader Club Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Reader Club</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Latest Insights</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">COVID-19 Tracker</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Press Release</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Infographics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blogs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">News</a></li>
              </ul>
            </div>

            {/* Help Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Help</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Become Reseller</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How To Order?</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms and Conditions</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Disclaimer</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sitemap</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Feeds</a></li>
              </ul>
            </div>
          </div>

          {/* Right Section - HR, Social Media, Payment */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* HR Contact */}
              <div>
                <p className="text-white font-semibold mb-2">HR Contact :</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-gray-300">+91-7262891127</span>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-white font-semibold mb-3">Connect With Us :</p>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-black rounded flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white hover:bg-red-700 transition-colors font-bold"
                    aria-label="Pinterest"
                  >
                    <span className="text-sm">P</span>
                  </a>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-white font-semibold mb-3">Secure Payment By :</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="px-3 py-2 bg-white rounded text-blue-600 font-bold text-xs">VISA</div>
                  <div className="px-3 py-2 bg-white rounded text-orange-600 font-bold text-xs">DISCOVER</div>
                  <div className="px-3 py-2 bg-white rounded text-red-600 font-bold text-xs">MasterCard</div>
                  <div className="px-3 py-2 bg-white rounded text-blue-600 font-bold text-xs">AMERICAN EXPRESS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Coherent Market Insights Pvt Ltd. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

