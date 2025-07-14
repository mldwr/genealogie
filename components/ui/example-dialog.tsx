'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from '@/components/ui/dialog';

// Example 1: Dialog with visible title
export function ExampleDialogWithTitle() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn bg-blue-600 text-white">
          Open Dialog with Title
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <DialogFooter>
          <button type="submit" className="btn bg-blue-600 text-white">
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Example 2: Dialog with hidden title (for accessibility)
export function ExampleDialogWithHiddenTitle() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn bg-green-600 text-white">
          Open Dialog with Hidden Title
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* This title is hidden visually but accessible to screen readers */}
          <VisuallyHidden>
            <DialogTitle>Confirmation Dialog</DialogTitle>
          </VisuallyHidden>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="btn bg-gray-300 text-gray-700">
            Cancel
          </button>
          <button className="btn bg-red-600 text-white">
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Example 3: Dialog without title (INCORRECT - will cause accessibility error)
export function ExampleDialogWithoutTitle() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn bg-red-600 text-white">
          ❌ Incorrect Dialog (No Title)
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {/* This is INCORRECT - missing DialogTitle */}
        <DialogDescription>
          This dialog is missing a DialogTitle and will cause an accessibility error.
        </DialogDescription>
        <DialogFooter>
          <button className="btn bg-gray-300 text-gray-700">
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Example 4: Corrected version of the above dialog
export function ExampleDialogCorrected() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn bg-blue-600 text-white">
          ✅ Corrected Dialog
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Add a visually hidden title for accessibility */}
          <VisuallyHidden>
            <DialogTitle>Information Dialog</DialogTitle>
          </VisuallyHidden>
          <DialogDescription>
            This dialog now has a proper DialogTitle for accessibility.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="btn bg-gray-300 text-gray-700">
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component to demonstrate all examples
export function DialogExamples() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Dialog Accessibility Examples</h2>
      <div className="space-y-4">
        <ExampleDialogWithTitle />
        <ExampleDialogWithHiddenTitle />
        <ExampleDialogWithoutTitle />
        <ExampleDialogCorrected />
      </div>
    </div>
  );
}
