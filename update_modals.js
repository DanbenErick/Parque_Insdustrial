const fs = require('fs');
const glob = require('glob');

const files = [
  'src/components/UserManagement.jsx',
  'src/components/CargosSettingsTab.jsx',
  'src/components/PeriodFormModal.jsx',
  'src/components/TenantsAndSectors.jsx',
  'src/components/Payments.jsx',
  'src/components/Billing.jsx',
  'src/components/GenerateInvoices.jsx',
  'src/components/GenerateInvoicesModal.jsx',
  'src/components/RegisterPaymentModal.jsx',
  'src/components/InquilinoDetailsModal.jsx',
  'src/components/NotificationModal.jsx',
  'src/components/LecturasSettingsTab.jsx',
  'src/components/ManualBilling.jsx',
  'src/components/MemberReport.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add framer-motion import if not exists
  if (!content.includes('framer-motion')) {
    content = content.replace(/(import React.*?;\n)/, "$1import { motion, AnimatePresence } from 'framer-motion';\n");
    changed = true;
  }

  fs.writeFileSync(file, content);
});
