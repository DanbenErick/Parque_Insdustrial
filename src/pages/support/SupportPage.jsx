import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    id: 1,
    question: "¿Cómo puedo anular una factura generada por error?",
    answer: "Las facturas solo pueden ser anuladas si aún no han sido enviadas a SUNAT. Dirígete a la vista de 'Ver Recibo', selecciona la factura y haz clic en 'Anular'. Si ya fue enviada, deberás emitir una Nota de Crédito."
  },
  {
    id: 2,
    question: "¿Cómo se calculan las tarifas de mantenimiento?",
    answer: "La tarifa de mantenimiento se calcula automáticamente basándose en los parámetros registrados para cada manzana industrial en el panel de Socios y Conexiones."
  },
  {
    id: 3,
    question: "¿Es posible cambiar la fecha de vencimiento de un recibo?",
    answer: "Sí, durante el proceso de 'Generar Facturas', antes de confirmar, puedes ajustar manualmente la fecha de vencimiento general o editando el registro individual del socio."
  },
  {
    id: 4,
    question: "La plataforma no actualiza mis lecturas de energía",
    answer: "Asegúrate de tener conexión a internet. Si el problema persiste, es probable que la base de datos central esté en mantenimiento. En ese caso, puedes usar la opción de 'Registro Manual' temporalmente."
  }
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleFaq = useCallback((id) => {
    setOpenFaq(prev => prev === id ? null : id);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  }, []);

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Centro de Soporte</h2>
              <p className="font-body-md text-on-surface-variant">¿Tienes algún problema? Estamos aquí para ayudarte.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            
            {/* Contact Form */}
            <div className="md:col-span-7 bg-surface border border-outline-variant rounded-xl shadow-sm p-xl">
              <h3 className="font-headline-sm font-bold text-on-surface mb-md">Enviar Ticket de Soporte</h3>
              <p className="text-sm text-on-surface-variant mb-lg">Nuestro equipo técnico responderá tu solicitud en un máximo de 24 horas laborables.</p>
              
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-lg bg-[#059669]/10 border border-[#059669]/20 rounded-lg text-center"
                  >
                    <span className="material-symbols-outlined text-[#059669] text-[48px] mb-2">check_circle</span>
                    <h4 className="font-bold text-[#059669]">¡Mensaje Enviado!</h4>
                    <p className="text-sm text-[#059669]/80 mt-1">Tu ticket ha sido registrado exitosamente. Te contactaremos pronto.</p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-md"
                  >
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-1">
                        <label htmlFor="asunto" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Asunto</label>
                        <input id="asunto" required type="text" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Ej. Error al facturar" />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="prioridad" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Prioridad</label>
                        <select id="prioridad" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer">
                          <option>Baja (Consultas generales)</option>
                          <option>Media (Problema no crítico)</option>
                          <option>Alta (Fallo crítico del sistema)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="descripcion" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Descripción del Problema</label>
                      <textarea id="descripcion" required rows="5" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors" placeholder="Describe detalladamente el inconveniente que estás presentando..."></textarea>
                    </div>
                    <div className="flex justify-end pt-md">
                      <button type="submit" disabled={isSubmitting} className="px-xl py-3 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                          <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">send</span>
                        )}
                        {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Info & FAQs */}
            <div className="md:col-span-5 space-y-lg">
              
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-md text-center">
                  <span className="material-symbols-outlined text-primary text-[32px] mb-2">call</span>
                  <p className="font-bold text-on-surface text-sm">Línea Directa</p>
                  <p className="text-xs text-on-surface-variant mt-1">+51 987 654 321</p>
                </div>
                <div className="bg-tertiary/5 border border-tertiary/20 rounded-lg p-md text-center">
                  <span className="material-symbols-outlined text-tertiary text-[32px] mb-2">mail</span>
                  <p className="font-bold text-on-surface text-sm">Email Soporte</p>
                  <p className="text-xs text-on-surface-variant mt-1">ayuda@jicamarca.com</p>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-lg">
                <h3 className="font-headline-sm font-bold text-on-surface mb-md">Preguntas Frecuentes</h3>
                <div className="divide-y divide-outline-variant">
                  {FAQS.map((faq) => (
                    <div key={faq.id} className="py-sm">
                      <button 
                        onClick={() => toggleFaq(faq.id)} 
                        className="w-full flex justify-between items-center text-left hover:text-primary transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                      >
                        <span className="font-bold text-sm text-on-surface pr-4">{faq.question}</span>
                        <motion.span 
                          animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="material-symbols-outlined text-on-surface-variant"
                        >
                          expand_more
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {openFaq === faq.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-on-surface-variant pt-2 pb-2 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Support;
