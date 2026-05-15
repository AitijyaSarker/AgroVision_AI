'use client'

import { Facebook, Linkedin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@agrovision.com', label: 'Email' },
  ]

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">🌱 Agro Vision</h3>
            <p className="text-gray-400">
              AI-Powered Crop Disease Detection for Farmers of Bangladesh
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors"
                aria-label={link.label}
              >
                <link.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Agro Vision. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


