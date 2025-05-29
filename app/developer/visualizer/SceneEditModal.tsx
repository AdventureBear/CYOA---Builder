import React, { useState, useEffect } from 'react';
import type { Scene } from '@/app/types';

interface SceneEditModalProps {
  open: boolean;
  scene: Scene | null;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  onSave: (scene: Scene) => Promise<void> | void;
  onClose: () => void;
}

const defaultScene: Scene = {
  id: '',
  name: '',
  description: '',
  location: '',
  season: '',
  isRequired: false,
  choices: [{ text: '', nextNodeId: '' }],
  actions: [],
  locationImage: '',
};

export default function SceneEditModal({ open, scene, scenes, setScenes, onSave, onClose }: SceneEditModalProps) {
  const [form, setForm] = useState<Scene>(scene || defaultScene);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(scene || defaultScene);
  }, [scene, open]);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }
  function handleChoiceChange(idx: number, field: keyof Scene['choices'][0], value: string) {
    const newChoices = [...form.choices];
    newChoices[idx] = { ...newChoices[idx], [field]: value };
    setForm({ ...form, choices: newChoices });
  }
  function addChoice() {
    setForm({ ...form, choices: [...form.choices, { text: '', nextNodeId: '' }] });
  }
  function removeChoice(idx: number) {
    setForm({ ...form, choices: form.choices.filter((_, i) => i !== idx) });
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      setScenes(scenes.map(s => s.id === form.id ? form : s));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save scene');
    } finally {
      setLoading(false);
    }
  }
  if (!open || !scene) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 min-w-[600px] shadow-2xl max-w-[1080px] w-[90%] min-h-[90vh] max-h-[90vh] overflow-y-auto flex flex-col">
        <h3 className="text-[22px] font-bold mb-1.5">Edit Scene</h3>
        {/* Basic Description section with more colorful pastel */}
        <div className="bg-cyan-50 border border-slate-200 rounded-lg p-3 mb-4 w-full">
          <div className="flex gap-2.5">
            <div className="basis-1/5 flex flex-col gap-0.5 justify-stretch">
              <div className="font-semibold text-[15px] mb-0.5">Basic Information</div>
              {/* ID */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="font-semibold text-[13px] min-w-[70px]">ID</label>
                <input name="id" value={form.id} onChange={handleFormChange} required className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" disabled />
              </div>
              {/* Location */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="font-semibold text-[13px] min-w-[70px]">Location</label>
                <input name="location" value={form.location} onChange={handleFormChange} required className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" />
              </div>
              {/* Season */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="font-semibold text-[13px] min-w-[70px]">Season</label>
                <input name="season" value={form.season} onChange={handleFormChange} className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" />
              </div>
              {/* Parent Scene */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="font-semibold text-[13px] min-w-[70px]">Parent</label>
                <select name="parentSceneId" value={form.parentSceneId || ''} onChange={handleFormChange} className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]">
                  <option value="">None</option>
                  {scenes.filter(s => s.id !== form.id).map(s => (
                    <option key={s.id} value={s.id}>{s.id}</option>
                  ))}
                </select>
              </div>
              {/* Required? */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="font-semibold text-[13px] min-w-[70px]">Required?</label>
                <input type="checkbox" name="isRequired" checked={form.isRequired} onChange={handleFormChange} className="ml-0" />
              </div>
            </div>
            <div className="basis-4/5 flex flex-col justify-stretch">
              <label className="font-semibold text-[14px] mb-0.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} required className="w-full px-1 py-0.5 rounded border border-slate-300 text-[14px] min-h-[112px] h-[112px] mt-0 resize-vertical" />
            </div>
          </div>
        </div>
        {/* Choices section with more colorful pastel */}
        <div className="bg-purple-50 border border-slate-200 rounded-lg p-3 w-full">
          <div className="flex items-center gap-1.5 mb-2">
            <label className="font-semibold text-[16px]">Choices</label>
            <button type="button" onClick={addChoice} className="bg-blue-600 text-white border-none rounded-full w-7 h-7 flex items-center justify-center font-bold text-[18px] cursor-pointer ml-0.5">+</button>
          </div>
          {/* Headers for choices */}
          <div className="flex gap-2 font-semibold text-[14px] mb-0.5">
            <div className="basis-4/5">Text</div>
            <div className="basis-1/5">Next Node ID</div>
          </div>
          {form.choices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input placeholder="Text" value={choice.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} required className="basis-4/5 min-w-[80px] px-1 py-0.5 rounded border border-slate-300 text-[14px] bg-white" />
              <input placeholder="Next Node ID" value={choice.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} required className="basis-1/5 min-w-[60px] px-1 py-0.5 rounded border border-slate-300 text-[14px] bg-white" />
              {form.choices.length > 1 && (
                <button type="button" onClick={() => removeChoice(idx)} className="bg-red-500 text-white border-none rounded px-2 font-semibold cursor-pointer text-[13px] ml-0.5">Remove</button>
              )}
            </div>
          ))}
        </div>
        <div className="flex-1" /> {/* Spacer to push buttons to bottom */}
        <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-3 pb-2 z-2">
          <button type="button" onClick={onClose} className="bg-slate-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="bg-green-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
        {error && <div className="text-red-500 font-bold mt-2">{error}</div>}
      </form>
    </div>
  );
} 