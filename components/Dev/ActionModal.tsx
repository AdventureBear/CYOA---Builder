import { useState, useEffect } from 'react';
import type { Action, Trigger, Condition, Outcome, StateChange, Scene } from '@/app/types';

interface ActionModalProps {
  action: Action;
  onSave: (action: Action) => Promise<void> | void;
  onClose: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  game?: string;
  actions: Action[];
  scenes: Scene[];
}

const defaultAction: Action = {
  id: '',
  trigger: 'onEnter',
  outcomes: [],
  conditions: [],
  failMessage: '',
};

export default function ActionModal({ action, onSave, onClose, onDelete, isEditing = false, actions = [], scenes = [] }: ActionModalProps) {
  console.log('actions:', actions, 'scenes:', scenes);
  const [form, setForm] = useState<Action>(action || defaultAction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChoices, setExpandedChoices] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setForm(action || defaultAction);
    setExpandedChoices({});
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

  // Toggle expand/collapse for a choice row
  function toggleChoiceExpand(outIdx: number, choiceIdx: number) {
    setExpandedChoices(prev => {
      const key = `${outIdx}`;
      return {
        ...prev,
        [key]: prev[key] === choiceIdx ? null : choiceIdx
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save action');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 0, minWidth: 600, boxShadow: '0 4px 24px #0002', maxWidth: 1080, width: '100%', minHeight: '90vh', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ padding: '20px 24px 0 24px' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{isEditing ? 'Edit Action' : 'Add Action'}</h3>
        </div>
        {/* Basic Info Section */}
        <div style={{ background: '#e6f7fa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, margin: '16px 24px 0 24px', display: 'flex', flexDirection: 'row', gap: 0, height: 112 }}>
          {/* Left: label/input pairs stacked vertically, each on a row */}
          <div style={{ flex: 1, minWidth: 220, maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'stretch' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Basic Info</div>
            {/* ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 13, minWidth: 80 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} disabled={isEditing} />
            </div>
            {/* Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 13, minWidth: 80 }}>Trigger</label>
              <select name="trigger" value={form.trigger} onChange={handleFormChange} style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
                {(['onEnter', 'onExit', 'onChoice', 'onItem', 'onFlag', 'onRep', 'onHealth', 'onAlignment', 'onRandom'] as Trigger[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Right: Fail Message textarea */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'stretch', marginLeft: 24 }}>
            <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Fail Message</label>
            <textarea name="failMessage" value={form.failMessage || ''} onChange={handleFailMessageChange} style={{ width: '100%', padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, minHeight: 40, background: '#fff' }} />
          </div>
        </div>
        {/* Conditions Section */}
        <div style={{ background: '#f9f6e7', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, margin: '16px 24px 0 24px', width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 15 }}>Conditions</label>
            <button type="button" onClick={addCondition} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
          </div>
          {/* Header row for columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            <div style={{ flex: 1, minWidth: 110 }}>Type</div>
            <div style={{ flex: 1, minWidth: 80 }}>Key</div>
            <div style={{ flex: 1, minWidth: 80 }}>Value</div>
            <div style={{ flex: 1, minWidth: 80 }}>Comparator</div>
            <div style={{ flex: 1, minWidth: 80 }}>Chance</div>
            <div style={{ width: 70 }}></div>
          </div>
          {(form.conditions || []).map((cond, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <select value={cond.type} onChange={e => handleConditionChange(idx, 'type', e.target.value)} style={{ flex: 1, minWidth: 110, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
                {['hasItem', 'flagSet', 'flagNotSet', 'random', 'reputation', 'doesNotHaveItem'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input placeholder="Key" value={cond.key || ''} onChange={e => handleConditionChange(idx, 'key', e.target.value)} style={{ flex: 1, minWidth: 80, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} />
              <input placeholder="Value" value={cond.value as string || ''} onChange={e => handleConditionChange(idx, 'value', e.target.value)} style={{ flex: 1, minWidth: 80, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} />
              {/* Always show Comparator, disable if not relevant */}
              <select value={cond.comparator || ''} onChange={e => handleConditionChange(idx, 'comparator', e.target.value)} style={{ flex: 1, minWidth: 80, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: (cond.type === 'hasItem' || cond.type === 'reputation') ? '#fff' : '#f3f4f6' }} disabled={!(cond.type === 'hasItem' || cond.type === 'reputation')}>
                <option value=""> </option>
                {['gte', 'eq', 'lte', 'neq'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {/* Always show Chance, disable if not relevant */}
              <input type="number" step="0.01" min="0" max="1" placeholder="Chance" value={cond.chance ?? ''} onChange={e => handleConditionChange(idx, 'chance', e.target.value)} style={{ flex: 1, minWidth: 80, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: cond.type === 'random' ? '#fff' : '#f3f4f6' }} disabled={cond.type !== 'random'} />
              <button type="button" onClick={() => removeCondition(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Remove</button>
            </div>
          ))}
        </div>
        {/* Outcomes Section */}
        <div style={{ background: '#FFFFFF',  padding: 12, margin: '16px 12px 0 12px', width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 15 }}>Outcomes</label>
            <button type="button" onClick={addOutcome} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
          </div>
          {(form.outcomes || []).map((out, idx) => (
            <div key={idx} style={{ padding: '6px', marginBottom: 16, background: '#f6e7fa', border: '1px solid #cbd5e1', borderRadius: 10, boxShadow: '0 2px 8px #0001' }}>
              {/* Description section, 1/8th label, 7/8ths input+remove, no extra bg/border */}
              <div style={{ display: 'flex' , padding: '3px', margin: '6px 6px 16px 6px',background: '#e6f7fa', borderRadius: 6}}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', paddingLeft: 8, paddingTop: 10 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, textAlign: 'left' }}>Description</label>
                </div>
                <div style={{ flex: 7, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input placeholder="Description" value={out.description || ''} onChange={e => handleOutcomeChange(idx, 'description', e.target.value)} style={{ flex: 2, minWidth: 120, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} />
                  <button type="button" onClick={() => removeOutcome(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Remove</button>
                </div>
              </div>
              {/* State Changes section, 1/8th label, 7/8ths content, no extra bg/border */}
              <div style={{ display: 'flex', padding: '3px',margin: '6px 6px 16px 6px', background: '#f6f8fa', borderRadius: 6}}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', paddingLeft: 8, paddingTop: 10 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, textAlign: 'left' }}>State Changes</label>
                </div>
                <div style={{ flex: 7, padding: '10px 12px' }}>
                  {/* Header row for State Changes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                    <div style={{ flex: 1, minWidth: 70 }}>Type</div>
                    <div style={{ flex: 1, minWidth: 60 }}>Key</div>
                    <div style={{ flex: 1, minWidth: 50 }}>Amount</div>
                    <div style={{ width: 60 }}></div>
                  </div>
                  {(out.stateChanges || []).map((sc, scIdx) => (
                    <div key={scIdx} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <select value={sc.type} onChange={e => handleStateChangeChange(idx, scIdx, 'type', e.target.value)} style={{ flex: 1, minWidth: 70, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}>
                        {['addItem', 'removeItem', 'setFlag'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <input placeholder="Key" value={sc.key || ''} onChange={e => handleStateChangeChange(idx, scIdx, 'key', e.target.value)} style={{ flex: 1, minWidth: 60, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                      <input type="number" placeholder="Amount" value={sc.amount ?? ''} onChange={e => handleStateChangeChange(idx, scIdx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                      <button type="button" onClick={() => removeStateChange(idx, scIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <button type="button" onClick={() => addStateChange(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>
              {/* Choices section, 1/8th label, 7/8ths content, no extra bg/border */}
              <div style={{ display: 'flex', padding: '3px', margin: '6px', background: '#f9f6e7', borderRadius: 6}}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', paddingLeft: 8, paddingTop: 10 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, textAlign: 'left' }}>Options</label>
                </div>
                <div style={{ flex: 7, padding: '10px 12px' }}>
                  {/* Header row for Choices */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                    <div style={{ flex: 2, minWidth: 60 }}>Text</div>
                    <div style={{ flex: 1, minWidth: 50 }}>Next Action</div>
                    <div style={{ flex: 1, minWidth: 50 }}>Next Scene</div>
                    <div style={{ width: 30 }}></div>
                  </div>
                  {(out.choices || []).map((choice, choiceIdx) => {
                    const expanded = expandedChoices[`${idx}`] === choiceIdx;
                    const isNewAction = choice.nextAction === '__new__';
                    const isNewScene = choice.nextScene === '__new__';
                    return (
                      <div key={choiceIdx} style={{ marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input placeholder="Text" value={choice.text || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'text', e.target.value)} style={{ flex: 2, minWidth: 60, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                          {/* Next Action dropdown */}
                          <select value={isNewAction ? '__new__' : (choice.nextAction || '')} onChange={e => {
                            if (e.target.value === '__new__') {
                              handleChoiceChange(idx, choiceIdx, 'nextAction', '__new__');
                            } else {
                              handleChoiceChange(idx, choiceIdx, 'nextAction', e.target.value);
                            }
                          }} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}>
                            <option value=""> </option>
                            {actions.length === 0 && <option value="" disabled>No actions found</option>}
                            {actions.map(a => (
                              <option key={a.id} value={a.id}>{a.id}</option>
                            ))}
                            <option value="__new__">New Action...</option>
                          </select>
                          {isNewAction && (
                            <input placeholder="New Action ID" value={choice.nextAction === '__new__' ? '' : choice.nextAction} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextAction', e.target.value)} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                          )}
                          {/* Next Scene dropdown */}
                          <select value={isNewScene ? '__new__' : (choice.nextScene || '')} onChange={e => {
                            if (e.target.value === '__new__') {
                              handleChoiceChange(idx, choiceIdx, 'nextScene', '__new__');
                            } else {
                              handleChoiceChange(idx, choiceIdx, 'nextScene', e.target.value);
                            }
                          }} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}>
                            <option value=""> </option>
                            {scenes.map(s => (
                              <option key={s.id} value={s.id}>{s.id}</option>
                            ))}
                            <option value="__new__">New Scene...</option>
                          </select>
                          {isNewScene && (
                            <input placeholder="New Scene ID" value={choice.nextScene === '__new__' ? '' : choice.nextScene} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextScene', e.target.value)} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                          )}
                          <button type="button" onClick={() => toggleChoiceExpand(idx, choiceIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, marginLeft: 4, color: '#64748b', lineHeight: 1 }}>{expanded ? '▼' : '▶'}</button>
                          <button type="button" onClick={() => removeChoice(idx, choiceIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12, marginLeft: 2 }}>Remove</button>
                        </div>
                        {expanded && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <input placeholder="Result Message" value={choice.resultMessage || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultMessage', e.target.value)} style={{ flex: 2, minWidth: 60, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                            <input placeholder="Result Button" value={choice.resultButtonText || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultButtonText', e.target.value)} style={{ flex: 1, minWidth: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <button type="button" onClick={() => addChoice(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Sticky Footer */}
        <div style={{ position: 'sticky', bottom: 0, background: '#f8fafc', padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            {isEditing && onDelete && (
              <button type="button" onClick={onDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Action'}
            </button>
          </div>
        </div>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
} 