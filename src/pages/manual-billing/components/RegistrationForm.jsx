import { useEffect, useState } from 'react';
import { parseSafe } from '../utils';
import { SkipReadingModal } from './SkipReadingModal';
import {
  DemandInput,
  ExistingReadingCard,
  MemberReadingHeader,
  MeterReplacementFields,
  ReadingActions,
  ReadingCalculationSummary,
  ReadingFields
} from './registration/RegistrationFormSections';

const getValidationErrors = ({ isTR, changedMeter, member, readings }) => {
  const errors = [];
  const { current, currentPeak, oldFinal, newInitial, oldFinalPeak, newInitialPeak } = readings;
  if (!current) errors.push(isTR ? 'Falta L. Actual (F.P.)' : 'Falta L. Actual');
  if (changedMeter) {
    if (!oldFinal) errors.push('Falta L. Final (Dañado)');
    if (!newInitial) errors.push('Falta L. Inicial (Nuevo)');
  }
  if (isTR) {
    if (!currentPeak) errors.push('Falta L. Actual (P)');
    if (changedMeter) {
      if (!oldFinalPeak) errors.push('Falta L. Final Punta (Dañado)');
      if (!newInitialPeak) errors.push('Falta L. Inicial Punta (Nuevo)');
    }
  }

  const addNegativeDifference = (value, base, message) => {
    if (value && parseSafe(value) < parseSafe(base)) errors.push(`${message} (Diferencia: ${(parseSafe(value) - parseSafe(base)).toFixed(2)} kWh)`);
  };
  if (changedMeter) {
    addNegativeDifference(oldFinal, member?.ultima_lectura, 'La L. Final (Dañado) es menor a la del mes anterior');
    addNegativeDifference(current, newInitial, 'La lectura es menor a la Inicial del Nuevo');
    if (isTR) {
      addNegativeDifference(oldFinalPeak, member?.ultima_lectura_punta, 'La L. Final Punta (Dañado) es menor a la del mes anterior');
      addNegativeDifference(currentPeak, newInitialPeak, 'La lectura Punta es menor a la Inicial del Nuevo');
    }
  } else {
    addNegativeDifference(current, member?.ultima_lectura, 'La lectura es menor al del mes anterior');
    if (isTR) addNegativeDifference(currentPeak, member?.ultima_lectura_punta, 'La lectura Punta es menor al del mes anterior');
  }
  return errors;
};

const consumption = (current, previous) => Math.max(0, parseSafe(current) - parseSafe(previous));
const hasNumericValue = (value) => value !== '' && value !== null && value !== undefined && !Number.isNaN(Number(value));

export const RegistrationForm = ({
  selectedMember, lecturaExistente, activePeriodo,
  currentReading, setCurrentReading,
  currentReadingPunta, setCurrentReadingPunta,
  factorPotencia, setFactorPotencia,
  maxDemandaFueraPunta, setMaxDemandaFueraPunta,
  maxDemandaPunta, setMaxDemandaPunta,
  isCambioMedidor, setIsCambioMedidor,
  lecturaFinalAntiguo, setLecturaFinalAntiguo,
  lecturaInicialNuevo, setLecturaInicialNuevo,
  lecturaFinalAntiguoPunta, setLecturaFinalAntiguoPunta,
  lecturaInicialNuevoPunta, setLecturaInicialNuevoPunta,
  isSaving, handleSave, onClose,
  isSkipping, handleSkip
}) => {
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [anomalyConfirmed, setAnomalyConfirmed] = useState(false);
  const isTR = selectedMember?.tipo === 'Hora Punta' || selectedMember?.tipo === 'Tiempo Real';
  const validationErrors = getValidationErrors({
    isTR,
    changedMeter: isCambioMedidor,
    member: selectedMember,
    readings: { current: currentReading, currentPeak: currentReadingPunta, oldFinal: lecturaFinalAntiguo, newInitial: lecturaInicialNuevo, oldFinalPeak: lecturaFinalAntiguoPunta, newInitialPeak: lecturaInicialNuevoPunta }
  });
  const normalBefore = consumption(lecturaFinalAntiguo, selectedMember?.ultima_lectura);
  const normalAfter = consumption(currentReading, lecturaInicialNuevo);
  const normalTotal = isCambioMedidor ? normalBefore + normalAfter : consumption(currentReading, selectedMember?.ultima_lectura);
  const peakBefore = consumption(lecturaFinalAntiguoPunta, selectedMember?.ultima_lectura_punta);
  const peakAfter = consumption(currentReadingPunta, lecturaInicialNuevoPunta);
  const peakTotal = isCambioMedidor ? peakBefore + peakAfter : consumption(currentReadingPunta, selectedMember?.ultima_lectura_punta);
  const totalConsumption = normalTotal + (isTR ? peakTotal : 0);
  const historicalAverage = parseSafe(selectedMember?.promedio_consumo_3m);
  const historicalSamples = Number(selectedMember?.muestras_consumo_3m) || 0;
  const hasCurrentValues = hasNumericValue(currentReading) && (!isTR || hasNumericValue(currentReadingPunta));
  let anomaly = null;
  if (hasCurrentValues && historicalSamples >= 2 && historicalAverage > 0) {
    const ratio = totalConsumption / historicalAverage;
    if (ratio >= 2 && totalConsumption - historicalAverage >= 100) {
      anomaly = { tone: 'high', label: 'Consumo inusualmente alto', ratio };
    } else if (ratio <= 0.25 && historicalAverage - totalConsumption >= 50) {
      anomaly = { tone: 'low', label: 'Consumo inusualmente bajo', ratio };
    }
  }

  useEffect(() => {
    setAnomalyConfirmed(false);
  }, [selectedMember?.id, currentReading, currentReadingPunta, isCambioMedidor]);
  const normalTariff = isTR ? parseSafe(activePeriodo?.tarifa_kwh_tr) || parseSafe(activePeriodo?.tarifa_kwh) : parseSafe(activePeriodo?.tarifa_kwh);
  const peakTariff = parseSafe(activePeriodo?.tarifa_kwh_punta);

  const consumptionFormula = (before, after, total, tariff) => (
    <>{isCambioMedidor ? `${before.toFixed(2)} + ${after.toFixed(2)} = ${total.toFixed(2)} kWh` : `${total.toFixed(2)} kWh`} <span className="font-bold mx-0.5">×</span> S/ {tariff.toFixed(4)}</>
  );
  const simpleFormula = (value, unit, tariff) => <>{Number(value).toFixed(2)} {unit} <span className="font-bold mx-0.5">×</span> S/ {tariff.toFixed(4)}</>;

  return <>
    <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
      <MemberReadingHeader member={selectedMember} onClose={onClose} />
      <div className="p-4">
        {lecturaExistente ? <ExistingReadingCard reading={lecturaExistente} period={activePeriodo} onClose={onClose} /> : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]" translate="no">swap_horiz</span>¿Hubo cambio de medidor este mes?</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={isCambioMedidor} onChange={(event) => setIsCambioMedidor(event.target.checked)} /><span className="w-9 h-5 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" /></label>
            </div>

            {isCambioMedidor && <MeterReplacementFields finalValue={lecturaFinalAntiguo} onFinalChange={setLecturaFinalAntiguo} initialValue={lecturaInicialNuevo} onInitialChange={setLecturaInicialNuevo} />}
            <ReadingFields previousLabel="L. Anterior" previousValue={selectedMember.ultima_lectura} currentLabel={`L. Actual ${isTR ? '(F.P.)' : ''}`} currentValue={currentReading} onCurrentChange={setCurrentReading} tariff={activePeriodo ? normalTariff : undefined} changedMeter={isCambioMedidor} autoFocus />
            {hasNumericValue(currentReading) && activePeriodo && <ReadingCalculationSummary icon="payments" title="Subtotal Fuera Punta" measureLabel="Consumo" formula={consumptionFormula(normalBefore, normalAfter, normalTotal, normalTariff)} amount={normalTotal * normalTariff} />}

            {isTR && (
              <>
                {isCambioMedidor && <MeterReplacementFields peak finalValue={lecturaFinalAntiguoPunta} onFinalChange={setLecturaFinalAntiguoPunta} initialValue={lecturaInicialNuevoPunta} onInitialChange={setLecturaInicialNuevoPunta} />}
                <ReadingFields previousLabel="L. Ant. Punta" previousValue={selectedMember.ultima_lectura_punta} currentLabel="L. Actual (P)" currentValue={currentReadingPunta} onCurrentChange={setCurrentReadingPunta} tariff={activePeriodo ? peakTariff : undefined} changedMeter={isCambioMedidor} margin={!isCambioMedidor ? 'mt-1' : ''} />
                {hasNumericValue(currentReadingPunta) && activePeriodo && <ReadingCalculationSummary icon="bolt" title="Subtotal Punta" measureLabel="Consumo" formula={consumptionFormula(peakBefore, peakAfter, peakTotal, peakTariff)} amount={peakTotal * peakTariff} tone="orange" />}

                <DemandInput label="Máx. Dem. Fuera Punta" unit="kW" value={maxDemandaFueraPunta} onChange={setMaxDemandaFueraPunta} tone="blue" />
                {hasNumericValue(maxDemandaFueraPunta) && activePeriodo && <ReadingCalculationSummary icon="electric_meter" title="Subtotal Dem. Fuera Punta" measureLabel="Demanda" formula={simpleFormula(maxDemandaFueraPunta, 'kW', parseSafe(activePeriodo.costo_potencia_fuera_punta))} amount={parseSafe(maxDemandaFueraPunta) * parseSafe(activePeriodo.costo_potencia_fuera_punta)} tone="blue" />}

                <DemandInput label="Máx. Dem. Punta" unit="kW" value={maxDemandaPunta} onChange={setMaxDemandaPunta} tone="orange" />
                {hasNumericValue(maxDemandaPunta) && activePeriodo && <ReadingCalculationSummary icon="electric_meter" title="Subtotal Dem. Punta" measureLabel="Demanda" formula={simpleFormula(maxDemandaPunta, 'kW', parseSafe(activePeriodo.costo_potencia))} amount={parseSafe(maxDemandaPunta) * parseSafe(activePeriodo.costo_potencia)} tone="orange" />}

                <DemandInput label="Energía Reactiva Cap." unit="kVARh" value={factorPotencia} onChange={setFactorPotencia} tone="purple" />
                {hasNumericValue(factorPotencia) && activePeriodo && <ReadingCalculationSummary icon="electric_meter" title="Subtotal Reactiva" measureLabel="Reactiva" formula={simpleFormula(factorPotencia, 'kVARh', parseSafe(activePeriodo.precio_energia_reactiva))} amount={parseSafe(factorPotencia) * parseSafe(activePeriodo.precio_energia_reactiva)} tone="purple" />}
              </>
            )}
            {anomaly && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[19px] text-amber-700" translate="no">warning</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{anomaly.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-800">El consumo calculado es {totalConsumption.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kWh. El promedio de los últimos {historicalSamples} registros es {historicalAverage.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kWh ({Math.round(anomaly.ratio * 100)}%).</p>
                    <label className="mt-2 flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-bold">
                      <input type="checkbox" checked={anomalyConfirmed} onChange={(event) => setAnomalyConfirmed(event.target.checked)} className="h-4 w-4 rounded border-amber-400 text-primary focus:ring-primary" />
                      Confirmo que verifiqué la lectura del medidor
                    </label>
                  </div>
                </div>
              </div>
            )}
            <ReadingActions errors={validationErrors} isSaving={isSaving} submitLabel="Guardar y siguiente" disabled={Boolean(anomaly && !anomalyConfirmed)} onSkip={() => setSkipModalOpen(true)} />
          </form>
        )}
      </div>
    </div>
    <SkipReadingModal isOpen={skipModalOpen} member={selectedMember} isSubmitting={isSkipping} onClose={() => setSkipModalOpen(false)} onSubmit={handleSkip} />
  </>;
};
