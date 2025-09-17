import React from 'react';

export default function DatasetManager() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
          Dataset Training Handled in Backend
        </h2>
        <p className="text-muted-foreground">
          The diabetes prediction model is trained on the server-side using the provided dataset.
          No dataset upload or training is required here.
        </p>
      </div>
    </div>
  );
}
