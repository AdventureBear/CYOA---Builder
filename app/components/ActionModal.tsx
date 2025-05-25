import { useState, useEffect } from 'react';
import type { Action, Trigger, Condition, Outcome, StateChange } from '@/app/types';

interface ActionModalProps {
  action: Action;
  onSave: (action: Action) => Promise<void> | void;
  onClose: () => void;
  isEditing?: boolean;
  game?: string;
}

const defaultAction: Action = {
  id: '',
  trigger: 'onEnter',
  outcomes: [],
  conditions: [],
  failMessage: '',
};

export default function ActionModal({ action, onSave, onClose, isEditing = false }: ActionModalProps) {
  const [form, setForm] = useState<Action>(action || defaultAction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(action || defaultAction);
  }, [action]);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  function handleFailMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm({ ...form, failMessage: e.target.value });
  }
  // --- Conditions ---
  function handleConditionChange(idx: number, field: keyof Condition, value: string) {
    const newConditions = [...(form.conditions || [])];
    newConditions[idx] = { ...newConditions[idx], [field]: value };
    setForm({ ...form, conditions: newConditions });
  }
  function addCondition() {
    setForm({ ...form, conditions: [...(form.conditions || []), { type: 'hasItem', key: '', value: '' }] });
  }
  function removeCondition(idx: number) {
    setForm({ ...form, conditions: (form.conditions || []).filter((_, i) => i !== idx) });
  }
  // --- Outcomes ---
  function handleOutcomeChange(idx: number, field: keyof Outcome, value: string) {
    const newOutcomes = [...(form.outcomes || [])];
    newOutcomes[idx] = { ...newOutcomes[idx], [field]: value };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addOutcome() {
    setForm({ ...form, outcomes: [...(form.outcomes || []), { description: '', stateChanges: [] }] });
  }
  function removeOutcome(idx: number) {
    setForm({ ...form, outcomes: (form.outcomes || []).filter((_, i) => i !== idx) });
  }
  // --- StateChanges for Outcomes ---
  function handleStateChangeChange(outIdx: number, scIdx: number, field: keyof StateChange, value: string | number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = [...(newOutcomes[outIdx].stateChanges || [])];
    if (field === 'type' && typeof value === 'string' && !['addItem', 'removeItem', 'setFlag'].includes(value)) return;
    newStateChanges[scIdx] = { ...newStateChanges[scIdx], [field]: value };
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges as StateChange[] };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addStateChange(outIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = [...(newOutcomes[outIdx].stateChanges || []), { type: 'addItem' as const, key: '', amount: 1 }];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges as StateChange[] };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function removeStateChange(outIdx: number, scIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = newOutcomes[outIdx].stateChanges.filter((_, i) => i !== scIdx);
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges };
    setForm({ ...form, outcomes: newOutcomes });
  }
  // --- Choices for Outcomes ---
  function handleChoiceChange(outIdx: number, choiceIdx: number, field: string, value: string) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = [...(newOutcomes[outIdx].choices || [])];
    newChoices[choiceIdx] = { ...newChoices[choiceIdx], [field]: value };
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addChoice(outIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = [...(newOutcomes[outIdx].choices || []), { text: '', nextAction: '', nextScene: '', resultMessage: '', resultButtonText: '' }];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function removeChoice(outIdx: number, choiceIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = newOutcomes[outIdx].choices?.filter((_, i) => i !== choiceIdx) || [];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save action');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 600, boxShadow: '0 4px 24px #0002', maxWidth: 1080, width: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{isEditing ? 'Edit Action' : 'Add Action'}</h3>
        {/* Top section: two columns */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
          {/* Left column: ID and Trigger */}
          <div style={{ flex: 1, minWidth: 180, maxWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: 15 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15, marginTop: 2 }} disabled={isEditing} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: 15 }}>Trigger</label>
              <select name="trigger" value={form.trigger} onChange={handleFormChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15, marginTop: 2 }}>
                {(['onEnter', 'onExit', 'onChoice', 'onItem', 'onFlag', 'onRep', 'onHealth', 'onAlignment', 'onRandom'] as Trigger[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Right column: Fail Message */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, fontSize: 15 }}>Fail Message</label>
            <textarea name="failMessage" value={form.failMessage || ''} onChange={handleFailMessageChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15, minHeight: 48, marginTop: 2 }} />
          </div>
        </div>
        {/* Conditions section: full width */}
        <div style={{ background: '#f6f8fa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 0, width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 16 }}>Conditions</label>
            <button type="button" onClick={addCondition} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
          </div>
          {(form.conditions || []).map((cond, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, background: '#f3f4f6', borderRadius: 6, padding: 8 }}>
              <select value={cond.type} onChange={e => handleConditionChange(idx, 'type', e.target.value)} style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}>
                {['hasItem', 'flagSet', 'flagNotSet', 'random', 'reputation', 'doesNotHaveItem'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input placeholder="Key" value={cond.key || ''} onChange={e => handleConditionChange(idx, 'key', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
              <input placeholder="Value" value={cond.value as string || ''} onChange={e => handleConditionChange(idx, 'value', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
              {(cond.type === 'hasItem' || cond.type === 'reputation') && (
                <select value={cond.comparator || 'gte'} onChange={e => handleConditionChange(idx, 'comparator', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}>
                  {['gte', 'eq', 'lte', 'neq'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              {cond.type === 'random' && (
                <input type="number" step="0.01" min="0" max="1" placeholder="Chance" value={cond.chance ?? ''} onChange={e => handleConditionChange(idx, 'chance', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
              )}
              <button type="button" onClick={() => removeCondition(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
            </div>
          ))}
        </div>
        {/* Outcomes section: full width */}
        <div style={{ background: '#f6f8fa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 0, width: '100%', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 16 }}>Outcomes</label>
            <button type="button" onClick={addOutcome} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
          </div>
          {(form.outcomes || []).map((out, idx) => (
            <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, marginBottom: 8, background: '#f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <input placeholder="Description" value={out.description || ''} onChange={e => handleOutcomeChange(idx, 'description', e.target.value)} style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                <button type="button" onClick={() => removeOutcome(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
              </div>
              {/* StateChanges for this outcome */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <label style={{ fontWeight: 500, fontSize: 13 }}>State Changes</label>
                  <button type="button" onClick={() => addStateChange(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
                </div>
                {(out.stateChanges || []).map((sc, scIdx) => (
                  <div key={scIdx} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <select value={sc.type} onChange={e => handleStateChangeChange(idx, scIdx, 'type', e.target.value)} style={{ flex: 1, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}>
                      {['addItem', 'removeItem', 'setFlag'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input placeholder="Key" value={sc.key || ''} onChange={e => handleStateChangeChange(idx, scIdx, 'key', e.target.value)} style={{ flex: 1, minWidth: 60, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <input type="number" placeholder="Amount" value={sc.amount ?? ''} onChange={e => handleStateChangeChange(idx, scIdx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <button type="button" onClick={() => removeStateChange(idx, scIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </div>
                ))}
              </div>
              {/* Choices for this outcome */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <label style={{ fontWeight: 500, fontSize: 13 }}>Choices</label>
                  <button type="button" onClick={() => addChoice(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
                </div>
                {(out.choices || []).map((choice, choiceIdx) => (
                  <div key={choiceIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 2, background: '#f3f4f6', borderRadius: 4, padding: 4 }}>
                    <input placeholder="Text" value={choice.text || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'text', e.target.value)} style={{ flex: 2, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <input placeholder="Next Action" value={choice.nextAction || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextAction', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <input placeholder="Next Scene" value={choice.nextScene || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextScene', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <input placeholder="Result Message" value={choice.resultMessage || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultMessage', e.target.value)} style={{ flex: 2, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <input placeholder="Button Text" value={choice.resultButtonText || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultButtonText', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                    <button type="button" onClick={() => removeChoice(idx, choiceIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
} 