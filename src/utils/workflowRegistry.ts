import { Workflow, WorkflowStage, WorkflowAction } from '../types/workflow';

/**
 * Centrally manages different approval workflows for various business types on HillyTrip.
 * High quality, production ready, completely configuration driven.
 */
export const WORKFLOWS: Record<string, Workflow> = {
  taxi_verification: {
    id: 'taxi_verification',
    name: 'Taxi Fleet RTO & Permit Verification',
    description: 'Verifies transport safety, commercial license validity, RTO registration, and tourist permit badges.',
    initialStageId: 'draft',
    stages: {
      draft: {
        id: 'draft',
        title: 'Draft',
        description: 'Onboarding is incomplete or in draft mode. Ensure commercial permits and insurance documents are ready.',
        statusColor: 'bg-slate-100 text-slate-800 border-slate-200',
        nextStages: ['submitted'],
        allowedActions: [
          { id: 'submit', label: 'Submit for RTO Audit', targetStageId: 'submitted', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      submitted: {
        id: 'submitted',
        title: 'Submitted',
        description: 'Taxi details are submitted and waiting for initial administrative vetting of RTO documents.',
        statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
        nextStages: ['pending_review', 'documents_rejected'],
        allowedActions: [
          { id: 'start_review', label: 'Assign RTO Reviewer', targetStageId: 'pending_review', requiredRole: ['reviewer', 'admin'], color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { id: 'reject_docs', label: 'Reject Vehicle Permits', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-red-600 hover:bg-red-700 text-white' }
        ]
      },
      pending_review: {
        id: 'pending_review',
        title: 'Pending RTO Vetting',
        description: 'Vetting team is verifying RTO commercial transport registry and driver background reports.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['approved', 'need_more_info', 'documents_rejected'],
        allowedActions: [
          { id: 'approve', label: 'Approve Taxi Fleet', targetStageId: 'approved', requiredRole: ['reviewer', 'admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'request_info', label: 'Query Driver Detail', targetStageId: 'need_more_info', requiredRole: ['reviewer', 'admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'reject_docs', label: 'Invalid RTO Documents', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-red-600 hover:bg-red-700 text-white' }
        ]
      },
      need_more_info: {
        id: 'need_more_info',
        title: 'Clarification Needed',
        description: 'Vetting desk requested missing driver details, updated badge scans, or vehicle fitness certificates.',
        statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
        nextStages: ['pending_review'],
        allowedActions: [
          { id: 'resubmit', label: 'Resubmit Additional Info', targetStageId: 'pending_review', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      documents_rejected: {
        id: 'documents_rejected',
        title: 'Documents Failed Vetting',
        description: 'The uploaded vehicle RTO permit or vehicle registration card has expired or is illegible.',
        statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
        nextStages: ['draft'],
        allowedActions: [
          { id: 'reupload', label: 'Upload New Permits', targetStageId: 'draft', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      approved: {
        id: 'approved',
        title: 'Approved',
        description: 'Vehicle and credentials verified successfully. Safe for public booking.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['published'],
        allowedActions: [
          { id: 'publish', label: 'Go Live on Marketplace', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-green-600 hover:bg-green-700 text-white' }
        ]
      },
      published: {
        id: 'published',
        title: 'Published',
        description: 'Taxi fleet is active. Travelers can view and request rides instantly.',
        statusColor: 'bg-teal-100 text-teal-800 border-teal-200',
        nextStages: ['suspended', 'archived'],
        allowedActions: [
          { id: 'suspend', label: 'Deactivate / Suspend', targetStageId: 'suspended', requiredRole: ['admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' },
          { id: 'archive', label: 'Permanently Archive', targetStageId: 'archived', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      suspended: {
        id: 'suspended',
        title: 'Suspended',
        description: 'Temporarily inactive due to pending vehicle inspections or complaint checks.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['published', 'draft'],
        allowedActions: [
          { id: 'reinstate', label: 'Re-approve & Reactivate', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'revert', label: 'Send back to Draft', targetStageId: 'draft', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      archived: {
        id: 'archived',
        title: 'Archived',
        description: 'Fleet record is closed permanently. No longer accessible for transit bookings.',
        statusColor: 'bg-slate-200 text-slate-800 border-slate-300',
        nextStages: [],
        allowedActions: [],
        isFinalStage: true
      }
    }
  },

  homestay_verification: {
    id: 'homestay_verification',
    name: 'Homestay Vibe & Trust Verification',
    description: 'Onboards regional homestays. Validates state tourism registry, local host ID proofs, and photo aesthetic guidelines.',
    initialStageId: 'draft',
    stages: {
      draft: {
        id: 'draft',
        title: 'Draft State',
        description: 'Configure your homestay rooms, facilities, local guides, and photo album.',
        statusColor: 'bg-slate-100 text-slate-800 border-slate-200',
        nextStages: ['submitted'],
        allowedActions: [
          { id: 'submit', label: 'Submit to Review Desk', targetStageId: 'submitted', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      submitted: {
        id: 'submitted',
        title: 'Submitted',
        description: 'Homestay application is in queue for visual and regulatory screening.',
        statusColor: 'bg-sky-100 text-sky-800 border-sky-200',
        nextStages: ['pending_review', 'documents_rejected'],
        allowedActions: [
          { id: 'review', label: 'Vibe & Aesthetic Check', targetStageId: 'pending_review', requiredRole: ['reviewer', 'admin'], color: 'bg-sky-600 hover:bg-sky-700 text-white' },
          { id: 'reject', label: 'Reject Document Scan', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      pending_review: {
        id: 'pending_review',
        title: 'Aesthetic Audit',
        description: 'Reviewing property photographs, amenity checklist, and local tourism certificates.',
        statusColor: 'bg-violet-100 text-violet-800 border-violet-200',
        nextStages: ['approved', 'need_more_info', 'documents_rejected'],
        allowedActions: [
          { id: 'approve', label: 'Approve Homestay Vibe', targetStageId: 'approved', requiredRole: ['reviewer', 'admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'request_clarification', label: 'Ask for Higher-Res Photos', targetStageId: 'need_more_info', requiredRole: ['reviewer', 'admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'reject_docs', label: 'Unacceptable Identity Scan', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      need_more_info: {
        id: 'need_more_info',
        title: 'Host Response Awaiting',
        description: 'Clarification regarding room photos or guest capacity policies has been sent to the host.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['pending_review'],
        allowedActions: [
          { id: 'resubmit', label: 'Submit Homestay Updates', targetStageId: 'pending_review', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      documents_rejected: {
        id: 'documents_rejected',
        title: 'Docs Rejected',
        description: 'The uploaded Aadhaar scan or GST document is invalid or blurry.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['draft'],
        allowedActions: [
          { id: 'reupload', label: 'Re-upload Trust Docs', targetStageId: 'draft', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      approved: {
        id: 'approved',
        title: 'Vetted & Trusted',
        description: 'Homestay layout and hosts verified. Quality bar satisfied.',
        statusColor: 'bg-green-100 text-green-800 border-green-200',
        nextStages: ['published'],
        allowedActions: [
          { id: 'publish', label: 'Publish to Travelers', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
        ]
      },
      published: {
        id: 'published',
        title: 'Published Live',
        description: 'Listing is live on the HillyTrip discovery search engine.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['suspended', 'archived'],
        allowedActions: [
          { id: 'suspend', label: 'Deactivate Listing', targetStageId: 'suspended', requiredRole: ['admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'archive', label: 'Archive Listing', targetStageId: 'archived', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      suspended: {
        id: 'suspended',
        title: 'Listing Suspended',
        description: 'Host account under temporary lockdown due to negative reviews or unresolved booking disputes.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['published', 'draft'],
        allowedActions: [
          { id: 'unsuspend', label: 'Unsuspend', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'revert', label: 'Revert to Draft', targetStageId: 'draft', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      archived: {
        id: 'archived',
        title: 'Archived Permanently',
        description: 'Homestay is permanently delisted from our system registry.',
        statusColor: 'bg-slate-200 text-slate-800 border-slate-300',
        nextStages: [],
        allowedActions: [],
        isFinalStage: true
      }
    }
  },

  tour_operator_verification: {
    id: 'tour_operator_verification',
    name: 'Tour Operator Safety & Adventure Audit',
    description: 'Ensures Himalayan tour operators possess certified safety equipment, valid state tourism registry, and liability waivers.',
    initialStageId: 'draft',
    stages: {
      draft: {
        id: 'draft',
        title: 'Draft Mode',
        description: 'Populate travel circuits, mountain safety kits details, and Tourism Board registration.',
        statusColor: 'bg-slate-100 text-slate-800 border-slate-200',
        nextStages: ['submitted'],
        allowedActions: [
          { id: 'submit', label: 'Submit for Safety Clearance', targetStageId: 'submitted', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      submitted: {
        id: 'submitted',
        title: 'Safety Board Submitted',
        description: 'Documents are in queue for mountaineering safety clearance review.',
        statusColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        nextStages: ['pending_review', 'documents_rejected'],
        allowedActions: [
          { id: 'review', label: 'Begin Safety Audit', targetStageId: 'pending_review', requiredRole: ['reviewer', 'admin'], color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          { id: 'reject', label: 'Reject Permits', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      pending_review: {
        id: 'pending_review',
        title: 'Under Safety Audit',
        description: 'Mountaineering board vettings, search/rescue compliance, and emergency protocols are under scrutiny.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['approved', 'need_more_info', 'documents_rejected'],
        allowedActions: [
          { id: 'approve', label: 'Approve Operators Safety Badge', targetStageId: 'approved', requiredRole: ['reviewer', 'admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'request_clarification', label: 'Query Rescue Affiliation', targetStageId: 'need_more_info', requiredRole: ['reviewer', 'admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'reject_docs', label: 'Reject Invalid Permits', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      need_more_info: {
        id: 'need_more_info',
        title: 'Pending Operator Evidence',
        description: 'Provide proof of wilderness first-aid certifications or rescue logistics partnerships.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['pending_review'],
        allowedActions: [
          { id: 'resubmit', label: 'Resubmit Safety Logs', targetStageId: 'pending_review', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      documents_rejected: {
        id: 'documents_rejected',
        title: 'Safety Permits Rejected',
        description: 'Expired State Tourism Board registration or inadequate liability insurance policies.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['draft'],
        allowedActions: [
          { id: 'reupload', label: 'Revise Safety Permits', targetStageId: 'draft', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      approved: {
        id: 'approved',
        title: 'Safety Certified',
        description: 'Operator safety parameters certified. Adventure compliance badge earned.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['published'],
        allowedActions: [
          { id: 'publish', label: 'Go Live on Explore', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-green-600 hover:bg-green-700 text-white' }
        ]
      },
      published: {
        id: 'published',
        title: 'Live Booking Active',
        description: 'Tour operators can post expeditions. Travelers can safely request bookings.',
        statusColor: 'bg-teal-100 text-teal-800 border-teal-200',
        nextStages: ['suspended', 'archived'],
        allowedActions: [
          { id: 'suspend', label: 'Suspend Safety Badge', targetStageId: 'suspended', requiredRole: ['admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' },
          { id: 'archive', label: 'Decommission Tour Agency', targetStageId: 'archived', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      suspended: {
        id: 'suspended',
        title: 'Safety Alert Suspension',
        description: 'Expedition license suspended due to safety concerns or expired certifications.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['published', 'draft'],
        allowedActions: [
          { id: 'reinstate', label: 'Reinstate Safety Badge', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'revert', label: 'Send back to Draft', targetStageId: 'draft', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      archived: {
        id: 'archived',
        title: 'Permanently Decommissioned',
        description: 'Historical safety and audit logs preserved. Listing deactivated.',
        statusColor: 'bg-slate-200 text-slate-800 border-slate-300',
        nextStages: [],
        allowedActions: [],
        isFinalStage: true
      }
    }
  },

  restaurant_verification: {
    id: 'restaurant_verification',
    name: 'Food Health & FSSAI Verification',
    description: 'Enforces sanitary safety and validates FSSAI kitchen registration.',
    initialStageId: 'draft',
    stages: {
      draft: {
        id: 'draft',
        title: 'Draft',
        description: 'Provide your FSSAI certificate scan, cuisine types, and photos of your dining layout.',
        statusColor: 'bg-slate-100 text-slate-800 border-slate-200',
        nextStages: ['submitted'],
        allowedActions: [
          { id: 'submit', label: 'Submit to Health Inspector', targetStageId: 'submitted', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      submitted: {
        id: 'submitted',
        title: 'Queued for Health Screening',
        description: 'Awaiting digital inspection of food safety licenses and sanitary protocols.',
        statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
        nextStages: ['pending_review', 'documents_rejected'],
        allowedActions: [
          { id: 'start_inspection', label: 'Assign Health Inspector', targetStageId: 'pending_review', requiredRole: ['reviewer', 'admin'], color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { id: 'fail_screening', label: 'Unsatisfactory Hygiene Docs', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      pending_review: {
        id: 'pending_review',
        title: 'Health Desk Inspection',
        description: 'The hygiene operations desk is actively vetting the food service guidelines compliance.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['approved', 'need_more_info', 'documents_rejected'],
        allowedActions: [
          { id: 'approve', label: 'Certify Dining Hygiene', targetStageId: 'approved', requiredRole: ['reviewer', 'admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'request_fssai_details', label: 'Query FSSAI Validity', targetStageId: 'need_more_info', requiredRole: ['reviewer', 'admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'reject_docs', label: 'FSSAI License Rejected', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      need_more_info: {
        id: 'need_more_info',
        title: 'Kitchen Query Active',
        description: 'Submit verified copy of the municipal fire-clearance certificate or updated FSSAI registry.',
        statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
        nextStages: ['pending_review'],
        allowedActions: [
          { id: 'resubmit', label: 'Resubmit Kitchen Specs', targetStageId: 'pending_review', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      documents_rejected: {
        id: 'documents_rejected',
        title: 'FSSAI Vetting Failed',
        description: 'FSSAI safety license is expired, invalid, or belongs to a different enterprise.',
        statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
        nextStages: ['draft'],
        allowedActions: [
          { id: 'reupload', label: 'Provide Valid FSSAI Scan', targetStageId: 'draft', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      approved: {
        id: 'approved',
        title: 'Hygiene Certified',
        description: 'The kitchen and safety standards conform to HillyTrip dining parameters.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['published'],
        allowedActions: [
          { id: 'publish', label: 'Launch Menu on Platform', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-green-600 hover:bg-green-700 text-white' }
        ]
      },
      published: {
        id: 'published',
        title: 'Dine Circle Active',
        description: 'Kitchen is online. Guests can look up menus and reserve dining packages.',
        statusColor: 'bg-teal-100 text-teal-800 border-teal-200',
        nextStages: ['suspended', 'archived'],
        allowedActions: [
          { id: 'suspend', label: 'Suspend Dining Listing', targetStageId: 'suspended', requiredRole: ['admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' },
          { id: 'archive', label: 'Archive Dining Listing', targetStageId: 'archived', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      suspended: {
        id: 'suspended',
        title: 'Dine Suspended',
        description: 'Dine services temporarily blocked due to kitchen audit failures or user complaints.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['published', 'draft'],
        allowedActions: [
          { id: 'reinstate', label: 'Reactivate Kitchen', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'revert', label: 'Send back to Draft', targetStageId: 'draft', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      archived: {
        id: 'archived',
        title: 'Archived',
        description: 'Dining record has been archived.',
        statusColor: 'bg-slate-200 text-slate-800 border-slate-300',
        nextStages: [],
        allowedActions: [],
        isFinalStage: true
      }
    }
  },

  guide_verification: {
    id: 'guide_verification',
    name: 'Tourism Guide Certification',
    description: 'Validates local mountain guides, government tourist badge identification, and mountain navigation experience.',
    initialStageId: 'draft',
    stages: {
      draft: {
        id: 'draft',
        title: 'Draft Profile',
        description: 'Upload your Tourism Guide Badge, languages spoken, and trekking expertise bio.',
        statusColor: 'bg-slate-100 text-slate-800 border-slate-200',
        nextStages: ['submitted'],
        allowedActions: [
          { id: 'submit', label: 'Submit Guide Badge', targetStageId: 'submitted', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      submitted: {
        id: 'submitted',
        title: 'Badge Queued',
        description: 'Awaiting local tourism representative credential check.',
        statusColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        nextStages: ['pending_review', 'documents_rejected'],
        allowedActions: [
          { id: 'start_vetting', label: 'Validate Badge Number', targetStageId: 'pending_review', requiredRole: ['reviewer', 'admin'], color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { id: 'reject_badge', label: 'Reject Guide Badge Scan', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      pending_review: {
        id: 'pending_review',
        title: 'State Guide Audit',
        description: 'Vetting tourism council registry data matching the uploaded badge identity.',
        statusColor: 'bg-violet-100 text-violet-800 border-violet-200',
        nextStages: ['approved', 'need_more_info', 'documents_rejected'],
        allowedActions: [
          { id: 'approve', label: 'Approve Guide Profile', targetStageId: 'approved', requiredRole: ['reviewer', 'admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'query_bio', label: 'Clarify Track Experience', targetStageId: 'need_more_info', requiredRole: ['reviewer', 'admin'], color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { id: 'reject_docs', label: 'Expired Guide Card', targetStageId: 'documents_rejected', requiredRole: ['reviewer', 'admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' }
        ]
      },
      need_more_info: {
        id: 'need_more_info',
        title: 'Pending Guide Response',
        description: 'Provide details about mountaineering certifications, or high altitude first aid qualifications.',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        nextStages: ['pending_review'],
        allowedActions: [
          { id: 'resubmit', label: 'Resubmit Bio Specs', targetStageId: 'pending_review', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      documents_rejected: {
        id: 'documents_rejected',
        title: 'Guide Card Rejected',
        description: 'The uploaded guide license badge is expired or has failed official tourism registry lookup.',
        statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
        nextStages: ['draft'],
        allowedActions: [
          { id: 'reupload', label: 'Upload Valid Guide Badge', targetStageId: 'draft', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
        ]
      },
      approved: {
        id: 'approved',
        title: 'Guide Verified',
        description: 'Credentials verified successfully. Safety trust badge awarded.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['published'],
        allowedActions: [
          { id: 'publish', label: 'Publish Guide Portfolio', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
        ]
      },
      published: {
        id: 'published',
        title: 'Guide Live',
        description: 'Guide details visible on the HillyTrip partner discovery registry.',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nextStages: ['suspended', 'archived'],
        allowedActions: [
          { id: 'suspend', label: 'Suspend Guide Badge', targetStageId: 'suspended', requiredRole: ['admin'], color: 'bg-rose-600 hover:bg-rose-700 text-white' },
          { id: 'archive', label: 'Archive Guide Portfolio', targetStageId: 'archived', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      suspended: {
        id: 'suspended',
        title: 'Badge Suspended',
        description: 'Guide active status suspended due to customer conduct complaints or verification checks.',
        statusColor: 'bg-red-100 text-red-800 border-red-200',
        nextStages: ['published', 'draft'],
        allowedActions: [
          { id: 'reinstate', label: 'Reinstate Guide Badge', targetStageId: 'published', requiredRole: ['admin'], color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { id: 'revert', label: 'Send back to Draft', targetStageId: 'draft', requiredRole: ['admin'], color: 'bg-slate-600 hover:bg-slate-700 text-white' }
        ]
      },
      archived: {
        id: 'archived',
        title: 'Archived',
        description: 'Guide profile has been archived permanently.',
        statusColor: 'bg-slate-200 text-slate-800 border-slate-300',
        nextStages: [],
        allowedActions: [],
        isFinalStage: true
      }
    }
  }
};

/**
 * Retrieves a workflow configuration dynamically by its ID.
 */
export const getWorkflow = (workflowId?: string): Workflow => {
  if (workflowId && WORKFLOWS[workflowId]) {
    return WORKFLOWS[workflowId];
  }
  // Default fallback if workflowId is missing or unrecognized
  return WORKFLOWS.homestay_verification;
};
