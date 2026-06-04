const fs = require('fs');
const path = require('path');

const files = [
  'src/components/Payments.jsx',
  'src/components/Billing.jsx',
  'src/components/Support.jsx',
  'src/components/Dashboard.jsx',
  'src/components/Login.jsx',
  'src/components/MemberReport.jsx',
  'src/components/Reports.jsx',
  'src/components/Settings.jsx',
  'src/components/ManualBilling.jsx',
  'src/components/GenerateInvoicesModal.jsx',
  'src/components/UserManagement.jsx',
  'src/components/TenantsAndSectors.jsx',
  'src/App.jsx',
  '../luz-backend/src/controllers/reciboController.js',
  '../luz-backend/src/controllers/pagoController.js'
];

files.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Solo reemplazaremos textos visibles o variables que no rompan lógica dura
    content = content.replace(/Miembro/g, 'Socio');
    content = content.replace(/miembro/g, 'socio');
    content = content.replace(/MIEMBRO/g, 'SOCIO');
    content = content.replace(/Miembros/g, 'Socios');
    content = content.replace(/miembros/g, 'socios');
    content = content.replace(/MIEMBROS/g, 'SOCIOS');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reemplazado en', file);
  } else {
    console.log('Archivo no encontrado:', file);
  }
});
