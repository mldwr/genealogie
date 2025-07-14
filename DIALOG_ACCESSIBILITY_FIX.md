# Radix UI Dialog Accessibility Fix

## Problem
You're getting this accessibility error in the browser console:
```
DialogContent requires a DialogTitle for the component to be accessible for screen reader users. If you want to hide the DialogTitle, you can wrap it with our VisuallyHidden component.
```

## Solution
I've installed the `@radix-ui/react-dialog` package and created proper Dialog components with accessibility features.

## Files Created/Modified

### 1. `components/ui/dialog.tsx`
- Complete Dialog component implementation with all necessary parts
- Includes `VisuallyHidden` component for accessibility
- Properly styled with Tailwind CSS

### 2. `components/ui/example-dialog.tsx`
- Examples showing correct and incorrect Dialog usage
- Demonstrates how to fix accessibility issues

### 3. Updated `app/(default)/page.tsx`
- Added Dialog examples to the home page for testing

## How to Fix the Accessibility Error

### Option 1: Add a Visible DialogTitle
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Your Dialog Title</DialogTitle>
      <DialogDescription>
        Your dialog description here.
      </DialogDescription>
    </DialogHeader>
    {/* Your dialog content */}
  </DialogContent>
</Dialog>
```

### Option 2: Add a Hidden DialogTitle (for accessibility only)
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, VisuallyHidden } from '@/components/ui/dialog';

<Dialog>
  <DialogContent>
    <DialogHeader>
      <VisuallyHidden>
        <DialogTitle>Hidden Title for Screen Readers</DialogTitle>
      </VisuallyHidden>
      <DialogDescription>
        Your dialog description here.
      </DialogDescription>
    </DialogHeader>
    {/* Your dialog content */}
  </DialogContent>
</Dialog>
```

## Finding the Problem Dialog

Since I couldn't find an existing Dialog component causing the error, here are steps to identify it:

1. **Check Browser Console**: The error should show you which component/file is causing the issue
2. **Search for Dialog Usage**: Look for any imports or usage of:
   - `@radix-ui/react-dialog`
   - `DialogContent`
   - Any custom modal components

3. **Check Recent Changes**: Look at recently modified files that might contain dialog/modal functionality

## Testing the Fix

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. You'll see dialog examples at the bottom of the page:
   - ✅ Correct examples (with DialogTitle)
   - ❌ Incorrect example (without DialogTitle - will show the error)

4. Open browser console and click the "❌ Incorrect Dialog" button to see the accessibility error

5. Click the "✅ Corrected Dialog" button to see the fixed version

## Key Points

1. **Every DialogContent MUST have a DialogTitle** for accessibility
2. **Use VisuallyHidden** if you don't want the title to be visible
3. **DialogTitle is required** even if you only have a DialogDescription
4. **Screen readers need the title** to understand the dialog's purpose

## Next Steps

1. Find the Dialog component causing the error in your codebase
2. Add a DialogTitle (visible or hidden) to fix the accessibility issue
3. Test with screen readers to ensure proper accessibility
4. Remove the example components from the home page once you've fixed the issue

## Example of Common Mistake

```tsx
// ❌ WRONG - Missing DialogTitle
<DialogContent>
  <DialogDescription>
    Some description without a title
  </DialogDescription>
</DialogContent>

// ✅ CORRECT - With hidden DialogTitle
<DialogContent>
  <DialogHeader>
    <VisuallyHidden>
      <DialogTitle>Dialog Title</DialogTitle>
    </VisuallyHidden>
    <DialogDescription>
      Some description with proper accessibility
    </DialogDescription>
  </DialogHeader>
</DialogContent>
```

The fix ensures your application is accessible to users with screen readers while maintaining your desired visual design.
