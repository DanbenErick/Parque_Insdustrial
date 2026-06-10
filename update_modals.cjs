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

  // 1. Add framer-motion import
  if (!content.includes('framer-motion')) {
    content = content.replace(/(import React.*?;\n)/, "$1import { motion, AnimatePresence } from 'framer-motion';\n");
    changed = true;
  }

  // 2. Replace {condition && ( <div className="fixed inset-0... )
  // We need a regex that finds: {someVar && ( <div className="fixed inset-0 ... animate-in ... fade-in ...">
  // and replaces it with <AnimatePresence>{someVar && ( <motion.div ... initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
  
  // This might be too complex for simple regex.
});
