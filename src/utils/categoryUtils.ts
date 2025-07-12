// src/utils/categoryUtils.ts - Centralized category color management

export interface CategoryColorScheme {
  backgroundColor: string;
  textColor: string;
}

// Centralized category hierarchy with colors - matches sidebar configuration
export const categoryHierarchy: { [key: string]: CategoryColorScheme & { items: string[] } } = {
  "Key Documents & Meetings": {
    backgroundColor: "#D1FAE4",
    textColor: "#065F46",
    items: ["Annual Report", "Investor/Analyst Meet", "Investor Presentation", "Concall Transcript"]
  },
  "Corporate Governance & Admin": {
    backgroundColor: "#FFE4E5",
    textColor: "#991B1B",
    items: ["Change in KMP", "Name Change", "Demise of KMP", "Change in Address", "Change in MOA"]
  },
  "Corporate Actions": {
    backgroundColor: "#FEF2C7",
    textColor: "#92400E",
    items: ["Mergers/Acquisitions", "Bonus/Stock Split", "Divestitures", "Buyback", "Consolidation of Shares", "Demerger", "Joint Ventures", "Incorporation/Cessation of Subsidiary", "Open Offer"]
  },
  "Capital & Financing": {
    backgroundColor: "#DBEAFE",
    textColor: "#1E40AF",
    items: ["Fundraise - Rights Issue", "Fundraise - Preferential Issue", "Increase in Share Capital", "Fundraise - QIP", "DRHP", "Reduction in Share Capital", "Debt & Financing", "Debt Reduction", "Interest Rates Updates", "One Time Settlement (OTS)"]
  },
  "Strategic & Business Operations": {
    backgroundColor: "#FCE7F3",
    textColor: "#BE185D",
    items: ["Agreements/MoUs", "Expansion", "Operational Update", "New Order", "New Product", "Closure of Factory", "Disruption of Operations", "PLI Scheme"]
  },
  "Financial Reporting & Ratings": {
    backgroundColor: "#EDE9FE",
    textColor: "#5B21B6",
    items: ["Financial Results", "Credit Rating"]
  },
  "Regulatory & Legal": {
    backgroundColor: "#FFF7ED",
    textColor: "#C2410C",
    items: ["Regulatory Approvals/Orders", "USFDA", "Global Pharma Regulation", "Litigation & Notices", "Insolvency and Bankruptcy", "Anti-dumping Duty", "Delisting", "Trading Suspension", "Clarifications/Confirmations"]
  },
  "Administrative Matters": {
    backgroundColor: "#E2E8F0",
    textColor: "#475569",
    items: ["Procedural/Administrative", "Board Meeting", "AGM/EGM", "Dividend", "Corporate Action", "Management Changes", "Strategic Update", "Other"]
  }
};

// Function to get category colors by category name
export const getCategoryColors = (categoryName: string): CategoryColorScheme => {
  // Find which parent category this subcategory belongs to
  for (const [parentName, parentData] of Object.entries(categoryHierarchy)) {
    if (parentData.items.includes(categoryName)) {
      return {
        backgroundColor: parentData.backgroundColor,
        textColor: parentData.textColor
      };
    }
  }

  // Default colors for unknown categories (matches "Administrative Matters")
  return {
    backgroundColor: "#E2E8F0",
    textColor: "#475569"
  };
};

// Function to get all categories as a flat array
export const getAllCategories = (): string[] => {
  return Object.values(categoryHierarchy).flatMap(group => group.items);
};