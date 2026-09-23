import { BusinessConfiguration } from '../types/businessOnboarding';

export const businessConfigurations: Record<string, BusinessConfiguration> = {
  homestay: {
    businessType: 'homestay',
    name: 'Homestay',
    workflowId: 'homestay_verification',
    sections: [
      {
        id: 'basic_info',
        title: 'Basic Information',
        description: 'Provide your homestay registered name and key details',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'registered_name',
            label: 'Registered Homestay Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Himalayan Mist Homestay'
          },
          {
            id: 'property_type',
            label: 'Property Category',
            type: 'select',
            required: true,
            optionsSource: 'property_types',
            placeholder: 'Select Property Type'
          },
          {
            id: 'state',
            label: 'State Location',
            type: 'select',
            required: true,
            optionsSource: 'states',
            placeholder: 'Select State'
          },
          {
            id: 'district',
            label: 'District',
            type: 'select',
            required: true,
            optionsSource: 'districts',
            placeholder: 'Select District'
          },
          {
            id: 'amenities_provided',
            label: 'Standard Amenities',
            type: 'amenities',
            required: false,
            optionsSource: 'amenities'
          },
          {
            id: 'languages_spoken',
            label: 'Languages Spoken',
            type: 'languages',
            required: false,
            optionsSource: 'languages'
          },
          {
            id: 'payment_modes',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: false,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Upload regulatory documents and identity proofs',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'aadhaar_card',
            name: 'Aadhaar Card Copy',
            description: 'Double-sided colored scan of state issued identity document'
          },
          {
            id: 'pan_card',
            name: 'PAN Card Copy',
            description: 'Business PAN or proprietor identity card scan'
          }
        ],
        optionalDocuments: [
          {
            id: 'gst_registration',
            name: 'GST Registration Certificate',
            description: 'Government Issued GSTIN Certificate (if registered)'
          }
        ]
      },
      {
        id: 'photos',
        title: 'Photos',
        description: 'Upload high-resolution pictures of your homestay rooms and surroundings',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Review & Submit',
        description: 'Verify your submitted homestay profile and terms',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  hotel: {
    businessType: 'hotel',
    name: 'Hotel',
    workflowId: 'homestay_verification',
    sections: [
      {
        id: 'hotel_details',
        title: 'Hotel Details',
        description: 'Provide details about your hotel facilities and amenities',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'hotel_name',
            label: 'Registered Hotel Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Grand Shivalik Resort & Spa'
          },
          {
            id: 'state',
            label: 'State Location',
            type: 'select',
            required: true,
            optionsSource: 'states',
            placeholder: 'Select State'
          },
          {
            id: 'room_categories',
            label: 'Available Room Types',
            type: 'room_types',
            required: true,
            optionsSource: 'room_types'
          },
          {
            id: 'amenities_provided',
            label: 'Hotel Facilities',
            type: 'amenities',
            required: true,
            optionsSource: 'amenities'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'documents',
        title: 'Regulatory Permits',
        description: 'Upload hotel commercial registration and trade license documents',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'trade_license',
            name: 'Commercial Trade License',
            description: 'Issued by local municipality authority'
          },
          {
            id: 'fssai_license',
            name: 'FSSAI Food License',
            description: 'Food safety license for in-house kitchen and dining services'
          }
        ],
        optionalDocuments: [
          {
            id: 'gst_certificate',
            name: 'GST Registration Certificate',
            description: 'Government Issued GSTIN Certificate (if registered)'
          }
        ]
      },
      {
        id: 'hotel_gallery',
        title: 'Room Gallery',
        description: 'Upload clear photographs of your suites, reception, and exterior view',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Final Audit',
        description: 'Confirm hotel details before submitting for audit',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  resort: {
    businessType: 'resort',
    name: 'Resort',
    sections: [
      {
        id: 'resort_profile',
        title: 'Resort Profile',
        description: 'Enter your luxury resort details, location and unique features',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'resort_name',
            label: 'Resort Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Pine Breeze Sanctuary Resort'
          },
          {
            id: 'state',
            label: 'State Location',
            type: 'select',
            required: true,
            optionsSource: 'states',
            placeholder: 'Select State'
          },
          {
            id: 'room_categories',
            label: 'Luxury Cottages & Rooms offered',
            type: 'room_types',
            required: true,
            optionsSource: 'room_types'
          },
          {
            id: 'amenities',
            label: 'Resort Infrastructure & Amenities',
            type: 'amenities',
            required: true,
            optionsSource: 'amenities'
          }
        ]
      },
      {
        id: 'licenses',
        title: 'Certificates & Clearances',
        description: 'Upload environment clearances and fire NOC certs',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'fire_noc',
            name: 'Fire Department NOC',
            description: 'Technical fire clearance audit copy'
          },
          {
            id: 'pollution_noc',
            name: 'Pollution Control NOC',
            description: 'Environmental state clearance technical certificate'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'resort_vibe',
        title: 'Resort Experience Photos',
        description: 'Upload snapshots of pool side, dining, and scenic views',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review_desk',
        title: 'Review Desk',
        description: 'Double check details before sending to the HillyTrip partner desk',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  camping: {
    businessType: 'camping',
    name: 'Camping',
    workflowId: 'tour_operator_verification',
    sections: [
      {
        id: 'camp_setup',
        title: 'Camp Setup Details',
        description: 'Provide coordinates, altitude, and base camp parameters',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'camp_name',
            label: 'Campsite Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Starlight Valley Basecamp'
          },
          {
            id: 'state',
            label: 'State Location',
            type: 'select',
            required: true,
            optionsSource: 'states',
            placeholder: 'Select State'
          },
          {
            id: 'amenities',
            label: 'Camp Site Ground Amenities',
            type: 'amenities',
            required: false,
            optionsSource: 'amenities'
          }
        ]
      },
      {
        id: 'safety_approvals',
        title: 'Safety Approvals',
        description: 'Upload forest permission and disaster management clearance certificates',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'forest_permission',
            name: 'Forest Department Permit NOC',
            description: 'Technical authorization of campsite layout approval'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'camp_photos',
        title: 'Campgrounds & Views',
        description: 'Upload photos of tents, bonfire zone, and site vistas',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Safety Declaration & Submit',
        description: 'Review campsite specifications and finalize submission',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  taxi_operator: {
    businessType: 'taxi_operator',
    name: 'Taxi Operator',
    workflowId: 'taxi_verification',
    sections: [
      {
        id: 'agency_profile',
        title: 'Agency Profile',
        description: 'Provide registered address and taxi fleet details',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'agency_name',
            label: 'Registered Travel Agency Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Hills Safe Cab Service'
          },
          {
            id: 'vehicle_types_operated',
            label: 'Vehicle Categories in Fleet',
            type: 'vehicle_types',
            required: true,
            optionsSource: 'vehicle_types'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'legal_docs',
        title: 'Legal Documents',
        description: 'Upload Trade License, PAN, and optional GST certificates',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'commercial_permit',
            name: 'RTO Commercial Permit Copy',
            description: 'Commercial tourist operations base license'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'review',
        title: 'Review & Complete',
        description: 'Verify your fleet registration application',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  car_rental: {
    businessType: 'car_rental',
    name: 'Car Rental',
    workflowId: 'taxi_verification',
    sections: [
      {
        id: 'rental_info',
        title: 'Rental Agency Details',
        description: 'Configure self-drive parameters and fleet sizing',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'rental_name',
            label: 'Car Rental Hub Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. SelfDrive Himalayans'
          },
          {
            id: 'vehicle_types',
            label: 'Vehicle Categories Available',
            type: 'vehicle_types',
            required: true,
            optionsSource: 'vehicle_types'
          },
          {
            id: 'fuel_options',
            label: 'Fuel Types Supported',
            type: 'multiselect',
            required: true,
            optionsSource: 'fuel_types'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'vehicle_insurance',
        title: 'Vehicle Permitting',
        description: 'Upload commercial insurance and transport licenses',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'rent_a_cab_permit',
            name: 'Government Rent-A-Cab License',
            description: 'Approved commercial RTO permit for self-drive logistics'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'fleet_photos',
        title: 'Fleet Images',
        description: 'Upload interior and exterior photos of cars in your fleet',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Audit & Launch',
        description: 'Review rental details and complete self-drive activation',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  bike_rental: {
    businessType: 'bike_rental',
    name: 'Bike Rental',
    workflowId: 'taxi_verification',
    sections: [
      {
        id: 'bike_details',
        title: 'Two Wheeler Portfolio',
        description: 'State bike models, engine CCs, and hourly rent options',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'rental_name',
            label: 'Bike Rental Store Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Royal Enfield Himalayan Riders'
          },
          {
            id: 'business_days',
            label: 'Working Days',
            type: 'select',
            required: true,
            optionsSource: 'business_days'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'rto_approvals',
        title: 'RTO Certificates',
        description: 'Upload commercial bluebook scans and RTO trade license',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'rto_license',
            name: 'RTO Commercial Rental Permit',
            description: 'Mandatory license for two-wheeler rental agency'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'bike_gallery',
        title: 'Motorbike Portfolio',
        description: 'Upload photos of the motorcycles available for rental',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Acknowledge & Save',
        description: 'Finalize your bike rental partner hub onboarding',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  tour_operator: {
    businessType: 'tour_operator',
    name: 'Tour Operator',
    workflowId: 'tour_operator_verification',
    sections: [
      {
        id: 'operator_specialty',
        title: 'Operator Specialty',
        description: 'Provide information regarding your tour packages and specialized circuits',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'operator_name',
            label: 'Tour Agency / Operator Brand Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Scenic Heights Himalayan Expeditions'
          },
          {
            id: 'languages',
            label: 'Tour Coordinator Languages',
            type: 'languages',
            required: true,
            optionsSource: 'languages'
          },
          {
            id: 'activities',
            label: 'Tour Package Activity Specialities',
            type: 'multiselect',
            required: true,
            optionsSource: 'adventure_activities'
          }
        ]
      },
      {
        id: 'tourism_registrations',
        title: 'Tourism Board Certificates',
        description: 'Upload department of tourism registration and business PAN card',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'tourism_reg_certificate',
            name: 'State Tourism Board Registration',
            description: 'Official department certificate showing active tour provider license'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'review',
        title: 'Verify & Launch',
        description: 'Verify tour itinerary parameters and complete certification',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  travel_agency: {
    businessType: 'travel_agency',
    name: 'Travel Agency',
    workflowId: 'tour_operator_verification',
    sections: [
      {
        id: 'agency_metadata',
        title: 'Agency Information',
        description: 'Specify sub-agent networks, branch locations, and office addresses',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'agency_name',
            label: 'Registered Travel Agency Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Kanchenjunga Holidays'
          },
          {
            id: 'business_days',
            label: 'Agency Operational Days',
            type: 'select',
            required: true,
            optionsSource: 'business_days'
          }
        ]
      },
      {
        id: 'accreditations',
        title: 'Accreditation Credentials',
        description: 'Upload IATA or national travel agent association memberships',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'iata_certificate',
            name: 'IATA Accreditation or National Permit',
            description: 'Accredited certificate showing active ticketing authority'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'review',
        title: 'Onboarding Submission',
        description: 'Check agency profile before dispatching to verification staff',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  local_guide: {
    businessType: 'local_guide',
    name: 'Local Guide',
    workflowId: 'guide_verification',
    sections: [
      {
        id: 'guide_bio',
        title: 'Guide Bio & Languages',
        description: 'Describe languages spoken, mountain tracks explored, and experience years',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'full_name',
            label: 'Guide Full Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Pemba Tenzing Sherpa'
          },
          {
            id: 'languages',
            label: 'Languages Spoken Fluently',
            type: 'languages',
            required: true,
            optionsSource: 'languages'
          }
        ]
      },
      {
        id: 'guide_id',
        title: 'Government Guide ID',
        description: 'Upload your state authorized guide card or identity credentials',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'guide_license',
            name: 'Government Tourism Guide Badge',
            description: 'Approved guide permit showing certified registration number'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'guide_photo',
        title: 'Professional Headshot',
        description: 'Upload a clear profile photo of yourself for travelers to recognize you',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Register Profile',
        description: 'Review and request background verification badge',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  restaurant: {
    businessType: 'restaurant',
    name: 'Restaurant',
    workflowId: 'restaurant_verification',
    sections: [
      {
        id: 'dining_setup',
        title: 'Dining Setup',
        description: 'Enter dining concept, cuisine specialities, and seat limits',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'restaurant_name',
            label: 'Restaurant Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. The Sherpa Kitchen'
          },
          {
            id: 'cuisine_types',
            label: 'Cuisines Offered',
            type: 'multiselect',
            required: true,
            optionsSource: 'cuisine_types'
          },
          {
            id: 'meal_plans',
            label: 'Available Board Meal Options',
            type: 'multiselect',
            required: false,
            optionsSource: 'meal_plans'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'fssai_certs',
        title: 'FSSAI & Food Licenses',
        description: 'Upload valid FSSAI copy and municipal health certificates',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'fssai_license',
            name: 'FSSAI Food License Copy',
            description: 'Food Safety Standards Authority of India certificate scan'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'food_gallery',
        title: 'Menu & Ambience Photos',
        description: 'Upload photographs of the dining hall, kitchen, and signature dishes',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Dine Circle Submission',
        description: 'Submit restaurant details for instant platform listing',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  cafe: {
    businessType: 'cafe',
    name: 'Cafe',
    workflowId: 'restaurant_verification',
    sections: [
      {
        id: 'cafe_vibe',
        title: 'Cafe Information',
        description: 'Specify opening hours, organic coffees, and local bakery treats',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'cafe_name',
            label: 'Scenic Cafe Brand Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Altitude Coffee House'
          },
          {
            id: 'cuisine_types',
            label: 'Sweets & Brew Specialities',
            type: 'multiselect',
            required: true,
            optionsSource: 'cuisine_types'
          },
          {
            id: 'payment_methods',
            label: 'Accepted Payment Methods',
            type: 'payment_methods',
            required: true,
            optionsSource: 'payment_methods'
          }
        ]
      },
      {
        id: 'food_safety',
        title: 'Food Safety Licenses',
        description: 'Upload FSSAI registrations or application copy',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'fssai_license',
            name: 'FSSAI Registration Copy',
            description: 'Food safety registration copy for kitchen logs'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'cafe_gallery',
        title: 'Cafe Aesthetic Photos',
        description: 'Upload pictures of seating corners, coffee machines, and dessert display',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Vibe Registry Check',
        description: 'Confirm cafe setup and complete partner registration',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  trek_organizer: {
    businessType: 'trek_organizer',
    name: 'Trek Organizer',
    workflowId: 'tour_operator_verification',
    sections: [
      {
        id: 'trekking_portfolio',
        title: 'Trekking Portfolio',
        description: 'List trekking paths, summit routes, and mountain guides network',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'organizer_name',
            label: 'Trek Company Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Snowpeaks Trekking Co.'
          },
          {
            id: 'activities',
            label: 'Mountain Expeditions Managed',
            type: 'multiselect',
            required: true,
            optionsSource: 'adventure_activities'
          },
          {
            id: 'languages',
            label: 'Trek Guides Languages Spoken',
            type: 'languages',
            required: true,
            optionsSource: 'languages'
          }
        ]
      },
      {
        id: 'trek_approvals',
        title: 'Climbing & Rescue Licenses',
        description: 'Upload IMF registration and search/rescue emergency affiliation certificates',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'mountaineering_cert',
            name: 'IMF Authorized Climbing NOC',
            description: 'Indian Mountaineering Foundation authorized operator license'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'review',
        title: 'Submit Safety Brief',
        description: 'Sign high-altitude safety agreements and complete verification',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  },
  adventure_provider: {
    businessType: 'adventure_provider',
    name: 'Adventure Activity Provider',
    workflowId: 'tour_operator_verification',
    sections: [
      {
        id: 'adventure_catalogue',
        title: 'Adventure Catalogue',
        description: 'Provide details on extreme sports (rafting, paragliding, bungee) and safety nets',
        icon: 'building',
        type: 'fields',
        fields: [
          {
            id: 'provider_name',
            label: 'Adventure Operations Hub Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Teesta Rapids River Rafting'
          },
          {
            id: 'activities',
            label: 'Thrill Sports Offered',
            type: 'multiselect',
            required: true,
            optionsSource: 'adventure_activities'
          },
          {
            id: 'languages',
            label: 'Instructors Languages Spoken',
            type: 'languages',
            required: true,
            optionsSource: 'languages'
          }
        ]
      },
      {
        id: 'liability_docs',
        title: 'Liability Scans',
        description: 'Upload mandatory third-party liability insurance and technical fitness certificates',
        icon: 'file-text',
        type: 'documents',
        requiredDocuments: [
          {
            id: 'liability_insurance',
            name: 'Third-Party Liability Insurance policy',
            description: 'Approved commercial insurance document scan for tourist safety'
          }
        ],
        optionalDocuments: []
      },
      {
        id: 'activity_photos',
        title: 'Activity Action Photos',
        description: 'Upload photographs of safety gear, launch sites, and action shots',
        icon: 'camera',
        type: 'photos'
      },
      {
        id: 'review',
        title: 'Review Risk Policy',
        description: 'Verify activity profiles and sign mountain liability waiver agreements',
        icon: 'check-circle',
        type: 'review'
      }
    ]
  }
};
