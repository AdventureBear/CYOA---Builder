'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddSceneModalProps {
    onAddScene: (newSceneId: string) => void;
    onClose: () => void;
}

const AddSceneModal: React.FC<AddSceneModalProps> = ({ onAddScene, onClose }) => {
    const [newSceneId, setNewSceneId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSceneId.trim()) {
            onAddScene(newSceneId.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Create New Scene</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="new-scene-id">New Scene ID</Label>
                        <Input
                            id="new-scene-id"
                            value={newSceneId}
                            onChange={(e) => setNewSceneId(e.target.value)}
                            placeholder="e.g., castle_entrance"
                            required
                        />
                        <p className="text-sm text-gray-500">Use lowercase letters and underscores only.</p>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Scene
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSceneModal; 